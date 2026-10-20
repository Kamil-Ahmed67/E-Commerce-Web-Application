'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { compressAndConvert, IMAGE_PRESETS } from '@/lib/image/compressImage';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import config from '@/config';
import { useAuth } from '@/provider/AuthProvider';
import { getAllBrands } from '@/lib/server/brandData';
import { getAdminProducts } from '@/lib/server/getAllProducts';
import RichTextEditor from '@/components/Admin/RichTextEditor';
import { ProcessingModal, SavingModal } from '@/components/Admin/UploadModals';

export default function UpdateProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { loginData } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingStep, setSavingStep] = useState(null); // null | 'compressing' | 'uploading' | 'saving' | 'done'
  const [error, setError] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  // Dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [imageSizes, setImageSizes] = useState([]);
  const [imageAltTexts, setImageAltTexts] = useState([]);
  const [imageIds, setImageIds] = useState([]); // DB Id per previewUrls entry, null = not yet saved
  const [deletedImageIds, setDeletedImageIds] = useState([]); // ids to soft-delete on save
  const [dbImageRecords, setDbImageRecords] = useState([]); // rows from postblitemimg
  const [processingStep, setProcessingStep] = useState(null);
  const [specs, setSpecs] = useState([]); // rows from postblitemspecification
  const [deletedSpecIds, setDeletedSpecIds] = useState([]); // ids to soft-delete on save
  const [sizeChartPreview, setSizeChartPreview] = useState(''); // current image url (existing https:// or blob: for a pending upload)
  const [sizeChartFile, setSizeChartFile] = useState(null); // pending File to upload on save
  const [sizeChartRemoved, setSizeChartRemoved] = useState(false); // user cleared an existing chart
  // Refs for outside click detection
  const brandRef = useRef(null);
  const genderRef = useRef(null);
  const typeRef = useRef(null);
  const fileByUrlRef = useRef(new Map()); // blob url -> File, for pending (not-yet-uploaded) images
  const dragIndexRef = useRef(null); // index currently being dragged in the image preview grid
  // Fetch product + data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [fetchedBrands, productsData, materialTypeRes] = await Promise.all([
          getAllBrands(),
          getAdminProducts(),
          fetch(`${config.API_BASE_URL}api/DropDown/GetAllMaterialType`, {
            headers: { 'TenantId': config.tenantId },
          }).then(r => r.ok ? r.json() : []).catch(() => []),
        ]);

        setBrands(fetchedBrands);
        setCategories(materialTypeRes.map(item => item.ChildName));

        const found = productsData.find(p => p.id === Number(id));
        if (!found) throw new Error('Product not found');

        setProduct(found);
        setSizeChartPreview(found.sizeChartUrl || '');

        const existing = found.imgs?.thumbnails || [];
        setPreviewUrls(existing);
        setImageSizes(existing.map(() => null));

        // Fetch existing image records from postblitemimg
        const imgRes = await fetch(`/api/item-images?itemId=${found.id}`);
        const imgRecords = imgRes.ok ? await imgRes.json() : [];
        setDbImageRecords(imgRecords);

        // Fetch existing spec rows
        const specRes = await fetch(`/api/item-specs?itemId=${found.id}`);
        const specRows = specRes.ok ? await specRes.json() : [];
        setSpecs(specRows.map(r => ({
          id: r.Id,
          header: r.Header || '',
          details: r.Details || '',
          remarks: r.Remarks || '',
          isNew: false,
        })));

        // Pre-populate alt texts and DB ids from DB records, aligned by URL
        setImageAltTexts(existing.map(url => {
          const match = imgRecords.find(r => r.ecomThumbnailUrls === url || r.EcomThumbnailUrls === url);
          return match?.imgAltText || match?.ImgAltText || '';
        }));
        setImageIds(existing.map(url => {
          const match = imgRecords.find(r => r.ecomThumbnailUrls === url || r.EcomThumbnailUrls === url);
          return match?.id ?? match?.Id ?? null;
        }));

      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandRef.current && !brandRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setShowGenderDropdown(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (!product) return;

    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        ['price', 'discountedPrice', 'StockQty', 'reviews', 'SellQty'].includes(name)
          ? Number(value) || 0
          : value
    }));
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    try {
      setProcessingStep('compressing');
      const webpFiles = await Promise.all(
        Array.from(files).map(file => compressAndConvert(file, IMAGE_PRESETS.product))
      );

      setProcessingStep('done');
      setTimeout(() => setProcessingStep(null), 1200);

      const newPreviews = webpFiles.map(f => URL.createObjectURL(f));
      const newSizes = webpFiles.map(f =>
        f.size < 1024 * 1024
          ? `${(f.size / 1024).toFixed(1)} KB`
          : `${(f.size / (1024 * 1024)).toFixed(2)} MB`
      );
      newPreviews.forEach((url, i) => fileByUrlRef.current.set(url, webpFiles[i]));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
      setImageSizes(prev => [...prev, ...newSizes]);
      setImageAltTexts(prev => [...prev, ...webpFiles.map(() => '')]);
      setImageIds(prev => [...prev, ...webpFiles.map(() => null)]);
    } catch (err) {
      setProcessingStep(null);
      toast.error('Image processing failed');
      console.error('Compression error:', err);
    }
  };

  const removeImage = (index) => {
    const removedId = imageIds[index];
    if (removedId) {
      setDeletedImageIds(prev => [...prev, removedId]);
    }

    setPreviewUrls(prev => {
      const url = prev[index];
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
        fileByUrlRef.current.delete(url);
      }
      return prev.filter((_, i) => i !== index);
    });
    setImageSizes(prev => prev.filter((_, i) => i !== index));
    setImageAltTexts(prev => prev.filter((_, i) => i !== index));
    setImageIds(prev => prev.filter((_, i) => i !== index));
  };

  const handleSizeChartSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessingStep('compressing');
      const [webpFile] = await Promise.all([compressAndConvert(file, IMAGE_PRESETS.product)]);
      setProcessingStep('done');
      setTimeout(() => setProcessingStep(null), 1200);

      if (sizeChartPreview.startsWith('blob:')) URL.revokeObjectURL(sizeChartPreview);

      const blobUrl = URL.createObjectURL(webpFile);
      fileByUrlRef.current.set(blobUrl, webpFile);
      setSizeChartFile(webpFile);
      setSizeChartPreview(blobUrl);
      setSizeChartRemoved(false);
    } catch (err) {
      setProcessingStep(null);
      toast.error('Image processing failed');
      console.error('Compression error:', err);
    }
  };

  const removeSizeChart = () => {
    if (sizeChartPreview.startsWith('blob:')) {
      URL.revokeObjectURL(sizeChartPreview);
      fileByUrlRef.current.delete(sizeChartPreview);
    }
    setSizeChartPreview('');
    setSizeChartFile(null);
    setSizeChartRemoved(true);
  };

  const moveImage = (from, to) => {
    if (from === to || from == null || to == null) return;
    const move = (arr) => {
      const copy = [...arr];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    };
    setPreviewUrls(prev => move(prev));
    setImageSizes(prev => move(prev));
    setImageAltTexts(prev => move(prev));
    setImageIds(prev => move(prev));
  };

  const formatBrandName = (name) => {
    return name?.replace(/([A-Z])/g, ' $1')?.trim() || name || '';
  };
  const uploadFilesToDrive = async (files) => {
    const urls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", "product");
      const res = await fetch("/api/uploadBanner", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "File upload failed");
      }
      const data = await res.json();
      urls.push(data.filePath);
    }
    return urls;
  };

  const addSpecRow = () => {
    setSpecs(prev => [...prev, { id: null, header: '', details: '', remarks: '', isNew: true }]);
  };

  const updateSpec = (index, field, value) => {
    setSpecs(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const removeSpecRow = (index) => {
    const row = specs[index];
    if (!row.isNew && row.id) {
      setDeletedSpecIds(prev => [...prev, row.id]);
    }
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!product || !loginData) return;

    try {
      const formData = new FormData();

      formData.append("Id", product.id);
      formData.append("StyleNo", product.styleNo?.trim() || "");
      formData.append("ProductType", product.productType?.trim() || "");
      formData.append("Category", product.category || "");
      formData.append("Brand", product.brand || "");
      formData.append("PMTitle", product.pmTitle || "");
      formData.append("PMDescription", product.pmDescription || "");
      formData.append("Status", product.status ? "New" : "Regular");
      formData.append("IsWebsite", product.isWebsite === true ? "true" : "false");
      formData.append("Description", product.description?.trim() || "");
      formData.append("EcomDescription", product.ecomDescription?.trim() || "");
      formData.append("EcomSpecification", product.ecomSpecification?.trim() || "");
      formData.append("UpdateBy", loginData?.Name || "");

      // Upload new images one by one, in the current preview grid order
      // (which reflects any drag-to-reorder the user did before saving)
      const pendingFiles = previewUrls
        .filter(url => url.startsWith('blob:'))
        .map(url => fileByUrlRef.current.get(url));

      let uploadedUrls = [];
      if (pendingFiles.length > 0) {
        setSavingStep('uploading');
        uploadedUrls = await uploadFilesToDrive(pendingFiles);
      }

      // Map uploaded urls back onto the blob: entries, in order
      let uploadCursor = 0;
      const finalUrls = previewUrls.map(url => url.startsWith('blob:') ? uploadedUrls[uploadCursor++] : url);

      // Size chart: upload if a new file was picked, keep existing url otherwise, or clear it if removed
      let finalSizeChartUrl = sizeChartRemoved ? '' : (product.sizeChartUrl || '');
      if (sizeChartFile) {
        setSavingStep('uploading');
        const [uploadedSizeChartUrl] = await uploadFilesToDrive([sizeChartFile]);
        finalSizeChartUrl = uploadedSizeChartUrl;
      }
      formData.append("SizeChartUrl", finalSizeChartUrl);

      setSavingStep('saving');
      const res = await fetch(
        `${config.API_BASE_URL}api/EItem/UpdateProductWithImages`,
        {
          method: "PUT",
          headers: { TenantId: config.tenantId },
          body: formData,
        }
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        throw new Error(errText);
      }

      // Hard-delete removed image rows
      for (const imageId of deletedImageIds) {
        await fetch(`/api/item-images?imageId=${imageId}`, { method: 'DELETE' });
      }

      // Save image rows: update existing (by Id), insert new (uploaded blobs)
      for (let i = 0; i < previewUrls.length; i++) {
        const isNewImage = previewUrls[i].startsWith('blob:');
        const url = finalUrls[i];
        const altText = imageAltTexts[i] || '';

        if (isNewImage) {
          await fetch('/api/item-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ItemId: product.id,
              EcomThumbnailUrls: url,
              EcomPreviewUrls: url,
              ImgAltText: altText,
              EntryBy: loginData?.Name || '',
              IsActive: true,
              SortOrder: i,
            }),
          });
        } else if (imageIds[i]) {
          await fetch('/api/item-images', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Id: imageIds[i],
              EcomThumbnailUrls: url,
              EcomPreviewUrls: url,
              ImgAltText: altText,
              UpdateBy: loginData?.Name || '',
              SortOrder: i,
            }),
          });
        }
      }

      // Soft-delete removed spec rows
      for (const specId of deletedSpecIds) {
        await fetch(`/api/item-specs?specId=${specId}`, { method: 'PATCH' });
      }

      // Save spec rows: update existing, insert new
      for (const spec of specs) {
        if (!spec.header.trim()) continue;
        if (spec.isNew) {
          await fetch('/api/item-specs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ItemId: product.id,
              Header: spec.header.trim(),
              Details: spec.details.trim(),
              Remarks: spec.remarks?.trim() || '',
              EntryBy: loginData?.Name || '',
              IsActive: true,
            }),
          });
        } else if (spec.id) {
          await fetch('/api/item-specs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Id: spec.id,
              ItemId: product.id,
              Header: spec.header.trim(),
              Details: spec.details.trim(),
              Remarks: spec.remarks?.trim() || '',
              UpdateBy: loginData?.Name || '',
              IsActive: true,
            }),
          });
        }
      }

      setSavingStep('done');

      // Clear the storefront's cached product data so this edit shows up immediately
      fetch('/api/revalidate-products', { method: 'POST' }).catch(() => {});

      previewUrls.forEach(url => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
      if (sizeChartPreview.startsWith("blob:")) URL.revokeObjectURL(sizeChartPreview);

      fileByUrlRef.current.clear();
      setPreviewUrls(finalUrls);
      setSizeChartPreview(finalSizeChartUrl);
      setSizeChartFile(null);
      setSizeChartRemoved(false);
      setProduct(prev => ({ ...prev, sizeChartUrl: finalSizeChartUrl }));

      const updatedProducts = await getAdminProducts();
      const refreshed = updatedProducts.find(p => p.id === Number(id));
      if (refreshed) setProduct(refreshed);

      // Close modal after a brief pause so user sees the success state
      setTimeout(() => {
        setSavingStep(null);
        router.push('/pos-product');
      }, 1800);

    } catch (err) {
      console.error("Update failed:", err);
      setSavingStep(null);
      toast.error(err.message || "Failed to update product");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href="/products" className="text-blue-600 hover:underline">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) return null;

  return (
    <>
      <style jsx global>{`
        .overflow-auto::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
        .overflow-auto {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      <div className=" mx-auto px-4 py-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow-md  p-6">
          <div className="space-y-4">
            <h1 className="text-xl font-bold mb-5">
              Edit Product - <span className="text-lg text-gray-500 font-medium">{product.styleNo}</span>
            </h1>

            {/* Title + Category + Gender */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
                <input
                  type="text"
                  name="styleNo"
                  value={product.styleNo || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-gray-700 bg-gray-100 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
                  required
                  readOnly
                />
              </div>
              {/* <div className="relative" ref={typeRef}>
                <label className="block text-sm font-medium mb-1">Product Type*</label>
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-400 rounded-md bg-white flex justify-between items-center"
                >
                  <span>{product.productType || 'Select category'}</span>
                  <svg className={`w-5 h-5 transition ${showTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setProduct({ ...product, productType: cat });
                          setShowTypeDropdown(false);
                        }}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${product.productType === cat ? 'bg-blue-100' : ''}`}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div> */}
              <div className="relative" ref={typeRef}>
                <label className="block text-sm text-gray-700 font-medium mb-1">Category*</label>
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-400 text-gray-700 rounded-md bg-white flex justify-between items-center"
                >
                  <span>{product.productType || 'Select category'}</span>
                  <svg className={`w-5 h-5 transition ${showTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showTypeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setProduct({ ...product, productType: cat });
                          setShowTypeDropdown(false);
                        }}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${product.productType === cat ? 'bg-blue-100' : ''}`}
                      >
                        {cat}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm text-gray-700 font-medium mb-1">Type</label>
                <div className="w-full px-3 py-2 border text-gray-700 border-gray-400 rounded-md bg-gray-100 flex justify-between items-center cursor-not-allowed">
                  <span className='text-gray-700'>{product.category || 'Select gender'}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {/* <div className="relative" ref={genderRef}>
                <label className="block text-sm font-medium mb-1">Category</label>
                <button
                  type="button"
                  onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-400 rounded-md bg-white flex justify-between items-center"
                >
                  <span>{product.category || 'Select gender'}</span>
                  <svg className={`w-5 h-5 transition ${showGenderDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showGenderDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
                    {['Men', 'Women'].map(g => (
                      <div
                        key={g}
                        onClick={() => {
                          setProduct({ ...product, category: g });
                          setShowGenderDropdown(false);
                        }}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer ${product.category === g ? 'bg-blue-100' : ''}`}
                      >
                        {g}
                      </div>
                    ))}
                  </div>
                )}
              </div> */}
            </div>
            {/* Brand + Sizes + Colors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* <div className="relative" ref={brandRef}>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <button
                  type="button"
                  onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                  className="w-full px-3 py-2 text-left border border-gray-400 rounded-md bg-white flex justify-between items-center"
                >
                  <span>{product.brand ? formatBrandName(product.brand) : 'Select brand'}</span>
                  <svg className={`w-5 h-5 transition ${showBrandDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showBrandDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                    {brands.map(b => (
                      <div
                        key={b.Id}
                        onClick={() => {
                          setProduct({ ...product, brand: b.Name });
                          setShowBrandDropdown(false);
                        }}
                        className={`px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center ${product.brand === b.Name ? 'bg-blue-100' : ''}`}
                      >
                        {b.Logo && (
                          <Image src={b.Logo} alt={b.Name} width={28} height={28} className="w-6 h-6 mr-2 object-contain" />
                        )}
                        <span>{formatBrandName(b.Name)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div> */}
              <div className="relative">
                <label className="block text-sm text-gray-700 font-medium mb-1">Brand</label>

                <div className="w-full px-3 py-2 border border-gray-400 rounded-md bg-gray-100 flex justify-between items-center cursor-not-allowed">

                  <div className="flex items-center">
                    {product.brandLogo && (
                      <Image
                        src={product.brandLogo}
                        alt={product.brand}
                        width={28}
                        height={28}
                        className="w-6 h-6 mr-2 object-contain"
                      />
                    )}
                    <span>{product.brand ? formatBrandName(product.brand) : 'Select brand'}</span>
                  </div>

                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>

                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
                <input
                  type="text"
                  name="description"
                  value={product.description || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border text-gray-700 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={!!product.status}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#34b4b4] focus:ring-[#34b4b4] border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Is New Arrival</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isWebsite"
                  checked={!!product.isWebsite}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#34b4b4] focus:ring-[#34b4b4] border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Website Visibility</label>
              </div>
            </div>
            {/* Images */}
            <div className="space-y-3">
              {/* Section header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700">Product Images</label>
                  {previewUrls.length > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {previewUrls.length} {previewUrls.length === 1 ? 'image' : 'images'}
                    </span>
                  )}
                </div>
                {previewUrls.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                      Alt set
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                      Missing
                    </span>
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-[#f0fafa] hover:border-[#34b4b4] transition-all duration-200 group/drop">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-gray-100 group-hover/drop:bg-[#e0f5f5] flex items-center justify-center transition-colors duration-200">
                    <svg className="w-5 h-5 text-gray-400 group-hover/drop:text-[#34b4b4] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 group-hover/drop:text-[#34b4b4] transition-colors duration-200">
                    <span className="font-semibold">Click or drag</span> to upload images
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG or WebP, up to 10MB · Any resolution — automatically resized &amp; converted to WebP</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>

              {/* Image grid */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-1">
                  {previewUrls.map((url, i) => (
                    <div
                      key={url}
                      className="group/card flex flex-col gap-2 cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={() => { dragIndexRef.current = i; }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        moveImage(dragIndexRef.current, i);
                        dragIndexRef.current = null;
                      }}
                      onDragEnd={() => { dragIndexRef.current = null; }}
                    >

                      {/* Card */}
                      <div className="relative aspect-square overflow-hidden shadow-sm border border-gray-200 bg-gray-100">
                        <Image
                          src={url}
                          alt={imageAltTexts[i] || `image ${i + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                          unoptimized
                        />

                        {/* Position badge — top center; i === 0 is the catalog cover image */}
                        <div className={`absolute top-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
                          i === 0 ? 'bg-[#34b4b4] text-white' : 'bg-white/90 text-gray-600 backdrop-blur-sm'
                        }`}>
                          {i === 0 ? 'Cover' : `#${i + 1}`}
                        </div>

                        {/* Alt status pill — top left */}
                        <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm shadow-sm transition-all duration-200 ${
                          imageAltTexts[i]
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-amber-400/90 text-white'
                        }`}>
                          {imageAltTexts[i] ? (
                            <>
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              ALT
                            </>
                          ) : (
                            <>
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              ALT
                            </>
                          )}
                        </div>

                        {/* Remove button — top right */}
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow flex items-center justify-center opacity-0 group-hover/card:opacity-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 transition-all duration-200"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* File size — bottom bar */}
                        {imageSizes[i] && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm text-white text-[10px] text-center py-1 font-medium tracking-wide">
                            {imageSizes[i]}
                          </div>
                        )}

                        {/* Alt text overlay — slides up on hover */}
                        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300 ease-out z-20">
                          <div className="bg-gradient-to-t from-black/85 via-black/70 to-transparent pt-6 px-2.5 pb-2.5">
                            <p className="text-[9px] text-white/60 font-semibold uppercase tracking-widest mb-1 flex items-center gap-1">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Image Alt Text
                            </p>
                            <input
                              type="text"
                              value={imageAltTexts[i] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setImageAltTexts(prev => prev.map((alt, idx) => idx === i ? val : alt));
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              placeholder="Describe this image for SEO…"
                              maxLength={125}
                              className="w-full bg-white/15 backdrop-blur-md text-white placeholder-white/40 text-xs px-2.5 py-1.5 rounded-lg border border-white/25 focus:outline-none focus:border-white/60 focus:bg-white/25 transition-all duration-150"
                            />
                            <div className="flex justify-end mt-1">
                              <span className="text-[9px] text-white/40 tabular-nums">
                                {(imageAltTexts[i] || '').length}/125
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Alt text preview below card */}
                      <div className="min-h-[18px]">
                        {imageAltTexts[i] ? (
                          <p className="text-[11px] text-gray-500 truncate leading-tight" title={imageAltTexts[i]}>
                            {imageAltTexts[i]}
                          </p>
                        ) : (
                          <p className="text-[11px] text-amber-500/70 leading-tight">
                            No alt text — hover to add
                          </p>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Size Chart Image */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">Size Chart Image</label>
                <span className="text-xs text-gray-400">(shown to customers on the product page)</span>
              </div>

              {sizeChartPreview ? (
                <div className="relative w-48 aspect-[3/4] border border-gray-200 rounded-xl overflow-hidden bg-gray-100 group/sizechart">
                  <Image
                    src={sizeChartPreview}
                    alt="Size chart"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  <button
                    onClick={removeSizeChart}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow flex items-center justify-center opacity-0 group-hover/sizechart:opacity-100 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 transition-all duration-200"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-48 h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-[#f0fafa] hover:border-[#34b4b4] transition-all duration-200 group/drop">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 rounded-full bg-gray-100 group-hover/drop:bg-[#e0f5f5] flex items-center justify-center transition-colors duration-200">
                      <svg className="w-5 h-5 text-gray-400 group-hover/drop:text-[#34b4b4] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 group-hover/drop:text-[#34b4b4] transition-colors duration-200 text-center px-2">
                      <span className="font-semibold">Click</span> to upload
                    </p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleSizeChartSelect} className="hidden" />
                </label>
              )}
            </div>
            {/* PMTitle + PMDescription */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                <input
                  type="text"
                  name="pmTitle"
                  value={product.pmTitle || ''}
                  onChange={handleChange}
                  placeholder="Enter product meta title"
                  className="w-full px-3 py-2 border text-gray-700 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <input
                  type="text"
                  name="pmDescription"
                  value={product.pmDescription || ''}
                  onChange={handleChange}
                  placeholder="Enter product meta description"
                  className="w-full px-3 py-2 border text-gray-700 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
                />
              </div>
            </div>
            {/*Website  Descriptions */}
            <div>
              <label className="block text-sm font-medium text-[#4a5568] mb-1">Website Description</label>
              <RichTextEditor
                defaultValue={product.ecomDescription || ''}
                onChange={(html) => setProduct(prev => ({ ...prev, ecomDescription: html }))}
                placeholder="Enter website description…"
                minHeight={180}
              />
            </div>
            {/* Product Specifications */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Product Specifications</label>
                <button
                  type="button"
                  onClick={addSpecRow}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#34b4b4] text-white rounded hover:bg-[#2a9d9d] transition"
                >
                  + Add Row
                </button>
              </div>
              {specs.length === 0 ? (
                <p className="text-sm text-gray-400 py-3">No specifications yet. Click &quot;Add Row&quot; to add one.</p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1.5fr_auto] gap-2 text-xs font-medium text-gray-500 px-1">
                    <span>Specification</span>
                    <span>Details</span>
                    <span></span>
                  </div>
                  {specs.map((spec, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2 items-center">
                      <input
                        type="text"
                        value={spec.header}
                        onChange={e => updateSpec(i, 'header', e.target.value)}
                        placeholder="e.g. Material"
                        className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
                      />
                      <input
                        type="text"
                        value={spec.details}
                        onChange={e => updateSpec(i, 'details', e.target.value)}
                        placeholder="e.g. 100% Cotton"
                        className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(i)}
                        className="p-2 text-red-400 hover:text-red-600 transition"
                        aria-label="Remove row"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Actions */}
            <div className="flex justify-end gap-4 ">
              <Link
                href="/product-list"
                className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!!savingStep}
                className="px-5 py-2.5 bg-[#34b4b4] text-white rounded-md hover:bg-[#2a9d9d] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Processing modal */}
      <AnimatePresence>
        {processingStep && <ProcessingModal step={processingStep} />}
      </AnimatePresence>

      {/* Saving modal */}
      <AnimatePresence>
        {savingStep && <SavingModal step={savingStep} />}
      </AnimatePresence>
    </>
  );
}