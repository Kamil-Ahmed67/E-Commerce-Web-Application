"use client";
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import config from '@/config';
import { useAuth } from '@/provider/AuthProvider';
import { fetchCategories } from '@/lib/server/categoryData';
import { getAllBrands } from '@/lib/server/brandData';
import toast from 'react-hot-toast';
import { compressAndConvert, IMAGE_PRESETS } from '@/lib/image/compressImage';
import { ProcessingModal, SavingModal } from '@/components/Admin/UploadModals';

export default function ProductManage() {
  const { loginData } = useAuth();

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);

  const [discountPercentages, setDiscountPercentages] = useState([]);

  const [processingStep, setProcessingStep] = useState(null);
  const [savingStep, setSavingStep] = useState(null);

  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

  const [products, setProducts] = useState([{
    Title: '',
    Type: '',
    Gender: '',
    Sizes: '',
    Colors: '',
    Brand: '',
    Reviews: 0,
    Price: 0,
    DiscountedPrice: 0,
    IsNewArraival: false,
    Description: '',
    AdditionalDescription: '',
    StockQty: 0,
    SellQty: 0,
    pendingFiles: [],
    previewUrls: []
  }]);
  const typeRef = useRef(null);
  const brandRef = useRef(null);
  const sizeRef = useRef(null);
  const colorRef = useRef(null);
  const genderRef = useRef(null);
  const formatBrandName = (name) => {
    return name.replace(/([A-Z])/g, ' $1').trim();
  };

  useEffect(() => {
    const fetchData = async () => {
      const fetchedBrands = await getAllBrands();
      setBrands(fetchedBrands);
      const fetchedCategories = await fetchCategories();
      setCategories(fetchedCategories);
    };
    fetchData();
  }, []);

  useEffect(() => {
    setDiscountPercentages(new Array(products.length).fill(0));
  }, [products.length]);

  useEffect(() => {
    const fetchDropdown = async (key, setter) => {
      try {
        const res = await fetch(
          `${config.API_BASE_URL}api/DropDown/GetMasterChildList?AccessKey=${key}`,
          { headers: { TenantId: config.tenantId } }
        );
        if (!res.ok) throw new Error();
        setter(await res.json());
      } catch {
        console.error(`Failed to load ${key} dropdown`);
      }
    };
    fetchDropdown("Color", setColorOptions);
    fetchDropdown("SIZE", setSizeOptions);
  }, []);
  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeRef.current && !typeRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
      if (brandRef.current && !brandRef.current.contains(event.target)) {
        setShowBrandDropdown(false);
      }
      if (sizeRef.current && !sizeRef.current.contains(event.target)) {
        setShowSizeDropdown(false);
      }
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        setShowColorDropdown(false);
      }
      if (genderRef.current && !genderRef.current.contains(event.target)) {
        setShowGenderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleChange = (index, e) => {
    const { name, value, type } = e.target;
    setProducts(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [name]: type === 'checkbox' ? e.target.checked :
          ['Reviews', 'Price', 'DiscountedPrice', 'StockQty', 'SellQty'].includes(name)
            ? Number(value) || 0
            : value
      };
      return next;
    });
  };

  const handleDiscountPercentageChange = (index, e) => {
    const percentage = e.target.value === "" ? 0 : Number(e.target.value);
    setDiscountPercentages(prev => {
      const next = [...prev];
      next[index] = percentage;
      return next;
    });

    setProducts(prev => {
      const next = [...prev];
      const price = Number(next[index].Price) || 0;
      next[index].DiscountedPrice = percentage > 0
        ? Math.round(price * (1 - percentage / 100) * 100) / 100
        : price;
      return next;
    });
  };

  const handleFileSelect = async (index, files) => {
    if (!files?.length) return;
    try {
      setProcessingStep('compressing');
      const webpFiles = await Promise.all(
        Array.from(files).map(f => compressAndConvert(f, IMAGE_PRESETS.product))
      );
      setProcessingStep('done');
      setTimeout(() => setProcessingStep(null), 1200);

      const newPreviews = webpFiles.map(f => URL.createObjectURL(f));
      setProducts(prev => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          pendingFiles: [...(next[index].pendingFiles || []), ...webpFiles],
          previewUrls:  [...(next[index].previewUrls  || []), ...newPreviews],
        };
        return next;
      });
    } catch (err) {
      setProcessingStep(null);
      toast.error('Image processing failed');
      console.error('Processing error:', err);
    }
  };

  const removePreviewImage = (index, imgIndex) => {
    setProducts(prev => {
      const next = [...prev];
      const item = next[index];

      if (item.previewUrls[imgIndex]) {
        URL.revokeObjectURL(item.previewUrls[imgIndex]);
      }

      next[index] = {
        ...item,
        pendingFiles: item.pendingFiles.filter((_, i) => i !== imgIndex),
        previewUrls: item.previewUrls.filter((_, i) => i !== imgIndex)
      };
      return next;
    });
  };
  const uploadFilesToDrive = async (files) => {
    const urls = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('label', 'product');
      const res = await fetch('/api/uploadBanner', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      urls.push(data.filePath);
    }
    return urls;
  };

  const handleSubmit = async (index) => {
    const item = products[index];

    if (!item.Title.trim() || !item.Type.trim() || item.Price <= 0) {
      toast.error("Title, Category and Price are required");
      return;
    }

    setSavingStep('uploading');
    try {
      let driveUrls = [];
      if (item.pendingFiles.length > 0) {
        driveUrls = await uploadFilesToDrive(item.pendingFiles);
      }

      setSavingStep('saving');
      const formData = new FormData();
      formData.append("Title", item.Title.trim());
      formData.append("Type", item.Type.trim());
      formData.append("Gender", item.Gender || "");
      formData.append("Sizes", item.Sizes || "");
      formData.append("Colors", item.Colors || "");
      formData.append("Brand", item.Brand || "");
      formData.append("Reviews", item.Reviews || 0);
      formData.append("Price", item.Price);
      formData.append("DiscountedPrice", item.DiscountedPrice || 0);
      formData.append("IsNewArraival", item.IsNewArraival);
      formData.append("Description", item.Description?.trim() || "");
      formData.append("AdditionalDescription", item.AdditionalDescription?.trim() || "");
      formData.append("StockQty", item.StockQty || 0);
      formData.append("SellQty", item.SellQty || 0);
      formData.append("CompanyId", config.CompanyId);
      formData.append("ImageUrls", driveUrls.join(","));
      formData.append("EntryBy", loginData?.Name || "");

      const res = await fetch(`${config.API_BASE_URL}api/EItem/AddProductWithImages`, {
        method: 'POST',
        headers: { TenantId: config.tenantId },
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "Unknown error");
        throw new Error(msg);
      }

      setSavingStep('done');
      setTimeout(() => {
        setSavingStep(null);
        toast.success("Product saved successfully!");
        item.previewUrls.forEach(url => URL.revokeObjectURL(url));
        setProducts(prev => {
          const next = [...prev];
          next[index] = {
            Title: '', Type: '', Gender: '', Sizes: '', Colors: '', Brand: '',
            Reviews: 0, Price: 0, DiscountedPrice: 0, IsNewArraival: false,
            Description: '', AdditionalDescription: '', StockQty: 0, SellQty: 0,
            pendingFiles: [], previewUrls: [],
          };
          return next;
        });
      }, 1500);

    } catch (err) {
      setSavingStep(null);
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save product");
    }
  };

  useEffect(() => {
    return () => {
      products.forEach(p => p.previewUrls.forEach(u => URL.revokeObjectURL(u)));
    };
  }, [products]);

  const addProductCard = () => {
    setProducts([...products, {
      Title: '',
      Type: '',
      Gender: '',
      Sizes: '',
      Colors: '',
      Brand: '',
      Reviews: 0,
      Price: 0,
      DiscountedPrice: 0,
      IsNewArraival: false,
      Description: '',
      AdditionalDescription: '',
      StockQty: 0,
      SellQty: 0,
      pendingFiles: [],
      previewUrls: []
    }]);
  };

  const removeProductCard = (index) => {
    const product = products[index];
    product.previewUrls.forEach(url => URL.revokeObjectURL(url));
    setProducts(prev => prev.filter((_, i) => i !== index));
  };
  return (
    <section>
      <div className="hidden justify-between items-center pt-2">
        <h1 className="text-lg lg:text-3xl font-bold text-gray-700">Product Management</h1>
        <button
          onClick={addProductCard}
          className="bg-[#4299e1] hover:bg-[#3182ce] text-sm lg:text-md text-white px-4 py-2 lg:py-3 rounded-[5px] transition-colors"
        >
          Add Product Card
        </button>
      </div>
      <div>
        {products.map((product, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-300 shadow-md overflow-hidden p-6 mb-2">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-[#2d3748]">Add New Product</h2>
              {products.length > 1 && (
                <button
                  onClick={() => removeProductCard(index)}
                  className="text-[#e53e3e] hover:text-[#c53030]"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Title*</label>
                  <input
                    type="text"
                    name="Title"
                    value={product.Title}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
                <div className="relative" ref={typeRef}>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Category*</label>
                  <button
                    type="button"
                    onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white flex justify-between items-center"
                  >
                    <span className={product.Type ? "text-gray-800" : "text-gray-400"}>
                      {product.Type || "Select a type"}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 duration-500 transition-transform ${showTypeDropdown ? 'rotate-180 text-teal-500' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showTypeDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-sm border border-gray-200 max-h-60 overflow-auto">
                      {categories.map((category, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            const newProducts = [...products];
                            newProducts[index] = { ...newProducts[index], Type: category.ProductType };
                            setProducts(newProducts);
                            setShowTypeDropdown(false);
                          }}
                          className={`px-4 py-2 hover:bg-[#e6f0ff] cursor-pointer ${product.Type === category.ProductType ? 'bg-[#cce0ff]' : ''}`}
                        >
                          {category.ProductType}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative" ref={genderRef}>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Gender</label>
                  <button
                    type="button"
                    onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white flex justify-between items-center"
                  >
                    <span className={product.Gender ? "text-gray-800" : "text-gray-400"}>
                      {product.Gender || "Select Gender"}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 duration-500 transition-transform ${showGenderDropdown ? 'rotate-180 text-teal-500' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showGenderDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-sm border border-gray-200">
                      {['Men', 'Women', 'Kids'].map((gender) => (
                        <div
                          key={gender}
                          onClick={() => {
                            const newProducts = [...products];
                            newProducts[index] = { ...newProducts[index], Gender: gender };
                            setProducts(newProducts);
                            setShowGenderDropdown(false);
                          }}
                          className={`px-4 py-2 hover:bg-[#e6f0ff] cursor-pointer ${product.Gender === gender ? 'bg-[#cce0ff]' : ''}`}
                        >
                          {gender}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative" ref={brandRef}>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Brand</label>
                  <button
                    type="button"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                    className="w-full px-3 py-2 text-left border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white flex justify-between items-center"
                  >
                    <span className={product.Brand ? 'text-gray-800' : 'text-gray-400'}>
                      {product.Brand ? formatBrandName(product.Brand) : 'Select a brand'}
                    </span>
                    <svg
                      className={`w-5 h-5 text-gray-400 duration-500 transition-transform ${showBrandDropdown ? 'rotate-180 text-teal-500' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showBrandDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-sm border border-gray-200 max-h-60 overflow-auto">
                      {brands.map((brand) => (
                        <div
                          key={brand.id}
                          onClick={() => {
                            const newProducts = [...products];
                            newProducts[index] = { ...newProducts[index], Brand: brand.name };
                            setProducts(newProducts);
                            setShowBrandDropdown(false);
                          }}
                          className={`px-4 py-2 hover:bg-[#e6f0ff] cursor-pointer flex items-center ${product.Brand === brand.name ? 'bg-[#cce0ff]' : ''}`}
                        >
                          <span>{formatBrandName(brand.name)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative" ref={sizeRef}>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Sizes</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="Sizes"
                      value={product.Sizes}
                      onChange={(e) => handleChange(index, e)}
                      onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer pr-8"
                      placeholder="Select sizes"
                      readOnly
                    />
                    <div className="absolute right-2 top-2.5 pointer-events-none">
                      <svg
                        className={`w-5 h-5 text-gray-400 duration-500 transition-transform ${showSizeDropdown ? 'rotate-180 text-teal-500' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {showSizeDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-sm border border-gray-200 max-h-60 overflow-auto">
                        {sizeOptions.map((size) => {
                          const isSelected = product.Sizes.split(',').includes(size.ChildName);
                          return (
                            <div
                              key={size.ChildId}
                              onClick={() => {
                                const currentSizes = product.Sizes ? product.Sizes.split(',') : [];
                                const newSizes = isSelected
                                  ? currentSizes.filter(s => s !== size.ChildName)
                                  : [...currentSizes, size.ChildName];
                                const newProducts = [...products];
                                newProducts[index] = { ...newProducts[index], Sizes: newSizes.join(',') };
                                setProducts(newProducts);
                              }}
                              className={`px-4 py-2 hover:bg-[#e6f0ff] cursor-pointer flex items-center ${isSelected ? 'bg-[#cce0ff]' : ''}`}
                            >
                              <span className="ml-2">{size.ChildName}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative" ref={colorRef}>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Colors</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="Colors"
                      value={product.Colors}
                      onChange={(e) => handleChange(index, e)}
                      onClick={() => setShowColorDropdown(!showColorDropdown)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer pr-8"
                      placeholder="Select colors"
                      readOnly
                    />
                    <div className="absolute right-2 top-2.5 pointer-events-none">
                      <svg
                        className={`w-5 h-5 text-gray-400 duration-500 transition-transform ${showColorDropdown ? 'rotate-180 text-teal-500' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {showColorDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-sm border border-gray-200 max-h-60 overflow-auto">
                        {colorOptions.map((color) => {
                          const isSelected = product.Colors.split(',').includes(color.ChildName);
                          return (
                            <div
                              key={color.ChildId}
                              onClick={() => {
                                const currentColors = product.Colors ? product.Colors.split(',') : [];
                                const newColors = isSelected
                                  ? currentColors.filter(c => c !== color.ChildName)
                                  : [...currentColors, color.ChildName];
                                const newProducts = [...products];
                                newProducts[index] = { ...newProducts[index], Colors: newColors.join(',') };
                                setProducts(newProducts);
                              }}
                              className="px-4 py-2 hover:bg-[#e6f0ff] cursor-pointer flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded mr-2 border border-gray-300"
                                  style={{ backgroundColor: color.Value }}
                                ></div>
                                <span>{color.ChildName}</span>
                              </div>
                              {isSelected && <span className="text-green-600 font-bold ml-2">✔</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Row 3 - Pricing & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Price*</label>
                  <input
                    type="number"
                    name="Price"
                    value={product.Price}
                    onChange={(e) => {
                      const price = Number(e.target.value || 0);
                      const discount = Number(discountPercentages[index] || 0);
                      const newProducts = [...products];
                      newProducts[index] = {
                        ...newProducts[index],
                        Price: price,
                        DiscountedPrice: discount > 0 ? Math.round(price * (1 - discount / 100) * 100) / 100 : price
                      };
                      setProducts(newProducts);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Discount %</label>
                  <input
                    type="number"
                    value={discountPercentages[index] || 0}
                    onChange={(e) => handleDiscountPercentageChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Discounted Price</label>
                  <input
                    type="number"
                    name="DiscountedPrice"
                    value={product.DiscountedPrice}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-100"
                    min="0"
                    step="0.01"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4a5568] mb-1">Total Stock</label>
                  <input
                    type="number"
                    name="StockQty"
                    value={product.StockQty}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="IsNewArraival"
                  checked={product.IsNewArraival || false}
                  onChange={(e) => handleChange(index, e)}
                  className="h-4 w-4 text-teal-500 focus:ring-teal-700 border-[#e2e8f0] rounded"
                />
                <label className="ml-2 block text-sm text-[#4a5568]">Is New Arrival</label>
              </div>
              {/* Image Upload Section */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (uploaded only on save)
                </label>

                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-400 hover:border-teal-500 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-500 ease-in-out">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or WebP, up to 10MB each · Any resolution — automatically resized &amp; compressed</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        handleFileSelect(index, e.target.files);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {product.previewUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Selected images (will be uploaded on save):</p>
                    <div className="flex flex-wrap gap-2">
                      {product.previewUrls.map((url, i) => (
                        <div key={i} className="relative group">
                          <div className="w-54 h-54 rounded-sm overflow-hidden border border-gray-200">
                            <Image
                              width={150}
                              height={150}
                              src={url}
                              alt={`Product preview ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removePreviewImage(index, i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4a5568] mb-1">Description</label>
                <textarea
                  name="Description"
                  value={product.Description}
                  onChange={(e) => handleChange(index, e)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4a5568] mb-1">Additional Description</label>
                <textarea
                  name="AdditionalDescription"
                  value={product.AdditionalDescription}
                  onChange={(e) => handleChange(index, e)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleSubmit(index)}
                  className="w-full lg:w-34 bg-[#32BBAB] hover:bg-[#2c9d90] text-white py-2 lg:py-3 px-4 rounded-[5px] transition-colors"
                >
                  Save Product
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {processingStep && <ProcessingModal step={processingStep} />}
      </AnimatePresence>
      <AnimatePresence>
        {savingStep && <SavingModal step={savingStep} />}
      </AnimatePresence>
    </section>
  );
}