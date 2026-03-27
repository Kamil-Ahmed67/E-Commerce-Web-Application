'use client';

import config from '@/config';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { IoMdAddCircle } from 'react-icons/io';

// ========================
// Custom hook for countdown
// ========================
function useCountdown(targetDate) {
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const end = new Date(targetDate);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      setDaysRemaining(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    calculate();
    const timer = setInterval(calculate, 86400000); // update every 24h

    return () => clearInterval(timer);
  }, [targetDate]);

  return daysRemaining;
}

// ========================
// Countdown cell component
// ========================
const CountdownCell = ({ endDate }) => {
  const daysRemaining = useCountdown(endDate);

  if (daysRemaining < 0) return <span className="text-red-500">Expired</span>;
  if (daysRemaining === 0) return <span className="text-yellow-500">Today</span>;
  return <span className="text-green-500">{daysRemaining} days</span>;
};

// ========================
// Main Discount component
// ========================
export default function Discount() {
  const [items, setItems] = useState([]);
  const [discountDetails, setDiscountDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredDiscount, setFilteredDiscount] = useState([]);

  const hasFetched = useRef(false); // prevent double-fetch in dev mode

  // ========================
  // Fetch all discounts
  // ========================
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchDiscount = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            TenantId: config.tenantId,
          },
          body: JSON.stringify({
            operation: '',
            procedureName: 'SP_EcomItem',
            parameters: { QueryChecker: 2 },
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch items');

        const data = await response.json();
        setItems(data);
        setFilteredDiscount(data);
      } catch (err) {
        console.error(err);
        setItems([]);
        setFilteredDiscount([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, []);

  // ========================
  // Fetch discount details for modal
  // ========================
  const fetchDiscountDetails = async (discountId) => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId,
        },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomItem',
          parameters: { QueryChecker: 3, Id: discountId },
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch discount details');

      const data = await response.json();
      setDiscountDetails(data);
    } catch (err) {
      console.error(err);
      setDiscountDetails([]);
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // Handle "View" button
  // ========================
  const handleViewClick = (id) => {
    setIsModalOpen(true);
    fetchDiscountDetails(id);
  };

  // ========================
  // Filter discounts by search
  // ========================
  useEffect(() => {
    const filtered = items.filter(
      (d) =>
        d.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.Type?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredDiscount(filtered);
  }, [searchQuery, items]);

  return (
    <div className="overflow-x-auto px-2 pt-2">
      <div className="rounded-md font-roboto overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-[#2c3e50] to-[#3498db] sticky top-0 z-20 shadow-md">
          <div className="px-3 py-2 flex justify-between items-center">
            <input
              className="pl-3 py-1 rounded bg-gray-50 text-gray-900"
              placeholder="Search discount"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="flex gap-3">
              <Link href="/add-discount">
                <IoMdAddCircle className="text-white text-xl" />
              </Link>
              <FaFileExcel className="text-white text-lg cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full bg-white">
          <tbody>
            {loading ? (
              <tr>
                <td className="text-center py-6">Loading...</td>
              </tr>
            ) : filteredDiscount.length === 0 ? (
              <tr>
                <td className="text-center py-6">No discount found</td>
              </tr>
            ) : (
              filteredDiscount.map((item) => (
                <tr key={item.Id} className="border-b border-gray-300 p-2">
                  <td className="p-2 text-gray-600">{item.Name}</td>
                  <td className="p-2 text-gray-600">{item.Type}</td>
                  <td className="p-2 text-gray-600">
                    {new Date(item.StartDate).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-gray-600">
                    {new Date(item.EndDate).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-gray-600">
                    <CountdownCell endDate={item.EndDate} />
                  </td>
                  <td>
                    <button
                      onClick={() => handleViewClick(item.Id)}
                      className="bg-blue-900 text-white px-2 py-0.5 rounded"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-100 max-w-md">
            <h2 className="text-lg font-bold mb-4">Discount Details</h2>
            {discountDetails.length === 0 ? (
              <p className="text-gray-500">No details available</p>
            ) : (
              discountDetails.map((d, i) => (
                <div key={i} className="flex justify-between border-b py-2">
                  <span>{d.Title || d.Code}</span>
                  <span>{typeof d.Value === 'number' ? `${d.Value}%` : d.Value}</span>
                </div>
              ))
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="mt-4 bg-red-500 text-white px-4 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
