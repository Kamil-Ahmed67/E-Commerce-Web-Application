'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/provider/AuthProvider';
import Link from 'next/link';
import { getAllBanners } from '@/lib/server/bannerData';
import config from '@/config';
import toast from 'react-hot-toast';
import { compressAndConvert, IMAGE_PRESETS } from '@/lib/image/compressImage';
import { ProcessingModal, SavingModal } from '@/components/Admin/UploadModals';
import CategoryBannerFields from '@/components/Admin/CategoryBannerFields';
import { getAllBrands } from '@/lib/server/brandData';
import {
  SITE_ACCESS_KEYS,
  MAIN_SITE_SCOPE,
  parseCategoryAccessKey,
  fetchProductTypes,
} from '@/lib/categoryAccessKey';

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

export default function BannerList() {
  const { loginData } = useAuth();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [brandNames, setBrandNames] = useState([]);

  useEffect(() => {
    fetchBanners();
    getAllBrands().then(list => setBrandNames(list.map(b => b.name).filter(Boolean))).catch(() => {});
  }, []);

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = !searchQuery.trim() || [banner.title, banner.description, banner.accessKey]
      .some(field => field?.toLowerCase().includes(searchQuery.trim().toLowerCase()));
    const matchesBrand = brandFilter === 'All' ||
      banner.accessKey?.toLowerCase().startsWith(brandFilter.toLowerCase());
    return matchesSearch && matchesBrand;
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await getAllBanners();
      setBanners(data || []);
    } catch (err) {
      setError('Failed to fetch banners');
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await callSP({
        QueryChecker: 2,
        Id: banner.id,
        Title: banner.title || '',
        Description: banner.description || '',
        BannerImage: banner.bannerImage?.join(',') || '',
        VideoUrl: banner.videoUrl || '',
        AccessKey: banner.accessKey || 'Home',
        IsActive: !banner.isActive,
        UpdateBy: loginData?.Name || '',
        CompanyId: config.CompanyId,
      });
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
      toast.success(!banner.isActive ? 'Banner activated' : 'Banner deactivated');
    } catch {
      toast.error('Failed to update banner status');
    }
  };

  const handleEdit = (banner) => setEditingBanner(banner);

  const openDeleteModal = (banner) => {
    setBannerToDelete(banner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await callSP({ QueryChecker: 4, Id: bannerToDelete.id, CompanyId: config.CompanyId });
      setBanners(prev => prev.filter(b => b.id !== bannerToDelete.id));
      toast.success('Banner deleted');
    } catch {
      toast.error('Failed to delete banner');
    } finally {
      setIsDeleteModalOpen(false);
      setBannerToDelete(null);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
        <Link href="/banner">
          <button className="bg-[#32BBAB] hover:bg-[#2c9d90] text-white font-bold py-2 px-4 rounded">
            Add New Banner
          </button>
        </Link>
      </div>

      {!loading && !error && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search banners by title, description, or access key..."
            className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#32BBAB]"
          />
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#32BBAB] bg-white"
          >
            <option value="All">All Brands</option>
            {brandNames.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#32BBAB]" />
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button onClick={fetchBanners} className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
            Retry
          </button>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">No banners found.</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">No banners match your search/filter.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                {banner.bannerImage?.length > 0 ? (
                  <Image src={banner.bannerImage[0]} alt={banner.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{banner.title}</h3>
                <p className="text-gray-600 text-sm mb-1 line-clamp-2">{banner.description}</p>
                <span className="inline-block bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-medium mb-3">{banner.accessKey}</span>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(banner)} className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded">
                      Edit
                    </button>
                    <button onClick={() => openDeleteModal(banner)} className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded">
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ${banner.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block w-3.5 h-3.5 mt-0.5 transform bg-white rounded-full shadow transition-transform duration-200 ${banner.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingBanner && (
        <EditBannerModal
          banner={editingBanner}
          loginName={loginData?.Name || ''}
          onClose={() => setEditingBanner(null)}
          onSaved={() => { setEditingBanner(null); fetchBanners(); }}
        />
      )}

      {isDeleteModalOpen && bannerToDelete && (
        <DeleteConfirmModal
          banner={bannerToDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({ banner, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-bold">{banner.title}</span>?
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

function EditBannerModal({ banner, loginName, onClose, onSaved }) {
  const [form, setForm] = useState({
    Id: banner.id,
    Title: banner.title || '',
    Description: banner.description || '',
    BannerImage: banner.bannerImage?.join(',') || '',
    VideoUrl: banner.videoUrl || '',
    IsActive: banner.isActive ?? true,
    AccessKey: banner.accessKey || 'Home',
  });
  const [pendingFiles, setPendingFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [savingStep, setSavingStep] = useState(null);
  const [processingStep, setProcessingStep] = useState(null);

  const [brandNames, setBrandNames] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [bannerMode, setBannerMode] = useState('site');
  const [categoryFields, setCategoryFields] = useState({ scope: MAIN_SITE_SCOPE, gender: 'Men', productType: '' });

  useEffect(() => {
    const accessKey = banner.accessKey || 'Home';
    Promise.all([
      getAllBrands().then(list => list.map(b => b.name).filter(Boolean)).catch(() => []),
      fetchProductTypes(config),
    ]).then(([brands, types]) => {
      setBrandNames(brands);
      setProductTypes(types);
      if (SITE_ACCESS_KEYS.includes(accessKey)) return;
      const parsed = parseCategoryAccessKey(accessKey, brands, types);
      if (parsed) {
        setBannerMode('category');
        setCategoryFields(parsed);
      }
    });
  }, [banner.accessKey]);

  const existingImages = form.BannerImage ? form.BannerImage.split(',').filter(Boolean) : [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
      setPendingFiles(prev => [...prev, ...webpFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    } catch {
      setProcessingStep(null);
      toast.error('Image processing failed');
    }
  };

  const removeExistingImage = (index) => {
    const urls = existingImages.slice();
    urls.splice(index, 1);
    setForm(prev => ({ ...prev, BannerImage: urls.join(',') }));
  };

  const removePendingImage = (index) => {
    setPreviewUrls(prev => {
      const url = prev[index];
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFileToDrive = async (file, index) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('label', `banner-${form.AccessKey.replace(/\s+/g, '-').toLowerCase()}-${index}`);
    const res = await fetch('/api/uploadBanner', { method: 'POST', body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data.filePath;
  };

  const handleSubmit = async () => {
    if (!form.Title.trim()) { toast.error('Title is required'); return; }
    if (bannerMode === 'category' && !form.AccessKey) {
      toast.error('Select a product type for this category banner');
      return;
    }
    setSavingStep('uploading');
    try {
      const driveUrls = await Promise.all(pendingFiles.map((file, i) => uploadFileToDrive(file, i)));
      const allImageUrls = [...existingImages, ...driveUrls];
      setSavingStep('saving');
      await callSP({
        QueryChecker: 2,
        Id: form.Id,
        Title: form.Title.trim(),
        Description: form.Description.trim(),
        BannerImage: allImageUrls.join(','),
        VideoUrl: form.VideoUrl?.trim() || '',
        AccessKey: form.AccessKey,
        IsActive: form.IsActive,
        UpdateBy: loginName,
        CompanyId: config.CompanyId,
      });
      setSavingStep('done');
      setTimeout(() => {
        setSavingStep(null);
        toast.success('Banner updated!');
        onSaved();
      }, 1500);
    } catch (err) {
      setSavingStep(null);
      toast.error(err.message || 'Failed to save banner');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <AnimatePresence>
        {processingStep && <ProcessingModal step={processingStep} />}
      </AnimatePresence>
      <AnimatePresence>
        {savingStep && <SavingModal step={savingStep} />}
      </AnimatePresence>

      <div className="bg-white rounded-lg border border-gray-300 shadow-md p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2d3748]">Edit Banner</h2>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 underline">Cancel</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4a5568] mb-1">Title *</label>
            <input
              type="text"
              name="Title"
              value={form.Title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a5568] mb-1">Description</label>
            <textarea
              name="Description"
              value={form.Description}
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
                  onChange={() => { setBannerMode('site'); setForm(prev => ({ ...prev, AccessKey: SITE_ACCESS_KEYS[0] })); }}
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
                value={form.AccessKey}
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
                    setForm(prev => ({ ...prev, AccessKey: accessKey }));
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Access key: <span className="font-mono">{form.AccessKey || '(select a product type)'}</span>
                </p>
              </>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="IsActive"
              checked={form.IsActive}
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

            {(existingImages.length > 0 || previewUrls.length > 0) && (
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
                  {previewUrls.map((url, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="w-full aspect-video rounded-md overflow-hidden border border-blue-200 relative">
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
              value={form.VideoUrl}
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
              Update Banner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
