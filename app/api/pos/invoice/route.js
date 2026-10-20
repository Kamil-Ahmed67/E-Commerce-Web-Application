import { NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('TenantId') || config.tenantId;

    // Send the payload directly (flat) — the backend reads ItemList at the root level
    console.log('[proxy/invoice] Sending payload to CreateInvoice:', JSON.stringify(body, null, 2));

    const response = await fetch(`${config.API_BASE_URL}api/Invoice/CreateInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TenantId': tenantId,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log(`[proxy/invoice] Backend responded ${response.status}:`, text);

    if (!response.ok) {
      return NextResponse.json(
        { error: `CreateInvoice failed: ${response.status}`, detail: text },
        { status: response.status }
      );
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return new NextResponse(text, { status: 200 });
    }
  } catch (err) {
    console.error('[proxy/invoice] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
