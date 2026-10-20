import { NextResponse } from 'next/server';
import crypto from 'crypto';
import config from '@/config';

async function getTikTokConfig() {
  try {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'TenantId': config.tenantId },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_EcomConfigApi',
        parameters: { QueryChecker: 8, Platform: 'TikTok' },
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

function sha256(value) {
  return value
    ? crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex')
    : undefined;
}

export async function POST(request) {
  try {
    const { event, data = {} } = await request.json();

    const cfg = await getTikTokConfig();
    if (!cfg?.SocialId || !cfg?.AccessKey) {
      return NextResponse.json({ skipped: true, reason: 'TikTok not configured' });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || data.ip
      || undefined;

    const payload = {
      pixel_code: cfg.SocialId,
      event,
      event_id: `${event}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      context: {
        user: {
          email: sha256(data.email),
          phone_number: sha256(data.phone),
        },
        ip,
        user_agent: data.userAgent || undefined,
        page: { url: data.url || undefined },
      },
      properties: {
        currency: 'BDT',
        value: data.value ?? undefined,
        contents: (data.contents || []).map((c) => ({
          content_id: String(c.id),
          content_type: 'product',
          content_name: c.title,
          price: c.price,
          quantity: c.quantity,
        })),
      },
    };

    const ttRes = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Access-Token': cfg.AccessKey },
      body: JSON.stringify(payload),
    });

    const ttData = await ttRes.json();
    return NextResponse.json({ ok: true, tt: ttData });
  } catch (err) {
    console.error('[TikTok CAPI]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
