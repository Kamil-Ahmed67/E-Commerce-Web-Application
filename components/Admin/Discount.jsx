'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import config from '@/config';
import toast from 'react-hot-toast';
import { getProducts } from '@/lib/server/shopData';

export default function Discount() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewArrivalsOnly, setShowNewArrivalsOnly] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

useEffect(() => {
    (async () => {
      try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.title?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.type?.toLowerCase().includes(query)
      );
    }

    if (showNewArrivalsOnly) {
      filtered = filtered.filter((product) => product.status==='New');
    }

    setFilteredProducts(filtered);
    setSelectAll(false);
    setSelectedProducts([]);
  }, [searchQuery, products, showNewArrivalsOnly]);

  const toggleNewArrivalsFilter = () => {
    setShowNewArrivalsOnly((prev) => !prev);
  };

  const toggleDiscountInput = () => {
    setShowDiscountInput((prev) => !prev);
    if (!showDiscountInput) {
      setDiscountPercentage('');
    }
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;

    // Allow only valid percentage input (0-100, up to 2 decimals)
    if (
      value === '' ||
      (/^\d{0,3}(\.\d{0,2})?$/.test(value) &&
        (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100)))
    ) {
      setDiscountPercentage(value);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
    setSelectAll(!selectAll);
  };

  const formatPrice = (price) => {
    return price !== undefined ? `৳${Number(price).toFixed(2)}` : '-';
  };

  const applyDiscount = async () => {
    if (!discountPercentage || selectedProducts.length === 0) return;

    const discountValue = parseFloat(discountPercentage);
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      alert('Please enter a valid discount percentage (0-100)');
      return;
    }

    try {
      const productUpdates = products
        .filter((p) => selectedProducts.includes(p.id))
        .map((product) => {
          const discountedPrice = Math.round(product.price * (1 - discountValue / 100));
          return {
            Id: product.id,
            DiscountedPrice: parseFloat(discountedPrice.toFixed(2)),
          };
        });

      const response = await fetch(`${config.API_BASE_URL}api/Discount/UpdateDiscountPrice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          TenantId: config.tenantId,
        },
        body: JSON.stringify(productUpdates),
      });

      if (response.ok) {
        const updatedProducts = products.map((product) => {
          if (selectedProducts.includes(product.id)) {
            const discountedPrice = Math.round(product.price * (1 - discountValue / 100));
            return {
              ...product,
              discountedPrice: parseFloat(discountedPrice.toFixed(2)),
            };
          }
          return product;
        });

        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        setSelectedProducts([]);
        setDiscountPercentage('');
        setShowDiscountInput(false);

        toast.success(`Applied ${discountValue}% discount to ${selectedProducts.length} products`);
      } else {
        throw new Error('Failed to update discounts');
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      toast.error("Failed to apply discounts. Please try again.");
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
          padding: 8px 4px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .fixed-table th {
          padding: 12px 4px;
        }
        .selectable-column { width: 40px; min-width: 40px; }
        .quantity-column { width: 60px; min-width: 60px; }
        .product-column { width: 250px; min-width: 200px; }
        .brand-column { width: 120px; min-width: 100px; }
        .category-column { width: 120px; min-width: 100px; }
        .price-column { width: 100px; min-width: 80px; }

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
            width: 100%;
          }
          .fixed-table tr {
            display: block;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          .fixed-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .fixed-table td::before {
            content: attr(data-label);
            font-weight: bold;
            margin-right: 10px;
            flex: 1;
          }
          .fixed-table td:last-child {
            border-bottom: none;
          }
        }
      `}</style>

      <div className="rounded-md font-roboto overflow-hidden">
        <div className="bg-linear-to-r from-teal-600 to-teal-800 sticky top-0 z-20 shadow-md">
          <div className="px-3 py-2 flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center w-full sm:w-auto min-w-45 max-w-[320px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  className="block w-full pl-10 pr-3 text-gray-700 py-1.5 border border-gray-300 rounded leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200 shadow-sm"
                  type="text"
                  placeholder="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-4 w-4 text-gray-400 hover:text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              <button
                onClick={toggleNewArrivalsFilter}
                className={`text-sm whitespace-nowrap px-3 py-[6.2px] border rounded font-medium transition-colors duration-200 ${
                  showNewArrivalsOnly
                    ? 'bg-[#2563eb] text-white border-[#2563eb] hover:bg-[#1e4ecf]'
                    : 'bg-[#f3f4f6] text-[#6b7280] border-[#d1d5db] hover:bg-[#e5e7eb]'
                }`}
              >
                New Arrivals
              </button>
            </div>

            <div className="flex items-center gap-3">
              {showDiscountInput ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={handleDiscountChange}
                    placeholder="%"
                    className="w-24 px-2 py-[6.2px] border border-gray-300 text-gray-700 bg-gray-50 rounded text-sm"
                    min="0"
                    max="100"
                  />
                  <button
                    onClick={applyDiscount}
                    className="text-sm whitespace-nowrap px-3 py-[6.2px] bg-teal-500 text-white rounded font-medium transition-colors duration-200 hover:bg-teal-700"
                    disabled={!discountPercentage || selectedProducts.length === 0}
                  >
                    Apply
                  </button>
                  <button
                    onClick={toggleDiscountInput}
                    className="text-sm whitespace-nowrap px-3 py-[6.2px] bg-red-600 text-white rounded font-medium transition-colors duration-200 hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={toggleDiscountInput}
                  className={`text-sm whitespace-nowrap px-3 py-[6.2px] border rounded-md font-medium transition-colors duration-200 ${
                    showNewArrivalsOnly
                      ? 'bg-[#2563eb] text-white border-[#2563eb] hover:bg-[#1e4ecf]'
                      : 'bg-[#f3f4f6] text-[#6b7280] border-[#d1d5db] hover:bg-[#e5e7eb]'
                  }`}
                >
                  Discount (%)
                </button>
              )}
            </div>
          </div>

          <table className="fixed-table w-full border-collapse">
            <thead className="bg-white text-gray-700">
              <tr className="border-b border-gray-300">
                <th className="text-sm px-2 py-2 selectable-column">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mx-auto"
                  />
                </th>
                <th className="text-sm px-3 py-2 product-column">Product</th>
                <th className="text-sm px-3 py-2 brand-column">Brand</th>
                <th className="text-sm px-3 py-2 category-column">Type</th>
                <th className="text-sm px-2 py-2 quantity-column">Stock</th>
                <th className="text-sm px-2 py-2 quantity-column">Sold</th>
                <th className="text-sm px-3 py-2 price-column">Price</th>
                <th className="text-sm px-3 py-2 price-column">Discounted</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className="max-h-92.5 overflow-y-auto custom-scrollbar">
          <table className="fixed-table w-full">
            <tbody className="bg-white text-gray-700">
              {filteredProducts.length === 0 ? (
                <tr className="h-83.75">
                  <td colSpan={8} className="text-center font-semibold text-4xl text-gray-400 py-4">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className={`border-b border-gray-300 hover:bg-gray-100 ${
                      selectedProducts.includes(product.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="text-xs px-2 py-2 selectable-column">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleProductSelection(product.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mx-auto"
                      />
                    </td>

                    <td data-label="Product" className="text-xs px-3 py-2 product-column text-left">
                      <div className="flex items-center gap-2">
                        {product.imgs?.thumbnails?.[0] ? (
                          <Image
                            width={40}
                            height={40}
                            src={product.imgs.thumbnails[0]}
                            alt={product.title}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const sibling = e.target.nextElementSibling;
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                        ) : null}

                        {/* Fallback if image fails or missing */}
                        <div className="w-10 h-10 bg-gray-200 text-gray-500 text-xs hidden items-center justify-center rounded">
                          N/A
                        </div>

                        <span className="truncate">{product.styleNo}</span>
                      </div>
                    </td>

                    <td data-label="Brand" className="text-xs px-3 py-2 brand-column truncate">
                      {product.brand}
                    </td>

                    <td data-label="Category" className="text-xs px-3 py-2 category-column truncate">
                      {product.productType}
                    </td>

                    <td data-label="Stock" className="text-xs px-2 py-2 quantity-column">
                      {product.StockQty}
                    </td>

                    <td data-label="Sold" className="text-xs px-2 py-2 quantity-column">
                      {product.SellQty}
                    </td>

                    <td data-label="Price" className="text-xs px-3 py-2 price-column">
                      {formatPrice(product.price)}
                    </td>

                    <td data-label="Discounted" className="text-xs px-3 py-2 price-column">
                      {formatPrice(product.discountedPrice)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}