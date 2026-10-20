'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaFileExcel, FaCheck, FaRegEdit, FaTrash, FaEdit } from 'react-icons/fa';
import { IoMdAddCircle } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import config from '@/config';
import { useAuth } from '@/provider/AuthProvider';
import { getBrands } from '@/lib/server/brandData';
import { fetchCategories } from '@/lib/server/categoryData';
import { getAdminProducts } from '@/lib/server/getAllProducts';
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editData, setEditData] = useState(null);
  const [showNewArrivalsOnly, setShowNewArrivalsOnly] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { loginData } = useAuth();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, brandsData, categoriesData] = await Promise.all([
          getAdminProducts(),
          getBrands(),
          fetchCategories(),
        ]);

        setProducts(productsData);
        setFilteredProducts(productsData);
        setBrands(brandsData);

        const activeCategories = categoriesData.filter((c) => c.IsActive);
        setCategories(activeCategories);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.type?.toLowerCase().includes(query)
      );
    }

    if (showNewArrivalsOnly) {
      result = result.filter((p) => p.IsNewArraival);
    }

    setFilteredProducts(result);
  }, [searchQuery, products, showNewArrivalsOnly]);

  const toggleNewArrivalsFilter = () => {
    setShowNewArrivalsOnly((prev) => !prev);
  };

  const handleEdit = (product) => {
    setEditData({ ...product });
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, isEditing: true } : p))
    );
  };

  const handleCancel = (productId) => {
    setEditData(null);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, isEditing: false } : p))
    );
  };

  const handleSave = async (productId) => {
    if (!editData) return;

    try {
      const payload = {
        Id: productId,
        Title: editData.title || '',
        Type: editData.type || '',
        Gender: editData.gender || '',
        Price: editData.price || 0,
        DiscountedPrice: editData.discountedPrice || 0,
        IsNewArraival: editData.IsNewArraival || false,
        StockQty: editData.StockQty || 0,
        SellQty: editData.SellQty || 0,
        UpdateBy: loginData?.Name || '',
      };

      const res = await fetch(`${config.API_BASE_URL}api/EItem/UpdateItem`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Update failed');

      const updatedProduct = {
        ...products.find((p) => p.id === productId),
        ...editData,
        id: productId,
        isEditing: false,
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? updatedProduct : p))
      );
      setEditData(null);

      toast.success('Product updated');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update product');
    }
  };

  const handleChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const res = await fetch(
        `${config.API_BASE_URL}api/EItem/RemoveItem?id=${productToDelete}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            TenantId: config.tenantId,
          },
        }
      );

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productToDelete));
        setFilteredProducts((prev) => prev.filter((p) => p.id !== productToDelete));
        toast.success('Product deleted');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Error deleting product');
    } finally {
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const renderEditableField = (field, value, productId) => {
    const isEditingThisRow = editData?.id === productId;

    if (!isEditingThisRow) {
      if (field === 'price' || field === 'discountedPrice') {
        return value !== undefined ? `${Number(value).toFixed(2)}` : '-';
      }
      return value?.toString() || '';
    }

    switch (field) {
      case 'title':
      case 'Description':
      case 'AdditionalDescription':
        return (
          <input
            type="text"
            value={editData[field] || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        );

      case 'brand':
        return (
          <select
            value={editData.brand || ''}
            onChange={(e) => handleChange('brand', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.Id} value={b.Name}>
                {b.Name}
              </option>
            ))}
          </select>
        );

      case 'type':
        return (
          <select
            value={editData.type || ''}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.Id} value={cat.Title}>
                {cat.Title}
              </option>
            ))}
          </select>
        );

      case 'gender':
        return (
          <select
            value={editData.gender || ''}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="">Select Gender</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        );

      case 'price':
      case 'discountedPrice':
      case 'StockQty':
      case 'SellQty':
        return (
          <input
            type="number"
            value={editData[field] ?? '0'}
            onChange={(e) => handleChange(field, Number(e.target.value))}
            min="0"
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
          />
        );

      case 'IsNewArraival':
        return (
          <select
            value={editData.IsNewArraival ? 'true' : 'false'}
            onChange={(e) => handleChange('IsNewArraival', e.target.value === 'true')}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
          >
            <option value="true">New Arrival</option>
            <option value="false">Regular</option>
          </select>
        );

      case 'sizes':
      case 'colors':
        return (
          <input
            type="text"
            value={Array.isArray(editData[field]) ? editData[field].join(', ') : ''}
            onChange={(e) =>
              handleChange(
                field,
                e.target.value.split(',').map((s) => s.trim())
              )
            }
            placeholder="Comma separated"
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
          />
        );

      default:
        return value?.toString() || '';
    }
  };
  return (
    <div className="overflow-x-auto">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .fixed-table {
          table-layout: fixed;
          width: 100%;
        }
        .fixed-table th,
        .fixed-table td {
          padding: 10px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 100px;
        }
        .fixed-table th {
          padding: 12px;
        }
        @media (max-width: 768px) {
          .fixed-table {
            display: block;
            width: 100%;
          }
          .fixed-table thead {
            display: none;
          }
          .fixed-table tbody {
            display: block;
          }
          .fixed-table tr {
            display: block;
            margin-bottom: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
          }
          .fixed-table td {
            display: flex;
            justify-content: space-between;
            text-align: left;
            border-bottom: 1px solid #f3f4f6;
            padding: 10px 12px;
          }
          .fixed-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #4b5563;
          }
          .fixed-table td:last-child {
            border-bottom: none;
          }
        }
      `}</style>

      <div className="rounded-md font-roboto overflow-hidden shadow-sm border border-gray-200">
        {/* Header + Search + Filter */}
        <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] sticky top-0 z-20 shadow-md">
          <div className="px-4 py-3 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative min-w-55 max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white border border-transparent rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <IoClose size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={toggleNewArrivalsFilter}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${showNewArrivalsOnly
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                    : 'bg-white/10 text-white border-white/30 hover:bg-white/20'
                  }`}
              >
                New Arrivals
              </button>
            </div>

            <div className="flex items-center gap-4 text-white">
              <Link href="/manage-product" className="hover:text-blue-200 transition">
                <IoMdAddCircle size={24} />
              </Link>
              <button className="hover:text-yellow-300 transition">
                <FaFileExcel size={20} />
              </button>
            </div>
          </div>

          {/* Table Header */}
          <table className="fixed-table w-full border-collapse bg-white">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700">
                <th className="text-sm font-semibold">Product</th>
                <th className="text-sm font-semibold">Brand</th>
                <th className="text-sm font-semibold">Category</th>
                <th className="text-sm font-semibold">Gender</th>
                <th className="text-sm font-semibold">Price</th>
                <th className="text-sm font-semibold">Discounted</th>
                <th className="text-sm font-semibold">Stock</th>
                <th className="text-sm font-semibold">Sold</th>
                <th className="text-sm font-semibold">Status</th>
                <th className="text-sm font-semibold">Actions</th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Table Body */}
        <div className="max-h-105 overflow-y-auto custom-scrollbar bg-white">
          <table className="fixed-table w-full border-collapse">
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center text-gray-400 text-xl font-medium">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td data-label="Product" className="px-3 py-2 text-xs">
                      <div className="flex items-center gap-3">
                        {product.imgs?.thumbnails?.[0] && (
                          <Image
                            src={product.imgs.thumbnails[0]}
                            alt={product.title}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-cover rounded-md border border-gray-200"
                          />
                        )}
                        {renderEditableField('title', product.title, product.id)}
                      </div>
                    </td>

                    <td data-label="Brand" className="px-3 py-2 text-xs">
                      {renderEditableField('brand', product.brand, product.id)}
                    </td>

                    <td data-label="Category" className="px-3 py-2 text-xs">
                      {renderEditableField('type', product.type, product.id)}
                    </td>

                    <td data-label="Gender" className="px-3 py-2 text-xs">
                      {renderEditableField('gender', product.gender, product.id)}
                    </td>

                    <td data-label="Price" className="px-3 py-2 text-xs">
                      {renderEditableField('price', product.price, product.id)}
                    </td>

                    <td data-label="Discounted" className="px-3 py-2 text-xs">
                      {renderEditableField('discountedPrice', product.discountedPrice, product.id)}
                    </td>

                    <td data-label="Stock" className="px-3 py-2 text-xs">
                      {renderEditableField('StockQty', product.StockQty, product.id)}
                    </td>

                    <td data-label="Sold" className="px-3 py-2 text-xs">
                      {renderEditableField('SellQty', product.SellQty, product.id)}
                    </td>

                    <td data-label="Status" className="px-2 py-2 text-xs">
                      {product.isEditing ? (
                        renderEditableField('IsNewArraival', product.IsNewArraival, product.id)
                      ) : product.IsNewArraival ? (
                        <span className="inline-block w-18 border border-green-500 px-1 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-xs">
                          New Arrival
                        </span>
                      ) : (
                        <span className="inline-block border border-blue-500 w-23.5 px-1 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-xs">
                          Regular
                        </span>
                      )}
                    </td>

                    <td data-label="Actions" className="px-3 py-2 text-xs">
                      {product.isEditing ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleSave(product.id)}
                            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
                            title="Save"
                          >
                            <FaCheck size={14} />
                          </button>
                          <button
                            onClick={() => handleCancel(product.id)}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                            title="Cancel"
                          >
                            <IoClose size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:text-blue-800 transition"
                            title="Quick Edit"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(product.id)}
                            className="p-2 text-red-600 hover:text-red-800 transition"
                            title="Delete"
                          >
                            <FaTrash size={15} />
                          </button>
                          <Link
                            href={`/update-product/${product.id}`}
                            className="p-2 text-indigo-600 hover:text-indigo-800 transition"
                            title="Full Edit"
                          >
                            <FaRegEdit size={15} />
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <Motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteModalOpen(false)}
          >
            <Motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-md border border-gray-200"
            >
              <Motion.div
                className="mx-auto mb-1 flex justify-center"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <svg
                  className="w-14 h-14 text-red-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <Motion.path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 9v2m0 4h.01M6 20h12c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.268 17c-.77 1.333.192 3 1.732 3z"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                </svg>
              </Motion.div>

              <h3 className="text-xl font-bold text-gray-700 text-center mb-2">
                Confirm Deletion
              </h3>

              <p className="text-sm text-gray-600 text-center mb-6">
                You are about to delete this product. This action{" "}
                <span className="text-red-500 font-medium">cannot</span> be undone.
              </p>

              <div className="flex justify-center gap-3">
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
                >
                  Cancel
                </Motion.button>
                <Motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 text-sm font-medium rounded-lg bg-linear-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  Delete Product
                </Motion.button>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}