'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';
import config from '@/config';
import { ProcessingModal, SavingModal } from '@/components/Admin/UploadModals';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-teal-600' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

function Card({ label, hint, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-baseline gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        {hint && <span className="text-xs font-normal normal-case text-gray-400">{hint}</span>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function BlogPostForm({ initialData = null, mode = 'add' }) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const titleRef  = useRef(initialData?.Title       || '');
  const descRef   = useRef(initialData?.Description || '');
  const [savingStep,      setSavingStep]      = useState(null);
  const [processingStep,  setProcessingStep]  = useState(null);

  // Image
  const [imageUrl,   setImageUrl]  = useState(initialData?.ThumbnailUrls || '');
  const [uploading,  setUploading] = useState(false);
  const [dragOver,   setDragOver]  = useState(false);
  const fileInputRef = useRef(null);

  // Fields
  const [shortDescription, setShortDescription] = useState(initialData?.ShortDescription || '');
  const [sortBy,            setSortBy]           = useState(initialData?.Sortby           ?? '');
  const [imgAltText,        setImgAltText]       = useState(initialData?.ImgAltText       || '');
  const [mTitle,            setMTitle]           = useState(initialData?.MTitle           || '');
  const [mDescription,      setMDescription]     = useState(initialData?.MDescription     || '');
  const [remarks,           setRemarks]          = useState(initialData?.Remarks          || '');
  const [isActive,          setIsActive]         = useState(initialData?.IsActive         ?? true);

  /* ── Image upload ── */
  const uploadImage = async (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error('Only JPEG, PNG, GIF and WebP are allowed.'); return; }
    if (file.size > 10 * 1024 * 1024)   { toast.error('Image must be under 10 MB.'); return; }
    setUploading(true);
    setProcessingStep('compressing');
    try {
      const { compressAndConvert, IMAGE_PRESETS } = await import('@/lib/image/compressImage');
      const compressed = await compressAndConvert(file, IMAGE_PRESETS.blog);
      setProcessingStep('converting');
      const fd = new FormData();
      fd.append('file', compressed, `blog-${Date.now()}.webp`);
      const res  = await fetch('/api/uploadBlog', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.filePath);
        setProcessingStep('done');
        setTimeout(() => setProcessingStep(null), 1000);
      } else {
        setProcessingStep(null);
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      setProcessingStep(null);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  /* ── Save ── */
  const handleSave = async () => {
    const title       = titleRef.current;
    const description = descRef.current;

    if (!title || title === '<br>' || title === '<p><br></p>') {
      toast.error('Title is required'); return;
    }

    setSavingStep('saving');
    try {
      const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomBlog',
          parameters: {
            QueryChecker:     isEdit ? 3 : 2,
            ...(isEdit ? { Id: initialData.Id } : {}),
            Title:            title,
            ThumbnailUrls:    imageUrl,
            PreviewUrls:      imageUrl,
            Description:      description,
            ShortDescription: shortDescription,
            Sortby:           sortBy === '' ? null : Number(sortBy),
            ImgAltText:       imgAltText,
            MTitle:           mTitle,
            MDescription:     mDescription,
            Remarks:          remarks,
            IsActive:         isActive,
          },
        }),
      });
      const result = await res.json();
      if (result?.[0]?.AffectedRows > 0 || result?.[0]?.Id != null) {
        setSavingStep('done');
        setTimeout(() => {
          setSavingStep(null);
          toast.success(isEdit ? 'Post updated!' : 'Post published!');
          router.push('/blog-manage');
        }, 1500);
      } else {
        setSavingStep(null);
        toast.error('Failed to save post');
      }
    } catch {
      setSavingStep(null);
      toast.error('Failed to save post');
    }
  };

  /* ── UI ── */
  return (
    <div className="min-h-screen bg-[#ECF0F4]">

      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        <button
          type="button"
          onClick={() => router.push('/blog-manage')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-teal-600 transition font-medium"
        >
          <FiArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Blog List</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium hidden sm:inline">
              {isActive ? 'Published' : 'Draft'}
            </span>
            <Toggle checked={isActive} onChange={setIsActive} />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={!!savingStep}
            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition shadow disabled:opacity-60"
          >
            <FiSave size={15} />
            {isEdit ? 'Save Changes' : isActive ? 'Publish' : 'Save Draft'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >

          {/* ── LEFT col (2/3): title → cover image → content ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Title */}
            <Card label="Blog Title">
              <RichTextEditor
                defaultValue={initialData?.Title || ''}
                onChange={(html) => { titleRef.current = html; }}
                placeholder="Enter your blog title here…"
                minHeight={80}
              />
            </Card>

            {/* Cover image — moved above content */}
            <Card label="Cover Image">
              {/* Drop zone / preview */}
              <div
                className={`relative w-full rounded-lg overflow-hidden border-2 border-dashed transition-colors ${
                  dragOver    ? 'border-teal-400 bg-teal-50'
                  : imageUrl  ? 'border-transparent'
                              : 'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/40'
                } flex items-center justify-center cursor-pointer`}
                style={{ minHeight: '200px' }}
                onClick={() => !imageUrl && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) uploadImage(f); }}
              >
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt={imgAltText || 'Cover'} className="w-full h-full object-contain max-h-72 bg-gray-50" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-800 text-xs font-semibold rounded-lg shadow hover:bg-gray-100 transition">
                        <FiUpload size={13} /> Replace
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setImageUrl(''); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg shadow hover:bg-red-600 transition">
                        <FiX size={13} /> Remove
                      </button>
                    </div>
                  </>
                ) : uploading ? (
                  <div className="text-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-teal-500 mx-auto mb-2" />
                    <p className="text-xs text-teal-600 font-medium">Compressing & uploading…</p>
                  </div>
                ) : (
                  <div className="text-center px-4 py-10">
                    <FiImage className="text-gray-300 mx-auto mb-2" size={36} />
                    <p className="text-sm font-medium text-gray-500">
                      Drop image here or <span className="text-teal-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP · max 10 MB · auto-converted to WebP</p>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ''; }} />

              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm font-medium text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/40 transition disabled:opacity-50">
                <FiUpload size={15} />
                {uploading ? 'Uploading…' : 'Upload Image'}
              </button>

              {/* Image Alt Text — lives right under the image */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Image Alt Text
                </label>
                <input
                  type="text"
                  value={imgAltText}
                  onChange={(e) => setImgAltText(e.target.value)}
                  placeholder="Describe the image for accessibility & SEO…"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </Card>

            {/* Blog Content */}
            <Card label="Blog Content">
              <RichTextEditor
                defaultValue={initialData?.Description || ''}
                onChange={(html) => { descRef.current = html; }}
                placeholder="Write your full blog post here…"
                minHeight={400}
              />
            </Card>
          </div>

          {/* ── RIGHT sidebar (1/3): meta + settings ── */}
          <div className="space-y-5">

            {/* Short Description — moved from left to sidebar */}
            <Card label="Short Description" hint="— shown on blog listing card">
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={4}
                placeholder="Write a brief summary of this post…"
                className="w-full text-sm text-gray-700 placeholder-gray-300 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </Card>

            {/* Sort Order */}
            <Card label="Sort Order" hint="— controls display sequence">
              <input
                type="number"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                min="0"
                placeholder="e.g. 1"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </Card>

            {/* SEO */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SEO / Meta</p>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={mTitle}
                    onChange={(e) => setMTitle(e.target.value)}
                    placeholder="Page title for search engines…"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{mTitle.length} / 60 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Meta Description
                  </label>
                  <textarea
                    value={mDescription}
                    onChange={(e) => setMDescription(e.target.value)}
                    rows={3}
                    placeholder="Short description shown in search results…"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{mDescription.length} / 160 characters</p>
                </div>
              </div>
            </div>

            {/* Remarks */}
            <Card label="Remarks / Tags" hint="— internal notes">
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                placeholder="Internal notes or comma-separated tags…"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </Card>

            {/* Visibility */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Visibility</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{isActive ? 'Published' : 'Draft'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isActive ? 'Visible on your website' : 'Hidden from your website'}
                  </p>
                </div>
                <Toggle checked={isActive} onChange={setIsActive} />
              </div>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={!!savingStep}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition shadow disabled:opacity-60"
            >
              <FiSave size={16} />
              {isEdit ? 'Save Changes' : isActive ? 'Publish Post' : 'Save as Draft'}
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {processingStep && <ProcessingModal step={processingStep} />}
      </AnimatePresence>
      <AnimatePresence>
        {savingStep && <SavingModal step={savingStep} />}
      </AnimatePresence>
    </div>
  );
}
