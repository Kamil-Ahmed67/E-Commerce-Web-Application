"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiPrinter,
  FiPackage,
  FiShoppingBag,
  FiClock,
  FiMapPin,
  FiMail,
  FiPhone,
  FiUser,
  FiArrowRight,
  FiFileText,
  FiHelpCircle,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import { getProducts } from "@/lib/server/shopData";
import ProductCard from "@/components/ProductCard/ProductCard";
import { trackEvent } from "@/lib/trackEvent";

const money = (n) => `${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Tk`;

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getEstimatedDelivery = (orderDateIso) => {
  const base = orderDateIso ? new Date(orderDateIso) : new Date();
  const startDate = new Date(base);
  startDate.setDate(startDate.getDate() + 2);
  const endDate = new Date(base);
  endDate.setDate(endDate.getDate() + 4);

  const formatShort = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${formatShort(startDate)} - ${formatShort(endDate)}`;
};

const CONFETTI_COLORS = ["#32BBAB", "#FFC107", "#FF6B6B", "#4C6FFF", "#34D399", "#F472B6"];

// Confetti streamers keep bursting in from both screen edges on a continuous, staggered loop.
function ConfettiBurst({ active }) {
  const pieces = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 50 }).map((_, i) => {
      const fromLeft = i % 2 === 0;
      const duration = 2.6 + Math.random() * 1.4;
      return {
        id: i,
        side: fromLeft ? "left" : "right",
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
        delay: Math.random() * 1.5,
        duration,
        repeatDelay: Math.random() * 1.5,
        drift: (fromLeft ? 1 : -1) * (25 + Math.random() * 45),
        rotate: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
        topOffset: Math.random() * 45,
        rounded: Math.random() > 0.5,
      };
    });
  }, [active]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className={`absolute ${p.rounded ? "rounded-full" : "rounded-sm"}`}
          style={{
            [p.side]: "-16px",
            top: `${p.topOffset}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: `${p.drift}vw`,
            y: "110vh",
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: "easeIn",
            repeat: Infinity,
            repeatDelay: p.repeatDelay,
          }}
        />
      ))}
    </div>
  );
}

export default function OrderConfirmation() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const purchaseTrackedRef = useRef(false);

  // Purchase is tracked here — not on the checkout page — so it uses the real,
  // server-confirmed order (this page is the canonical "thank you" page for
  // that), and only fires once even if this component re-renders.
  useEffect(() => {
    if (!order || purchaseTrackedRef.current) return;
    purchaseTrackedRef.current = true;

    const orderItems = order.EOrderItems || [];
    trackEvent('purchase', {
      value: Number(order.Total ?? 0),
      transactionId: order.InvoiceNo,
      contentIds: orderItems.map((i) => String(i.ItemId)),
      contents: orderItems.map((i) => ({
        id: i.ItemId,
        title: i.Name,
        price: Number(i.DiscountedPrice ?? i.Price ?? 0),
        quantity: i.Quantity,
        brand: i.Brand,
        sku: i.SKU,
      })),
      numItems: orderItems.reduce((s, i) => s + (i.Quantity || 0), 0),
      email: order.Email,
      phone: order.Phone,
      name: order.CustomerName,
      lastName: order.LastName,
      city: order.BillingCity,
      district: order.BillingCity,
      area: order.BillingArea,
      address: order.BillingAddress,
      country: order.Country,
      zip: order.ZipCode,
    });
  }, [order]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastOrderConfirmation");
      if (raw) {
        setOrder(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Failed to read order confirmation:", err);
    }
    setLoaded(true);

    // Fetch recommended products for repeat interest
    const loadRecommendations = async () => {
      try {
        setLoadingProducts(true);
        const products = await getProducts();
        if (Array.isArray(products)) {
          // Shuffle or select top 4 items
          const sliced = products.slice(0, 8);
          setRecommendedProducts(sliced);
        }
      } catch (err) {
        console.error("Failed to load recommended products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadRecommendations();
  }, []);

  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === "invoice") {
      setCopiedInvoice(true);
      toast.success("Invoice number copied to clipboard!");
      setTimeout(() => setCopiedInvoice(false), 2000);
    } else if (type === "txn") {
      setCopiedTxn(true);
      toast.success("Transaction ID copied to clipboard!");
      setTimeout(() => setCopiedTxn(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!loaded) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#32BBAB] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium text-sm">Loading order details...</p>
      </div>
    );
  }

  // Fallback view when no order is in session
  if (!order) {
    return (
      <section className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-gray-100 mb-12">
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="w-10 h-10 text-[#32BBAB]" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-3 manrope">No Recent Order Found</h1>
            <p className="text-gray-600 max-w-md mx-auto mb-8 text-base">
              We couldn&apos;t find active order details for this session. Explore our latest collections and discover your next style statement.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 btn-animated-gradient font-semibold py-3.5 px-8 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-0.5"
            >
              <FiShoppingBag className="w-5 h-5" />
              Explore Collections
            </Link>
          </div>

          {/* Recommended Section even when empty */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 manrope">Trending Now</h2>
                <p className="text-gray-500 text-sm mt-1">Popular styles our customers are loving right now</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {recommendedProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  const items = order.EOrderItems || [];
  const sameAsBilling =
    order.ShippingAddress === order.BillingAddress &&
    order.ShippingName === order.CustomerName;

  return (
    <section className="min-h-screen pt-32 pb-20 bg-slate-50/70 text-gray-800 print:bg-white print:pt-0 print:pb-0">
      <ConfettiBurst active />
      {/* Hide breadcrumb on print */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 print:hidden">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Checkout", href: "/checkout" },
            { label: "Order Confirmation", href: null },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* CELEBRATORY HERO BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-gray-100 print:shadow-none print:border-none"
        >
          {/* Background Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-100/60 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            {/* Animated Checkmark Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
              className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-[#32BBAB] to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/25"
            >
              <motion.div
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <FiCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white stroke-[3]" />
              </motion.div>
              <div className="absolute inset-0 rounded-full border-2 border-teal-300/40 animate-ping" />
            </motion.div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-[#32BBAB] text-xs font-bold uppercase tracking-wider mb-4">
              <HiSparkles className="w-3.5 h-3.5" /> Order Successfully Placed
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 manrope tracking-tight mb-3">
              Thank You For Your Order!
            </h1>
            <p className="text-gray-600 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
              We&apos;re getting your items ready for shipment. Invoice{" "}
              <span className="font-semibold text-gray-900 underline decoration-teal-400 decoration-2">
                #{order.InvoiceNo}
              </span>{" "}
              has been recorded and sent to your registered email.
            </p>

            {/* QUICK HIGHLIGHT PILLS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto bg-gray-50/80 p-3 rounded-2xl border border-gray-100 print:hidden">
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Invoice No</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-gray-900 text-sm sm:text-base">#{order.InvoiceNo || "-"}</span>
                  <button
                    onClick={() => handleCopy(order.InvoiceNo, "invoice")}
                    className="p-1 text-gray-400 hover:text-[#32BBAB] transition"
                    title="Copy Invoice"
                  >
                    {copiedInvoice ? <FiCheck className="w-4 h-4 text-emerald-500" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Order Date</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base mt-0.5">
                  {formatDate(order.OrderDate)}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Est. Delivery</span>
                <span className="font-bold text-[#32BBAB] text-sm sm:text-base mt-0.5">
                  {getEstimatedDelivery(order.OrderDate)}
                </span>
              </div>
            </div>

            {/* QUICK ACTIONS BAR */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
              {/* <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition"
              >
                <FiPrinter className="w-4 h-4 text-gray-500" />
                Print Receipt
              </button> */}

              <button
                onClick={() => router.push("/shop")}
                className="inline-flex items-center gap-2 btn-animated-gradient px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
              >
                <FiShoppingBag className="w-4 h-4" />
                Continue Shopping
              </button>
            </div>
          </div>
        </motion.div>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Items Purchased & Delivery Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ITEMS PURCHASED CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between pb-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#32BBAB]">
                    <FiPackage className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 manrope">Purchased Items</h2>
                    <p className="text-xs text-gray-500">{order.OrderQty || items.length} item(s) in this shipment</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const itemPrice = item.DiscountedPrice ?? item.Price ?? 0;
                  const itemTotal = itemPrice * (item.Quantity || 1);

                  return (
                    <div
                      key={`${item.ItemId}-${item.VariantId || idx}`}
                      className="py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-20 h-24 rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 border border-gray-200/60 shadow-xs">
                          <Image
                            src={item.Image || "/images/default-product.jpg"}
                            alt={item.Name || "Product"}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.src = "/images/default-product.jpg";
                              e.target.onerror = null;
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2">
                            {item.Name}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {item.SelectedColor && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Color: {item.SelectedColor}
                              </span>
                            )}
                            {item.SelectedSize && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Size: {item.SelectedSize}
                              </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-[#32BBAB]">
                              Qty: {item.Quantity}
                            </span>
                          </div>

                          {item.SKU && (
                            <p className="text-xs text-gray-400 font-mono">SKU: {item.SKU}</p>
                          )}
                        </div>
                      </div>

                      <div className="text-right w-full sm:w-auto flex sm:flex-col justify-between sm:justify-center items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                        <span className="text-xs text-gray-400 sm:hidden">Item Total</span>
                        <div>
                          <p className="font-bold text-gray-900 text-base">{money(itemTotal)}</p>
                          {item.Quantity > 1 && (
                            <p className="text-xs text-gray-400">({money(itemPrice)} each)</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* CUSTOMER & SHIPPING INFORMATION CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#32BBAB]">
                  <FiUser className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 manrope">Customer & Shipping Info</h2>
                  <p className="text-xs text-gray-500">Destination and contact details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Box */}
                <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <FiFileText className="w-4 h-4 text-[#32BBAB]" /> Billing Details
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-semibold text-gray-900 text-base">{order.CustomerName || "-"}</p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FiPhone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {order.Phone || "-"}
                    </p>
                    <p className="text-gray-600 flex items-center gap-2">
                      <FiMail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {order.Email || "-"}
                    </p>
                    <p className="text-gray-600 flex items-start gap-2 pt-1">
                      <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>
                        {order.BillingAddress}
                        {order.BillingArea ? `, ${order.BillingArea}` : ""}
                        {order.BillingCity ? `, ${order.BillingCity}` : ""}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Shipping Box */}
                <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <FiMapPin className="w-4 h-4 text-[#32BBAB]" /> Shipping Address
                  </div>

                  {sameAsBilling ? (
                    <div className="pt-2 text-sm text-gray-500 space-y-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#32BBAB] text-xs font-semibold rounded-full">
                        <FiCheck className="w-3.5 h-3.5" /> Same as Billing Address
                      </span>
                      <p className="text-xs text-gray-500 pt-1">
                        Package will be delivered to the billing address listed on the left.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-sm">
                      <p className="font-semibold text-gray-900 text-base">{order.ShippingName || order.CustomerName}</p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <FiPhone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {order.ShippingPhone || order.Phone}
                      </p>
                      <p className="text-gray-600 flex items-center gap-2">
                        <FiMail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {order.ShippingEmail || order.Email}
                      </p>
                      <p className="text-gray-600 flex items-start gap-2 pt-1">
                        <FiMapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>
                          {order.ShippingAddress}
                          {order.ShippingArea ? `, ${order.ShippingArea}` : ""}
                          {order.ShippingCity ? `, ${order.ShippingCity}` : ""}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes Callout */}
              {order.Notes && order.Notes !== "No Notes Available" && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-amber-900 text-sm flex items-start gap-3">
                  <FiFileText className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-amber-950">Order Instructions / Note:</span>
                    <p className="text-amber-800 text-xs mt-0.5">{order.Notes}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Financials */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* ORDER FINANCIAL SUMMARY CARD */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-gray-100 space-y-6 sticky top-28"
            >
              <h2 className="text-xl font-bold text-gray-900 manrope pb-4 border-b border-gray-100">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{money(order.Subtotal)}</span>
                </div>

                {Number(order.Discount) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                      Discount {order.CouponCode ? `(${order.CouponCode})` : ""}
                    </span>
                    <span className="font-medium">-{money(order.Discount)}</span>
                  </div>
                )}

                {Number(order.TotalVat) > 0 && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>VAT</span>
                    <span className="font-medium text-gray-900">+{money(order.TotalVat)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-gray-900">
                    {Number(order.DeliveryCharge) > 0 ? `+${money(order.DeliveryCharge)}` : "Free"}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-gray-900 block">Total Amount</span>
                    <span className="text-xs text-gray-400">Includes all taxes</span>
                  </div>
                  <span className="text-2xl font-extrabold text-[#32BBAB] manrope">
                    {money(order.Total)}
                  </span>
                </div>
              </div>

              {/* PAYMENT METADATA BOX */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Payment Method</span>
                  <span className="font-bold text-gray-800 uppercase px-2 py-0.5 bg-white rounded border border-gray-200">
                    {order.PaymentMethod || "COD"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Payment Status</span>
                  <span
                    className={`font-bold uppercase px-2 py-0.5 rounded ${
                      order.PaymentStatus === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.PaymentStatus || "Pending"}
                  </span>
                </div>

                {order.TransactionId && (
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between gap-2">
                    <span className="text-gray-500">Txn ID:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-gray-800 font-semibold truncate max-w-[140px]">
                        {order.TransactionId}
                      </span>
                      <button
                        onClick={() => handleCopy(order.TransactionId, "txn")}
                        className="text-gray-400 hover:text-[#32BBAB]"
                        title="Copy Txn ID"
                      >
                        {copiedTxn ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* NEED ASSISTANCE CARD */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2 font-bold text-[#32BBAB]">
                  <FiHelpCircle className="w-4 h-4" /> Need Help With Your Order?
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Our customer support team is available 24/7 to assist with tracking or order modifications.
                </p>
                <div className="pt-1 flex items-center gap-4 font-semibold text-gray-900">
                  <Link href="/contact" className="hover:text-[#32BBAB] underline">
                    Contact Support
                  </Link>
                  <span>•</span>
                  <Link href="/delivery-timeline" className="hover:text-[#32BBAB] underline">
                    Shipping Policy
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* RECOMMENDED PRODUCTS SECTION: "COMPLETE YOUR STYLE" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-10 border-t border-gray-200 print:hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#32BBAB]">
                Inspire Your Wardrobe
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 manrope mt-1">
                You Might Also Love
              </h2>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#32BBAB] hover:text-teal-700 transition"
            >
              Explore Full Catalog <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100">
                  <div className="aspect-3/4 bg-gray-200 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </section>
  );
}
