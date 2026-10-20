'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/provider/AuthProvider';
import config from '@/config';
import toast from 'react-hot-toast';
import { compressAndConvert, IMAGE_PRESETS } from '@/lib/image/compressImage';
import { ProcessingModal, SavingModal } from '@/components/Admin/UploadModals';
import CategoryBannerFields from '@/components/Admin/CategoryBannerFields';
import { getAllBrands } from '@/lib/server/brandData';
import {
  SITE_ACCESS_KEYS,
  MAIN_SITE_SCOPE,
  buildCategoryAccessKey,
  parseCategoryAccessKey,
  fetchProductTypes,
} from '@/lib/categoryAccessKey';

const EMPTY_BANNER = {
  Id: null,
  Title: '',
  Description: '',
  BannerImage: '',
  VideoUrl: '',
  IsActive: true,
  AccessKey: 'Home',
};

const callSP = async (parameters) => {
  const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
    body: JSON.stringify({ operation: '', procedureName: 'SP_Banners', parameters }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error');
    throw new Error(text);
  }
  return res.json();
};
// callSP is used for list fetch, delete, and toggle — saving uses the C# endpoint directly to preserve VideoUrl handling

export default function BannerManage() {
  const { loginData } = useAuth();

  const [banner, setBanner] = useState({ ...EMPTY_BANNER });
  const [savingStep, setSavingStep] = useState(null);
  const [processingStep, setProcessingStep] = useState(null);
  const [pendingBannerFiles, setPendingBannerFiles] = useState([]);
  const [previewBannerUrls, setPreviewBannerUrls] = useState([]);

  const [bannerList, setBannerList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const [bannerMode, setBannerMode] = useState('site'); // 'site' | 'category'
  const [categoryFields, setCategoryFields] = useState({ scope: MAIN_SITE_SCOPE, gender: 'Men', productType: '' });
  const [brandNames, setBrandNames] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    fetchAllBanners();
    getAllBrands().then(list => setBrandNames(list.map(b => b.name).filter(Boolean))).catch(() => {});
    fetchProductTypes(config).then(setProductTypes);
  }, []);

  const fetchAllBanners = async () => {
    setListLoading(true);
    try {
      const data = await callSP({ QueryChecker: 6, CompanyId: config.CompanyId });
      setBannerList(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load banner list');
    } finally {
      setListLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBanner(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setBanner({ ...EMPTY_BANNER });
    setBannerMode('site');
    setCategoryFields({ scope: MAIN_SITE_SCOPE, gender: 'Men', productType: '' });
    previewBannerUrls.forEach(u => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
    setPendingBannerFiles([]);
    setPreviewBannerUrls([]);
  };

  const loadBannerForEdit = (b) => {
    const accessKey = b.AccessKey || 'Home';
    setBanner({
      Id: b.Id,
      Title: b.Title || '',
      Description: b.Description || '',
      BannerImage: b.BannerImage || '',
      VideoUrl: b.VideoUrl || '',
      IsActive: b.IsActive ?? true,
      AccessKey: accessKey,
    });

    const parsed = SITE_ACCESS_KEYS.includes(accessKey)
      ? null
      : parseCategoryAccessKey(accessKey, brandNames, productTypes);
    if (parsed) {
      setBannerMode('category');
      setCategoryFields(parsed);
    } else {
      setBannerMode('site');
      setCategoryFields({ scope: MAIN_SITE_SCOPE, gender: 'Men', productType: '' });
    }

    previewBannerUrls.forEach(u => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
    setPendingBannerFiles([]);
    setPreviewBannerUrls([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = async (files) => {
    if (!files?.length) return;
    try {
      setProcessingStep('compressing');
      const webpFiles = await Promise.all(
        Array.from(files).map(f => compressAndConvert(f, IMAGE_PRESETS.banner))
      );
      setProcessingStep(null);
      const newPreviews = webpFiles.map(f => URL.createObjectURL(f));
      setPendingBannerFiles(prev => [...prev, ...webpFiles]);
      setPreviewBannerUrls(prev => [...prev, ...newPreviews]);
    } catch {
      setProcessingStep(null);
      toast.error('Image processing failed');
    }
  };

  const removeExistingImage = (index) => {
    const urls = banner.BannerImage.split(',').filter(Boolean);
    urls.splice(index, 1);
    setBanner(prev => ({ ...prev, BannerImage: urls.join(',') }));
  };

  const removePendingImage = (index) => {
    setPreviewBannerUrls(prev => {
      const url = prev[index];
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setPendingBannerFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFileToDrive = async (file, index) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('label', `banner-${banner.AccessKey.replace(/\s+/g, '-').toLowerCase()}-${index}`);
    const res = await fetch('/api/uploadBanner', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.filePath;
  };

  const handleSubmit = async () => {
    if (!banner.Title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (bannerMode === 'category' && !banner.AccessKey) {
      toast.error('Select a product type for this category banner');
      return;
    }
    setSavingStep('uploading');
    try {
      // Step 1: upload new files to Google Drive
      const driveUrls = await Promise.all(
        pendingBannerFiles.map((file, i) => uploadFileToDrive(file, i))
      );

      // Step 2: combine kept existing images + new Drive URLs
      const existingUrls = banner.BannerImage ? banner.BannerImage.split(',').filter(Boolean) : [];
      const allImageUrls = [...existingUrls, ...driveUrls];

      setSavingStep('saving');

      // Step 3: save via SP (now includes VideoUrl)
      if (banner.Id) {
        await callSP({
          QueryChecker: 2,
          Id: banner.Id,
          Title: banner.Title?.trim() || '',
          Description: banner.Description?.trim() || '',
          BannerImage: allImageUrls.join(','),
          VideoUrl: banner.VideoUrl?.trim() || '',
          AccessKey: banner.AccessKey,
          IsActive: banner.IsActive,
          UpdateBy: loginData?.Name || '',
          CompanyId: config.CompanyId,
        });
      } else {
        const result = await callSP({
          QueryChecker: 1,
          Title: banner.Title?.trim() || '',
          Description: banner.Description?.trim() || '',
          BannerImage: allImageUrls.join(','),
          VideoUrl: banner.VideoUrl?.trim() || '',
          AccessKey: banner.AccessKey,
          IsActive: banner.IsActive,
          Remarks: '',
          EntryBy: loginData?.Name || '',
          CompanyId: config.CompanyId,
        });
        if (!result?.[0]?.Id) throw new Error('Banner was not created. Please try again.');
      }

      setSavingStep('done');
      setTimeout(() => {
        setSavingStep(null);
        toast.success(banner.Id ? 'Banner updated!' : 'Banner created!');
        resetForm();
        fetchAllBanners();
      }, 1500);
    } catch (err) {
      setSavingStep(null);
      toast.error(err.message || 'Failed to save banner');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await callSP({ QueryChecker: 4, Id: id, CompanyId: config.CompanyId });
      toast.success('Banner deleted');
      if (banner.Id === id) resetForm();
      fetchAllBanners();
    } catch {
      toast.error('Failed to delete banner');
    }
  };

  const handleToggleActive = async (b) => {
    try {
      await callSP({
        QueryChecker: 2,
        Id: b.Id,
        Title: b.Title || '',
        Description: b.Description || '',
        BannerImage: b.BannerImage || '',
        VideoUrl: b.VideoUrl || '',
        AccessKey: b.AccessKey || 'Home',
        IsActive: !b.IsActive,
        UpdateBy: loginData?.Name || '',
        CompanyId: config.CompanyId,
      });
      toast.success(!b.IsActive ? 'Banner activated' : 'Banner deactivated');
      fetchAllBanners();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const existingImages = banner.BannerImage ? banner.BannerImage.split(',').filter(Boolean) : [];

  return (
    <>
      <AnimatePresence>
        {processingStep && <ProcessingModal step={processingStep} />}
      </AnimatePresence>
      <AnimatePresence>
        {savingStep && <SavingModal step={savingStep} />}
      </AnimatePresence>

      <section className="overflow-hidden p-2 min-h-screen space-y-6">

        {/* ── Form ── */}
        <div className="bg-white rounded-lg border border-gray-300 shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#2d3748]">
              {banner.Id ? 'Edit Banner' : 'Add Banner'}
            </h2>
            {banner.Id && (
              <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-800 underline">
                Cancel Edit
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4a5568] mb-1">Title *</label>
              <input
                type="text"
                name="Title"
                value={banner.Title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a5568] mb-1">Description (Displayed On Banner)</label>
              <textarea
                name="Description"
                value={banner.Description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a5568] mb-1">Banner Type</label>
              <div className="flex gap-4 mb-2">
                <label className="flex items-center gap-1.5 text-sm text-[#4a5568]">
                  <input
                    type="radio"
                    checked={bannerMode === 'site'}
                    onChange={() => { setBannerMode('site'); setBanner(prev => ({ ...prev, AccessKey: SITE_ACCESS_KEYS[0] })); }}
                  />
                  Site / Hero Banner
                </label>
                <label className="flex items-center gap-1.5 text-sm text-[#4a5568]">
                  <input
                    type="radio"
                    checked={bannerMode === 'category'}
                    onChange={() => setBannerMode('category')}
                  />
                  Product Category Banner
                </label>
              </div>

              {bannerMode === 'site' ? (
                <select
                  name="AccessKey"
                  value={banner.AccessKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1] bg-white"
                >
                  {SITE_ACCESS_KEYS.map(key => <option key={key} value={key}>{key}</option>)}
                </select>
              ) : (
                <>
                  <CategoryBannerFields
                    scope={categoryFields.scope}
                    gender={categoryFields.gender}
                    productType={categoryFields.productType}
                    brands={brandNames}
                    productTypes={productTypes}
                    onChange={(fields, accessKey) => {
                      setCategoryFields(fields);
                      setBanner(prev => ({ ...prev, AccessKey: accessKey }));
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Access key: <span className="font-mono">{banner.AccessKey || '(select a product type)'}</span>
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="IsActive"
                checked={banner.IsActive}
                onChange={handleChange}
                className="h-4 w-4 text-[#4299e1] focus:ring-[#4299e1] border-[#e2e8f0] rounded"
              />
              <label className="ml-2 block text-sm text-[#4a5568]">Active</label>
            </div>

            {/* Image upload */}
            <div>
              <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-400 hover:border-[#63b3ed] rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500 mt-2"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or WebP, up to 10MB · Any resolution — automatically resized &amp; converted to WebP</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ''; }} className="hidden" />
              </label>

              {(existingImages.length > 0 || previewBannerUrls.length > 0) && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Banner images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="w-full aspect-video rounded-md overflow-hidden border border-gray-200">
                          <Image width={200} height={120} src={url} alt="" className="w-full h-full object-cover" unoptimized />
                        </div>
                        <button type="button" onClick={() => removeExistingImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs">×</button>
                      </div>
                    ))}
                    {previewBannerUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="w-full aspect-video rounded-md overflow-hidden border border-blue-200">
                          <Image src={url} alt="" fill unoptimized className="object-cover" />
                          <span className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                        </div>
                        <button type="button" onClick={() => removePendingImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 text-xs">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#4a5568] mb-1">Video URL (Google Drive — optional)</label>
              <input
                type="url"
                name="VideoUrl"
                value={banner.VideoUrl}
                onChange={handleChange}
                placeholder="https://drive.google.com/file/d/abc123/preview"
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
              />
              <p className="text-xs text-gray-500 mt-1">Paste public Google Drive video link. Images will be ignored if video is set.</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={!!savingStep}
                className="w-full lg:w-40 bg-[#32BBAB] hover:bg-[#2c9d90] disabled:bg-gray-400 text-white py-2 lg:py-3 px-4 rounded-[5px] transition-colors"
              >
                {banner.Id ? 'Update Banner' : 'Save Banner'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Banner List ──
        <div className="bg-white rounded-lg border border-gray-300 shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#2d3748] mb-4">All Banners</h2>

          {listLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#32BBAB]" />
            </div>
          ) : bannerList.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No banners yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-3 py-3">Image</th>
                    <th className="px-3 py-3">Title</th>
                    <th className="px-3 py-3">Access Key</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bannerList.map((b) => {
                    const firstImg = b.BannerImage ? b.BannerImage.split(',').filter(Boolean)[0] : null;
                    return (
                      <tr key={b.Id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          {firstImg ? (
                            <div className="relative w-20 h-12 rounded overflow-hidden border border-gray-200">
                              <Image src={firstImg} alt="" fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-20 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No img</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{b.Title || '—'}</td>
                        <td className="px-3 py-2">
                          <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-medium">{b.AccessKey}</span>
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => handleToggleActive(b)} className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${b.IsActive ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <span className={`inline-block w-3.5 h-3.5 mt-0.5 transform bg-white rounded-full shadow transition-transform duration-200 ${b.IsActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => loadBannerForEdit(b)} className="text-xs font-medium text-blue-600 hover:text-blue-800 underline">Edit</button>
                            <button onClick={() => handleDelete(b.Id)} className="text-xs font-medium text-red-500 hover:text-red-700 underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div> */}

      </section>
    </>
  );
}
