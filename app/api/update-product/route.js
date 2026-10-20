import { NextResponse } from 'next/server';
import config from '@/config';

async function handleUpdate(request) {
  try {
    const body = await request.json();

    const backendRes = await fetch(
      `${config.API_BASE_URL}api/EItem/UpdateItem`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TenantId': config.tenantId,
        },
        body: JSON.stringify(body),
      }
    );

    const text = await backendRes.text();
    console.log(`[update-product proxy] Backend responded ${backendRes.status}:`, text);

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: text || 'Backend error' },
        { status: backendRes.status }
      );
    }

    try {
      return NextResponse.json(JSON.parse(text), { status: 200 });
    } catch {
      return new NextResponse(text, { status: 200 });
    }
  } catch (err) {
    console.error('[update-product proxy] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Proxy error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  return handleUpdate(request);
}

export async function POST(request) {
  return handleUpdate(request);
}
