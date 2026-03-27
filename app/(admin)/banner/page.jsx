'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/provider/AuthProvider';
import config from '@/config';
import toast from 'react-hot-toast';
//import { getBanners } from '@/lib/server/bannerData';

export default function BannerManage() {
  const { loginData } = useAuth();

  const [banner, setBanner] = useState({
    Id: null,
    Title: '',
    Description: '',
    BannerImage: '',
    VideoUrl: '',
    IsActive: true
  });

  const [loading, setLoading] = useState(false);
  const [pendingBannerFiles, setPendingBannerFiles] = useState([]);
  const [previewBannerUrls, setPreviewBannerUrls] = useState([]);
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    setBanner((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const removeImage = (imageIndex) => {
    const urls = banner.BannerImage.split(',');
    urls.splice(imageIndex, 1);
    setBanner((prev) => ({
      ...prev,
      BannerImage: urls.join(',')
    }));
  };
  const handleFileSelect = (files) => {
    if (!files?.length) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));

    setPendingBannerFiles(prev => [...prev, ...newFiles]);
    setPreviewBannerUrls(prev => [...prev, ...newPreviews]);
  };
  const removeBannerImage = (index) => {
    setPreviewBannerUrls(prev => {
      const url = prev[index];
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });

    const existingCount = banner.BannerImage ? banner.BannerImage.split(',').filter(Boolean).length : 0;
    if (index >= existingCount) {
      const pendingIndex = index - existingCount;
      setPendingBannerFiles(prev => prev.filter((_, i) => i !== pendingIndex));
    } else {
      // Remove from existing
      const urls = banner.BannerImage.split(',').filter(Boolean);
      urls.splice(index, 1);
      setBanner(prev => ({ ...prev, BannerImage: urls.join(',') }));
    }
  };
  const handleSubmit = async () => {
    if (!banner.Title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("Title", banner.Title.trim());
      formData.append("Description", banner.Description?.trim() || "");
      formData.append("VideoUrl", banner.VideoUrl?.trim() || "");
      formData.append("IsActive", banner.IsActive);
      formData.append("EntryBy", loginData?.Name || "");
      formData.append("UpdateBy", loginData?.Name || "");
      formData.append("Remarks", banner.Remarks?.trim() || "");
      // If updating, send ID and existing images
      if (banner.Id) {
        formData.append("Id", banner.Id);
        const kept = banner.BannerImage ? banner.BannerImage.split(',').filter(Boolean) : [];
        formData.append("ExistingBannerImage", kept.join(","));
      }

      // Add new files
      pendingBannerFiles.forEach(file => formData.append("files", file));

      const endpoint = banner.Id
        ? `${config.API_BASE_URL}api/EItem/UpdateBannerWithImages`
        : `${config.API_BASE_URL}api/EItem/AddBannerWithImages`;

      const res = await fetch(endpoint, {
        method: banner.Id ? 'PUT' : 'POST',
        headers: { TenantId: config.tenantId },
        body: formData
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        throw new Error(errText);
      }

      toast.success(banner.Id ? 'Banner updated!' : 'Banner created!');

      // Clean up
      previewBannerUrls.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });

      setPendingBannerFiles([]);
      setPreviewBannerUrls([]);

      // // Refresh banner
      // const refreshed = await getBanners(); // your fetch function
      // if (refreshed) setBanner(refreshed);

    } catch (err) {
      toast.error(err.message || 'Failed to save banner');
    } finally {
      setLoading(false);
    }
  };
  // Fetch existing banner on mount
  // useEffect(() => {
  //   const fetchBanner = async () => {
  //     try {
  //       const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           TenantId: config.tenantId
  //         },
  //         body: JSON.stringify({
  //           operation: '',
  //           procedureName: 'SP_Banners',
  //           parameters: {
  //             QueryChecker: 6
  //           }
  //         })
  //       });

  //       const result = await response.json();

  //       if (response.ok && result.Status === 'success' && result.Data?.length > 0) {
  //         setBanner(result.Data[0]);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching banner:', error);
  //     }
  //   };

  //   fetchBanner();
  // }, []);

  return (
    <section className="overflow-hidden p-2 min-h-screen">
      <div className="bg-white rounded-lg border border-gray-300 shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold text-[#2d3748] mb-4">Banner</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#4a5568] mb-1">Title*</label>
            <input
              type="text"
              name="Title"
              value={banner.Title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4a5568] mb-1">Description</label>
            <textarea
              name="Description"
              value={banner.Description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
            />
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

          <div className="relative">
            {/* <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Images {uploadStatus && `(${uploadStatus})`}
            </label> */}

            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-400 hover:border-[#63b3ed] rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition-all duration-500 ease-in-out">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    handleFileSelect(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {(banner.BannerImage || previewBannerUrls.length > 0) && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Banner images:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {/* Existing images */}
                  {banner.BannerImage?.split(',').filter(Boolean).map((url, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="w-full aspect-video rounded-md overflow-hidden border border-gray-200">
                        <Image
                          width={200}
                          height={120}
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        x
                      </button>
                    </div>
                  ))}

                  {/* Pending uploads */}
                  {previewBannerUrls.map((url, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="w-full aspect-video rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={url}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeBannerImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#4a5568] mb-1">
              Video URL (Google Drive — optional)
            </label>
            <input
              type="url"
              name="VideoUrl"
              value={banner.VideoUrl}
              onChange={handleChange}
              placeholder="https://drive.google.com/file/d/abc123/preview or uc?export..."
              className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4299e1]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste public Google Drive video link. Images will be ignored if video is set.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full lg:w-34 bg-[#32BBAB] hover:bg-[#2c9d90] disabled:bg-gray-400 text-white py-2 lg:py-3 px-4 rounded-[5px] transition-colors"
            >
              {loading ? 'Saving...' : (banner.Id ? 'Update Banner' : 'Save Banner')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}