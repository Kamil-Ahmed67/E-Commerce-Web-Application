'use client'
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiEdit, FiSave, FiX, FiLock, FiUnlock, FiUser, FiMail, FiPhone, FiShield } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import config from "@/config";
import { useAuth } from "@/provider/AuthProvider";
const AccountDetails = () => {
    const { loginData } = useAuth();
    const [formData, setFormData] = useState({
        Name: '',
        Email: '',
        Phone: '',
        UserRole: 'Customer',
        CurrentPassword: '',
        NewPassword: '',
        ConfirmPassword: '',
        Password: '',
        StoredPassword: 'currentPassword123'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Fetch account details
    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'TenantId': config.tenantId
                    },
                    body: JSON.stringify({
                        operation: "",
                        procedureName: "SP_EcomCustomer",
                        parameters: {
                            QueryChecker: 1,
                            Id: loginData?.Id
                        },
                    }),
                });

                if (!response.ok) throw new Error('Failed to fetch account details');

                const data = await response.json();
                if (data && data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        Name: data[0].Name || '',
                        Email: data[0].Email || '',
                        Phone: data[0].Phone || '',
                        Password: data[0].Password || '',
                        UserRole: data[0].UserRole || 'Customer'
                    }));
                }
            } catch (error) {
                console.error('Error fetching account details:', error);
                toast.error('Failed to load account details!');
            } finally {
                setIsLoading(false);
            }
        };

        if (loginData?.Id) {
            fetchAccountDetails();
        }
    }, [loginData?.Id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);

            const updatePayload = {
                Id: loginData?.Id,
                Name: formData.Name,
                Email: formData.Email,
                Phone: formData.Phone,
                UserRole: formData.UserRole,
                Password: formData.Password // Include current password by default
            };

            // Only add password fields if we're changing the password
            if (showPasswordFields) {
                if (!formData.CurrentPassword) {
                    toast.error('Please enter your current password');
                    setIsLoading(false);
                    return;
                }
                if (formData.CurrentPassword !== formData.Password) {
                    toast.error('Current password is incorrect');
                    setIsLoading(false);
                    return;
                }
                if (formData.NewPassword !== formData.ConfirmPassword) {
                    toast.error('New passwords do not match');
                    setIsLoading(false);
                    return;
                }
                if (formData.NewPassword.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    setIsLoading(false);
                    return;
                }
                // Update password fields in payload
                updatePayload.CurrentPassword = formData.CurrentPassword;
                updatePayload.Password = formData.NewPassword;
            }

            const updateResponse = await fetch(`${config.API_BASE_URL}api/EOrder/UpdateCustomer`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'TenantId': config.tenantId
                },
                body: JSON.stringify(updatePayload),
            });

            const responseText = await updateResponse.text();
            let responseData = {};

            try {
                responseData = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                throw new Error('Unexpected response from server');
            }

            if (!updateResponse.ok) {
                throw new Error(responseData.message || 'Failed to update account information');
            }

            toast.success(showPasswordFields
                ? 'Password changed successfully!'
                : 'Account information updated successfully!', {
                style: {
                    background: '#4BB543',
                    color: '#fff',
                }
            });

            setIsEditing(false);
            setShowPasswordFields(false);

            // Update local password state if changed
            if (showPasswordFields) {
                setFormData(prev => ({
                    ...prev,
                    Password: formData.NewPassword,
                    CurrentPassword: '',
                    NewPassword: '',
                    ConfirmPassword: ''
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    CurrentPassword: '',
                    NewPassword: '',
                    ConfirmPassword: ''
                }));
            }

        } catch (error) {
            console.error('Error updating account:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update account!';
            toast.error(errorMessage, {
                style: {
                    background: '#FF3333',
                    color: '#fff',
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-700">Account Details</h2>
                        <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto border border-gray-300 bg-white rounded-md shadow-md overflow-hidden mt-30">
            <div className="p-8">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-700">Account Settings</h2>
                        <p className="text-gray-6">Manage your profile and security settings</p>
                    </div>

                    {!isEditing ? (
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsEditing(true)}
                            className="mt-4 md:mt-0 text-xs lg:text-sm flex items-center gap-1.5 px-3 py-2.5 bg-linear-to-r from-teal-500 to-teal-700 text-white rounded shadow hover:shadow-lg transition-all"
                        >
                            <FiEdit />
                            Edit Profile
                        </motion.button>
                    ) : (
                        <div className="flex gap-2 mt-4 md:mt-0">
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setIsEditing(false);
                                    setShowPasswordFields(false);
                                }}
                                className="flex items-center text-xs lg:text-sm gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                            >
                                <FiX />
                                Cancel
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit}
                                className="flex items-center text-sm lg:text-base gap-1.5 px-3 py-2.5 bg-linear-to-r from-green-500 to-green-700 text-white rounded shadow hover:shadow-lg transition"
                                disabled={isLoading}
                            >
                                <FiSave/>
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </motion.button>
                        </div>
                    )}
                </div>

                <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'profile' ? 'border-blue-500 text-blue' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-2">
                                <FiUser />
                                Profile
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`py-4 px-1 font-medium text-sm border-b-2 ${activeTab === 'security' ? 'border-blue-500 text' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                        >
                            <div className="flex items-center gap-2">
                                <FiShield />
                                Security
                            </div>
                        </button>
                    </nav>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'profile' ? (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <FiUser className="text-gray-500" />
                                    <label className="block text-sm font-medium text-gray-700  items-center gap-2">
                                        Name
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    name="Name"
                                    value={formData.Name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <FiMail className="text-gray-500" />
                                    <label className="block text-sm font-medium text-gray-700  items-center gap-2">
                                        Email
                                    </label>
                                </div>
                                <input
                                    type="email"
                                    name="Email"
                                    value={formData.Email}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                    <FiPhone className="text-gray-500" />
                                    <label className="block text-sm font-medium text-gray-700  items-center gap-2">
                                        Phone Number
                                    </label>
                                </div>
                                <input
                                    type="tel"
                                    name="Phone"
                                    value={formData.Phone}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500  "
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="space-y-1 hidden">
                                <div className="flex items-center gap-1">
                                    <FiShield className="text-gray-500" />
                                    <label className="block text-sm font-medium text-gray-700  items-center gap-2">
                                        User Role
                                    </label>
                                </div>
                                <select
                                    name="UserRole"
                                    value={formData.UserRole}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    disabled={!isEditing}
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-[#eff6ff] border border-[#dbeafe] rounded-lg p-6 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-[#dbeafe] p-3 rounded-full">
                                        <FiLock className="text-[#2563eb] text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-[#1f2937]">Password</h3>
                                        <p className="text-sm text-[#4b5563] mt-1">
                                            Update your password to keep your account secure.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(true);
                                                setShowPasswordFields(!showPasswordFields);
                                            }}
                                            className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#3b82f6] hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6]"
                                        >
                                            {showPasswordFields ? (
                                                <>
                                                    <FiUnlock className="mr-2" />
                                                    Hide Password Change
                                                </>
                                            ) : (
                                                <>
                                                    <FiLock className="mr-2" />
                                                    Change Password
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <AnimatePresence>
                                {showPasswordFields && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4"
                                    >
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                name="CurrentPassword"
                                                value={formData.CurrentPassword}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your current password"
                                            />
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="NewPassword"
                                                value={formData.NewPassword}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your new password"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Password must be at least 6 characters long
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                name="ConfirmPassword"
                                                value={formData.ConfirmPassword}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Confirm your new password"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AccountDetails;