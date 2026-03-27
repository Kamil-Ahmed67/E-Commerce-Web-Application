import config from "@/config";

export const initiateMoneybagPayment = async (
  amount,
  orderId,
  customerData,
  successUrl,
  cancelUrl,
  failUrl,
  orderItems
) => {
  try {
    const payload = {
      order_id: orderId,
      currency: "BDT",
      order_amount: amount.toFixed(2),
      order_description: "Online purchase of electronics",
      success_url: successUrl,
      cancel_url: cancelUrl,
      fail_url: failUrl,
      ipn_url: `${config.API_BASE_URL}api/payment/ipn`,
      customer: {
        name: customerData.name,
        email: customerData.email,
        address: customerData.address,
        city: customerData.city,
        postcode: customerData.postcode || "1000",
        area: customerData.area,
        phone: customerData.phone,
      },
      order_items: orderItems.map((item) => {
        const unitPrice = item.unit_price.toFixed(2);
        return {
          sku: null,
          product_name: item.product_name,
          product_category: null,
          quantity: item.quantity,
          unit_price: unitPrice,
          vat: "0.00",
          convenience_fee: "0.00",
          discount_amount: "0.00",
          net_amount: unitPrice,
        };
      }),
      shipping: {
        name: customerData.name,
        address: customerData.address,
        city: customerData.city,
        postcode: customerData.postcode || "1000",
        area: customerData.area,
      },
      metadata: {
        source: "web",
        session_id: "SESSION12345",
        user_agent: "Mozilla/5.0",
        ip_address: "192.168.1.1",
        platform: "web",
      },
      payment_info: {
        is_recurring: false,
        installments: 0,
        currency_conversion: false,
        allowed_payment_methods: ["card", "mobile_banking"],
        requires_emi: false,
      },
    };

    const response = await fetch(
      "https://staging-api.moneybag.com.bd/api/v2/payments/checkout",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Merchant-API-Key": config.MONEYBAG_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Payment initiation failed");
    }

    const data = await response.json();

    if (!data.success || !data.data?.checkout_url) {
      throw new Error(data.message || "Invalid response from payment gateway");
    }

    return {
      checkout_url: data.data.checkout_url,
      session_id: data.data.session_id,
    };
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw error instanceof Error ? error : new Error("Payment initiation failed");
  }
};

export const verifyMoneybagPayment = async (
  transactionId
) => {
  try {
    const response = await fetch(
      `https://staging-api.moneybag.com.bd/api/v2/payments/verify/${transactionId}`,
      {
        method: "GET",
        headers: {
          "X-Merchant-API-Key": config.MONEYBAG_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to verify payment");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Payment verification error:", error);
    throw error instanceof Error ? error : new Error("Payment verification failed");
  }
};