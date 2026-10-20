"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/provider/AuthProvider";
import { useCart } from "@/provider/CartProvider";
import Login from "./Login";
import Billing from "./Billing";
import Shipping from "./Shipping";
import CheckoutOrderSummary from "./CheckoutOrderSummary";
import CheckoutAuthModal from "./CheckoutAuthModal";
import { getAllDistricts, getSubDistricts } from "@/lib/server/addressCache";
import { getSubDistrictAmount } from "@/lib/server/addressData";
import config from "@/config";
import { initiateSSLCommerzPayment, validateSSLCommerzPayment } from "@/app/utils/sslcommerzService";
import { generateTranId } from "@/app/utils/generateTranId";
import { useFeatures } from "@/hooks/useFeatures";
import { trackEvent } from "@/lib/trackEvent";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";

const Checkout = () => {
  const { loginData } = useAuth();
  const { features, loading: featuresLoading } = useFeatures();
  const { cartItems: allCartItems, removeAllItems, buyNowItem, clearBuyNowItem } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  // Shipping always mirrors billing — no separate shipping address needed on this store
  const [isSameAsBilling, setIsSameAsBilling] = useState(true);
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSavedOnce, setAddressSavedOnce] = useState(false);
  const [addressFoundFromLookup, setAddressFoundFromLookup] = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const [billing, setBilling] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    country: 'Bangladesh',
    city: '',
    area: '',
    districtId: 0,
    subDistrictId: 0,
    zipCode: ''
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
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [termsAccepted, setTermsAccepted] = useState(false);
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

    const filteredItems = buyNowItem
      ? [buyNowItem]
      : allCartItems.filter(item => item.checked ?? true);
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

    if (filteredItems.length > 0) {
      trackEvent('begin_checkout', {
        value: Math.round(newSubtotal),
        numItems: filteredItems.reduce((s, i) => s + i.quantity, 0),
        contentIds: filteredItems.map((i) => String(i.id)),
        contents: filteredItems.map((i) => ({
          id: i.id,
          title: i.title,
          price: Number(i.discountedPrice ?? i.price ?? 0),
          quantity: i.quantity,
        })),
      });
    }
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

  const buildFullName = (b) => `${b.name || ''} ${b.lastName || ''}`.trim();

  const saveBillingToBackend = async (b) => {
    try {
      await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'TenantId': config.tenantId },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomCusAddInfo',
          parameters: {
            QueryChecker: 1,
            Name: b.name,
            LastName: b.lastName,
            Email: b.email,
            Phone: b.phone,
            Address: b.address,
            Country: b.country,
            ZipCode: b.zipCode,
          }
        })
      });
    } catch (err) {
      console.error('Address save error:', err);
    }
  };

  const handleSaveAddress = async () => {
    setIsSavingAddress(true);
    setSaveConfirmed(false);
    await saveBillingToBackend(billing);
    setIsSavingAddress(false);
    setAddressSavedOnce(true);
    setSaveConfirmed(true);
    setTimeout(() => setSaveConfirmed(false), 2500);

    // Shipping always mirrors billing on this store, so saving the billing
    // address is the equivalent of the standard GA4 "add_shipping_info" step.
    trackEvent('add_shipping_info', {
      value: Math.round(total),
      contentIds: cartItems.map((i) => String(i.id)),
      contents: cartItems.map((i) => ({
        id: i.id,
        title: i.title,
        price: Number(i.discountedPrice ?? i.price ?? 0),
        quantity: i.quantity,
        brand: i.brand,
        sku: i.sku,
      })),
      numItems: cartItems.reduce((s, i) => s + i.quantity, 0),
      city: billing.city,
    });
  };

  const handlePhoneLookup = async (phone) => {
    if (!phone || phone.length < 6) return;
    try {
      const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'TenantId': config.tenantId },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomCusAddInfo',
          parameters: { QueryChecker: 2, Phone: phone }
        })
      });
      const result = await res.json();
      const rows = Array.isArray(result) ? result : Array.isArray(result?.data) ? result.data : [];
      if (rows.length > 0) {
        const saved = rows[0];
        setBilling(prev => ({
          ...prev,
          name: saved.Name || prev.name,
          lastName: saved.LastName || prev.lastName,
          email: saved.Email || prev.email,
          address: saved.Address || prev.address,
          country: saved.Country || prev.country,
          zipCode: saved.ZipCode || prev.zipCode,
        }));
        setAddressFoundFromLookup(true);
      }
    } catch (err) {
      console.error('Address lookup error:', err);
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setBilling(prev => ({ ...prev, [name]: value }));
    if (name === 'phone') {
      setAddressFoundFromLookup(false);
      setAddressSavedOnce(false);
      setSaveConfirmed(false);
    }
  };

  const handleBillingDistrictChange = (districtId, districtName) => {
    setFieldErrors(prev => ({ ...prev, districtId: '' }));
    setBilling(prev => ({
      ...prev,
      districtId,
      city: districtName,
      subDistrictId: 0,
      area: '',
    }));
  };

  const handleBillingSubDistrictChange = async (subDistrictId, subDistrictName) => {
    setFieldErrors(prev => ({ ...prev, subDistrictId: '' }));
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
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setShipping(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingDistrictChange = (districtId, districtName) => {
    setFieldErrors(prev => ({ ...prev, districtId2: '' }));
    setShipping(prev => ({
      ...prev,
      districtId2: districtId,
      city2: districtName,
      subDistrictId2: 0,
      area2: '',
    }));
  };

  const handleShippingSubDistrictChange = async (subDistrictId, subDistrictName) => {
    setFieldErrors(prev => ({ ...prev, subDistrictId2: '' }));
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
          name2: buildFullName(billing),
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
    billing.name, billing.lastName, billing.phone, billing.email, billing.address,
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
    trackEvent('add_payment_info', { paymentMethod: method });
  };

  const generateInvoice = () => {
    return `INV${Math.floor(100000 + Math.random() * 900000)}`;
  };

  const goToOrderConfirmation = (orderPayload) => {
    try {
      sessionStorage.setItem('lastOrderConfirmation', JSON.stringify(orderPayload));
    } catch (err) {
      console.error('Failed to persist order confirmation:', err);
    }
    router.push('/order-confirmation');
  };

  // const updateStockQuantities = async (items) => {
  //   try {
  //     for (const item of items) {
  //       const response = await fetch(`${config.API_BASE_URL}api/EItem/UpdateStock`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'TenantId': config.tenantId,
  //         },
  //         body: JSON.stringify({
  //           ItemId: item.id,
  //           Quantity: item.quantity
  //         })
  //       });

  //       if (!response.ok) {
  //         let errorMessage = `Failed to update stock for item ${item.id}`;
  //         try {
  //           const errorData = await response.text();
  //           if (errorData) {
  //             try {
  //               const parsedError = JSON.parse(errorData);
  //               errorMessage += `: ${parsedError.message || errorData}`;
  //             } catch {
  //               errorMessage += `: ${errorData}`;
  //             }
  //           }
  //         } catch (e) {
  //           console.error('Error reading error response:', e);
  //         }
  //         throw new Error(errorMessage);
  //       }

  //       const responseText = await response.text();
  //       const result = responseText ? JSON.parse(responseText) : { Success: true };

  //       if (!result.Success) {
  //         throw new Error(`Failed to update stock for item ${item.id}`);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Stock update error:', error);
  //     throw error;
  //   }
  // };

  const validateFields = () => {
    const errors = {};
    let firstId = null;
    const flag = (key, msg, id) => { errors[key] = msg; if (!firstId) firstId = id ?? key; };

    if (!billing.name.trim()) flag('name', 'First name is required');
    if (!billing.lastName.trim()) flag('lastName', 'Last name is required');
    if (!/^\d{11}$/.test(billing.phone.trim())) flag('phone', 'Phone number must be exactly 11 digits');
    if (!billing.email.trim()) flag('email', 'Email is required');
    if (!billing.address.trim()) flag('address', 'Street address is required');
    if (!billing.country.trim()) flag('country', 'Country/Region is required');
    if (!billing.districtId) flag('districtId', 'Please select a district', 'billing-district');
    if (!billing.subDistrictId) flag('subDistrictId', 'Please select City/Area', 'billing-subdistrict');

    if (!isSameAsBilling) {
      if (!shipping.name2?.trim()) flag('name2', 'Name is required');
      if (!shipping.address2?.trim()) flag('address2', 'Address is required');
      if (!shipping.districtId2) flag('districtId2', 'Please select a district', 'shipping-district');
      if (!shipping.subDistrictId2) flag('subDistrictId2', 'Please select a sub-district', 'shipping-subdistrict');
    }

    return { errors, firstId };
  };

  const handleSSLCommerzPayment = async () => {
    const { errors, firstId } = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setFieldErrors({});

    setIsProcessing(true);
    setPaymentError(null);

    let tranId = '';
    let invoiceNo = '';

    try {
      // Guest users (no loginData) are allowed — CustomerId defaults to 0
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
          name: buildFullName(billing),
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
    async (tranId, checkoutData, bankTranId, cardType, valId) => {
      if (sessionStorage.getItem(`processing_${tranId}`)) {
        //console.log(`Already processing transaction ${tranId}`);
        return;
      }

      if (localStorage.getItem(`orderSaved_${tranId}`)) {
        // console.log('Order already saved for this transaction', tranId);
        router.push('/order-confirmation');
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
          LastName: checkoutData.billing.lastName,
          Phone: checkoutData.billing.phone,
          Email: checkoutData.billing.email,
          BillingAddress: checkoutData.billing.address,
          BillingCity: checkoutData.billing.city,
          BillingArea: checkoutData.billing.area,
          Country: checkoutData.billing.country,
          ZipCode: checkoutData.billing.zipCode,
          ShippingName: checkoutData.shipping.name2 || buildFullName(checkoutData.billing),
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
              checkoutData.paymentMethod === 'sslcommerz' ? (cardType || 'SSL Commerz') :
                checkoutData.paymentMethod === 'cash' ? 'Cash' : 'Bank',
          PaymentStatus: 'Paid',
          ShipmentStatus: 0,
          TransactionId: tranId,
          BankTranId: bankTranId || null,
          ReferenceSSLID: valId || null,
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

        // try {
        //   const stockItems = checkoutData.cartItems.map(i => ({ id: i.id, quantity: i.quantity }));
        //   await updateStockQuantities(stockItems);
        // } catch (err) {
        //   console.error('Stock update failed after order creation:', err);
        // }

        removeAllItems();
        clearBuyNowItem();
        saveBillingToBackend(checkoutData.billing);

        // Purchase is tracked on the order confirmation page instead (using the
        // authoritative saved order, not this pre-redirect cart snapshot) — see
        // components/Checkout/OrderConfirmation.jsx.

        localStorage.setItem(`orderSaved_${tranId}`, 'true');
        localStorage.removeItem(`pendingOrder_${tranId}`);
        localStorage.removeItem(`tran_id_${tranId}`);

        goToOrderConfirmation(payload);
      } catch (error) {
        console.error('Order completion error:', error);
        setPaymentError(error instanceof Error ? error.message : 'Order creation failed after payment');
        throw error;
      } finally {
        sessionStorage.removeItem(`processing_${tranId}`);
      }
    },
    [removeAllItems, calcItemVatAmount, totalVat, router]
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

          let cardType = null;
          if (valId) {
            const validationData = await validateSSLCommerzPayment(valId);
            console.log('SSL Validation response:', validationData);
            console.log('Available SSL Fields:', Object.keys(validationData));
            const validStatus = validationData.status?.toUpperCase();
            if (validStatus === 'VALID' || validStatus === 'VALIDATED') {
              bankTranId = validationData.bank_tran_id || validationData.bankTranId || validationData.BankTranId || '';
              cardType = validationData.card_type || validationData.cardType || validationData.CardType || null;
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

          await completeOrderAfterPayment(transactionId, pendingOrder, bankTranId, cardType, valId);
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
    // Guest checkout allowed without sign-in — no auth modal shown
    const { errors, firstId } = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      document.getElementById(firstId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setFieldErrors({});
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
        LastName: billing.lastName,
        Phone: billing.phone,
        Email: billing.email,
        BillingAddress: billing.address,
        BillingCity: billing.city,
        BillingArea: billing.area,
        Country: billing.country,
        ZipCode: billing.zipCode,
        ShippingName: isSameAsBilling ? buildFullName(billing) : shipping.name2,
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
        PaymentStatus: 'Unpaid',
        ShipmentStatus: 0,
        TransactionId: null,
        BankTranId: null,
        OrderDate: new Date().toISOString(),
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

      // try {
      //   await updateStockQuantities(cartItems);
      // } catch (error) {
      //   console.error('Stock update failed:', error);
      // }

      removeAllItems();
      clearBuyNowItem();
      saveBillingToBackend(billing);

      // Purchase is tracked on the order confirmation page instead (using the
      // authoritative saved order, not this pre-redirect cart snapshot) — see
      // components/Checkout/OrderConfirmation.jsx.

      goToOrderConfirmation(payload);
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

  return (
    <>
      <section className="overflow-hidden py-10 pt-32 bg-gray-200">
        <div className="max-w-300 w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="mb-4">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Checkout', href: null }]} />
          </div>
          {paymentError && (
            <div className="bg-red-100 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
              {paymentError}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7 xl:gap-7">
              <div className="lg:max-w-167.5 w-full order-2 lg:order-1">
                {/* <Login /> — returning customer login section hidden */}
                <Billing
                  data={billing}
                  onChange={handleBillingChange}
                  onDistrictChange={handleBillingDistrictChange}
                  onSubDistrictChange={handleBillingSubDistrictChange}
                  onSameAsBillingChange={setIsSameAsBilling}
                  isSameAsBilling={isSameAsBilling}
                  fieldErrors={fieldErrors}
                  onPhoneBlur={handlePhoneLookup}
                  onSaveAddress={handleSaveAddress}
                  isSavingAddress={isSavingAddress}
                  isAddressUpdate={addressFoundFromLookup || addressSavedOnce}
                  saveConfirmed={saveConfirmed}
                />
                {/* Hidden — isSameAsBilling is always true; shipping data synced from billing */}
                <div className="hidden">
                  <Shipping
                    data={shipping}
                    onChange={handleShippingChange}
                    onDistrictChange={handleShippingDistrictChange}
                    onSubDistrictChange={handleShippingSubDistrictChange}
                    disabled={isSameAsBilling}
                    fieldErrors={fieldErrors}
                  />
                </div>
                {/* Shipping Method card */}
                <div className="bg-white shadow-1 rounded-sm p-4 sm:p-8.5 mt-7.5">
                  <h2 className="font-medium text-gray-700 text-xl sm:text-2xl mb-3">
                    Shipping method
                  </h2>
                  {/* Shipping info */}
                  <div className="flex items-center gap-4 bg-[#32BBAB]/8 border border-[#32BBAB]/25 rounded-sm px-4 py-3.5">
                    <svg className="w-5 h-5 text-[#32BBAB] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10m10 0H3m10 0h1m3-8h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-9h6" />
                    </svg>
                    <div>
                      {/* <p className="text-sm font-semibold text-gray-700">Standard Shipping</p> */}
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">Delivered within 3–5 days inside Dhaka and 3–7 days outside Dhaka
                      </p>
                    </div>
                  </div>
                  {/* Notes toggle */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowNotes(v => !v)}
                      className="text-sm text-[#32BBAB] underline underline-offset-2 hover:text-[#279487] transition-colors"
                    >
                      {showNotes ? 'Remove order note' : 'Leave a note for your order'}
                    </button>
                    {showNotes && (
                      <textarea
                        name="notes"
                        id="notes"
                        value={notes}
                        onChange={handleNotesChange}
                        rows={3}
                        placeholder="Any special instructions, preferences, or delivery details..."
                        className="mt-3 rounded border border-gray-300 bg-gray-50 placeholder:text-gray-500 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:ring-2 focus:ring-[#32BBAB]/30 text-sm"
                      />
                    )}
                  </div>
                </div>

                {isCheckoutButtonEnabled && (
                  <div className="lg:hidden mt-7.5">
                    {/* Terms checkbox — mobile only */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <div className="relative mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded border-2 border-gray-300 bg-white peer-checked:bg-teal-600 peer-checked:border-teal-600 transition-colors duration-150 flex items-center justify-center">
                            {termsAccepted && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 leading-relaxed">
                          I have read and agree to the{" "}
                          <a href="/privacy-policy" target="_blank" className="text-teal-600 hover:underline font-medium">Privacy Policy</a>,{" "}
                          <a href="/terms" target="_blank" className="text-teal-600 hover:underline font-medium">Terms & Conditions</a>,{" "}
                          <a href="/replacement-policy" target="_blank" className="text-teal-600 hover:underline font-medium">Refund Policy</a>, and{" "}
                          <a href="/delivery-timeline" target="_blank" className="text-teal-600 hover:underline font-medium">Delivery Timeline</a>.
                        </span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full flex justify-center font-medium text-white bg-[#32BBAB] py-2.5 px-6 rounded-md ease-out duration-200 hover:bg-[#4faa9f]"
                      disabled={!mounted || cartItems.length === 0 || isProcessing || featuresLoading || !termsAccepted || isSavingAddress}
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
                        'Place Order'
                      )}
                    </button>
                  </div>
                )}
              </div>
              <div className="w-full order-1 lg:order-2">
                <CheckoutOrderSummary
                  onApplyCoupon={handleCouponApply}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  paymentMethod={paymentMethod}
                  onSubmit={handleSubmit}
                  isProcessing={isProcessing}
                  isSavingAddress={isSavingAddress}
                  deliveryCharges={deliveryCharges}
                  isCalculatingCharge={isCalculatingCharge}
                  termsAccepted={termsAccepted}
                  onTermsChange={setTermsAccepted}
                />
              </div>
            </div>
          </form>
        </div>
      </section>
      {/* CheckoutAuthModal removed — guests proceed directly without sign-in prompt */}

    </>
  );
};

export default Checkout;