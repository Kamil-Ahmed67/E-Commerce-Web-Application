'use client';

import { useState, useEffect, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiEdit2, FiPlus, FiSave, FiX, FiToggleLeft, FiToggleRight, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { SiMeta, SiGoogle, SiTiktok } from 'react-icons/si';
import toast from 'react-hot-toast';
import config from '@/config';
import { AuthContext } from '@/provider/AuthProvider';

const PLATFORMS = ['Meta', 'Google', 'TikTok'];

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

const PLATFORM_ICONS = {
  Meta: <SiMeta className="text-blue-600" size={20} />,
  Google: <SiGoogle className="text-red-500" size={20} />,
  TikTok: <SiTiktok className="text-black" size={20} />,
};

const PLATFORM_LABELS = {
  Meta: 'Meta (Facebook + Instagram)',
  Google: 'Google Analytics 4',
  TikTok: 'TikTok Events API',
};

const FIELD_HINTS = {
  Meta: { SocialId: 'Pixel ID (e.g. 937006525828541)', AccessKey: 'Conversions API Access Token' },
  Google: { SocialId: 'Measurement ID (e.g. G-XXXXXXXXXX)', AccessKey: 'API Secret' },
  TikTok: { SocialId: 'Pixel ID (e.g. CXXXXXXXXXXXXXXXXXX)', AccessKey: 'Events API Access Token' },
};

const EMPTY_FORM = { Platform: '', SocialId: '', AccessKey: '', Remarks: '' };

async function callSP(parameters) {
  debugger;
  const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'TenantId': config.tenantId },
    body: JSON.stringify({ operation: '', procedureName: 'SP_EcomConfigApi', parameters }),
  });
  return res.json();
}

export default function ConversionApiConfig() {
  const { loginData } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showKey, setShowKey] = useState({});

  // Test Events state
  const [selectedEvent, setSelectedEvent] = useState('');
  const [metaTestCode, setMetaTestCode] = useState('');
  const [testFiring, setTestFiring] = useState(false);
  const [testResults, setTestResults] = useState(null); // { Meta, Google, TikTok } each: { status, message }

  // Test All Events state
  const [testAllFiring, setTestAllFiring] = useState(false);
  const [testAllResults, setTestAllResults] = useState(null); // { Meta, Google, TikTok } each: { ok, skipped, error, total }

  const fetchAll = async () => {
    try {
      const data = await callSP({ QueryChecker: 3 });
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setRows(list);
    } catch {
      toast.error('Failed to load configurations');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAll();
  };

  const openAdd = () => {
    setEditingRow(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (row) => {
    setEditingRow(row);
    setForm({
      Platform: row.Platform,
      SocialId: row.SocialId,
      AccessKey: row.AccessKey,
      Remarks: row.Remarks || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRow(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.Platform) { toast.error('Please select a platform'); return; }
    if (!form.SocialId.trim()) { toast.error('Pixel ID / Measurement ID is required'); return; }
    if (!form.AccessKey.trim()) { toast.error('Access Token is required'); return; }

    setSaving(true);
    try {
      const by = loginData?.Name || loginData?.Email || 'Admin';

      if (editingRow) {
        await callSP({
          QueryChecker: 2,
          Id: editingRow.Id,
          SocialId: form.SocialId.trim(),
          AccessKey: form.AccessKey.trim(),
          Platform: form.Platform,
          Remarks: form.Remarks.trim(),
          UpdateBy: by,
        });
        toast.success('Configuration updated');
      } else {
        const result = await callSP({
          QueryChecker: 1,
          SocialId: form.SocialId.trim(),
          AccessKey: form.AccessKey.trim(),
          Platform: form.Platform,
          Remarks: form.Remarks.trim(),
          EntryBy: by,
        });
        const res = Array.isArray(result) ? result[0] : result;
        if (res?.Status === 'DUPLICATE') {
          toast.error(res.Message || 'Platform already exists. Edit it instead.');
          setSaving(false);
          return;
        }
        toast.success('Configuration saved');
      }

      closeModal();
      await fetchAll();
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (row) => {
    try {
      await callSP({
        QueryChecker: 6,
        Id: row.Id,
        UpdateBy: loginData?.Name || loginData?.Email || 'Admin',
      });
      toast.success(`${row.Platform} ${row.IsActive ? 'disabled' : 'enabled'}`);
      await fetchAll();
    } catch {
      toast.error('Failed to toggle status');
    }
  };

  const confirmDelete = (row) => {
    setDeleteTarget(row);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await callSP({ QueryChecker: 7, Id: deleteTarget.Id });
      toast.success(`${deleteTarget.Platform} configuration deleted`);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleKeyVisibility = (id) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key) => {
    if (!key) return '—';
    return key.length <= 8 ? '••••••••' : `${key.slice(0, 4)}${'•'.repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`;
  };

  const configuredPlatforms = new Set(rows.map((r) => r.Platform));

  const fireTestEvent = async () => {
    if (!selectedEvent) { toast.error('Please select an event to test'); return; }
    setTestFiring(true);
    setTestResults(null);

    const testPayload = {
      event: selectedEvent,
      eventId: `TEST_${selectedEvent}_${Date.now()}`,
      ...(metaTestCode.trim() && { testEventCode: metaTestCode.trim() }),
      data: {
        value: 100,
        contentIds: ['TEST-001'],
        contents: [{ id: 'TEST-001', title: 'Test Product', price: 100, quantity: 1 }],
        numItems: 1,
        transactionId: `TEST-${Date.now()}`,
      },
      clientId: `test_${Date.now()}`,
    };

    const results = {};
    await Promise.all([
      fetch('/api/track/meta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testPayload) })
        .then(r => r.json()).then(d => {
          results.Meta = d.skipped ? { status: 'skipped', message: d.reason } : d.error ? { status: 'error', message: d.error } : { status: 'ok', message: 'Sent to Meta' };
        }).catch(e => { results.Meta = { status: 'error', message: e.message }; }),
      fetch('/api/track/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testPayload) })
        .then(r => r.json()).then(d => {
          results.Google = d.skipped ? { status: 'skipped', message: d.reason } : d.error ? { status: 'error', message: d.error } : { status: 'ok', message: 'Sent to Google' };
        }).catch(e => { results.Google = { status: 'error', message: e.message }; }),
      fetch('/api/track/tiktok', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(testPayload) })
        .then(r => r.json()).then(d => {
          results.TikTok = d.skipped ? { status: 'skipped', message: d.reason } : d.error ? { status: 'error', message: d.error } : { status: 'ok', message: 'Sent to TikTok' };
        }).catch(e => { results.TikTok = { status: 'error', message: e.message }; }),
    ]);

    setTestResults(results);
    setTestFiring(false);
    toast.success('Test event fired — see results below');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Conversion API Setup</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage pixel IDs and access tokens for Meta, Google, and TikTok.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#32BBAB] text-white rounded-md text-sm font-medium hover:bg-[#279487] transition-colors"
          >
            <FiPlus size={16} />
            Add Platform
          </button>
        </div>
      </div>

      {/* Platform status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {PLATFORMS.map((p) => {
          const row = rows.find((r) => r.Platform === p);
          return (
            <div
              key={p}
              className={`rounded-lg border-2 p-4 flex items-center gap-3 ${row?.IsActive ? 'border-[#32BBAB] bg-[#32BBAB]/5' : 'border-gray-200 bg-gray-50'
                }`}
            >
              <div className="shrink-0">{PLATFORM_ICONS[p]}</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p}</p>
                <p className={`text-xs mt-0.5 ${row?.IsActive ? 'text-[#32BBAB]' : row ? 'text-amber-500' : 'text-gray-400'}`}>
                  {row?.IsActive ? 'Active' : row ? 'Disabled' : 'Not configured'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <p className="text-lg font-medium mb-2">No platforms configured yet</p>
          <p className="text-sm mb-4">Add your first platform to start tracking conversions.</p>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-[#32BBAB] text-white rounded-md text-sm font-medium hover:bg-[#279487] transition-colors"
          >
            <FiPlus size={16} /> Add Platform
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Platform</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Pixel / ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Access Key</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Remarks</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.Id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {PLATFORM_ICONS[row.Platform]}
                      <span className="font-medium text-gray-800">{row.Platform}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {row.SocialId || '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>{showKey[row.Id] ? row.AccessKey : maskKey(row.AccessKey)}</span>
                      <button
                        onClick={() => toggleKeyVisibility(row.Id)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                        title={showKey[row.Id] ? 'Hide' : 'Show'}
                      >
                        {showKey[row.Id] ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{row.Remarks || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(row)}
                      title={row.IsActive ? 'Disable' : 'Enable'}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors"
                    >
                      {row.IsActive ? (
                        <span className="flex items-center gap-1 text-[#32BBAB]">
                          <FiToggleRight size={18} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400">
                          <FiToggleLeft size={18} /> Disabled
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 size={15} />
                      </button>
                      <button
                        onClick={() => confirmDelete(row)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-800">
                  {editingRow ? `Edit ${editingRow.Platform}` : 'Add Platform'}
                </h2>
                <button onClick={closeModal} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500">
                  <FiX size={18} />
                </button>
              </div>

              <div className="px-6 py-5 space-y-4">
                {/* Platform selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Platform</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PLATFORMS.map((p) => {
                      const alreadyExists = configuredPlatforms.has(p) && (!editingRow || editingRow.Platform !== p);
                      return (
                        <button
                          key={p}
                          type="button"
                          disabled={alreadyExists}
                          onClick={() => setForm((f) => ({ ...f, Platform: p }))}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-xs font-medium transition-colors
                            ${alreadyExists ? 'opacity-40 cursor-not-allowed border-gray-200 bg-gray-50' : ''}
                            ${form.Platform === p ? 'border-[#32BBAB] bg-[#32BBAB]/5 text-[#32BBAB]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                        >
                          {PLATFORM_ICONS[p]}
                          {p}
                          {alreadyExists && <span className="text-[10px] text-gray-400">Configured</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Social ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {form.Platform ? FIELD_HINTS[form.Platform]?.SocialId : 'Pixel ID / Measurement ID'}
                  </label>
                  <input
                    type="text"
                    value={form.SocialId}
                    onChange={(e) => setForm((f) => ({ ...f, SocialId: e.target.value }))}
                    placeholder={form.Platform ? FIELD_HINTS[form.Platform]?.SocialId : 'Select a platform first'}
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#32BBAB]/30 focus:border-[#32BBAB] transition-colors"
                  />
                </div>

                {/* Access Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {form.Platform ? FIELD_HINTS[form.Platform]?.AccessKey : 'Access Token'}
                  </label>
                  <input
                    type="password"
                    value={form.AccessKey}
                    onChange={(e) => setForm((f) => ({ ...f, AccessKey: e.target.value }))}
                    placeholder="Paste your access token here"
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#32BBAB]/30 focus:border-[#32BBAB] transition-colors font-mono"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Remarks <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.Remarks}
                    onChange={(e) => setForm((f) => ({ ...f, Remarks: e.target.value }))}
                    placeholder="e.g. Main store pixel, Test account..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#32BBAB]/30 focus:border-[#32BBAB] transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#32BBAB] text-white text-sm font-medium rounded-md hover:bg-[#279487] disabled:opacity-60 transition-colors"
                >
                  <FiSave size={15} />
                  {saving ? 'Saving...' : editingRow ? 'Update' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TEST EVENTS SECTION ─────────────────────────────────── */}
      <div className="mt-10 border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">Test Events</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fire a dummy event to verify your platform connections are working.</p>
          </div>
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

          {/* Event grid */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Select Event</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {TEST_EVENTS.map(ev => (
                <button
                  key={ev.name}
                  type="button"
                  onClick={() => setSelectedEvent(ev.name)}
                  className={`text-left px-3 py-2.5 rounded-lg border-2 transition-all ${
                    selectedEvent === ev.name
                      ? 'border-[#32BBAB] bg-[#32BBAB]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <p className={`text-xs font-semibold ${selectedEvent === ev.name ? 'text-[#32BBAB]' : 'text-gray-800'}`}>
                    {ev.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{ev.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fire button */}
          <button
            onClick={fireTestEvent}
            disabled={testFiring || !selectedEvent}
            className="flex items-center gap-2 px-5 py-2 bg-[#32BBAB] text-white text-sm font-medium rounded-md hover:bg-[#279487] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testFiring ? (
              <>
                <FiRefreshCw size={15} className="animate-spin" />
                Firing…
              </>
            ) : (
              <>
                <FiToggleRight size={16} />
                Fire Test Event{selectedEvent ? ` — ${TEST_EVENTS.find(e => e.name === selectedEvent)?.label}` : ''}
              </>
            )}
          </button>

          {/* Results */}
          {testResults && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Results</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { key: 'Meta', icon: <SiMeta className="text-blue-600" size={16} /> },
                  { key: 'Google', icon: <SiGoogle className="text-red-500" size={16} /> },
                  { key: 'TikTok', icon: <SiTiktok className="text-black" size={16} /> },
                ].map(({ key, icon }) => {
                  const r = testResults[key];
                  return (
                    <div key={key} className="flex items-center gap-3 px-4 py-3">
                      <div className="shrink-0">{icon}</div>
                      <span className="text-sm font-medium text-gray-700 w-16">{key}</span>
                      {!r ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : r.status === 'ok' ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                          {r.message}
                        </span>
                      ) : r.status === 'skipped' ? (
                        <span className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                          Not configured — {r.message}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                          Error: {r.message}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── DIVIDER ── */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 shrink-0">Or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* ── Fire All Events ── */}
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

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Configuration</h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete the <strong>{deleteTarget.Platform}</strong> configuration?
                This will stop all tracking for this platform.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                  className="px-4 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
