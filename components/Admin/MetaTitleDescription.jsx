'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiEdit2, FiChevronDown, FiChevronRight, FiPlus, FiExternalLink } from 'react-icons/fi';
import toast from 'react-hot-toast';
import config from '@/config';
import Link from 'next/link';
import { menuData } from '@/lib/server/menuData';
import { STATIC_PAGE_META } from '@/lib/staticPageMeta';

const MetaTitleDescription = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [addingSubItem, setAddingSubItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    path: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await menuData();
        if (isMounted) {
          const dbItems = (data || []).map((menu) => ({
            Id: menu.Id,
            Title: menu.Title,
            Path: menu.Path,
            NewTab: menu.NewTab ?? false,
            IsActive: menu.IsActive,
            PromoImage: menu.PromoImage ?? '',
            MetaTitle: menu.MTitle || '',
            MetaDescription: menu.MDescription || '',
            subItems: (menu.submenu || []).map((sub) => ({
              Id: sub.Id,
              ParentId: menu.Id,
              MenuId: sub.MenuId,
              Title: sub.Title,
              Path: sub.Path,
              Category: sub.Category || '',
              NewTab: sub.NewTab ?? false,
              IsActive: sub.IsActive,
              MetaTitle: sub.STitle || '',
              MetaDescription: sub.SDescription || ''
            }))
          }));

          // Pages with no EcomtblMenu/EcomtblSubMenu row (e.g. hardcoded brand pages) —
          // show their fallback meta from source code instead of leaving them out.
          const knownPaths = new Set();
          dbItems.forEach((m) => {
            knownPaths.add((m.Path || '').split('?')[0]);
            m.subItems.forEach((s) => knownPaths.add((s.Path || '').split('?')[0]));
          });

          const staticItems = STATIC_PAGE_META
            .filter((sp) => !knownPaths.has(sp.path))
            .map((sp) => ({
              Id: `static-${sp.path}`,
              Title: sp.title,
              Path: sp.path,
              IsActive: true,
              MetaTitle: sp.metaTitle,
              MetaDescription: sp.metaDescription,
              isStatic: true,
              parentMenuId: sp.parentMenuId,
              category: sp.category || '',
              subItems: []
            }));

          setItems([...dbItems, ...staticItems]);
        }
      } catch (err) {
        if (isMounted) setError('Failed to load data');
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  const toggleItem = (itemId) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleEdit = (item) => {
    if (item.type === 'parent') {
      const parent = items.find((m) => m.Id === item.id);
      if (parent) {
        setFormData({
          title: parent.Title || '',
          path: parent.Path || '',
          metaTitle: parent.MetaTitle || '',
          metaDescription: parent.MetaDescription || '',
          isActive: !!parent.IsActive
        });
      }
    } else {
      const parent = items.find((m) => m.Id === item.parentId);
      const sub = parent?.subItems?.find((s) => s.Id === item.id);
      if (sub) {
        setFormData({
          title: sub.Title || '',
          path: sub.Path || '',
          metaTitle: sub.MetaTitle || '',
          metaDescription: sub.MetaDescription || '',
          isActive: !!sub.IsActive
        });
      }
    }
    setEditingItem(item);
  };

  const updateParent = async (id, updatedData) => {
    try {
      const item = items.find((m) => m.Id === id);
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomMenu',
          parameters: {
            QueryChecker: 3,
            Id: id,
            Title: item?.Title,
            Path: item?.Path,
            NewTab: item?.NewTab,
            IsActive: item?.IsActive,
            PromoImage: item?.PromoImage || null,
            MTitle: updatedData.metaTitle,
            MDescription: updatedData.metaDescription
          }
        })
      });
      const result = await response.json();
      console.log('updateParent result:', result);
      return result?.[0]?.AffectedRows > 0;
    } catch (err) {
      console.error('Update error:', err);
      return false;
    }
  };

  // Sets STitle/SDescription on a submenu row (QueryChecker 4). Shared by the
  // create and update paths for pages backed by a submenu rather than a parent menu.
  const setSubItemMeta = async (id, item, updatedData) => {
    const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        TenantId: config.tenantId
      },
      body: JSON.stringify({
        operation: '',
        procedureName: 'SP_EcomMenu',
        parameters: {
          QueryChecker: 4,
          Id: id,
          MenuId: item.parentMenuId,
          Title: item.Title,
          Path: item.Path,
          Category: item.category || null,
          NewTab: false,
          IsActive: true,
          STitle: updatedData.metaTitle,
          SDescription: updatedData.metaDescription
        }
      })
    });
    if (!response.ok) throw new Error('Failed to save page meta');
    const result = await response.json();
    return result?.[0]?.AffectedRows > 0;
  };

  // Pages with no DB row yet (hardcoded brand/static pages). SP_EcomMenu has no
  // "insert top-level page" option, so the first save inserts a submenu under the
  // page's designated parent menu (QueryChecker 5), then sets its meta (QueryChecker 4) —
  // the insert step doesn't accept STitle/SDescription directly.
  const createStaticSubItem = async (item, updatedData) => {
    try {
      const insertRes = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomMenu',
          parameters: {
            QueryChecker: 5,
            MenuId: item.parentMenuId,
            Title: item.Title,
            Path: item.Path,
            Category: item.category || null,
            NewTab: false,
            IsActive: true
          }
        })
      });
      if (!insertRes.ok) throw new Error('Failed to insert page');
      const insertResult = await insertRes.json();
      const newId = insertResult?.[0]?.NewSubmenuId;
      if (!newId) return null;

      const saved = await setSubItemMeta(newId, item, updatedData);
      return saved ? newId : null;
    } catch (err) {
      console.error('Error creating static page entry:', err);
      return null;
    }
  };

  // Once a static page has been saved once, it's a real EcomtblSubMenu row —
  // later edits update it directly instead of inserting again.
  const updateStaticSubItem = async (item, updatedData) => {
    try {
      return await setSubItemMeta(item.Id, item, updatedData);
    } catch (err) {
      console.error('Error updating static page entry:', err);
      return false;
    }
  };

  const updateSubItem = async (subId, parentId, updatedData) => {
    try {
      const parent = items.find((m) => m.Id === parentId);
      const sub = parent?.subItems?.find((s) => s.Id === subId);
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomMenu',
          parameters: {
            QueryChecker: 4,
            Id: subId,
            MenuId: parentId,
            Title: sub?.Title,
            Path: sub?.Path,
            Category: sub?.Category,
            NewTab: sub?.NewTab,
            IsActive: sub?.IsActive,
            STitle: updatedData.metaTitle,
            SDescription: updatedData.metaDescription
          }
        })
      });
      if (!response.ok) throw new Error('Failed to update sub-item');
      const result = await response.json();
      console.log('updateSubItem result:', result);
      return result?.[0]?.AffectedRows > 0;
    } catch (err) {
      console.error('Error updating sub-item:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      let success = false;
      const updateData = {
        title: formData.title,
        path: formData.path,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        isActive: formData.isActive
      };

      if (editingItem.type === 'parent') {
        const parent = items.find((m) => m.Id === editingItem.id);

        if (parent?.isStatic) {
          const newId = await createStaticSubItem(parent, updateData);
          success = !!newId;
          if (success) {
            setItems((prev) =>
              prev.map((item) =>
                item.Id === editingItem.id
                  ? { ...item, Id: newId, isStatic: false, MetaTitle: updateData.metaTitle, MetaDescription: updateData.metaDescription }
                  : item
              )
            );
            toast.success('Page meta saved');
          }
        } else if (parent?.parentMenuId) {
          success = await updateStaticSubItem(parent, updateData);
          if (success) {
            setItems((prev) =>
              prev.map((item) =>
                item.Id === editingItem.id
                  ? { ...item, MetaTitle: updateData.metaTitle, MetaDescription: updateData.metaDescription }
                  : item
              )
            );
            toast.success('Item updated successfully');
          }
        } else {
          success = await updateParent(editingItem.id, updateData);
          if (success) {
            setItems((prev) =>
              prev.map((item) =>
                item.Id === editingItem.id
                  ? { ...item, MetaTitle: updateData.metaTitle, MetaDescription: updateData.metaDescription }
                  : item
              )
            );
            toast.success('Item updated successfully');
          }
        }
      } else if (editingItem.parentId) {
        success = await updateSubItem(editingItem.id, editingItem.parentId, updateData);
        if (success) {
          setItems((prev) =>
            prev.map((item) => {
              if (item.Id === editingItem.parentId) {
                return {
                  ...item,
                  subItems: item.subItems.map((sub) =>
                    sub.Id === editingItem.id
                      ? { ...sub, MetaTitle: updateData.metaTitle, MetaDescription: updateData.metaDescription }
                      : sub
                  )
                };
              }
              return item;
            })
          );
          toast.success('Sub-item updated successfully');
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

  const addSubItem = async (newData) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomMetaData',
          parameters: {
            QueryChecker: 6,
            ParentId: newData.parentId,
            Title: newData.title,
            Path: newData.path,
            MetaTitle: newData.metaTitle,
            MetaDescription: newData.metaDescription,
            IsActive: newData.isActive
          }
        })
      });
      if (!response.ok) throw new Error('Failed to add sub-item');
      const result = await response.json();
      return result?.[0]?.NewSubItemId || null;
    } catch (err) {
      console.error('Error adding sub-item:', err);
      return null;
    }
  };

  const handleAddSubItem = (parentId) => {
    setAddingSubItem({ parentId });
    setFormData({ title: '', path: '', metaTitle: '', metaDescription: '', isActive: true });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addingSubItem) return;

    try {
      const newData = {
        title: formData.title,
        path: formData.path,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        isActive: formData.isActive,
        parentId: addingSubItem.parentId
      };

      const newSubItemId = await addSubItem(newData);

      if (newSubItemId) {
        setItems((prev) =>
          prev.map((item) => {
            if (item.Id === addingSubItem.parentId) {
              return {
                ...item,
                subItems: [
                  ...(item.subItems || []),
                  {
                    Id: newSubItemId,
                    ParentId: addingSubItem.parentId,
                    Title: formData.title,
                    Path: formData.path,
                    MetaTitle: formData.metaTitle,
                    MetaDescription: formData.metaDescription,
                    IsActive: formData.isActive
                  }
                ]
              };
            }
            return item;
          })
        );
        toast.success('Sub-item added successfully');
        setAddingSubItem(null);
      } else {
        toast.error('Failed to add sub-item');
      }
    } catch (err) {
      console.error('Failed to add:', err);
      toast.error('Failed to add sub-item');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="px-4 py-4">
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          {/* MAIN TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-linear-to-r from-teal-700 to-teal-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-light text-white uppercase tracking-wider">
                    Page Name
                  </th>
                  {/* <th className="px-6 py-4 text-left text-xs font-light text-white uppercase tracking-wider">
                    Path
                  </th> */}
                  <th className="px-6 py-4 text-left text-xs font-light text-white uppercase tracking-wider">
                    Meta Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light text-white uppercase tracking-wider">
                    Meta Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-light text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                      No meta data found
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <React.Fragment key={item.Id}>
                      {/* Parent Row */}
                      <tr
                        className={`hover:bg-teal-50/40 transition-colors ${expandedItems.includes(item.Id) ? 'bg-teal-50' : ''
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.subItems?.length > 0 ? (
                              <button
                                onClick={() => toggleItem(item.Id)}
                                className="mr-3 text-gray-600 hover:text-teal-700"
                              >
                                {expandedItems.includes(item.Id) ? (
                                  <FiChevronDown className="w-5 h-5" />
                                ) : (
                                  <FiChevronRight className="w-5 h-5" />
                                )}
                              </button>
                            ) : (
                              <span className="w-8 inline-block" />
                            )}
                            <Link
                              href={item.Path || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 hover:underline truncate max-w-md"
                            >
                              {item.Title}
                              <FiExternalLink size={14} className="shrink-0 text-teal-500" />
                            </Link>
                          </div>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-md">
                          {item.Path}
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-md">
                          {item.MetaTitle}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                          <p className="truncate">{item.MetaDescription}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit({ type: 'parent', id: item.Id })}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                              title="Edit"
                            >
                              <FiEdit2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Animated Sub-items Section */}
                      <AnimatePresence>
                        {expandedItems.includes(item.Id) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            <td colSpan={5} className="p-0">
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
                                          Sub-page Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-light text-white uppercase tracking-wider">
                                          Path
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-light text-white uppercase tracking-wider">
                                          Meta Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-light text-white uppercase tracking-wider">
                                          Meta Description
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-light text-white uppercase tracking-wider">
                                          Actions
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-100">
                                      {item.subItems?.map((sub) => (
                                        <tr key={sub.Id} className="hover:bg-gray-50">
                                          <td className="px-6 py-3 text-sm text-gray-900 truncate max-w-xs">
                                            <Link
                                              href={sub.Path || '#'}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center gap-1.5 text-teal-700 hover:text-teal-900 hover:underline truncate"
                                            >
                                              {sub.Title}
                                              <FiExternalLink size={13} className="shrink-0 text-teal-500" />
                                            </Link>
                                          </td>
                                          <td className="px-6 py-3 text-sm text-gray-600 truncate max-w-xs">
                                            {sub.Path}
                                          </td>
                                          <td className="px-6 py-3 text-sm text-gray-600 truncate max-w-xs">
                                            {sub.MetaTitle}
                                          </td>
                                          <td className="px-6 py-3 text-sm text-gray-600 max-w-xs">
                                            <p className="truncate">{sub.MetaDescription}</p>
                                          </td>
                                          <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                              <button
                                                onClick={() =>
                                                  handleEdit({ type: 'sub', id: sub.Id, parentId: item.Id })
                                                }
                                                className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                                              >
                                                <FiEdit2 size={18} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>

                                  <div className="bg-gray-100 px-4 py-3 flex justify-end">
                                    <button
                                      onClick={() => handleAddSubItem(item.Id)}
                                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition"
                                    >
                                      <FiPlus size={16} />
                                      Add Sub-page
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
              className="relative w-full max-w-lg bg-white rounded-md shadow-2xl overflow-hidden"
            >
              <div className="bg-linear-to-r from-teal-800 to-teal-600 px-8 py-5 text-white">
                <h2 className="text-2xl font-bold">
                  {formData.title || 'Edit Meta'}
                </h2>
                <p className="text-teal-100 mt-1 text-sm">{formData.path}</p>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="e.g., Mingle Fashion — Home"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter a short description for search engines..."
                  />
                </div>

                <div className="border-t border-gray-200 pt-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-linear-to-r from-teal-800 to-teal-600 text-white font-semibold rounded-md hover:from-teal-900 hover:to-teal-700 transition-all shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}

      {/* Add Sub-page Modal */}
      {addingSubItem && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Sub-page</h2>
            <form onSubmit={handleAddSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="title">
                  Page Name *
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
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="metaTitle">
                  Meta Title *
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="metaDescription">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 resize-none"
                />
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
                  onClick={() => setAddingSubItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Add Sub-page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MetaTitleDescription;
