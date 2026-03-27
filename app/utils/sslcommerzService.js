import config from "@/config";

export const initiateSSLCommerzPayment = async (
  amount,
  tranId,
  customerData,
  successUrl,
  cancelUrl,
  failUrl,
  ipnUrl,
  orderItems,
  customerId,
  additionalData
) => {
  try {
    // Build payload exactly like Postman JSON
    const payload = {
      total_amount: amount,
      currency: "BDT",
      tran_id: tranId,
      success_url: successUrl,
      fail_url: failUrl,
      cancel_url: cancelUrl,
      ipn_url: ipnUrl,
      cus_name: customerData.name,
      cus_email: customerData.email,
      cus_add1: customerData.address,
      cus_city: customerData.city,
      cus_postcode: customerData.postcode || "1000",
      cus_area: customerData.area,
      cus_phone: customerData.phone,
      shipping_method: "YES",
      product_name: "Online Purchase",
      product_category: "General",
      product_profile: "general",
      cart: orderItems.map((item) => ({
        product: item.product_name,
        amount: item.unit_price * item.quantity
      })),
      value_a: customerId,
      value_b: JSON.stringify({
        items: orderItems,
        timestamp: new Date().toISOString()
      }),
      ...additionalData
    };
    console.log(payload);
    debugger;
    const response = await fetch(`${config.API_BASE_URL}api/payment/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TenantId': config.tenantId
      },
      body: JSON.stringify(payload) // send as JSON exactly like Postman
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
    }

    const data = await response.json();

    if (data.status !== 'SUCCESS') {
      throw new Error(data.failedreason || 'Payment initiation failed');
    }

    return {
      gateway_url: data.GatewayPageURL,
      session_key: data.sessionkey
    };
  } catch (error) {
    console.error('SSLCommerz initiation error:', error);
    throw error instanceof Error ? error : new Error('Payment initiation failed');
  }
};

export const validateSSLCommerzPayment = async (
  valId
) => {
  try {
    const response = await fetch(`${config.API_BASE_URL}api/payment/validate?val_id=${valId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('SSLCommerz validation error:', error);
    throw error instanceof Error ? error : new Error('Payment validation failed');
  }
};

export const handleSSLCommerzIPN = async (ipnData) => {
  try {
    // First validate the IPN through SSLCommerz validation API
    const validationData = await validateSSLCommerzPayment(ipnData.val_id);

    if (validationData.status !== 'VALID' && validationData.status !== 'VALIDATED') {
      throw new Error('IPN validation failed');
    }

    // Check if risk level is high
    if (validationData.risk_level === 1 && validationData.status === 'VALID') {
      // Hold transaction for manual verification
      return {
        status: 'HOLD',
        message: 'Transaction requires manual verification',
        data: validationData
      };
    }

    return {
      status: validationData.status,
      data: validationData
    };
  } catch (error) {
    console.error('IPN handling error:', error);
    throw error;
  }
};