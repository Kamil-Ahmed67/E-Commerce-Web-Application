'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/provider/AuthProvider';
import Link from 'next/link';
import { deleteBanner, getAllBanners, toggleBannerActive } from '@/lib/server/bannerData';
import config from '@/config';
import toast from 'react-hot-toast';

export default function BannerList() {
  const { loginData } = useAuth();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

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
      const success = await toggleBannerActive(
        banner.id,
        !banner.isActive,
        loginData?.Name || ''
      );

      if (success) {
        setBanners((prev) =>
          prev.map((b) =>
            b.id === banner.id ? { ...b, isActive: !b.isActive } : b
          )
        );
        toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`);
      } else {
        throw new Error('Failed to update banner status');
      }
    } catch (err) {
      toast.error('Failed to update banner status');
      console.error('Error updating banner:', err);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (banner) => {
    setBannerToDelete(banner);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!bannerToDelete) return;

    try {
      const success = await deleteBanner(bannerToDelete.id);
      if (success) {
        setBanners((prev) => prev.filter((b) => b.id !== bannerToDelete.id));
        toast.success('Banner deleted successfully');
      } else {
        throw new Error('Failed to delete banner');
      }
    } catch (err) {
      toast.error('Failed to delete banner');
      console.error('Error deleting banner:', err);
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
          <button className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded">
            Add New Banner
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-teal-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchBanners}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Retry
          </button>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">No banners found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                {banner.bannerImage?.length > 0 ? (
                  <Image
                    src={banner.bannerImage[0]}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{banner.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{banner.description}</p>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(banner)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                      banner.isActive ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className="sr-only">{banner.isActive ? 'Deactivate' : 'Activate'}</span>
                    <span
                      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                        banner.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  <p>Created: {new Date(banner.entryDate).toLocaleDateString()}</p>
                  {banner.updateDate && (
                    <p>Updated: {new Date(banner.updateDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingBanner && (
        <EditBannerModal
          banner={editingBanner}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBanner(null);
          }}
          onSave={async (updated) => {
            // This function is now called from modal with updated formData
            try {
              const formData = new FormData();

              formData.append("Id", updated.id);
              formData.append("Title", updated.title.trim());
              formData.append("Description", updated.description?.trim() || "");
              formData.append("IsActive", updated.isActive);
              formData.append("UpdateBy", loginData?.Name || "");
              formData.append("Remarks", updated.remarks || "");

              // Kept existing images (after removals)
              const keptImages = updated.bannerImage.filter(img => !img.startsWith('blob:'));
              formData.append("ExistingBannerImage", keptImages.join(","));

              // New files (pending ones)
              updated.pendingFiles?.forEach(file => formData.append("files", file));

              const res = await fetch(`${config.API_BASE_URL}api/EItem/UpdateBannerWithImages`, {
                method: 'PUT',
                headers: { TenantId: config.tenantId },
                body: formData
              });

              if (!res.ok) {
                const errText = await res.text().catch(() => "Unknown error");
                throw new Error(errText);
              }

              toast.success("Banner updated successfully!");
              await fetchBanners();
              setIsEditModalOpen(false);
              setEditingBanner(null);
            } catch (err) {
              toast.error(err.message || "Failed to update banner");
              console.error(err);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
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

// Delete Confirmation Modal (unchanged)
function DeleteConfirmModal({ banner, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-bold">{banner.title}</span>?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Banner Modal (updated with delayed upload)
function EditBannerModal({ banner, onClose, onSave }) {
  const [formData, setFormData] = useState({
    ...banner,
    pendingFiles: [],
    bannerImage: banner.bannerImage || [] // array of URLs
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newFiles = Array.from(files);
    const newPreviews = newFiles.map(f => ({
      url: URL.createObjectURL(f),
      file: f
    }));

    setFormData(prev => ({
      ...prev,
      pendingFiles: [...(prev.pendingFiles || []), ...newFiles],
      bannerImage: [...(prev.bannerImage || []), ...newPreviews.map(p => p.url)]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const updatedImages = [...prev.bannerImage];
      const url = updatedImages[index];

      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }

      updatedImages.splice(index, 1);

      // Also remove from pendingFiles if it was new
      const existingCount = prev.bannerImage.filter(u => !u.startsWith('blob:')).length;
      if (index >= existingCount) {
        const pendingIndex = index - existingCount;
        const updatedPending = [...(prev.pendingFiles || [])];
        updatedPending.splice(pendingIndex, 1);
        return { ...prev, bannerImage: updatedImages, pendingFiles: updatedPending };
      }

      return { ...prev, bannerImage: updatedImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Prepare data for parent save handler
    const updated = {
      ...formData,
      bannerImage: formData.bannerImage.filter(url => !url.startsWith('blob:')), // only server URLs
      pendingFiles: formData.pendingFiles // pass files to parent
    };

    try {
      await onSave(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Banner</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Images
            </label>

            <div className="flex items-center justify-center w-full mb-3">
              <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-400 hover:border-blue-500 rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 transition-all duration-200">
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
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {formData.bannerImage?.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Images (will upload on save):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formData.bannerImage.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full aspect-video rounded-md overflow-hidden border border-gray-200">
                        <Image
                          width={200}
                          height={120}
                          src={url}
                          alt={`Banner image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={!!formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-teal-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}