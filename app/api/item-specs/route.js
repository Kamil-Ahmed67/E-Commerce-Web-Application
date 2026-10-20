import { NextResponse } from 'next/server';
import config from '@/config';

async function callSP(parameters) {
  const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'TenantId': config.tenantId,
    },
    body: JSON.stringify({
      operation: '',
      procedureName: 'SP_POStblItemSpecification',
      parameters,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || `Backend error ${res.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// GET /api/item-specs?itemId=123  →  QueryChecker 3
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const data = await callSP({ QueryChecker: 3, ItemId: Number(itemId) });
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('[item-specs GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/item-specs  →  QueryChecker 1 (insert)
export async function POST(request) {
  try {
    const body = await request.json();
    const data = await callSP({ QueryChecker: 1, ...body });
    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error('[item-specs POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/item-specs  →  QueryChecker 2 (update)
export async function PUT(request) {
  try {
    const body = await request.json();
    const data = await callSP({ QueryChecker: 2, ...body });
    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error('[item-specs PUT]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/item-specs?specId=5  →  QueryChecker 5 (soft-delete)
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specId = searchParams.get('specId');

    if (!specId) {
      return NextResponse.json({ error: 'specId is required' }, { status: 400 });
    }

    const data = await callSP({ QueryChecker: 5, Id: Number(specId) });
    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error('[item-specs PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
