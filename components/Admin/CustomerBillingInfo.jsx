'use client';
import { useState, useEffect } from 'react';
import { MdPeopleAlt } from 'react-icons/md';
import { IoFilterSharp } from 'react-icons/io5';
import config from '@/config';

export default function CustomerBillingInfo() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomCusAddInfo',
          parameters: { QueryChecker: 3 }
        })
      });
      const data = await res.json();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setRecords(rows);
    } catch (err) {
      console.error('Failed to fetch customer billing info:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    return (
      (r.Name || '').toLowerCase().includes(q) ||
      (r.Phone || '').toLowerCase().includes(q) ||
      (r.Email || '').toLowerCase().includes(q) ||
      (r.Address || '').toLowerCase().includes(q)
    );
  });

  const handleExportExcel = () => {
    const headers = ['SL', 'Name', 'Phone', 'Email', 'Address'];
    const rows = filtered.map((r, i) => [
      i + 1,
      r.Name || '',
      r.Phone || '',
      r.Email || '',
      r.Address || ''
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-billing-info.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const rows = filtered.map((r, i) => `
      <tr style="border-bottom:1px solid #e5e7eb;${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
        <td style="padding:8px 12px;text-align:center;color:#6b7280;">${i + 1}</td>
        <td style="padding:8px 12px;color:#111827;font-weight:500;">${r.Name || '-'}</td>
        <td style="padding:8px 12px;color:#374151;">${r.Phone || '-'}</td>
        <td style="padding:8px 12px;color:#374151;">${r.Email || '-'}</td>
        <td style="padding:8px 12px;color:#374151;">${r.Address || '-'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
      <title>Customer Billing Information</title>
      <style>
        @page { size: A4 landscape; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
        h2 { margin: 0 0 4px; font-size: 16px; color: #0f766e; }
        p { margin: 0 0 14px; font-size: 11px; color: #6b7280; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #0f766e; }
        thead th { padding: 10px 12px; color: #fff; text-align: left; font-size: 12px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h2>Customer Billing Information</h2>
      <p>Generated: ${new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;|&nbsp; Total: ${filtered.length} records</p>
      <table>
        <thead><tr>
          <th style="width:46px">SL</th>
          <th>Name</th><th>Phone</th><th>Email</th><th>Address</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;

    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: 'none' });
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    doc.open(); doc.write(html); doc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 1500);
  };

  return (
    <div className="p-4 sm:p-6">
      <style>{`
        .scroll-container { max-height: calc(98vh - 158px); overflow-y: auto; }
        .scroll-container::-webkit-scrollbar { width: 0; display: none; }
        .scroll-container { scrollbar-width: none; }
      `}</style>

      <div className="bg-white rounded-sm shadow-sm overflow-hidden">

        {/* Header */}
        <div className="bg-linear-to-r from-teal-600 to-teal-800 p-3 flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-white font-semibold text-lg tracking-wide">CUSTOMER BILLING INFORMATION</h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search..."
              className="bg-white rounded text-gray-700 px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={filtered.length === 0}
              title="Export Excel"
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-40"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zM8 13h8v1H8v-1zm0 2.5h8v1H8v-1zm0 2.5h5v1H8v-1z" />
              </svg>
            </button>
            {/* Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={filtered.length === 0}
              title="Export PDF"
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-40"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13zM9 13h1.5a1.5 1.5 0 010 3H9v-3zm0 4.5h1.5a3 3 0 000-6H8v7.5H9v-1.5zm4.5-4.5H15v1.5h-1.5V17H15v1.5h-1.5V20H12v-7h1.5v.5z" />
              </svg>
            </button>
            {/* Refresh */}
            <button
              onClick={() => fetchData(true)}
              title="Refresh"
              className={`p-2 text-white hover:bg-white/10 rounded-full transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="scroll-container">
          {loading ? (
            <div className="flex h-80 items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#32BBAB]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              {search ? 'No records match your search.' : 'No customer billing information saved yet.'}
            </div>
          ) : (
            <>
              {/* Column headers */}
              <div className="grid grid-cols-12 items-center py-2 px-4 gap-4 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-1">SL</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-2">Phone</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-3">Address</div>
              </div>
              <div className="divide-y divide-gray-200">
                {filtered.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 items-center py-2.5 px-4 gap-4 hover:bg-gray-50 transition-colors text-gray-700">
                    {/* SL */}
                    <div className="col-span-1 text-sm text-gray-400">{i + 1}</div>
                    {/* Name */}
                    <div className="col-span-3 flex items-center gap-3">
                      <p className="font-semibold text-sm text-[#279185] truncate">{r.Name || '-'}</p>
                    </div>
                    {/* Phone */}
                    <div className="col-span-2 text-sm truncate text-gray-600">
                      {r.Phone || '-'}
                    </div>
                    {/* Email */}
                    <div className="col-span-3 text-sm truncate text-gray-600">
                      {r.Email || '-'}
                    </div>
                    {/* Address */}
                    <div className="col-span-3 text-sm truncate text-gray-600">
                      {r.Address || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400 bg-gray-50">
            Showing {filtered.length} of {records.length} records
          </div>
        )}
      </div>
    </div>
  );
}
