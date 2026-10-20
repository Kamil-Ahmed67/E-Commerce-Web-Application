'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiX, FiExternalLink } from 'react-icons/fi';
import { MdNewspaper } from 'react-icons/md';
import toast from 'react-hot-toast';
const EMPTY_FORM = {
    Title: '',
    Description: '',
    Source: '',
    EventDate: '',
    NewsPortal: '',
    Remarks: '',
    IsActive: true,
};

function formatDate(str) {
    if (!str) return '—';
    try {
        return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return str; }
}


export default function NewsEventsManage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | 'edit'
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/news-events');
            const data = await res.json();
            setRecords(Array.isArray(data) ? data : []);
        } catch {
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setForm(EMPTY_FORM);
        setModal('add');
    };

    const openEdit = (record) => {
        setForm({
            Id: record.Id,
            Title: record.Title || '',
            Description: record.Description || '',
            Source: record.Source || '',
            EventDate: record.EventDate ? record.EventDate.split('T')[0] : '',
            NewsPortal: record.NewsPortal || '',
            Remarks: record.Remarks || '',
            IsActive: record.IsActive,
        });
        setModal('edit');
    };

    const closeModal = () => { setModal(null); setForm(EMPTY_FORM); };

    const handleSave = async () => {
        if (!form.Title.trim()) { toast.error('Title is required'); return; }
        setSaving(true);
        try {
            const isEdit = modal === 'edit';
            const body = {
                Title: form.Title,
                Description: form.Description || null,
                Source: form.Source || null,
                EventDate: form.EventDate || null,
                NewsPortal: form.NewsPortal || null,
                Remarks: form.Remarks || null,
                IsActive: form.IsActive ? 1 : 0,
                EntryBy: 1,
                UpdateBy: 1,
            };
            if (isEdit) body.Id = form.Id;

            const res = await fetch('/api/news-events', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result?.error || `HTTP ${res.status}`);
            toast.success(isEdit ? 'Record updated' : 'Record added');
            closeModal();
            fetchAll();
        } catch (err) {
            console.error('[handleSave]', err.message);
            toast.error(err.message || 'Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch('/api/news-events', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Id: deleteTarget.Id }),
            });
            if (!res.ok) throw new Error();
            toast.success('Record deleted');
            setRecords((prev) => prev.filter((r) => r.Id !== deleteTarget.Id));
        } catch {
            toast.error('Failed to delete');
        } finally {
            setDeleteTarget(null);
        }
    };

    const filtered = records.filter((r) => {
        const q = search.toLowerCase();
        return (
            r.Title?.toLowerCase().includes(q) ||
            r.Source?.toLowerCase().includes(q) ||
            r.Remarks?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-16">

            {/* Header */}
            <div className="px-4 pt-4 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MdNewspaper className="text-teal-600" size={24} />
                        News & Events Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {records.length} record{records.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition shadow"
                >
                    <FiPlus size={16} />
                    Add New
                </button>
            </div>

            {/* Search */}
            <div className="px-4 pb-3">
                <div className="relative max-w-sm">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by title, source…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="px-4">
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-teal-700 to-teal-900">
                                <tr>
                                    {['SL', 'Title', 'News Portal', 'Event Date', 'Article URL', 'Entry Date', 'Status', 'Actions'].map((h) => (
                                        <th key={h} className={`px-4 py-4 text-xs font-light text-white uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <div className="flex justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-teal-500" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-16 text-center">
                                            <MdNewspaper className="mx-auto text-gray-300 mb-3" size={48} />
                                            <p className="text-gray-500 font-medium">
                                                {search ? 'No records match your search' : 'No news & events yet'}
                                            </p>
                                            {!search && (
                                                <button onClick={openAdd} className="mt-3 text-sm text-teal-600 hover:underline">
                                                    Add your first entry
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((rec, index) => (
                                        <tr key={rec.Id} className="hover:bg-teal-50/30 transition-colors">
                                            <td className="px-4 py-3 text-xs text-gray-500 font-medium">{index + 1}</td>
                                            <td className="px-4 py-3 max-w-xs">
                                                <p className="text-sm font-medium text-gray-800 truncate" title={rec.Title}>
                                                    {rec.Title || '—'}
                                                </p>
                                                {rec.Description && (
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">{rec.Description}</p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                {rec.NewsPortal || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                {formatDate(rec.EventDate)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {rec.Source ? (
                                                    <a
                                                        href={rec.Source}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
                                                    >
                                                        Visit <FiExternalLink size={11} />
                                                    </a>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                {formatDate(rec.EntryDate)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${rec.IsActive
                                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                                    : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                                                    {rec.IsActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(rec)}
                                                        className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(rec)}
                                                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg z-10 overflow-hidden"
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-700 to-teal-900">
                                <h3 className="text-base font-semibold text-white">
                                    {modal === 'add' ? 'Add News & Event' : 'Edit News & Event'}
                                </h3>
                                <button onClick={closeModal} className="text-white/70 hover:text-white">
                                    <FiX size={20} />
                                </button>
                            </div>

                            {/* Modal body */}
                            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Title <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={form.Title}
                                        onChange={(e) => setForm((p) => ({ ...p, Title: e.target.value }))}
                                        placeholder="e.g. আরাম, সুস্থতা ও আত্মপ্রকাশের প্রত্যয়…"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Description / Excerpt</label>
                                    <textarea
                                        rows={3}
                                        value={form.Description}
                                        onChange={(e) => setForm((p) => ({ ...p, Description: e.target.value }))}
                                        placeholder="Short summary shown on the card…"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                                    />
                                </div>

                                {/* Source URL + Event Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Article URL</label>
                                        <input
                                            type="url"
                                            value={form.Source}
                                            onChange={(e) => setForm((p) => ({ ...p, Source: e.target.value }))}
                                            placeholder="https://bangla.bdnews24.com/…"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Event / Published Date</label>
                                        <input
                                            type="date"
                                            value={form.EventDate}
                                            onChange={(e) => setForm((p) => ({ ...p, EventDate: e.target.value }))}
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                    </div>
                                </div>

                                {/* News Portal Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">News Portal Name</label>
                                    <input
                                        type="text"
                                        value={form.NewsPortal}
                                        onChange={(e) => setForm((p) => ({ ...p, NewsPortal: e.target.value }))}
                                        placeholder="e.g. BDNews24 Bangla, Prothom Alo…"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* Remarks */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                                    <input
                                        type="text"
                                        value={form.Remarks}
                                        onChange={(e) => setForm((p) => ({ ...p, Remarks: e.target.value }))}
                                        placeholder="Optional internal note…"
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    />
                                </div>

                                {/* IsActive */}
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setForm((p) => ({ ...p, IsActive: !p.IsActive }))}
                                        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.IsActive ? 'bg-teal-500' : 'bg-gray-300'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.IsActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                    <span className="text-sm text-gray-600">{form.IsActive ? 'Active (visible on site)' : 'Inactive (hidden)'}</span>
                                </div>
                            </div>

                            {/* Modal footer */}
                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 text-sm font-medium transition disabled:opacity-60"
                                >
                                    {saving ? 'Saving…' : modal === 'add' ? 'Add Record' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirm Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setDeleteTarget(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm z-10"
                        >
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Record</h3>
                            <p className="text-sm text-gray-600 mb-5">
                                Are you sure you want to delete <strong>&ldquo;{deleteTarget.Title}&rdquo;</strong>? This cannot be undone.
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm font-medium transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
