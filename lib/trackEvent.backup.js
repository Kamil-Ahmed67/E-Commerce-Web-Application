'use client';

// ─── Unified event tracker ────────────────────────────────────────────────────
// Fires on browser pixels (Meta fbq, Google gtag, TikTok ttq) AND calls
// server-side CAPI routes so events are captured even when the pixel is blocked.
//
// Usage:
//   trackEvent('ViewContent', { value: 1200, contentIds: ['42'], contents: [...] })
//   trackEvent('Purchase', { value: 2400, transactionId: 'INV123', contents: [...] })
//
// Standard event names:  PageView | ViewContent | AddToCart | InitiateCheckout | Purchase

const META_EVENTS = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
  AddPaymentInfo: 'AddPaymentInfo',
  AddToWishlist: 'AddToWishlist',
  CompleteRegistration: 'CompleteRegistration',
  Contact: 'Contact',
  CustomizeProduct: 'CustomizeProduct',
  FindLocation: 'FindLocation',
  Lead: 'Lead',
  Search: 'Search',
  StartTrial: 'StartTrial',
  Subscribe: 'Subscribe',
};

const GOOGLE_EVENTS = {
  PageView: 'page_view',
  ViewContent: 'view_item',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
  AddPaymentInfo: 'add_payment_info',
  AddToWishlist: 'add_to_wishlist',
  CompleteRegistration: 'sign_up',
  Contact: 'contact',
  CustomizeProduct: 'select_item',
  FindLocation: 'find_location',
  Lead: 'generate_lead',
  Search: 'search',
  StartTrial: 'start_trial',
  Subscribe: 'subscribe',
};

const TIKTOK_EVENTS = {
  PageView: 'PageView',
  ViewContent: 'ViewContent',
  AddToCart: 'AddToCart',
  InitiateCheckout: 'InitiateCheckout',
  Purchase: 'Purchase',
  AddPaymentInfo: 'AddPaymentInfo',
  AddToWishlist: 'AddToWishlist',
  CompleteRegistration: 'CompleteRegistration',
  Contact: 'Contact',
  CustomizeProduct: 'CustomizeProduct',
  FindLocation: 'FindLocation',
  Lead: 'SubmitForm',
  Search: 'Search',
  StartTrial: 'Subscribe',
  Subscribe: 'Subscribe',
};

function getGaClientId() {
  try {
    const cookie = document.cookie.split('; ').find((c) => c.startsWith('_ga='));
    if (!cookie) return undefined;
    const parts = cookie.split('=')[1]?.split('.');
    return parts?.length >= 4 ? `${parts[2]}.${parts[3]}` : undefined;
  } catch {
    return undefined;
  }
}

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? match[2] : undefined;
  } catch {
    return undefined;
  }
}

export function trackEvent(eventName, data = {}) {
  if (typeof window === 'undefined') return;

  const metaEventName = META_EVENTS[eventName] || eventName;
  const gaEventName = GOOGLE_EVENTS[eventName] || eventName.toLowerCase();
  const ttEventName = TIKTOK_EVENTS[eventName] || eventName;

  const pixelData = {
    currency: 'BDT',
    value: data.value,
    content_ids: data.contentIds,
    content_type: 'product',
    contents: data.contents,
    num_items: data.numItems,
  };

  // ── Meta Pixel (browser) ────────────────────────────────────
  if (window.fbq) {
    window.fbq('track', metaEventName, pixelData);
  }

  // ── Google gtag (browser) ───────────────────────────────────
  if (window.gtag) {
    const gaItems = (data.contents || []).map((c) => ({
      item_id: String(c.id),
      item_name: c.title,
      price: c.price,
      quantity: c.quantity,
    }));
    window.gtag('event', gaEventName, {
      currency: 'BDT',
      value: data.value ?? 0,
      ...(gaItems.length > 0 && { items: gaItems }),
      ...(data.transactionId && { transaction_id: data.transactionId }),
    });
  }

  // ── TikTok Pixel (browser) ──────────────────────────────────
  if (window.ttq) {
    window.ttq.track(ttEventName, {
      currency: 'BDT',
      value: data.value,
      contents: (data.contents || []).map((c) => ({
        content_id: String(c.id),
        content_type: 'product',
        content_name: c.title,
        price: c.price,
        quantity: c.quantity,
      })),
    });
  }

  // ── Server-side CAPI (fire-and-forget) ──────────────────────
  const capiPayload = {
    event: eventName,
    eventId: `${eventName}_${Date.now()}`,
    data: {
      ...data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      fbc: getCookie('_fbc'),
      fbp: getCookie('_fbp'),
    },
    clientId: getGaClientId(),
  };

  fetch('/api/track/meta', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(capiPayload),
    keepalive: true,
  }).catch(() => {});

  fetch('/api/track/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(capiPayload),
    keepalive: true,
  }).catch(() => {});

  fetch('/api/track/tiktok', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(capiPayload),
    keepalive: true,
  }).catch(() => {});
}
