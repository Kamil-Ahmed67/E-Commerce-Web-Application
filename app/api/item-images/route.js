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
      procedureName: 'SP_POStblItemImage',
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

// GET /api/item-images?itemId=123  →  QueryChecker 3 (fetch all images for a product)
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
    console.error('[item-images GET]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/item-images  →  QueryChecker 1 (insert)
export async function POST(request) {
  try {
    const body = await request.json();
    const data = await callSP({ QueryChecker: 1, ...body });
    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error('[item-images POST]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/item-images  →  QueryChecker 2 (update)
export async function PUT(request) {
  try {
    const body = await request.json();
    const data = await callSP({ QueryChecker: 2, ...body });
    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error('[item-images PUT]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/item-images?imageId=5  →  QueryChecker 5 (soft delete single row)
export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ error: 'imageId is required' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const data = await callSP({ QueryChecker: 5, Id: Number(imageId), UpdateBy: body.UpdateBy || '' });
    return NextResponse.json(data ?? {});
  } catch (err) {
    console.error('[item-images PATCH]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/item-images?imageId=5  →  QueryChecker 8 (hard delete single row by Id)
// DELETE /api/item-images?itemId=123 →  QueryChecker 6 (hard delete all for ItemId)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const itemId = searchParams.get('itemId');

    if (imageId) {
      const data = await callSP({ QueryChecker: 8, Id: Number(imageId) });
      return NextResponse.json(data ?? {});
    }

    if (itemId) {
      const data = await callSP({ QueryChecker: 6, ItemId: Number(itemId) });
      return NextResponse.json(data ?? {});
    }

    return NextResponse.json({ error: 'imageId or itemId is required' }, { status: 400 });
  } catch (err) {
    console.error('[item-images DELETE]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
