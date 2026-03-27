"use client";
import * as React from 'react';
import { FaChevronDown, FaChevronUp, FaEdit, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import { IoFilterSharp } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from "framer-motion";
import config from '@/config';
import { AuthContext } from '@/provider/AuthProvider';

export default function FeatureManage() {
    const { loginData } = React.useContext(AuthContext);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [expandedFeatures, setExpandedFeatures] = React.useState({});
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [featureData, setFeatureData] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [showDeleteModal, setShowDeleteModal] = React.useState(false);
    const [selectedFeature, setSelectedFeature] = React.useState(null);
    const [formData, setFormData] = React.useState({
        featureKey: '',
        featureName: '',
        remarks: '',
        isActive: true,
        entryBy: 'Admin' // You might want to get this from auth context
    });

    // Fetch feature data
    const fetchFeatureData = async () => {
        try {
            const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "TenantId": config.tenantId,
                },
                body: JSON.stringify({
                    operation: "",
                    procedureName: "SP_EcomItem",
                    parameters: { QueryChecker: 15 }, // 15 = Get all feature flags
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch features: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setFeatureData(data || []);
        } catch (err) {
            console.error('Error fetching feature data:', err);
            setError(err.message || 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchFeatureData();
    }, []);

    const toggleFeature = (featureId) => {
        setExpandedFeatures(prev => ({
            ...prev,
            [featureId]: !prev[featureId]
        }));
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setError(null);
        await fetchFeatureData();
        setIsRefreshing(false);
    };

    // Toggle feature status
    const handleToggleFeature = async (feature, newStatus) => {
        try {
            const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "TenantId": config.tenantId,
                },
                body: JSON.stringify({
                    operation: "",
                    procedureName: "SP_EcomItem",
                    parameters: {
                        QueryChecker: 21, // Toggle IsActive
                        Id: feature.Id,
                        IsActive: newStatus,
                        UpdateBy: loginData?.Name // You might want to get this from auth context
                    },
                }),
            });

            if (response.ok) {
                toast.success(`Feature ${newStatus ? 'enabled' : 'disabled'} successfully!`);
                handleRefresh();
            } else {
                throw new Error('Failed to update feature status');
            }
        } catch (error) {
            console.error('Error toggling feature:', error);
            toast.error('Failed to update feature status');
        }
    };

    // Add new feature
    const handleAddFeature = async () => {
        if (!formData.featureKey || !formData.featureName) {
            toast.error('Feature Key and Name are required');
            return;
        }

        try {
            const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "TenantId": config.tenantId,
                },
                body: JSON.stringify({
                    operation: "",
                    procedureName: "SP_EcomItem",
                    parameters: {
                        QueryChecker: 18, // Insert new feature
                        FeatureKey: formData.featureKey,
                        FeatureName: formData.featureName,
                        Remarks: formData.remarks,
                        IsActive: formData.isActive,
                        EntryBy: loginData?.Name
                    },
                }),
            });

            if (response.ok) {
                toast.success('Feature added successfully!');
                setShowAddModal(false);
                resetForm();
                handleRefresh();
            } else {
                throw new Error('Failed to add feature');
            }
        } catch (error) {
            console.error('Error adding feature:', error);
            toast.error('Failed to add feature');
        }
    };

    // Update feature
    const handleUpdateFeature = async () => {
        if (!selectedFeature) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "TenantId": config.tenantId,
                },
                body: JSON.stringify({
                    operation: "",
                    procedureName: "SP_EcomItem",
                    parameters: {
                        QueryChecker: 19, // Update feature
                        Id: selectedFeature.Id,
                        FeatureKey: formData.featureKey,
                        FeatureName: formData.featureName,
                        Remarks: formData.remarks,
                        IsActive: formData.isActive,
                        UpdateBy: loginData?.Name // You might want to get this from auth context
                    },
                }),
            });

            if (response.ok) {
                toast.success('Feature updated successfully!');
                setShowEditModal(false);
                resetForm();
                handleRefresh();
            } else {
                throw new Error('Failed to update feature');
            }
        } catch (error) {
            console.error('Error updating feature:', error);
            toast.error('Failed to update feature');
        }
    };

    // Delete feature
    const handleDeleteFeature = async () => {
        if (!selectedFeature) return;

        try {
            const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "TenantId": config.tenantId,
                },
                body: JSON.stringify({
                    operation: "",
                    procedureName: "SP_EcomItem",
                    parameters: {
                        QueryChecker: 20, // Delete feature
                        Id: selectedFeature.Id
                    },
                }),
            });

            if (response.ok) {
                toast.success('Feature deleted successfully!');
                setShowDeleteModal(false);
                setSelectedFeature(null);
                handleRefresh();
            } else {
                throw new Error('Failed to delete feature');
            }
        } catch (error) {
            console.error('Error deleting feature:', error);
            toast.error('Failed to delete feature');
        }
    };

    const resetForm = () => {
        setFormData({
            featureKey: '',
            featureName: '',
            remarks: '',
            isActive: true,
            entryBy:loginData?.Name
        });
        setSelectedFeature(null);
    };

    const openEditModal = (feature) => {
        setSelectedFeature(feature);
        setFormData({
            featureKey: feature.FeatureKey,
            featureName: feature.FeatureName,
            remarks: feature.Remarks || '',
            isActive: feature.IsActive,
            entryBy: loginData?.Name
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (feature) => {
        setSelectedFeature(feature);
        setShowDeleteModal(true);
    };

    const filteredFeatures = featureData.filter(feature =>
        (feature.FeatureName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feature.FeatureKey || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (feature.Remarks || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <>
            <section className="overflow-hidden relative pb-2 pt-2">
                <div className="bg-white rounded-sm shadow-md overflow-hidden">
                    <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .scroll-container { max-height: calc(98vh - 158px); overflow-y: auto; }
            
            /* Custom Toggle Switch Styles */
            .toggle-switch {
              position: relative;
              display: inline-block;
              width: 44px;
              height: 24px;
            }
            
            .toggle-switch input {
              opacity: 0;
              width: 0;
              height: 0;
            }
            
            .toggle-slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: #ccc;
              transition: .3s;
              border-radius: 34px;
            }
            
            .toggle-slider:before {
              position: absolute;
              content: "";
              height: 18px;
              width: 18px;
              left: 3px;
              bottom: 3px;
              background-color: white;
              transition: .3s;
              border-radius: 50%;
            }
            
            input:checked + .toggle-slider {
              background: linear-gradient(to right, #0D9488, #14B8A6);
            }
            
            input:checked + .toggle-slider:before {
              transform: translateX(20px);
            }
            
            input:focus + .toggle-slider {
              box-shadow: 0 0 1px #0D9488;
            }
            
            .toggle-slider.disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          `}</style>

                    {/* Header */}
                    <div className="bg-linear-to-r from-teal-600 to-teal-800 p-3 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-4">
                            <h1 className="text-white font-semibold text-lg">FEATURE MANAGEMENT</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search Features..."
                                className="bg-white rounded text-gray-700 px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                                    title="Filter columns"
                                >
                                    <IoFilterSharp className="text-lg" />
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    className={`p-2 text-white hover:bg-white/10 rounded-full transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                                    title="Refresh data"
                                    disabled={isRefreshing}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setShowAddModal(true);
                                    }}
                                    className="px-3 py-1.5 text-sm font-medium rounded bg-white text-teal-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
                                >
                                    <FaPlus className="text-xs" />
                                    <span>Add Feature</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Features list */}
                    <div className="scroll-container no-scrollbar">
                        {loading && (
                            <div className="bg-opacity-70 flex h-80 items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#32BBAB]"></div>
                            </div>
                        )}

                        {error && (
                            <div className="p-8 text-center text-red-500">{error}</div>
                        )}

                        {!loading && !error && (
                            filteredFeatures.length > 0 ? (
                                <div className="divide-y divide-gray-300">
                                    {filteredFeatures
                                        .sort((a, b) => new Date(b.EntryDate || 0).getTime() - new Date(a.EntryDate || 0).getTime())
                                        .map(feature => (
                                            <div key={feature.Id} className="text-gray-700 transition-colors">
                                                {/* Feature header row */}
                                                <div className="grid grid-cols-12 items-center py-3 px-4 gap-4">
                                                    <div className="col-span-5 flex items-center gap-4">
                                                        <div className={`p-2 rounded-full ${feature.IsActive ? 'bg-green-100' : 'bg-gray-100'} shrink-0`}>
                                                            {feature.IsActive ? (
                                                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h2 className="font-semibold text-base text-[#279185] truncate">{feature.FeatureName}</h2>
                                                            <p className="text-xs text-gray-500 truncate">Key: {feature.FeatureKey}</p>
                                                        </div>
                                                    </div>

                                                    <div className="col-span-3 flex items-center justify-center">
                                                        <label className="toggle-switch">
                                                            <input
                                                                type="checkbox"
                                                                checked={feature.IsActive}
                                                                onChange={(e) => handleToggleFeature(feature, e.target.checked)}
                                                            />
                                                            <span className="toggle-slider"></span>
                                                        </label>
                                                    </div>

                                                    <div className="col-span-4 flex items-center justify-end gap-4">
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">Updated: {formatDate(feature.UpdateDate)}</p>
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => openEditModal(feature)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                                title="Edit feature"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            {expandedFeatures[feature.Id] ? (
                                                                <FaChevronUp
                                                                    className="text-gray-500 text-sm cursor-pointer"
                                                                    onClick={() => toggleFeature(feature.Id)}
                                                                />
                                                            ) : (
                                                                <FaChevronDown
                                                                    className="text-gray-500 text-sm cursor-pointer"
                                                                    onClick={() => toggleFeature(feature.Id)}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Expanded content */}
                                                <AnimatePresence>
                                                    {expandedFeatures[feature.Id] && (
                                                        <motion.div
                                                            key={`expanded-${feature.Id}`}
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="bg-gray-50 overflow-hidden"
                                                        >
                                                            <div className="p-4">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {/* Feature Details */}
                                                                    <div className="bg-white p-4 rounded shadow-sm">
                                                                        <h3 className="font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-2">
                                                                            Feature Details
                                                                        </h3>
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-start">
                                                                                <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                                                </svg>
                                                                                <div>
                                                                                    <p className="text-gray-700 text-sm font-medium">Feature Key</p>
                                                                                    <p className="text-gray-600 text-sm">{feature.FeatureKey}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-start">
                                                                                <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                                </svg>
                                                                                <div>
                                                                                    <p className="text-gray-700 text-sm font-medium">Remarks</p>
                                                                                    <p className="text-gray-600 text-sm">{feature.Remarks || 'No remarks provided'}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Audit Information */}
                                                                    <div className="bg-white p-4 rounded shadow-sm">
                                                                        <h3 className="font-semibold text-gray-700 mb-3 border-b border-gray-300 pb-2">
                                                                            Audit Information
                                                                        </h3>
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-start">
                                                                                <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                </svg>
                                                                                <div>
                                                                                    <p className="text-gray-700 text-sm font-medium">Entry Date</p>
                                                                                    <p className="text-gray-600 text-sm">{formatDate(feature.EntryDate)}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-start">
                                                                                <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                                <div>
                                                                                    <p className="text-gray-700 text-sm font-medium">Last Updated</p>
                                                                                    <p className="text-gray-600 text-sm">{formatDate(feature.UpdateDate)}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-start">
                                                                                <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                                </svg>
                                                                                <div>
                                                                                    <p className="text-gray-700 text-sm font-medium">Entry By / Updated By</p>
                                                                                    <p className="text-gray-600 text-sm">{feature.EntryBy || 'N/A'} / {feature.UpdateBy || 'N/A'}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="mt-4 bg-white p-4 rounded shadow-sm flex justify-end gap-2">
                                                                    <button
                                                                        className="px-3 py-2 text-xs font-medium rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                                                                        onClick={() => openEditModal(feature)}
                                                                    >
                                                                        <FaEdit className="inline mr-1" /> Edit Feature
                                                                    </button>
                                                                    <button
                                                                        className="px-3 py-2 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-700 transition-colors"
                                                                        onClick={() => openDeleteModal(feature)}
                                                                    >
                                                                        Delete Feature
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-[calc(100vh-200px)] min-h-75">
                                    <div className="text-center p-8">
                                        <h3 className="text-2xl font-semibold text-gray-400 mb-1">
                                            {searchTerm ? 'No features match your search' : 'No features found'}
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {searchTerm ? 'Try a different search term' : 'Click "Add Feature" to create your first feature flag'}
                                        </p>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* Add Feature Modal */}
            {showAddModal && (
                <FeatureModal
                    title="Add New Feature"
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleAddFeature}
                    onClose={() => {
                        setShowAddModal(false);
                        resetForm();
                    }}
                />
            )}

            {/* Edit Feature Modal */}
            {showEditModal && (
                <FeatureModal
                    title="Edit Feature"
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleUpdateFeature}
                    onClose={() => {
                        setShowEditModal(false);
                        resetForm();
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <AnimatePresence>
                    <motion.div
                        className="fixed inset-0 bg-gray-400/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="bg-white shadow-2xl rounded p-6 w-full max-w-md border border-gray-100"
                        >
                            <motion.div
                                className="mx-auto mb-1 flex justify-center"
                                initial={{ scale: 0.8, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 500 }}
                            >
                                <div className="relative">
                                    <svg className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <motion.path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.5, delay: 0.2 }}
                                        />
                                    </svg>
                                </div>
                            </motion.div>

                            <h3 className="text-xl font-bold text-gray-700 text-center mb-2">
                                Confirm Deletion
                            </h3>

                            <p className="text-sm text-gray-600 text-center mb-6">
                                You are about to delete feature <span className="font-semibold">{selectedFeature?.FeatureName}</span>.
                                <br />
                                This action <span className="text-red-500 font-medium">cannot</span> be undone.
                            </p>

                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-5 py-2.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteFeature}
                                    className="px-5 py-2.5 text-sm font-medium rounded bg-linear-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
                                >
                                    Delete Feature
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            )}
        </>
    );
}

// Feature Modal Component
const FeatureModal = ({ title, formData, setFormData, onSave, onClose }) => {
    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-gray-400/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white shadow-2xl rounded-lg p-6 w-full max-w-lg border border-gray-200"
                >
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Key <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.featureKey}
                                onChange={(e) => setFormData({ ...formData, featureKey: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="e.g., enable_dark_mode"
                            />
                            <p className="text-xs text-gray-500 mt-1">Unique identifier for the feature (no spaces)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Feature Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.featureName}
                                onChange={(e) => setFormData({ ...formData, featureName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="e.g., Dark Mode"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Remarks
                            </label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                placeholder="Additional notes about this feature..."
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                                Active (feature enabled)
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium rounded border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            className="px-4 py-2 text-sm font-medium rounded bg-linear-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <FaSave />
                            Save
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};