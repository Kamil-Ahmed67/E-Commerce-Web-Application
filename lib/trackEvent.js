'use client';

// ─── Unified event tracker ────────────────────────────────────────────────────
// Pushes events into the GTM dataLayer (tags/triggers are configured in the GTM
// dashboard) AND calls server-side CAPI routes so events are captured even when
// the GTM container or a tag is blocked.
//
// Usage:
//   trackEvent('view_item', { value: 1200, contentIds: ['42'], contents: [...] })
//   trackEvent('purchase', { value: 2400, transactionId: 'INV123', contents: [...] })
//
// Event names follow GA4's snake_case convention (view_item, add_to_cart, begin_checkout,
// purchase, etc.) — GTM maps each of these to the matching Meta Pixel PascalCase event
// (ViewContent, AddToCart, ...) inside the tag configuration, not in this code.
// Current event names: view_item | view_item_list | add_to_cart | view_cart | begin_checkout |
// add_shipping_info | add_payment_info | purchase | add_to_wishlist | sign_up | login | contact |
// customize_product | find_location | search | start_trial | subscribe | scroll |
// click_to_whatsapp | click_to_messenger | chat_initiated | generate_lead

// Splits a full name into first/last for Meta's Advanced Matching (fn/ln),
// which expects them as separate lowercase fields.
function splitName(name) {
  if (!name) return { firstName: undefined, lastName: undefined };
  const parts = name.trim().split(/\s+/);
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : undefined,
  };
}

export function trackEvent(eventName, data = {}) {
  if (typeof window === 'undefined') return;

  // Product id is kept as a string everywhere (content_ids, contents[].id,
  // items[].item_id) — Facebook catalog matching can mismatch/error if the
  // same id shows up as a number in one place and a string in another.
  const contents = (data.contents || []).map((item) => ({ ...item, id: String(item.id) }));

  // GA4/GTM-conventional items array — the GTM container's custom variables
  // (FB-Content_ids/FB-Contents/TotalQuantity/Contentname/Contentcategory)
  // read item_id/item_name/item_category/price/quantity from this shape.
  const items = contents.map((item) => ({
    item_id: item.id,
    item_name: item.title,
    item_brand: item.brand,
    item_category: item.category,
    sku: item.sku,
    price: Number(item.price),
    quantity: Number(item.quantity ?? 1),
    stock_quantity: item.stock,
    stock_status: item.stock === undefined ? undefined : (item.stock > 0 ? 'instock' : 'outofstock'),
  }));

  // Prefer an explicitly-passed lastName (now captured as its own checkout
  // field) over guessing it by splitting the full name string.
  const { firstName, lastName } = data.lastName
    ? { firstName: data.name, lastName: data.lastName }
    : splitName(data.name);

  // ── GTM dataLayer (browser) ─────────────────────────────────
  window.dataLayer = window.dataLayer || [];

  // Google's official GA4 e-commerce guidance: clear the previous ecommerce
  // object before pushing a new one, so no stale keys from the last event
  // (e.g. a bigger items array) can bleed into this one.
  window.dataLayer.push({ ecommerce: null });

  window.dataLayer.push({
    event: eventName,
    ecommerce: {
      currency: 'BDT',
      value: data.value,
      content_ids: (data.contentIds || []).map(String),
      content_type: 'product',
      contents,
      items,
      num_items: data.numItems,
      transaction_id: data.transactionId,
      item_list_name: data.listName,
    },
    // Advanced Matching source fields — GTM's user_data variables (fbph, etc.)
    // should read from these dataLayer keys.
    email: data.email,
    phone: data.phone,
    firstName,
    lastName,
    city: data.city,
    district: data.district,
    area: data.area,
    address: data.address,
    country: data.country,
    zip: data.zip,
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    // Engagement source (WhatsApp/Messenger/chatbot) — set on click_to_whatsapp,
    // click_to_messenger, chat_initiated, generate_lead.
    chat_platform: data.chatPlatform,
  });
}
