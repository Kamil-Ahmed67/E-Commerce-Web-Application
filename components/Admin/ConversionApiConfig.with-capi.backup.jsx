'use client';

import { useState, useEffect, useContext } from 'react';
import { FiSave, FiRefreshCw, FiToggleRight } from 'react-icons/fi';
import { SiMeta, SiGoogle, SiTiktok } from 'react-icons/si';
import toast from 'react-hot-toast';
import config from '@/config';
import { AuthContext } from '@/provider/AuthProvider';

const TEST_EVENTS = [
  { name: 'AddToCart',           label: 'Add to Cart',            desc: 'Customer adds a product to their cart' },
  { name: 'Purchase',            label: 'Purchase',               desc: 'Customer completes an order' },
  { name: 'ViewContent',         label: 'View Content',           desc: 'Customer opens a product page' },
  { name: 'AddPaymentInfo',      label: 'Add Payment Info',       desc: 'Customer enters payment details at checkout' },
  { name: 'AddToWishlist',       label: 'Add to Wishlist',        desc: 'Customer saves a product to wishlist' },
  { name: 'CompleteRegistration',label: 'Complete Registration',  desc: 'Customer creates a new account' },
  { name: 'Contact',             label: 'Contact',                desc: 'Customer submits the contact form' },
  { name: 'CustomizeProduct',    label: 'Customise Product',      desc: 'Customer picks a size or colour variant' },
  { name: 'FindLocation',        label: 'Find Location',          desc: 'Customer visits the Store Location page' },
  { name: 'Lead',                label: 'Lead',                   desc: 'Customer submits an enquiry or interest form' },
  { name: 'Search',              label: 'Search',                 desc: 'Customer uses the search bar' },
  { name: 'StartTrial',          label: 'Start Trial',            desc: 'Customer starts a trial or free offer' },
  { name: 'Subscribe',           label: 'Subscribe',              desc: 'Customer subscribes to the newsletter' },
];

const EMPTY_FORM = { headSnippet: '', bodySnippet: '' };

async function callSP(parameters) {
  const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'TenantId': config.tenantId },
    body: JSON.stringify({ operation: '', procedureName: 'SP_EcomConfigApi', parameters }),
  });
  return res.json();
}

export default function ConversionApiConfig() {
  const { loginData } = useContext(AuthContext);
  const [gtmRow, setGtmRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Test Events state
  const [metaTestCode, setMetaTestCode] = useState('');
  const [testAllFiring, setTestAllFiring] = useState(false);
  const [testAllResults, setTestAllResults] = useState(null); // { Meta, Google, TikTok } each: { ok, skipped, error, total }

  const fetchGtm = async () => {
    try {
      const data = await callSP({ QueryChecker: 3 });
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      const row = list.find((r) => r.Platform === 'GTM') || null;
      setGtmRow(row);
      setForm({
        headSnippet: row?.SocialId || '',
        bodySnippet: row?.AccessKey || '',
      });
    } catch {
      toast.error('Failed to load GTM configuration');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGtm(); }, []);

  const handleSave = async () => {
    if (!form.headSnippet.trim()) { toast.error('Please paste the head snippet'); return; }
    if (!form.bodySnippet.trim()) { toast.error('Please paste the body snippet'); return; }

    setSaving(true);
    try {
      const by = loginData?.Name || loginData?.Email || 'Admin';

      if (gtmRow) {
        await callSP({
          QueryChecker: 2,
          Id: gtmRow.Id,
          SocialId: form.headSnippet.trim(),
          AccessKey: form.bodySnippet.trim(),
          Platform: 'GTM',
          Remarks: gtmRow.Remarks || '',
          UpdateBy: by,
        });
      } else {
        await callSP({
          QueryChecker: 1,
          SocialId: form.headSnippet.trim(),
          AccessKey: form.bodySnippet.trim(),
          Platform: 'GTM',
          Remarks: '',
          EntryBy: by,
        });
      }
      toast.success('GTM configuration saved');
      await fetchGtm();
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const fireAllTestEvents = async () => {
    setTestAllFiring(true);
    setTestAllResults(null);

    const tally = {
      Meta:   { ok: 0, skipped: 0, error: 0, total: TEST_EVENTS.length },
      Google: { ok: 0, skipped: 0, error: 0, total: TEST_EVENTS.length },
      TikTok: { ok: 0, skipped: 0, error: 0, total: TEST_EVENTS.length },
    };

    await Promise.all(
      TEST_EVENTS.flatMap((ev) => {
        const payload = {
          event: ev.name,
          eventId: `TEST_${ev.name}_${Date.now()}`,
          ...(metaTestCode.trim() && { testEventCode: metaTestCode.trim() }),
          data: {
            value: 100,
            contentIds: ['TEST-001'],
            contents: [{ id: 'TEST-001', title: 'Test Product', price: 100, quantity: 1 }],
            numItems: 1,
            transactionId: `TEST-${ev.name}-${Date.now()}`,
          },
          clientId: `test_${Date.now()}`,
        };

        return [
          fetch('/api/track/meta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            .then(r => r.json()).then(d => { tally.Meta[d.skipped ? 'skipped' : d.error ? 'error' : 'ok']++; })
            .catch(() => { tally.Meta.error++; }),
          fetch('/api/track/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            .then(r => r.json()).then(d => { tally.Google[d.skipped ? 'skipped' : d.error ? 'error' : 'ok']++; })
            .catch(() => { tally.Google.error++; }),
          fetch('/api/track/tiktok', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
            .then(r => r.json()).then(d => { tally.TikTok[d.skipped ? 'skipped' : d.error ? 'error' : 'ok']++; })
            .catch(() => { tally.TikTok.error++; }),
        ];
      })
    );

    setTestAllResults(tally);
    setTestAllFiring(false);
    toast.success(`All ${TEST_EVENTS.length} events fired across all platforms`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Google Tag Manager Setup</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste the head and body snippets exactly as Google Tag Manager gives them to you.
        </p>
      </div>

      {/* GTM snippet form */}
      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4 rounded-lg border border-gray-200 p-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Head snippet <span className="text-gray-400 font-normal">(paste the &lt;script&gt;...&lt;/script&gt; block)</span>
            </label>
            <textarea
              rows={6}
              value={form.headSnippet}
              onChange={(e) => setForm((f) => ({ ...f, headSnippet: e.target.value }))}
              placeholder="<!-- Google Tag Manager -->&#10;<script>...&#10;</script>"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-[#32BBAB]/30 focus:border-[#32BBAB] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Body snippet <span className="text-gray-400 font-normal">(paste the &lt;noscript&gt;&lt;iframe&gt;...&lt;/iframe&gt;&lt;/noscript&gt; block)</span>
            </label>
            <textarea
              rows={4}
              value={form.bodySnippet}
              onChange={(e) => setForm((f) => ({ ...f, bodySnippet: e.target.value }))}
              placeholder="<!-- Google Tag Manager (noscript) -->&#10;<noscript><iframe ...></iframe></noscript>"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-xs font-mono outline-none focus:ring-2 focus:ring-[#32BBAB]/30 focus:border-[#32BBAB] transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-[#32BBAB] text-white text-sm font-medium rounded-md hover:bg-[#279487] disabled:opacity-60 transition-colors"
            >
              <FiSave size={15} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      {/* ── TEST EVENTS SECTION ─────────────────────────────────── */}
      <div className="mt-10 border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-base font-bold text-gray-800">Test Events</h2>
          <p className="text-xs text-gray-500 mt-0.5">Fire all dummy events at once to verify your platform connections are working.</p>
        </div>

        <div className="p-5 space-y-5">
          {/* Meta Test Event Code */}
          <div className="max-w-sm">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
              Meta Test Event Code <span className="text-gray-400 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={metaTestCode}
              onChange={e => setMetaTestCode(e.target.value)}
              placeholder="e.g. TEST12345"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#32BBAB]/30 focus:border-[#32BBAB] font-mono transition-colors"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Get this from Meta Events Manager → your Pixel → Test Events tab. Lets Meta label incoming calls as &quot;test&quot; in their dashboard.
            </p>
          </div>

          {/* Fire All Events */}
          <div className="rounded-lg border border-dashed border-[#32BBAB]/50 bg-[#32BBAB]/[0.03] p-4 space-y-3">
            <div>
              <p className="text-sm font-bold text-gray-800">Fire All Events at Once</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Triggers all {TEST_EVENTS.length} events simultaneously across Meta, Google, and TikTok. Uses the Meta Test Event Code above if provided.
              </p>
            </div>

            <button
              onClick={fireAllTestEvents}
              disabled={testAllFiring}
              className="flex items-center gap-2 px-5 py-2 bg-[#0F0B30] hover:bg-[#1a1550] text-white text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {testAllFiring ? (
                <>
                  <FiRefreshCw size={15} className="animate-spin" />
                  Firing all {TEST_EVENTS.length} events…
                </>
              ) : (
                <>
                  <FiToggleRight size={16} />
                  Fire All {TEST_EVENTS.length} Events
                </>
              )}
            </button>

            {testAllResults && (
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Bulk Fire Results</p>
                  <span className="text-[11px] text-gray-400">{TEST_EVENTS.length} events × 3 platforms = {TEST_EVENTS.length * 3} calls</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { key: 'Meta',   icon: <SiMeta className="text-blue-600" size={16} /> },
                    { key: 'Google', icon: <SiGoogle className="text-red-500" size={16} /> },
                    { key: 'TikTok', icon: <SiTiktok className="text-black" size={16} /> },
                  ].map(({ key, icon }) => {
                    const t = testAllResults[key];
                    return (
                      <div key={key} className="flex items-center gap-3 px-4 py-3 flex-wrap">
                        <div className="shrink-0">{icon}</div>
                        <span className="text-sm font-medium text-gray-700 w-16">{key}</span>
                        <div className="flex items-center gap-3 flex-wrap">
                          {t.ok > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              {t.ok}/{t.total} sent
                            </span>
                          )}
                          {t.skipped > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                              {t.skipped} not configured
                            </span>
                          )}
                          {t.error > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                              {t.error} failed
                            </span>
                          )}
                          {t.ok === 0 && t.skipped === t.total && (
                            <span className="text-xs text-amber-500 font-medium">Platform not configured — skipped all</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
