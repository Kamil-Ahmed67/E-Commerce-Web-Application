import { NextResponse } from 'next/server';
import config from '@/config';

export async function POST(request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('TenantId') || config.tenantId;

    const response = await fetch(`${config.API_BASE_URL}api/AccVoucher/Add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TenantId': tenantId,
      },
      body: JSON.stringify(body),
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: `AddVoucher failed: ${response.status}`, detail: text },
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
    console.error('[proxy/voucher] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
