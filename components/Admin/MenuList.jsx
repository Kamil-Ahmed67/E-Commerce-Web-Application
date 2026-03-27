'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiPlus } from 'react-icons/fi';
import { FaTrashCan } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import config from '@/config';
import { menuData } from '@/lib/server/menuData';

const MenuList = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [addingSubmenu, setAddingSubmenu] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [promoImage, setPromoImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    path: '',
    category: '',
    newTab: false,
    isActive: true,
    promoImageUrl: ''
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await menuData();
        if (isMounted) setMenus(data || []);
      } catch (err) {
        if (isMounted) setError('Failed to load menu data');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);
  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleEdit = (item) => {
    if (item.type === 'menu') {
      const menu = menus.find((m) => m.Id === item.id);
      if (menu) {
        setFormData({
          title: menu.Title || '',
          path: menu.Path || '',
          category: '',
          newTab: !!menu.NewTab,
          isActive: !!menu.IsActive,
          promoImageUrl: menu.PromoImage || ''
        });

        if (menu.PromoImage) {
          setPreviewImage(menu.PromoImage);
        } else {
          setPreviewImage('');
        }
        setPromoImage(null);
      }
    } else {
      const menu = menus.find((m) => m.Id === item.menuId);
      const submenu = menu?.submenu?.find((s) => s.Id === item.id);
      if (submenu) {
        setFormData({
          title: submenu.Title || '',
          path: submenu.Path || '',
          category: submenu.Category || '',
          newTab: !!submenu.NewTab,
          isActive: !!submenu.IsActive,
          promoImageUrl: ''
        });
        setPromoImage(null);
        setPreviewImage('');
      }
    }
    setEditingItem(item);
  };

  const updateMenu = async (menuId, updatedData) => {
    try {
      let imagePath = '';
      if (promoImage) {
        const form = new FormData();
        form.append('file', promoImage);
        const res = await fetch('/api/uploadPromo', {
          method: 'POST',
          body: form
        });
        const data = await res.json();
        imagePath = data.filePath || '';
      }

      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomItem',
          parameters: {
            QueryChecker: 8,
            Id: menuId,
            Title: updatedData.title,
            Path: updatedData.path,
            NewTab: updatedData.newTab,
            IsActive: updatedData.isActive,
            PromoImage: imagePath || null
          }
        })
      });

      const result = await response.json();
      return result?.[0]?.AffectedRows > 0;
    } catch (err) {
      console.error('Update menu error:', err);
      return false;
    }
  };

  const updateSubmenu = async (submenuId, menuId, updatedData) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomItem',
          parameters: {
            QueryChecker: 9,
            Id: submenuId,
            MenuId: menuId,
            Title: updatedData.title,
            Path: updatedData.path,
            Category: updatedData.category,
            NewTab: updatedData.newTab,
            IsActive: updatedData.isActive
          }
        })
      });

      if (!response.ok) throw new Error('Failed to update submenu');

      const result = await response.json();
      return result?.[0]?.AffectedRows > 0;
    } catch (error) {
      console.error('Error updating submenu:', error);
      return false;
    }
  };

  const deleteMenu = async (menuId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomItem',
          parameters: {
            QueryChecker: 11,
            Id: menuId
          }
        })
      });

      if (!response.ok) throw new Error('Failed to delete menu');

      const result = await response.json();
      return result?.[0]?.AffectedRows > 0;
    } catch (error) {
      console.error('Error deleting menu:', error);
      return false;
    }
  };

  const deleteSubmenu = async (submenuId, menuId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomItem',
          parameters: {
            QueryChecker: 12,
            Id: submenuId,
            MenuId: menuId
          }
        })
      });

      if (!response.ok) throw new Error('Failed to delete submenu');

      const result = await response.json();
      return result?.[0]?.AffectedRows > 0;
    } catch (error) {
      console.error('Error deleting submenu:', error);
      return false;
    }
  };

  const handleDeleteClick = (type, id, menuId) => {
    setDeletingItem({ type, id, menuId });
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      let success = false;

      if (deletingItem.type === 'menu') {
        success = await deleteMenu(deletingItem.id);
        if (success) {
          setMenus((prev) => prev.filter((menu) => menu.Id !== deletingItem.id));
          toast.success('Menu deleted successfully');
        }
      } else if (deletingItem.menuId) {
        success = await deleteSubmenu(deletingItem.id, deletingItem.menuId);
        if (success) {
          setMenus((prev) =>
            prev.map((menu) => {
              if (menu.Id === deletingItem.menuId) {
                return {
                  ...menu,
                  submenu: menu.submenu.filter((sub) => sub.Id !== deletingItem.id)
                };
              }
              return menu;
            })
          );
          toast.success('Submenu deleted successfully');
        }
      }

      if (!success) {
        toast.error('Failed to delete item');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error('Failed to delete item');
    } finally {
      setDeletingItem(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      let success = false;

      if (editingItem.type === 'menu') {
        const menuUpdateData = {
          title: formData.title,
          path: formData.path,
          newTab: formData.newTab,
          isActive: formData.isActive
        };
        success = await updateMenu(editingItem.id, menuUpdateData);

        if (success) {
          setMenus((prev) =>
            prev.map((menu) =>
              menu.Id === editingItem.id ? { ...menu, ...menuUpdateData } : menu
            )
          );
          toast.success('Menu updated successfully');
        }
      } else if (editingItem.menuId) {
        const submenuUpdateData = {
          title: formData.title,
          path: formData.path,
          category: formData.category,
          newTab: formData.newTab,
          isActive: formData.isActive
        };
        success = await updateSubmenu(editingItem.id, editingItem.menuId, submenuUpdateData);

        if (success) {
          setMenus((prev) =>
            prev.map((menu) => {
              if (menu.Id === editingItem.menuId) {
                return {
                  ...menu,
                  submenu: menu.submenu.map((sub) =>
                    sub.Id === editingItem.id ? { ...sub, ...submenuUpdateData } : sub
                  )
                };
              }
              return menu;
            })
          );
          toast.success('Submenu updated successfully');
        }
      }

      if (success) {
        setEditingItem(null);
      } else {
        toast.error('Failed to save changes');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      toast.error('Failed to save changes');
    }
  };

  const addSubmenu = async (newSubmenuData) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomItem',
          parameters: {
            QueryChecker: 10,
            MenuId: newSubmenuData.menuId,
            Title: newSubmenuData.title,
            Path: newSubmenuData.path,
            Category: newSubmenuData.category,
            NewTab: newSubmenuData.newTab,
            IsActive: newSubmenuData.isActive
          }
        })
      });

      if (!response.ok) throw new Error('Failed to add submenu');

      const result = await response.json();
      return result?.[0]?.NewSubmenuId || null;
    } catch (error) {
      console.error('Error adding submenu:', error);
      return null;
    }
  };

  const handleAddSubmenu = (menuId) => {
    setAddingSubmenu({ menuId });
    setFormData({
      title: '',
      path: '',
      category: '',
      newTab: false,
      isActive: true,
      promoImageUrl: ''
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addingSubmenu) return;

    try {
      const newSubmenuData = {
        title: formData.title,
        path: formData.path,
        category: formData.category,
        newTab: formData.newTab,
        isActive: formData.isActive,
        menuId: addingSubmenu.menuId
      };

      const newSubmenuId = await addSubmenu(newSubmenuData);

      if (newSubmenuId) {
        setMenus((prev) =>
          prev.map((menu) => {
            if (menu.Id === addingSubmenu.menuId) {
              return {
                ...menu,
                submenu: [
                  ...menu.submenu,
                  {
                    Id: newSubmenuId,
                    MenuId: addingSubmenu.menuId,
                    Title: formData.title,
                    Path: formData.path,
                    Category: formData.category,
                    NewTab: formData.newTab,
                    IsActive: formData.isActive
                  }
                ]
              };
            }
            return menu;
          })
        );
        toast.success('Submenu added successfully');
        setAddingSubmenu(null);
      } else {
        toast.error('Failed to add submenu');
      }
    } catch (err) {
      console.error('Failed to add:', err);
      toast.error('Failed to add submenu');
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className=" px-4 py-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* MAIN TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-linear-to-r from-teal-700 to-teal-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-light text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light text-white uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-light text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-light text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {menus.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                      No menus found
                    </td>
                  </tr>
                ) : (
                  menus.map((menu) => (
                    <React.Fragment key={menu.Id}>
                      {/* Parent Row */}
                      <tr
                        className={`hover:bg-teal-50/40 transition-colors ${
                          expandedMenus.includes(menu.Id) ? 'bg-teal-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {menu.submenu?.length > 0 ? (
                              <button
                                onClick={() => toggleMenu(menu.Id)}
                                className="mr-3 text-gray-600 hover:text-teal-700"
                              >
                                {expandedMenus.includes(menu.Id) ? (
                                  <FiChevronDown className="w-5 h-5" />
                                ) : (
                                  <FiChevronRight className="w-5 h-5" />
                                )}
                              </button>
                            ) : (
                              <span className="w-8 inline-block" />
                            )}
                            <span className="text-sm font-medium text-gray-900 truncate max-w-md">
                              {menu.Title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-md">
                          {menu.Path}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              menu.IsActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {menu.IsActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit({ type: 'menu', id: menu.Id })}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                              title="Edit"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick('menu', menu.Id)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Animated Submenu Section */}
                      <AnimatePresence>
                        {expandedMenus.includes(menu.Id) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            <td colSpan={4} className="p-0">
                              <motion.div
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="bg-gray-50 border-t border-gray-200 px-4 py-3"
                              >
                                <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-linear-to-r from-blue-800 to-blue-950">
                                      <tr>
                                        <th className="px-6 py-3 text-left text-xs font-light text-white uppercase tracking-wider">
                                          Submenu Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-light text-white uppercase tracking-wider">
                                          Path
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-light text-white uppercase tracking-wider">
                                          Category
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-light text-white uppercase tracking-wider">
                                          Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-light text-white uppercase tracking-wider">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                      {menu.submenu?.map((sub) => (
                                        <tr key={sub.Id} className="hover:bg-gray-50">
                                          <td className="px-6 py-3 text-sm text-gray-900 truncate max-w-xs">
                                            {sub.Title}
                                          </td>
                                          <td className="px-6 py-3 text-sm text-gray-600 truncate max-w-xs">
                                            {sub.Path}
                                          </td>
                                          <td className="px-6 py-3 text-sm text-gray-600">
                                            {sub.Category || ''}
                                          </td>
                                          <td className="px-6 py-3 text-center">
                                            <span
                                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                                sub.IsActive
                                                  ? 'bg-green-100 text-green-800'
                                                  : 'bg-red-100 text-red-800'
                                              }`}
                                            >
                                              {sub.IsActive ? 'Active' : 'Inactive'}
                                            </span>
                                          </td>
                                          <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                              <button
                                                onClick={() =>
                                                  handleEdit({ type: 'submenu', id: sub.Id, menuId: menu.Id })
                                                }
                                                className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                                              >
                                                <FiEdit2 size={18} />
                                              </button>
                                              <button
                                                onClick={() => handleDeleteClick('submenu', sub.Id, menu.Id)}
                                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                                              >
                                                <FiTrash2 size={18} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>

                                  <div className="bg-gray-100 px-4 py-3 flex justify-end">
                                    <button
                                      onClick={() => handleAddSubmenu(menu.Id)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition"
                                    >
                                      <FiPlus size={16} />
                                      Add Submenu
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-md shadow-2xl overflow-hidden"
            >
              <div className="bg-linear-to-r from-teal-800 to-teal-600 px-8 py-5 text-white">
                <h2 className="text-2xl font-bold">
                  {editingItem.type === 'menu'
                    ? `Edit Main Menu (${formData.title || ''})`
                    : `Edit Submenu (${formData.title || formData.category || ''})`}
                </h2>
                <p className="text-indigo-100 mt-1 text-sm">Update details below and save changes</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 px-8 py-4 gap-8">
                  {/* Left Column */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="e.g., Electronics"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        URL Path <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="path"
                        value={formData.path}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="/electronics"
                      />
                    </div>

                    {editingItem.type === 'submenu' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          placeholder="e.g., Mobile Phones"
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {editingItem.type === 'menu' && (
                      <div className="p-5 rounded-md border-2 border-dashed border-gray-300 space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Promo / Banner Image
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setPromoImage(null);
                              setPreviewImage('');
                              setFormData((prev) => ({ ...prev, promoImageUrl: '' }));
                            }}
                            className="px-3 py-1 text-red-600/60 text-sm rounded-md hover:text-red-700 transition flex items-center justify-center"
                          >
                            <FaTrashCan className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPromoImage(file);
                              setPreviewImage(URL.createObjectURL(file));
                            }
                          }}
                          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-teal-700 hover:file:bg-indigo-100 transition"
                        />

                        {previewImage && (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs text-gray-500">Preview:</p>
                            <div className="relative rounded-md overflow-hidden border border-gray-200 shadow-sm">
                              <Image
                                src={previewImage}
                                alt="Promo Preview"
                                width={600}
                                height={200}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <span className="text-white font-medium text-sm">Current Image</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-md p-5 space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="newTab"
                          checked={formData.newTab}
                          onChange={handleChange}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Open link in new tab</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleChange}
                          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Menu is Active (Visible)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-4">
                  <div className="flex justify-end gap-4 px-8 py-4">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-3 bg-linear-to-r from-teal-800 to-teal-600 text-white font-semibold rounded-md hover:from-teal-900 hover:to-teal-700 transform transition-all shadow-lg"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}

      {/* Add Submenu Modal */}
      {addingSubmenu && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Submenu</h2>
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="title">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="path">
                  Path *
                </label>
                <input
                  type="text"
                  id="path"
                  name="path"
                  value={formData.path}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="category">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="newTab"
                  name="newTab"
                  checked={formData.newTab}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="newTab" className="ml-2 block text-sm text-gray-700">
                  Open in new tab
                </label>
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setAddingSubmenu(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Add Submenu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete this {deletingItem.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuList;