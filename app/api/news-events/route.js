import { NextResponse } from 'next/server';
import config from '@/config';

async function callSP(parameters) {
    const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            TenantId: config.tenantId,
        },
        body: JSON.stringify({ operation: '', procedureName: 'SP_EcomNewsEvents', parameters }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || `Backend error ${res.status}`);
    try { return JSON.parse(text); } catch { return text; }
}

// GET /api/news-events  →  QC4: get all active
export async function GET() {
    try {
        const data = await callSP({ QueryChecker: 4 });
        return NextResponse.json(Array.isArray(data) ? data : []);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/news-events  →  QC1: insert new record
export async function POST(request) {
    try {
        const body = await request.json();
        console.log('[news-events POST] body:', body);
        const data = await callSP({ QueryChecker: 1, ...body });
        console.log('[news-events POST] SP response:', data);
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('[news-events POST] error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT /api/news-events  →  QC2: update existing record
export async function PUT(request) {
    try {
        const body = await request.json();
        console.log('[news-events PUT] body:', body);
        const data = await callSP({ QueryChecker: 2, ...body });
        console.log('[news-events PUT] SP response:', data);
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('[news-events PUT] error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// DELETE /api/news-events  →  QC3: soft delete
export async function DELETE(request) {
    try {
        const { Id } = await request.json();
        console.log('[news-events DELETE] Id:', Id);
        const data = await callSP({ QueryChecker: 3, Id, UpdateBy: 1 });
        console.log('[news-events DELETE] SP response:', data);
        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('[news-events DELETE] error:', err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
