"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Coupon from "./Coupon";
import { useCart } from "@/provider/CartProvider";
import PaymentMethod from "./PaymentMethod";
import { useFeatures } from "@/hooks/useFeatures";

const CheckoutOrderSummary = ({
  onApplyCoupon,
  onPaymentMethodChange,
  paymentMethod,
  onSubmit,
  isProcessing = false,
  deliveryCharges,
  isCalculatingCharge = false
}) => {
  const { cartItems } = useCart();
  const [discount, setDiscount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { features, loading: featuresLoading } = useFeatures();
  const isCheckoutButtonEnabled = features?.enable_checkout_button !== false;
  // Use setTimeout to defer state update
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Use a stable reference for filtered items
  const filteredItems = mounted ? cartItems.filter(item => item.checked ?? true) : [];
  const isExclusiveVat = (vatType) =>
    String(vatType || "").trim().toLowerCase() === "exclusive";

  const calcItemVatAmount = (item) => {
    const basePrice = Number(item.discountedPrice ?? item.price ?? 0);
    const qty = Number(item.quantity ?? 0);
    const vatPercent = Number(item.vat ?? 0);

    if (!isExclusiveVat(item.vatType) || vatPercent <= 0 || basePrice <= 0 || qty <= 0) return 0;
    const vat = (basePrice * qty * vatPercent) / 100;
    return Math.round(vat);
  };

  const totalVat = Math.round(
    filteredItems.reduce((sum, item) => sum + calcItemVatAmount(item), 0)
  );
  const subtotal = Math.round(
    filteredItems.reduce(
      (sum, item) => sum + (Number(item.discountedPrice ?? item.price ?? 0) * Number(item.quantity ?? 0)),
      0
    )
  );
  const total = Math.round(subtotal + totalVat - discount + deliveryCharges);

  const handleApplyCoupon = (couponCode, discountAmount) => {
    setDiscount(discountAmount);
    onApplyCoupon(couponCode, discountAmount);
  };

  const handlePaymentMethodChange = (method) => {
    onPaymentMethodChange(method);
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  // Return loading skeleton during SSR
  if (!mounted) {
    return (
      <div className="lg:max-w-150 w-full">
        <div className="bg-white shadow-1 rounded-sm">
          <div className="border-b border-gray-300 py-5 px-4 sm:px-8.5">
            <h3 className="font-medium text-xl text-gray-800">Order Summary</h3>
          </div>
          <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
            {/* Skeleton loader */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-300">
                  <div className="flex items-center gap-3">
                    <div className="w-17.5 h-20 rounded-md bg-gray-200 animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 animate-pulse w-32 rounded"></div>
                      <div className="h-3 bg-gray-200 animate-pulse w-24 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 animate-pulse w-16 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:max-w-150 w-full">
      <div className="bg-white shadow-1 rounded-sm">
        <div className="border-b border-gray-300 py-5 px-4 sm:px-8.5">
          <h3 className="font-medium text-xl text-gray-800">Order Summary</h3>
        </div>

        <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
          <div className="flex items-center justify-between py-3 border-b border-gray-300">
            <div><h4 className="font-medium text-gray-700">Product</h4></div>
            <div><h4 className="font-medium text-gray-700 text-right">Subtotal</h4></div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">No items in cart</p>
            </div>
          ) : (
            filteredItems.slice().reverse().map((item, idx) => (
              <div
                key={item.variantId ?? `${item.id}-${item.color ?? ''}-${item.size ?? ''}-${idx}`}
                className="flex items-center justify-between py-3 border-b border-gray-300"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-md bg-gray-200 max-w-17 w-full h-17">
                    <div className="w-17.5 h-20 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
                      <Image
                        width={70}
                        height={70}
                        src={item.image || '/images/default-product.jpg'}
                        alt={item.title || "Product"}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          e.target.src = '/images/default-product.jpg';
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-start text-sm text-gray-700">
                      {item.title || "Unknown Product"}
                    </p>

                    {item.color && (
                      <p className="text-xs text-gray-500">Color: {item.color} | <span className="text-gray-500">Qty : {item.quantity}</span> </p>
                    )}

                    {item.size && (
                      <p className="text-xs text-gray-500">Size: {item.size}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 text-right">
                    {((item.discountedPrice ?? item.price ?? 0) * (item.quantity || 1)).toFixed(2)} Tk
                  </p>
                </div>
              </div>
            ))
          )}

          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-700">Sub Total</p>
              <p className="text-gray-700">{subtotal.toFixed(2)} Tk</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-700">Discount</p>
              <p className="text-gray-700">-{discount.toFixed(2)} Tk</p>
            </div>
            {totalVat > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-gray-700">VAT</p>
                <p className="text-gray-700">+{totalVat.toFixed(2)} Tk</p>
              </div>
            )}
            {deliveryCharges > 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Delivery Charges</p>
               <span>{deliveryCharges > 0 ? `+${Math.round(deliveryCharges)} Tk` : '-'}</span>
              </div>
            ) : isCalculatingCharge ? (
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Delivery Charges</p>
                <div className="flex items-end gap-0.5">
                  <div className="wave-bar h-4 w-1.5 bg-teal-600 animate-wave-1"></div>
                  <div className="wave-bar h-4 w-1.5 bg-teal-600 animate-wave-2"></div>
                  <div className="wave-bar h-4 w-1.5 bg-teal-600 animate-wave-3"></div>
                  <div className="wave-bar h-4 w-1.5 bg-teal-600 animate-wave-4"></div>
                  <div className="wave-bar h-4 w-1.5 bg-teal-600 animate-wave-5"></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-700">Delivery Charges</p>
                <p className="text-gray-500">-</p>
              </div>
            )}
          </div>

          {/* Move inline styles to a separate style element outside JSX */}
          <style>
            {`
              @keyframes wave {
                0%, 100% { transform: translateY(0); }
                50%      { transform: translateY(-6px); }
              }
              .animate-wave-1 { animation: wave 1.2s ease-in-out infinite; animation-delay: 0s; }
              .animate-wave-2 { animation: wave 1.2s ease-in-out infinite; animation-delay: 0.1s; }
              .animate-wave-3 { animation: wave 1.2s ease-in-out infinite; animation-delay: 0.2s; }
              .animate-wave-4 { animation: wave 1.2s ease-in-out infinite; animation-delay: 0.3s; }
              .animate-wave-5 { animation: wave 1.2s ease-in-out infinite; animation-delay: 0.4s; }
            `}
          </style>

          <div className="flex items-center justify-between pt-3 border-t border-gray-300 mt-3">
            <div><p className="font-medium text-lg text-gray-700">Total</p></div>
            <div><p className="font-medium text-lg text-gray-700 text-right">{total.toFixed(2)} Tk</p></div>
          </div>

          <Coupon onApplyCoupon={handleApplyCoupon} subtotal={subtotal} />
          <PaymentMethod
            onPaymentMethodChange={handlePaymentMethodChange}
            currentMethod={paymentMethod}
          />

          <div className="hidden lg:block">
            {isCheckoutButtonEnabled && (
              <div className="hidden lg:block">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full flex justify-center font-medium text-gray-50 bg-teal-600 py-2.5 px-6 rounded-sm ease-out duration-200 hover:bg-teal-700 mt-6"
                  disabled={filteredItems.length === 0 || isProcessing || featuresLoading}
                >
                  {isProcessing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Process to Checkout'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutOrderSummary;