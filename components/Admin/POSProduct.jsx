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
import { getAllBrands } from '@/lib/server/brandData';
import { fetchCategories } from '@/lib/server/categoryData';
import { getAdminProducts } from '@/lib/server/getAllProducts';
export default function POSProduct() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editData, setEditData] = useState(null);
    const [showNewArrivalsOnly, setShowNewArrivalsOnly] = useState(false);
    const [showWebsiteVisibility, setShowWebsiteVisibility] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const { loginData } = useAuth();

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            const [productsResult, brandsResult, categoriesResult] = await Promise.allSettled([
                getAdminProducts(),
                getAllBrands(),
                fetchCategories(),
            ]);

            if (productsResult.status === 'fulfilled') {
                setProducts(productsResult.value);
                setFilteredProducts(productsResult.value);
            } else {
                console.error('Error fetching products:', productsResult.reason);
            }

            if (brandsResult.status === 'fulfilled') {
                setBrands(brandsResult.value);
            } else {
                console.error('Error fetching brands:', brandsResult.reason);
            }

            if (categoriesResult.status === 'fulfilled') {
                const activeCategories = categoriesResult.value.filter((c) => c.IsActive);
                setCategories(activeCategories);
            } else {
                console.error('Error fetching categories:', categoriesResult.reason);
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
                    p.styleNo?.toLowerCase().includes(query) ||
                    p.brand?.toLowerCase().includes(query) ||
                    p.productType?.toLowerCase().includes(query)
            );
        }

        if (showNewArrivalsOnly) {
            result = result.filter((p) => p.isWebsite === false);
        }
        if (showWebsiteVisibility) {
            // Fix 2: add missing filter
            result = result.filter((p) => p.isWebsite === true);
        }
        setFilteredProducts(result);
    }, [searchQuery, products, showNewArrivalsOnly, showWebsiteVisibility]);

    const toggleNewArrivalsFilter = () => {
        setShowNewArrivalsOnly((prev) => !prev);
        setShowWebsiteVisibility(false);
    };
    const toggleWebsiteVisibilityFilter = () => {
        setShowWebsiteVisibility((prev) => !prev);
        setShowNewArrivalsOnly(false);
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
                ProductType: editData.productType || '',
                Category: editData.category || '',
                Status: editData.status || false,
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
            case 'styleNo':
            case 'description':
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
                            <option key={b.id} value={b.name}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                );

            case 'productType':
                return (
                    <select
                        value={editData.productType || ''}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                        <option value="">Select Type</option>
                        {categories.map((cat) => (
                            <option key={cat.Id} value={cat.Title}>
                                {cat.Title}
                            </option>
                        ))}
                    </select>
                );

            case 'category':
                return (
                    <select
                        value={editData.category || ''}
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                        <option value="">Select Category</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                    </select>
                );

            //   case 'price':
            //   case 'discountedPrice':
            //   case 'StockQty':
            //   case 'SellQty':
            //     return (
            //       <input
            //         type="number"
            //         value={editData[field] ?? '0'}
            //         onChange={(e) => handleChange(field, Number(e.target.value))}
            //         min="0"
            //         className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            //       />
            //     );

            case 'status':
                return (
                    <select
                        value={editData.status ? 'New' : 'Regular'}
                        onChange={(e) => handleChange('status', e.target.value === 'New')}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                        <option value="New">New</option>
                        <option value="Regular">Regular</option>
                    </select>
                );

            //   case 'sizes':
            //   case 'colors':
            //     return (
            //       <input
            //         type="text"
            //         value={Array.isArray(editData[field]) ? editData[field].join(', ') : ''}
            //         onChange={(e) =>
            //           handleChange(
            //             field,
            //             e.target.value.split(',').map((s) => s.trim())
            //           )
            //         }
            //         placeholder="Comma separated"
            //         className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            //       />
            //     );

            default:
                return value?.toString() || '';
        }
    };
    return (
        <div className="overflow-x-auto">
            <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #93c5fd #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #60a5fa, #3b82f6);
          border-radius: 8px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #3b82f6, #2563eb);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }
        .fixed-table {
          table-layout: fixed;
          width: 100%;
        }
        .fixed-table th,
        .fixed-table td {
          padding: 8px 6px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
        .fixed-table th {
          padding: 10px 6px;
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

                {/* ── Toolbar ── */}
                <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] px-4 py-3 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative min-w-55 max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
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
                                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                    <IoClose size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={toggleNewArrivalsFilter}
                            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${showNewArrivalsOnly ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
                        >
                            Website Invisible
                        </button>
                        <button
                            onClick={toggleWebsiteVisibilityFilter}
                            className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${showWebsiteVisibility ? 'bg-purple-700 text-white border-purple-700' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
                        >
                            Website Visible
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-white">
                        {/* <Link href="/manage-product" className="hover:text-blue-200 transition">
                            <IoMdAddCircle size={24} />
                        </Link> */}
                        <button className="hover:text-yellow-300 transition">
                            <FaFileExcel size={20} />
                        </button>
                    </div>
                </div>

                {/* ── Single table, sticky thead ── */}
                <div className="custom-scrollbar overflow-x-auto max-h-[680px] overflow-y-auto">
                    <table className="w-full border-collapse text-sm" style={{ tableLayout: 'fixed' }}>
                        <colgroup>
                            <col style={{ width: '50px' }} />
                            <col style={{ width: '11%' }} />
                            <col style={{ width: '18%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '8%' }} />
                        </colgroup>
                        <thead className="sticky top-0 z-10 bg-white shadow-sm">
                            <tr className="border-b-2 border-gray-200">
                                {[
                                    { label: 'SL', align: 'text-center' },
                                    { label: 'Product', align: 'text-left' },
                                    { label: 'Description', align: 'text-left' },
                                    { label: 'Brand', align: 'text-center' },
                                    { label: 'Category', align: 'text-center' },
                                    { label: 'Type', align: 'text-center' },
                                    { label: 'Website', align: 'text-center' },
                                    { label: 'Status', align: 'text-center' },
                                    { label: 'Actions', align: 'text-center' },
                                ].map(h => (
                                    <th key={h.label} className={`py-3 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap ${h.align}`}>
                                        {h.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-20 text-center text-gray-400 text-base font-medium">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product, index) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">

                                        {/* SL */}
                                        <td className="py-3 px-3 text-center text-xs text-gray-400 font-medium">
                                            {index + 1}
                                        </td>

                                        {/* Product */}
                                        <td className="py-3 px-3 text-xs text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap text-left">
                                            <div className="flex items-center justify-start gap-2">
                                                {product.imgs?.thumbnails?.[0] && (
                                                    <Image
                                                        src={product.imgs.thumbnails[0]}
                                                        alt={product.styleNo || 'Product'}
                                                        width={32} height={32}
                                                        className="w-8 h-8 object-cover rounded border border-gray-200 flex-shrink-0"
                                                    />
                                                )}
                                                <span className="truncate">{renderEditableField('styleNo', product.styleNo, product.id)}</span>
                                            </div>
                                        </td>

                                        {/* Description */}
                                        <td className="py-3 px-3 text-xs text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap text-left">
                                            {renderEditableField('description', product.description, product.id)}
                                        </td>

                                        {/* Brand */}
                                        <td className="py-3 px-3 text-xs text-center text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {renderEditableField('brand', product.brand, product.id)}
                                        </td>

                                        {/* Product Type */}
                                        <td className="py-3 px-3 text-xs text-center text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {renderEditableField('productType', product.productType, product.id)}
                                        </td>

                                        {/* Category */}
                                        <td className="py-3 px-3 text-xs text-center text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {renderEditableField('category', product.category, product.id)}
                                        </td>

                                        {/* Website */}
                                        <td className="py-3 px-3 text-center">
                                            {product.isWebsite ? (
                                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 border border-purple-300 rounded">Visible</span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">Hidden</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="py-3 px-3 text-center">
                                            {product.isEditing ? (
                                                renderEditableField('status', product.status, product.id)
                                            ) : product.status === 'New' ? (
                                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 border border-green-300 rounded">New Arrival</span>
                                            ) : (
                                                <span className="inline-block px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-300 rounded">Regular</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3 px-3 text-center">
                                            {product.isEditing ? (
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleSave(product.id)} className="p-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition" title="Save">
                                                        <FaCheck size={12} />
                                                    </button>
                                                    <button onClick={() => handleCancel(product.id)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition" title="Cancel">
                                                        <IoClose size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Link href={`/update-product/${product.id}`} className="inline-flex p-1.5 text-indigo-600 hover:text-indigo-800 transition" title="Edit">
                                                    <FaRegEdit size={15} />
                                                </Link>
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