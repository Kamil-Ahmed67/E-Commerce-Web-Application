import { NextResponse } from 'next/server';
import config from '@/config';

async function getGoogleConfig() {
  try {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'TenantId': config.tenantId },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_EcomConfigApi',
        parameters: { QueryChecker: 8, Platform: 'Google' },
      }),
      cache: 'no-store',
    });
    const data = await res.json();
    const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return rows[0] || null;
  } catch {
    return null;
  }
}

// Maps our standard event names to GA4 Measurement Protocol event names
const GA4_EVENT_MAP = {
  PageView: 'page_view',
  ViewContent: 'view_item',
  AddToCart: 'add_to_cart',
  InitiateCheckout: 'begin_checkout',
  Purchase: 'purchase',
};

export async function POST(request) {
  try {
    const { event, data = {}, clientId } = await request.json();

    const cfg = await getGoogleConfig();
    if (!cfg?.SocialId || !cfg?.AccessKey) {
      return NextResponse.json({ skipped: true, reason: 'Google not configured' });
    }

    const ga4Event = GA4_EVENT_MAP[event] || event.toLowerCase();

    const items = (data.contents || []).map((c) => ({
      item_id: String(c.id),
      item_name: c.title,
      price: c.price,
      quantity: c.quantity,
    }));

    const eventParams = {
      currency: 'BDT',
      value: data.value ?? 0,
      ...(items.length > 0 && { items }),
      ...(data.transactionId && { transaction_id: data.transactionId }),
    };

    const payload = {
      client_id: clientId || `anon_${Date.now()}`,
      events: [{ name: ga4Event, params: eventParams }],
    };

    const gaRes = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${cfg.SocialId}&api_secret=${cfg.AccessKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );

    return NextResponse.json({ ok: true, status: gaRes.status });
  } catch (err) {
    console.error('[Google CAPI]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
