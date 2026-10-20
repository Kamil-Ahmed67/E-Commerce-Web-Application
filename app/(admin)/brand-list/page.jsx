'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/provider/AuthProvider';
import { getAllBrands, toggleBrandActive, deleteBrand, updateBrand } from '@/lib/server/brandData';
import toast from 'react-hot-toast';

export default function BrandList() {
  const { loginData } = useAuth();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBrands();
      setBrands(data || []);
    } catch (err) {
      setError('Failed to fetch brands');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (brand) => {
    try {
      const success = await toggleBrandActive(brand.id, !brand.isActive, loginData?.Name || '');
      if (success) {
        setBrands((prev) => prev.map((b) => b.id === brand.id ? { ...b, isActive: !b.isActive } : b));
        toast.success(`Brand ${!brand.isActive ? 'activated' : 'deactivated'}`);
      } else throw new Error();
    } catch {
      toast.error('Failed to update brand status');
    }
  };

  const openDeleteModal = (brand) => { setBrandToDelete(brand); setIsDeleteModalOpen(true); };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    try {
      const success = await deleteBrand(brandToDelete.id);
      if (success) {
        setBrands((prev) => prev.filter((b) => b.id !== brandToDelete.id));
        toast.success('Brand deleted successfully');
      } else throw new Error();
    } catch {
      toast.error('Failed to delete brand');
    } finally {
      setIsDeleteModalOpen(false);
      setBrandToDelete(null);
    }
  };

  return (
    <div className="px-10 py-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
          {!loading && !error && (
            <p className="text-sm text-gray-400 mt-0.5">{brands.length} brand{brands.length !== 1 ? 's' : ''} total</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{error}</span>
          <button onClick={fetchBrands} className="ml-auto text-sm font-semibold underline underline-offset-2">Retry</button>
        </div>
      ) : brands.length === 0 ? (
        <div className="text-center py-20 text-gray-300">
          <svg className="w-14 h-14 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-sm">No brands found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {brands.map((brand) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              onEdit={() => { setEditingBrand(brand); setIsEditModalOpen(true); }}
              onDelete={() => openDeleteModal(brand)}
              onToggle={() => handleToggleActive(brand)}
            />
          ))}
        </div>
      )}

      {isEditModalOpen && editingBrand && (
        <EditBrandModal
          brand={editingBrand}
          onClose={() => { setIsEditModalOpen(false); setEditingBrand(null); }}
          onSave={async (formData) => {
            try {
              const success = await updateBrand({ ...formData, updateBy: loginData?.Name || '' });
              if (!success) throw new Error();
              await fetchBrands();
              setIsEditModalOpen(false);
              setEditingBrand(null);
              toast.success('Brand updated successfully!');
            } catch {
              toast.error('Failed to update brand');
            }
          }}
        />
      )}

      {isDeleteModalOpen && brandToDelete && (
        <DeleteConfirmModal brand={brandToDelete} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} />
      )}
    </div>
  );
}

function BrandCard({ brand, onEdit, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-gray-900 text-base truncate">{brand.name}</h3>
        <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${brand.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          {brand.isActive ? 'Live' : 'Off'}
        </span>
      </div>

      {brand.entryDate && (
        <p className="text-[11px] text-gray-400 mb-3">
          Added {new Date(brand.entryDate).toLocaleDateString()}
        </p>
      )}

      {brand.remarks && (
        <p className="text-xs text-gray-500 mb-3 truncate">{brand.remarks}</p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onEdit}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-gray-50 hover:bg-teal-50 hover:text-teal-700 text-gray-500 border border-gray-200 hover:border-teal-200 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-500 border border-gray-200 hover:border-red-200 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={onToggle}
          title={brand.isActive ? 'Deactivate' : 'Activate'}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${brand.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block w-4 h-4 mt-1 transform bg-white rounded-full shadow transition-transform duration-200 ${brand.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}

function EditBrandModal({ brand, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...brand });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(formData); }
    finally { setSaving(false); }
  };

  const input = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";
  const fieldLabel = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Brand</h2>
            <p className="text-xs text-gray-400 mt-0.5">{brand.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5">
            <div className="mb-5">
              <label className={fieldLabel}>Brand Name</label>
              <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required className={input} />
            </div>

            <div className="mb-4">
              <label className={fieldLabel}>Remarks</label>
              <input type="text" name="remarks" value={formData.remarks || ''} onChange={handleChange} className={input} />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${formData.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block w-4 h-4 mt-1 transform bg-white rounded-full shadow transition-transform duration-200 ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm text-gray-600">
                {formData.isActive
                  ? <><span className="font-semibold text-emerald-600">Active</span> — visible on frontend</>
                  : <><span className="font-semibold text-gray-400">Inactive</span> — hidden from frontend</>
                }
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Brand images (Home, Collection Banner, Men/Women) are now managed from the Banner page.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ brand, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-1">Delete brand?</h2>
        <p className="text-sm text-gray-500 mb-6">
          <span className="font-semibold text-gray-800">{brand.name}</span> will be permanently removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
