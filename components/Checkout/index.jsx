"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/provider/AuthProvider";
import { useCart } from "@/provider/CartProvider";
import Login from "./Login";
import Billing from "./Billing";
import Shipping from "./Shipping";
import CheckoutOrderSummary from "./CheckoutOrderSummary";
import SuccessModal from "./SuccessModal";
import CheckoutAuthModal from "./CheckoutAuthModal";
import { getAllDistricts, getSubDistricts } from "@/lib/server/addressCache";
import { getSubDistrictAmount } from "@/lib/server/addressData";
import config from "@/config";
import { initiateSSLCommerzPayment, validateSSLCommerzPayment } from "@/app/utils/sslcommerzService";
import { generateTranId } from "@/app/utils/generateTranId";
import { useFeatures } from "@/hooks/useFeatures";

const Checkout = () => {
  const { loginData } = useAuth();
  const { features, loading: featuresLoading } = useFeatures();
  const { cartItems: allCartItems, removeAllItems } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSameAsBilling, setIsSameAsBilling] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCheckoutButtonEnabled = features?.enable_checkout_button !== false;

  // STATE FOR CLIENT-SIDE ONLY CALCULATIONS
  const [mounted, setMounted] = useState(false);
  const [cartItems, setCartItems] = useState([]); // Client-side only state
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [billing, setBilling] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    area: '',
    districtId: 0,
    subDistrictId: 0
  });
  const [shipping, setShipping] = useState({
    name2: '',
    address2: '',
    city2: '',
    area2: '',
    phone2: '',
    email2: '',
    districtId2: 0,
    subDistrictId2: 0
  });
  const now = new Date();
  const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();
  const [notes, setNotes] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [isCalculatingCharge, setIsCalculatingCharge] = useState(false);
  const [totalVat, setTotalVat] = useState(0);
  // Set mounted state on client only
  useEffect(() => {
    setMounted(true);
  }, []);
  const isExclusiveVat = useCallback((vatType) => {
    return String(vatType || "").trim().toLowerCase() === "exclusive";
  }, []);

  const calcItemVatAmount = useCallback(
    (item) => {
      const basePrice = Number(item.discountedPrice ?? item.price ?? 0);
      const qty = Number(item.quantity ?? 0);
      const vatPercent = Number(item.vat ?? 0);

      if (!isExclusiveVat(item.vatType) || vatPercent <= 0 || basePrice <= 0 || qty <= 0) return 0;

      const vat = (basePrice * qty * vatPercent) / 100;
      return Math.round(vat);
    },
    [isExclusiveVat]
  );
  // Update cart items and calculations only on client
  useEffect(() => {
    if (!mounted) return;

    const filteredItems = allCartItems.filter(item => item.checked ?? true);
    setCartItems(filteredItems);

    const newSubtotal = filteredItems.reduce(
      (sum, item) => sum + (Number(item.discountedPrice ?? item.price ?? 0) * Number(item.quantity ?? 0)),
      0
    );

    // Sum of already rounded per-item VAT → still round the total just to be safe
    const vatSum = filteredItems.reduce((sum, item) => sum + calcItemVatAmount(item), 0);
    const newTotalVat = Math.round(vatSum);

    setSubtotal(Math.round(newSubtotal));           // also round subtotal for consistency
    setTotalVat(newTotalVat);

    // Total = subtotal + vat + delivery - discount (all rounded)
    const newTotal = Math.round(newSubtotal) + newTotalVat + deliveryCharges - discount;
    setTotal(newTotal);
  }, [mounted, allCartItems, discount, deliveryCharges, calcItemVatAmount]);

  useEffect(() => {
    getAllDistricts().catch(console.error);
  }, []);

  const calculateDelivery = useCallback(
    async (subDistrictId, districtId) => {
      if (!subDistrictId || !districtId) {
        setDeliveryCharges(0);
        return;
      }

      setIsCalculatingCharge(true);
      try {
        await getSubDistricts(districtId);
        const amount = await getSubDistrictAmount(subDistrictId);
        setDeliveryCharges(Math.round(amount));
      } catch (e) {
        console.error("Delivery charge error:", e);
        setDeliveryCharges(0);
      } finally {
        setIsCalculatingCharge(false);
      }
    },
    []
  );

  useEffect(() => {
    if (loginData && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [loginData, showAuthModal]);

  useEffect(() => {
    if (loginData?.Email) {
      setBilling(prev => ({
        ...prev,
        email: loginData.Email,
        name: loginData.Name || '',
        phone: loginData.Phone || ''
      }));
    }
  }, [loginData]);

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingDistrictChange = (districtId, districtName) => {
    setBilling(prev => ({
      ...prev,
      districtId,
      city: districtName,
      subDistrictId: 0,
      area: '',
    }));
  };

  const handleBillingSubDistrictChange = async (subDistrictId, subDistrictName) => {
    setBilling(prev => ({
      ...prev,
      subDistrictId,
      area: subDistrictName,
    }));

    if (isSameAsBilling && subDistrictId) {
      await calculateDelivery(subDistrictId, billing.districtId);
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingDistrictChange = (districtId, districtName) => {
    setShipping(prev => ({
      ...prev,
      districtId2: districtId,
      city2: districtName,
      subDistrictId2: 0,
      area2: '',
    }));
  };

  const handleShippingSubDistrictChange = async (subDistrictId, subDistrictName) => {
    setShipping(prev => ({
      ...prev,
      subDistrictId2: subDistrictId,
      area2: subDistrictName,
    }));

    if (!isSameAsBilling && subDistrictId) {
      await calculateDelivery(subDistrictId, shipping.districtId2);
    }
  };

  useEffect(() => {
    const sync = async () => {
      if (isSameAsBilling) {
        setShipping({
          name2: billing.name,
          address2: billing.address,
          city2: billing.city,
          area2: billing.area,
          phone2: billing.phone,
          email2: billing.email,
          districtId2: billing.districtId,
          subDistrictId2: billing.subDistrictId,
        });

        await calculateDelivery(billing.subDistrictId, billing.districtId);
      } else {
        await calculateDelivery(shipping.subDistrictId2, shipping.districtId2);
      }
    };

    sync();
  }, [
    isSameAsBilling,
    billing.name, billing.phone, billing.email, billing.address,
    billing.city, billing.area, billing.districtId, billing.subDistrictId,
    shipping.districtId2, shipping.subDistrictId2,
    calculateDelivery,
  ]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleCouponApply = (coupon, discount) => {
    setCoupon(coupon);
    setDiscount(discount);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentError(null);
  };

  const generateInvoice = () => {
    return `INV${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const updateStockQuantities = async (items) => {
    try {
      for (const item of items) {
        const response = await fetch(`${config.API_BASE_URL}api/EItem/UpdateStock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TenantId': config.tenantId,
          },
          body: JSON.stringify({
            ItemId: item.id,
            Quantity: item.quantity
          })
        });

        if (!response.ok) {
          let errorMessage = `Failed to update stock for item ${item.id}`;
          try {
            const errorData = await response.text();
            if (errorData) {
              try {
                const parsedError = JSON.parse(errorData);
                errorMessage += `: ${parsedError.message || errorData}`;
              } catch {
                errorMessage += `: ${errorData}`;
              }
            }
          } catch (e) {
            console.error('Error reading error response:', e);
          }
          throw new Error(errorMessage);
        }

        const responseText = await response.text();
        const result = responseText ? JSON.parse(responseText) : { Success: true };

        if (!result.Success) {
          throw new Error(`Failed to update stock for item ${item.id}`);
        }
      }
    } catch (error) {
      console.error('Stock update error:', error);
      throw error;
    }
  };

  const handleSSLCommerzPayment = async () => {
    setIsProcessing(true);
    setPaymentError(null);

    let tranId = '';
    let invoiceNo = '';

    try {
      if (!loginData?.Id && !isGuestCheckout) {
        throw new Error('User not properly authenticated');
      }

      if (!billing.name || !billing.phone || !billing.email ||
        !billing.address || !billing.city || !billing.area) {
        throw new Error('Please fill in all required customer information');
      }

      const orderItems = cartItems.map(item => ({
        product_name: item.title,
        quantity: item.quantity,
        unit_price: item.discountedPrice ?? item.price,
      }));

      invoiceNo = generateInvoice();
      tranId = generateTranId();
      //console.log('Generated tranId:', tranId, 'InvoiceNo:', invoiceNo);

      const pendingOrder = {
        userId: loginData?.Id || 0,
        invoiceNo,
        billing,
        shipping,
        notes,
        coupon,
        discount,
        deliveryCharges,
        cartItems,
        total,
        totalVat,
        paymentMethod: 'sslcommerz'
      };

      localStorage.setItem(`pendingOrder_${tranId}`, JSON.stringify(pendingOrder));
      localStorage.setItem(`tran_id_${tranId}`, tranId);

      const { gateway_url } = await initiateSSLCommerzPayment(
        total,
        tranId,
        {
          name: billing.name,
          email: billing.email,
          phone: billing.phone,
          address: billing.address,
          city: billing.city,
          area: billing.area,
        },
        `${config.API_BASE_URL}api/payment/success?tran_id=${tranId}`,
        `${config.API_BASE_URL}api/payment/cancel?tran_id=${tranId}`,
        `${config.API_BASE_URL}api/payment/fail?tran_id=${tranId}`,
        `${config.API_BASE_URL}api/payment/ipn`,
        orderItems,
        loginData?.Id?.toString() || 'guest',
        {
          value_c: JSON.stringify({
            delivery_charge: deliveryCharges,
            discount,
            coupon,
            invoice_no: invoiceNo
          })
        }
      );
      window.location.href = gateway_url;
    } catch (error) {
      console.error('SSLCommerz payment initiation error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Payment initiation failed');
      setIsProcessing(false);
      localStorage.removeItem(`pendingOrder_${tranId}`);
      localStorage.removeItem(`tran_id_${tranId}`);
    }
  };
  const completeOrderAfterPayment = useCallback(
    async (tranId, checkoutData, bankTranId) => {
      if (sessionStorage.getItem(`processing_${tranId}`)) {
        //console.log(`Already processing transaction ${tranId}`);
        return;
      }

      if (localStorage.getItem(`orderSaved_${tranId}`)) {
        // console.log('Order already saved for this transaction', tranId);
        setIsModalOpen(true);
        localStorage.removeItem(`pendingOrder_${tranId}`);
        localStorage.removeItem(`tran_id_${tranId}`);
        return;
      }

      sessionStorage.setItem(`processing_${tranId}`, '1');

      try {
        const totalQuantity = checkoutData.cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const eOrderItems = checkoutData.cartItems.map(item => ({
          ItemId: item.id,
          Name: item.title,
          Price: item.price,
          Brand: item.brand || null,
          SKU: item.sku || null,
          Barcode: item.barcode || null,
          DiscountedPrice: item.discountedPrice ?? item.price,
          Quantity: item.quantity,
          Image: item.image,
          SelectedColor: item.color,
          SelectedSize: item.size,
          VariantId: item.variantId,
          VatType: item.vatType,
          VatPercent: Number(item.vat ?? 0),
          VatAmount: calcItemVatAmount(item),
        }));

        const payload = {
          CustomerId: checkoutData.userId,
          InvoiceNo: checkoutData.invoiceNo,
          CustomerName: checkoutData.billing.name,
          Phone: checkoutData.billing.phone,
          Email: checkoutData.billing.email,
          BillingAddress: checkoutData.billing.address,
          BillingCity: checkoutData.billing.city,
          BillingArea: checkoutData.billing.area,
          ShippingName: checkoutData.shipping.name2 || checkoutData.billing.name,
          ShippingAddress: checkoutData.shipping.address2 || checkoutData.billing.address,
          ShippingCity: checkoutData.shipping.city2 || checkoutData.billing.city,
          ShippingArea: checkoutData.shipping.area2 || checkoutData.billing.area,
          ShippingPhone: checkoutData.shipping.phone2 || checkoutData.billing.phone,
          ShippingEmail: checkoutData.shipping.email2 || checkoutData.billing.email,
          Notes: checkoutData.notes || 'No Notes Available',
          CouponCode: checkoutData.coupon,
          Discount: checkoutData.discount,
          Subtotal: Math.round(checkoutData.total - checkoutData.deliveryCharges + checkoutData.discount),
          DeliveryCharge: Math.round(checkoutData.deliveryCharges),
          Total: Math.round(checkoutData.total),
          PaymentMethod:
            checkoutData.paymentMethod === 'moneybag' ? 'Moneybag' :
              checkoutData.paymentMethod === 'sslcommerz' ? 'SSL Commerz' :
                checkoutData.paymentMethod === 'cash' ? 'Cash' : 'Bank',
          ShipmentStatus: 0,
          TransactionId: tranId,
          BankTranId: bankTranId || null,
          OrderDate: new Date().toISOString(),
          EOrderItems: eOrderItems,
          OrderQty: totalQuantity,
          TotalVat: Math.round(checkoutData.totalVat ?? totalVat),
        };

        //console.log('Saving order with payload:', payload);

        const response = await fetch(`${config.API_BASE_URL}api/EOrder/AddOrder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'TenantId': config.tenantId,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Order creation failed: ${errorText}`);
        }

        await response.json();

        try {
          const stockItems = checkoutData.cartItems.map(i => ({ id: i.id, quantity: i.quantity }));
          await updateStockQuantities(stockItems);
        } catch (err) {
          console.error('Stock update failed after order creation:', err);
        }

        removeAllItems();

        localStorage.setItem(`orderSaved_${tranId}`, 'true');
        localStorage.removeItem(`pendingOrder_${tranId}`);
        localStorage.removeItem(`tran_id_${tranId}`);

        setIsModalOpen(true);
      } catch (error) {
        console.error('Order completion error:', error);
        setPaymentError(error instanceof Error ? error.message : 'Order creation failed after payment');
        throw error;
      } finally {
        sessionStorage.removeItem(`processing_${tranId}`);
      }
    },
    [removeAllItems, calcItemVatAmount, totalVat]
  );

  useEffect(() => {
    let isMounted = true;

    const checkPaymentCallback = async () => {
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : searchParams;
      const status = urlParams.get('status');
      const tranIdFromUrl = urlParams.get('tran_id');
      const valId = urlParams.get('val_id');

      if (!status || !tranIdFromUrl || !isMounted) {
        // console.log('Missing required parameters or component unmounted:', { status, tranIdFromUrl, isMounted });
        return;
      }

      if (sessionStorage.getItem(`handled_${tranIdFromUrl}`)) {
        //console.log(`Transaction ${tranIdFromUrl} already handled in this session.`);
        return;
      }
      sessionStorage.setItem(`handled_${tranIdFromUrl}`, '1');

      if (status === 'success') {
        setIsProcessing(true);
        setPaymentError(null);

        try {
          const transactionId = tranIdFromUrl;
          let bankTranId = null;

          if (valId) {
            const validationData = await validateSSLCommerzPayment(valId);
            if (validationData.status === 'VALID' || validationData.status === 'VALIDATED') {
              bankTranId = validationData.bank_tran_id;
              // console.log('Payment validated successfully:', validationData);
              // console.log('Original tran_id:', transactionId);
              // console.log('Bank tran_id:', bankTranId);
              // console.log('Validation tran_id:', validationData.tran_id);
            } else {
              throw new Error('Payment validation failed');
            }
          }

          const pendingOrderStr = localStorage.getItem(`pendingOrder_${transactionId}`);
          if (!pendingOrderStr) {
            console.warn('No pending order found for this transaction. It may have been processed already.');
            setIsModalOpen(true);
            router.replace('/checkout');
            return;
          }

          const pendingOrder = JSON.parse(pendingOrderStr);

          const originalTranId = localStorage.getItem(`tran_id_${transactionId}`);
          if (originalTranId !== transactionId) {
            console.warn(`Transaction ID mismatch. Expected: ${originalTranId}, Received: ${transactionId}`);
          }

          await completeOrderAfterPayment(transactionId, pendingOrder, bankTranId);
          // console.log('Order completed successfully with transaction ID:', transactionId);

          if (bankTranId) {
            localStorage.setItem(`bank_tran_id_${transactionId}`, bankTranId);
          }
        } catch (error) {
          console.error('Payment processing error:', error);
          setPaymentError(error instanceof Error ? error.message : 'Payment processing failed');
          router.replace('/checkout');
        } finally {
          setIsProcessing(false);
          localStorage.removeItem(`pendingOrder_${tranIdFromUrl}`);
          localStorage.removeItem(`tran_id_${tranIdFromUrl}`);
        }
      } else if (status === 'cancel' || status === 'fail') {
        setPaymentError(status === 'cancel' ? 'Payment was cancelled' : 'Payment failed');
        localStorage.removeItem(`pendingOrder_${tranIdFromUrl}`);
        localStorage.removeItem(`tran_id_${tranIdFromUrl}`);
        router.replace('/checkout');
      }
    };

    checkPaymentCallback();

    return () => {
      isMounted = false;
    };
  }, [searchParams, completeOrderAfterPayment, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGuestCheckout && !loginData) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      setShowAuthModal(true);
      return;
    }
    if (!billing.subDistrictId) {
      setPaymentError('Please select a sub-district for billing address');
      return;
    }
    if (!isSameAsBilling && !shipping.subDistrictId2) {
      setPaymentError('Please select a sub-district for shipping address');
      return;
    }
    if (!billing.name || !billing.phone || !billing.address ||
      !billing.city || !billing.area) {
      setPaymentError('Please fill in all required billing information');
      return;
    }
    if (!isSameAsBilling && (!shipping.name2 || !shipping.address2 ||
      !shipping.city2 || !shipping.area2)) {
      setPaymentError('Please fill in all required shipping information');
      return;
    }
    if (paymentMethod === 'sslcommerz') {
      await handleSSLCommerzPayment();
      return;
    }
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      const eOrderItems = cartItems.map(item => ({
        ItemId: item.id,
        Name: item.title,
        Price: item.price,
        DiscountedPrice: item.discountedPrice ?? item.price,
        Quantity: item.quantity,
        Image: item.image,
        SelectedColor: item.color,
        SelectedSize: item.size,
        Brand: item.brand ?? null,
        SKU: item.sku ?? null,
        Barcode: item.barcode ?? null,
        VatType: item.vatType,
        VariantId: item.variantId,
        VatPercent: Number(item.vat ?? 0),
        VatAmount: calcItemVatAmount(item),
      }));

      const payload = {
        CustomerId: loginData?.Id || 0,
        InvoiceNo: generateInvoice(),
        CustomerName: billing.name,
        Phone: billing.phone,
        Email: billing.email,
        BillingAddress: billing.address,
        BillingCity: billing.city,
        BillingArea: billing.area,
        ShippingName: isSameAsBilling ? billing.name : shipping.name2,
        ShippingAddress: isSameAsBilling ? billing.address : shipping.address2,
        ShippingCity: isSameAsBilling ? billing.city : shipping.city2,
        ShippingArea: isSameAsBilling ? billing.area : shipping.area2,
        ShippingPhone: isSameAsBilling ? billing.phone : shipping.phone2,
        ShippingEmail: isSameAsBilling ? billing.email : shipping.email2,
        Notes: notes || 'No Notes Available',
        CouponCode: coupon,
        Discount: discount,
        Subtotal: Math.round(subtotal),               
        DeliveryCharge: Math.round(deliveryCharges),  
        Total: Math.round(total),
        PaymentMethod: paymentMethod === 'cash' ? 'Cash' : 'Bank',
        ShipmentStatus: 0,
        TransactionId: null,
        OrderDate: localISOTime,
        EOrderItems: eOrderItems,
        OrderQty: totalQuantity,
        TotalVat: Math.round(totalVat),
      };

      console.log('Submitting order (non-payment gateway):', payload);

      const response = await fetch(`${config.API_BASE_URL}api/EOrder/AddOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TenantId': config.tenantId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order submission failed: ${errorText}`);
      }

      const orderResponse = await response.json();
      console.log('Order created successfully:', orderResponse);

      try {
        await updateStockQuantities(cartItems);
      } catch (error) {
        console.error('Stock update failed:', error);
      }

      removeAllItems();
      setIsModalOpen(true);
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError(error instanceof Error ? error.message : 'Order submission failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGuestCheckout = () => {
    setIsGuestCheckout(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    router.push('/');
  };

  return (
    <>
      <section className="overflow-hidden py-10 pt-32 bg-gray-200">
        <div className="max-w-300 w-full mx-auto px-4 sm:px-8 xl:px-0">
          {paymentError && (
            <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              {paymentError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7 xl:gap-7">
              <div className="lg:max-w-167.5 w-full order-2 lg:order-1">
                <Login />
                <Billing
                  data={billing}
                  onChange={handleBillingChange}
                  onDistrictChange={handleBillingDistrictChange}
                  onSubDistrictChange={handleBillingSubDistrictChange}
                  onSameAsBillingChange={setIsSameAsBilling}
                  isSameAsBilling={isSameAsBilling}
                />
                <Shipping
                  data={shipping}
                  onChange={handleShippingChange}
                  onDistrictChange={handleShippingDistrictChange}
                  onSubDistrictChange={handleShippingSubDistrictChange}
                  disabled={isSameAsBilling}
                />
                <div className="bg-white shadow-1 rounded-sm p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>
                    <textarea
                      name="notes"
                      id="notes"
                      value={notes}
                      onChange={handleNotesChange}
                      rows={5}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-300 bg-gray-100 placeholder:text-gray-700 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20"
                    ></textarea>
                  </div>
                  {isCheckoutButtonEnabled && (
                    <div className="lg:hidden bg-white mt-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full flex justify-center font-medium text-white bg-[#32BBAB] py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-[#4faa9f]"
                        disabled={!mounted || cartItems.length === 0 || isProcessing || featuresLoading}
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
              <div className="w-full order-1 lg:order-2">
                <CheckoutOrderSummary
                  onApplyCoupon={handleCouponApply}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  paymentMethod={paymentMethod}
                  onSubmit={handleSubmit}
                  isProcessing={isProcessing}
                  deliveryCharges={deliveryCharges}
                  isCalculatingCharge={isCalculatingCharge}
                />
              </div>
            </div>
          </form>
        </div>
      </section>
      <SuccessModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
      <CheckoutAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onGuestCheckout={handleGuestCheckout}
      />
    </>
  );
};

export default Checkout;