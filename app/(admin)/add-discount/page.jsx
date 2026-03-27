'use client';

import config from '@/config';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave, FiPercent, FiTag } from 'react-icons/fi';

export default function AddDiscountPage() {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [discountName, setDiscountName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [rowValues, setRowValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}api/EItem/GetItemList`, {
          headers: {
            'Content-Type': 'application/json',
            TenantId: config.tenantId,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch items');

        const data = await res.json();
        setItems(data || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load products');
      }
    };

    fetchItems();
  }, []);

  // Sync row values when global value or selection changes (percentage only)
  useEffect(() => {
    if (discountType === 'percentage' && discountValue && selectedItems.length > 0) {
      const newValues = { ...rowValues };
      selectedItems.forEach((id) => {
        newValues[id] = discountValue;
      });
      setRowValues(newValues);
    }
  }, [discountValue, selectedItems, discountType,rowValues]);

  const toggleSelectAll = (checked) => {
    if (checked) {
      const allIds = items
        .map((item) => item.Id || item.id || 0)
        .filter(Boolean);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!discountName.trim() || !startDate || !endDate || !discountValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (discountType === 'percentage' && selectedItems.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    if (discountType === 'flat' && !couponCode.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    const valueNum = parseFloat(discountValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }

    if (discountType === 'percentage' && valueNum > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    setIsSubmitting(true);

    const details =
      discountType === 'flat'
        ? [{ Code: couponCode.trim(), Value: valueNum }]
        : selectedItems.map((id) => ({
            ItemId: id,
            Value: parseFloat(rowValues[id] || discountValue) || valueNum,
          }));

    const payload = {
      Name: discountName.trim(),
      StartDate: startDate,
      EndDate: endDate,
      Type: discountType,
      Value: valueNum,
      EDiscountDetails: details,
    };

    try {
      const res = await fetch(`${config.API_BASE_URL}api/Discount/AddDiscount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create discount');
      }

      toast.success('Discount created successfully!');

      // Reset form
      setDiscountName('');
      setStartDate('');
      setEndDate('');
      setDiscountType('percentage');
      setDiscountValue('');
      setCouponCode('');
      setSelectedItems([]);
      setRowValues({});
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRowValueChange = (id, value) => {
    setRowValues((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-4 sm:px-6 lg:px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/discount-management"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
            >
              <FiArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Discount</h1>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-sm font-medium text-white
              transition-colors shadow-sm
              ${isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'}
            `}
          >
            <FiSave size={18} />
            {isSubmitting ? 'Saving...' : 'Save Discount'}
          </button>
        </div>

        {/* Main Form Card */}
        <div className="mb-10 rounded-sm border border-gray-300 bg-white shadow-sm overflow-hidden">
          <div className="border-b-2 border-gray-300 bg-gray-50/80 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800">Discount Information</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discount Type
                </label>
                <div className="relative">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 pl-3 pr-10"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="flat">Coupon (Fixed Amount)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    {discountType === 'percentage' ? (
                      <FiPercent className="text-gray-400" />
                    ) : (
                      <FiTag className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discount / Coupon Name
                </label>
                <input
                  type="text"
                  value={discountName}
                  onChange={(e) => setDiscountName(e.target.value)}
                  placeholder="Summer Sale 2025"
                  className="w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {discountType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount'}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === 'percentage' ? '25' : '150'}
                  min="0"
                  max={discountType === 'percentage' ? 100 : undefined}
                  step={discountType === 'percentage' ? 0.1 : 1}
                  className="w-full rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                />
              </div>

              {/* Coupon Code */}
              {discountType === 'flat' && (
                <div className="sm:col-span-2 lg:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="SUMMER25 / WELCOME200"
                    className="w-full max-w-md rounded-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3 uppercase tracking-wider"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Customers will enter this code at checkout
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Products Table - only for percentage */}
        {discountType === 'percentage' && (
          <div className="rounded-sm border border-gray-300 bg-white shadow-sm overflow-hidden">
            <div className="border-b-2 border-gray-300 bg-gray-50/80 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-800">Applicable Products</h2>
              <p className="mt-1 text-sm text-gray-600">
                Select products this discount should apply to
              </p>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center text-gray-500">Loading products...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === items.length && items.length > 0}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          className="h-5 w-5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Discount %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {items.map((item) => {
                      const itemId = item.Id || item.id || 0;
                      const isSelected = selectedItems.includes(itemId);

                      return (
                        <tr key={itemId} className={isSelected ? 'bg-blue-50/40' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedItems((prev) =>
                                  prev.includes(itemId)
                                    ? prev.filter((i) => i !== itemId)
                                    : [...prev, itemId]
                                );
                              }}
                              className="h-5 w-5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.ItemName || item.Title || 'Unnamed Product'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.Type || '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {isSelected ? (
                              <input
                                type="number"
                                value={rowValues[itemId] ?? discountValue}
                                onChange={(e) => handleRowValueChange(itemId, e.target.value)}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-24 rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 px-3 text-sm"
                              />
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}