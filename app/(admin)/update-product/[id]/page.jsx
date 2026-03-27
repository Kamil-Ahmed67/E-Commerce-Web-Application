'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import config from '@/config';
import { useAuth } from '@/provider/AuthProvider';
import { getBrands } from '@/lib/server/brandData';
import { fetchCategories } from '@/lib/server/categoryData';
import { getAllProducts } from '@/lib/server/getAllProducts';
import { getProducts } from '@/lib/server/shopData';
export default function UpdateProductPage() {
  const { id } = useParams();
  const { loginData } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  // Dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  // Refs for outside click detection
  const brandRef = useRef(null);
  const genderRef = useRef(null);
  const typeRef = useRef(null);
  // Fetch product + data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [fetchedBrands, productsData, fetchedCategories] = await Promise.all([
          getBrands(),
          getAllProducts(),
          fetchCategories(),
        ]);

        setBrands(fetchedBrands);

        const found = productsData.find(p => p.id === Number(id));
        if (!found) throw new Error('Product not found');

        setProduct(found);

        const existing = found.imgs?.thumbnails || [];
        setPreviewUrls(existing);

        const categoryStrings = fetchedCategories.map(item => item.ProductType);
        setCategories(categoryStrings);
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

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));

    setPendingFiles(prev => [...prev, ...newFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => {
      const url = prev[index];
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });

    const existingCount = product?.imgs?.thumbnails?.length || 0;
    if (index >= existingCount) {
      const pendingIndex = index - existingCount;
      setPendingFiles(prev => prev.filter((_, i) => i !== pendingIndex));
    }
  };

  const formatBrandName = (name) => {
    return name?.replace(/([A-Z])/g, ' $1')?.trim() || name || '';
  };
  const uploadFilesToDrive = async (files) => {
    const formData = new FormData();

    files.forEach(file => formData.append("file", file));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("File upload failed");

    const data = await res.json();

    return data.paths.map(p => p.path);
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
      formData.append("Status", product.status ? "New" : "Regular");
      formData.append("IsWebsite", product.isWebsite === true ? "true" : "false");
      formData.append("Description", product.description?.trim() || "");
      formData.append("EcomDescription", product.ecomDescription?.trim() || "");
      formData.append("EcomSpecification", product.ecomSpecification?.trim() || "");
      formData.append("UpdateBy", loginData?.Name || "");

      // Keep old images
      const keptImages = previewUrls.filter(url => !url.startsWith("blob:"));

      // Upload new images
      let uploadedUrls = [];
      if (pendingFiles.length > 0) {
        uploadedUrls = await uploadFilesToDrive(pendingFiles);
      }

      // Final image list
      const finalUrls = [...keptImages, ...uploadedUrls];

      // Send URLs only
      formData.append("ImageUrls", finalUrls.join(","));
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
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

      toast.success("Product updated successfully!");

      previewUrls.forEach(url => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });

      setPendingFiles([]);
      setPreviewUrls(finalUrls);

      const updatedProducts = await getProducts();
      const refreshed = updatedProducts.find(p => p.id === Number(id));
      if (refreshed) setProduct(refreshed);

    } catch (err) {
      console.error("Update failed:", err);
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
                <label className="block text-sm font-medium text-[#4a5568] mb-1">Title*</label>
                <input
                  type="text"
                  name="styleNo"
                  value={product.styleNo || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border bg-gray-100 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
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
              <div className="relative">
                <label className="block text-sm font-medium mb-1">Product Type*</label>
                <div className="w-full px-3 py-2 border border-gray-400 rounded-md bg-gray-100 flex justify-between items-center cursor-not-allowed">
                  <span>{product.productType || 'Select category'}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1">Category</label>
                <div className="w-full px-3 py-2 border border-gray-400 rounded-md bg-gray-100 flex justify-between items-center cursor-not-allowed">
                  <span>{product.category || 'Select gender'}</span>
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
                <label className="block text-sm font-medium mb-1">Brand</label>

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
                <label className="block text-sm font-medium text-[#4a5568] mb-1">Description*</label>
                <input
                  type="text"
                  name="description"
                  value={product.description || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
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
                <label className="ml-2 text-sm text-[#4a5568]">Is New Arrival</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isWebsite"
                  checked={!!product.isWebsite}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#34b4b4] focus:ring-[#34b4b4] border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-[#4a5568]">Website Visibility</label>
              </div>
            </div>
            {/* Images */}
            <div className='space-y-3'>
              <label className="block text-sm font-medium mb-1">Product Images</label>

              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center pt-5 pb-6">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500"><span className="font-semibold">Click or drag</span> images</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <div className="aspect-square rounded overflow-hidden border border-gray-300 bg-gray-50">
                        <Image
                          src={url}
                          alt={`image ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/*Website  Descriptions */}
            <div>
              <label className="block text-sm font-medium text-[#4a5568] mb-1">Website Description</label>
              <textarea
                name="ecomDescription"
                value={product.ecomDescription || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
              />
            </div>
            {/*Website  Specifications */}
            <div>
              <label className="block text-sm font-medium text-[#4a5568] mb-1">Website Specifications</label>
              <textarea
                name="ecomSpecification"
                value={product.ecomSpecification || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
              />
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
                className="px-5 py-2.5 bg-[#34b4b4] text-white rounded-md hover:bg-[#2a9d9d] transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}