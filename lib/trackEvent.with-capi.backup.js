'use client';

// ─── Unified event tracker ────────────────────────────────────────────────────
// Pushes events into the GTM dataLayer (tags/triggers are configured in the GTM
// dashboard) AND calls server-side CAPI routes so events are captured even when
// the GTM container or a tag is blocked.
//
// Usage:
//   trackEvent('ViewContent', { value: 1200, contentIds: ['42'], contents: [...] })
//   trackEvent('Purchase', { value: 2400, transactionId: 'INV123', contents: [...] })
//
// Standard event names: PageView | ViewContent | AddToCart | InitiateCheckout | Purchase |
// AddPaymentInfo | AddToWishlist | CompleteRegistration | Contact | CustomizeProduct |
// FindLocation | Lead | Search | StartTrial | Subscribe

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

  // ── GTM dataLayer (browser) ─────────────────────────────────
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    currency: 'BDT',
    value: data.value,
    content_ids: data.contentIds,
    content_type: 'product',
    contents: data.contents,
    num_items: data.numItems,
    transaction_id: data.transactionId,
  });

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
