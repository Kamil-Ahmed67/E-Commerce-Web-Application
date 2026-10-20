'use client';

import { useState, useEffect, useContext } from 'react';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import config from '@/config';
import { AuthContext } from '@/provider/AuthProvider';
import CollapsibleCodeField from './CollapsibleCodeField';

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
      await fetch('/api/revalidate-pixel-configs', { method: 'POST' }).catch(() => {});
      toast.success('GTM configuration saved');
      await fetchGtm();
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
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
          <CollapsibleCodeField
            label="Head snippet"
            description="Paste the <script>...</script> block"
            value={form.headSnippet}
            onChange={(e) => setForm((f) => ({ ...f, headSnippet: e.target.value }))}
            placeholder="<!-- Google Tag Manager -->&#10;<script>...&#10;</script>"
            rows={6}
          />

          <CollapsibleCodeField
            label="Body snippet"
            description="Paste the <noscript><iframe>...</iframe></noscript> block"
            value={form.bodySnippet}
            onChange={(e) => setForm((f) => ({ ...f, bodySnippet: e.target.value }))}
            placeholder="<!-- Google Tag Manager (noscript) -->&#10;<noscript><iframe ...></iframe></noscript>"
            rows={4}
          />

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
    </div>
  );
}
