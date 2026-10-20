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
      procedureName: 'SP_VTOCredits',
      parameters,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || `Backend error ${res.status}`);
  try { return JSON.parse(text); } catch { return text; }
}

// GET /api/vto-credits?customerId=X  →  QC1: get balance
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'customerId is required' }, { status: 400 });

    const data = await callSP({ QueryChecker: 1, CustomerId: customerId });
    const row = Array.isArray(data) ? data[0] : null;
    return NextResponse.json(row ?? { FreeUsed: 0, PaidCreditsRemaining: 0 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/vto-credits  →  multiple actions via action field
export async function POST(request) {
  try {
    const body = await request.json();
    const { action, customerId } = body;

    if (!customerId) return NextResponse.json({ error: 'customerId is required' }, { status: 400 });

    // action: 'use_free'  →  QC2
    if (action === 'use_free') {
      await callSP({ QueryChecker: 2, CustomerId: customerId, EntryBy: customerId, UpdateBy: customerId });
      return NextResponse.json({ success: true });
    }

    // action: 'use_paid'  →  QC3
    if (action === 'use_paid') {
      await callSP({ QueryChecker: 3, CustomerId: customerId, UpdateBy: customerId });
      return NextResponse.json({ success: true });
    }

    // action: 'confirm_purchase'  →  QC4
    if (action === 'confirm_purchase') {
      const { tranId, amount, creditsAdded } = body;
      await callSP({
        QueryChecker: 4,
        CustomerId: customerId,
        TranId: tranId,
        Amount: amount,
        CreditsAdded: creditsAdded,
        EntryBy: customerId,
        UpdateBy: customerId,
        Remarks: `VTO pack purchase - ${creditsAdded} credits`,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
