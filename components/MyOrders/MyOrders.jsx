'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/provider/AuthProvider";
import config from "@/config";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { loginData } = useAuth();

  useEffect(() => {
    if (loginData?.Id != null) {
      fetchOrders(String(loginData.Id));
    } else {
      setError("Customer ID not found. Please login first.");
      setLoading(false);
    }
  }, [loginData?.Id]);

  const fetchOrders = async (customerId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${config.API_BASE_URL}api/EOrder/CustomerwiseOrder?customerId=${customerId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'TenantId': config.tenantId
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Group items by OrderId
  const groupedOrders = orders.reduce((acc, item) => {
    if (!acc[item.OrderId]) {
      acc[item.OrderId] = [];
    }
    acc[item.OrderId].push(item);
    return acc;
  }, {});

  const openOrderDetails = (orderItems) => {
    setSelectedOrder(orderItems);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <section className="overflow-hidden py-10 bg-gray-100 min-h-screen">
        <div className="max-w-292 w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center mt-20">
            <p className="text-gray-600 text-lg mb-6">Loading your orders...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden py-10 mt-37 lg:mt-26 bg-gray-100 min-h-screen">
        <div className="max-w-292 w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center mt-20">
            <p className="text-gray-600 text-lg mb-6">{error}</p>
            <button
              onClick={() => router.push('/shop-with-sidebar')}
              className="px-6 py-2 text-sm font-medium border border-orange-500 text-orange-500 hover:bg-orange-50 transition"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handlePrintInvoice = (orderItems) => {
    const COLORS = {
      primary: '#2B3A67',
      secondary: '#41B3A3',
      accent: '#E8A87C',
      success: '#85DCB8',
      warning: '#E27D60',
      background: {
        light: '#F8F9FA',
        medium: '#E9ECEF'
      },
      text: {
        dark: '#2D3436',
        muted: '#636E72'
      }
    };

    const printOrder = {
      InvoiceNo: orderItems[0].InvoiceNo,
      OrderDate: orderItems[0].OrderDate,
      PaymentMethod: orderItems[0].PaymentMethod,
      DeliveryCharge: orderItems[0].DeliveryCharge,
      Total: orderItems[0].Total,
      Discount: orderItems[0].Discount,
      SubTotal: orderItems[0].Subtotal,
      CustomerName: orderItems[0].ShippingName,
      ShippingAddress: orderItems[0].ShippingAddress,
      ShippingCity: orderItems[0].ShippingCity,
      ShippingCountry: orderItems[0].ShippingCountry,
      Phone: orderItems[0].ShippingPhone,
      Email: orderItems[0].ShippingEmail,
      items: orderItems.map(item => ({
        name: item.Name,
        discountedPrice: item.DiscountedPrice,
        quantity: item.Quantity,
        color: item.SelectedColor,
        size: item.SelectedSize
      }))
    };

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    document.body.appendChild(iframe);

    const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice #${printOrder.InvoiceNo}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            :root {
                --page-padding: 2rem;
                --section-spacing: 1.5rem;
                --border-radius: 8px;
            }

            @page {
                size: A4;
                margin: 0;
            }

            body {
                font-family: 'Poppins', sans-serif;
                line-height: 1.5;
                color: ${COLORS.text.dark};
                background: #ffffff;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .invoice-container {
                max-width: 210mm;
                min-height: 297mm;
                margin: 0 auto;
                position: relative;
                background: #ffffff;
            }

            .header {
                background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primary}ee 100%);
                color: white;
                padding: var(--page-padding);
                position: relative;
                overflow: hidden;
                border-bottom: 4px solid ${COLORS.secondary};
            }

            /* ... rest of your beautiful invoice styles remain unchanged ... */
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- The rest of your invoice HTML remains exactly the same -->
            <!-- ... (header, client-section, items-table, totals, footer) ... -->
        </div>
    </body>
    </html>
    `;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(invoiceHTML);
      iframeDoc.close();

      iframe.onload = function () {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
    }
  };

  return (
    <>
      <section className="overflow-hidden border border-gray-300 shadow-md py-8 mt-34 lg:mt-30 rounded-md bg-gray-100 min-h-screen">
        <h3 className="font font-semibold text-2xl sm:px-8 xl:px-4 text-gray-700">My Orders</h3>
        <div className="max-w-292 w-full mx-auto px-4 sm:px-8 xl:px-4">
          {Object.keys(groupedOrders).length === 0 ? (
            <div className="text-center mt-20">
              <p className="text-gray-600 text-lg mb-6">
                There are no orders placed yet.
              </p>
              <Link prefetch={false} href="/shop-with-sidebar">
                <button className="px-6 py-2 text-sm font-medium border border-orange-500 text-orange-500 hover:bg-orange-50 transition">
                  CONTINUE SHOPPING
                </button>
              </Link>
            </div>
          ) : (
            <div
              className="mt-8 space-y-8 max-h-[calc(100vh-200px)] overflow-y-auto"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {Object.entries(groupedOrders)
                .sort((a, b) => new Date(b[1][0].OrderDate).getTime() - new Date(a[1][0].OrderDate).getTime())
                .map(([orderId, items]) => (
                  <div
                    key={orderId}
                    className="bg-white rounded-lg border border-gray-300 shadow p-6 scroll-container"
                  >
                    <style>{`
                      .scroll-container::-webkit-scrollbar {
                        display: none;
                        width: 0;
                        height: 0;
                      }
                    `}</style>
                    <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
                      <h3 className="text-lg font-semibold">Order Invoice #{items[0].InvoiceNo}</h3>
                      <p className="text-sm text-gray-500">
                        Order placed on
                        <span className="font-semibold ml-1">
                          {new Date(items[0].OrderDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex border-b border-gray-300 pb-4 last:border-0">
                          <div className="w-24 h-24 shrink-0">
                            <Image
                              src={item.Image}
                              alt={item.Name}
                              width={96}
                              height={96}
                              className="w-22 h-26 object-cover rounded"
                            />
                          </div>
                          <div className="ml-4 grow">
                            <h4 className="font-medium">{item.Name}</h4>
                            <div className="text-sm text-gray-600 mt-1">
                              <p>Color: {item.SelectedColor}</p>
                              <p>Size: {item.SelectedSize}</p>
                              <p>Qty: {item.Quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {item.DiscountedPrice.toFixed(2)}Tk
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <div className="space-x-3">
                          <button
                            onClick={() => openOrderDetails(items)}
                            className="px-4 py-2 text-sm text-white font-medium bg-[#32BBAB] hover:bg-[#279185] rounded-md transition"
                          >
                            Order Details
                          </button>
                          <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-200 transition">
                            Download Invoice
                          </button>
                        </div>

                        <div className="text-right space-y-1">
                          <p className="text-sm text-gray-600">
                            {items.reduce((sum, item) => sum + item.Quantity, 0)}
                            {items.reduce((sum, item) => sum + item.Quantity, 0) > 1 ? " Items" : " Item"}
                          </p>
                          <div className="text-sm text-gray-600">
                            <p className="flex justify-between font-semibold text-gray-800">
                              <span>Total:</span>
                              <span>{items[0].Total.toFixed(2)}Tk</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-800/20 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-white rounded-md shadow-2xl w-full mt-34 lg:mt-16 max-w-5xl max-h-[60vh] flex flex-col md:flex-row"
          >
            {/* Left Section - Scrollable */}
            <div
              className="flex-1 bg-[#f6f8f8] overflow-y-auto rounded-l-md custom-scroll p-6"
              style={{
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Invoice: #{selectedOrder[0].InvoiceNo}
                  </h2>
                </div>
                <p className="text-sm text-gray-500">
                  Order Date:
                  <span className="ml-1 font-semibold">
                    {new Date(selectedOrder[0].OrderDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </p>
              </div>

              {/* Shipment Status Starts */}
              {selectedOrder[0].ShipmentStatus === -1 ? (
                <div className="w-full my-6 py-4 bg-[#FFEBEE] border-2 border-dashed border-gray-400 rounded-lg">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[#D32F2F] text-lg font-bold tracking-widest">
                        ORDER CANCELLED
                      </span>
                    </div>
                    <p className="text-center text-[#C62828] text-sm">
                      This order is no longer active and cannot be modified.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 mt-8">
                  <div className="relative">
                    {/* Progress bar background */}
                    <div className="absolute top-5 left-0 right-0 h-[2.5px] bg-gray-300 z-0"></div>

                    {/* Progress indicator */}
                    <div
                      className="absolute top-5 left-0 h-[2.5px] bg-[#32BBAB] z-0 transition-all duration-500 ease-out"
                      style={{
                        width:
                          selectedOrder[0].ShipmentStatus === 3
                            ? '100%'
                            : `calc(${(selectedOrder[0].ShipmentStatus / 3) * 100}% + ${selectedOrder[0].ShipmentStatus > 0 ? '12px' : '0px'
                            })`,
                        maxWidth: '100%',
                      }}
                    ></div>

                    {/* Steps */}
                    <div className="relative grid grid-cols-4 z-10">
                      {[
                        {
                          status: 0,
                          label: 'Order Placed',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          ),
                        },
                        {
                          status: 1,
                          label: 'Processing',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          ),
                        },
                        {
                          status: 2,
                          label: 'Shipped',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                              />
                            </svg>
                          ),
                        },
                        {
                          status: 3,
                          label: 'Delivered',
                          icon: (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ),
                        },
                      ].map((step) => {
                        const isCompleted = selectedOrder[0].ShipmentStatus >= step.status;
                        const isCurrent = selectedOrder[0].ShipmentStatus === step.status;
                        const isDelivered = selectedOrder[0].ShipmentStatus === 3 && step.status === 3;

                        return (
                          <div key={step.status} className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${isCompleted
                                  ? isDelivered
                                    ? 'bg-green-700 text-white shadow-md'
                                    : 'bg-[#32BBAB] text-white shadow-md'
                                  : 'bg-gray-500 text-gray-100 border-2 border-gray-200'
                                }`}
                            >
                              {step.icon}
                            </div>
                            <span
                              className={`text-xs font-medium text-center ${isCompleted
                                  ? isDelivered
                                    ? 'text-green-700 font-semibold'
                                    : 'text-[#32BBAB] font-semibold'
                                  : 'text-gray-500'
                                }`}
                            >
                              {step.label}
                            </span>
                            {isCurrent && !isDelivered && (
                              <span className="text-xs text-blue-700 font-medium mt-1 animate-pulse">
                                In Progress
                              </span>
                            )}
                            {isDelivered && (
                              <span className="text-xs text-green-600 font-semibold mt-1">
                                Completed
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {/* Shipment Status Ends */}

              <h3 className="text-md lg:block hidden font-semibold text-gray-700 mb-3">
                Ordered Items
              </h3>
              <div className="space-y-4 lg:block hidden">
                {selectedOrder.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex gap-4 items-center">
                    <div className="w-20 h-20 relative rounded-md overflow-hidden border border-gray-300">
                      <Image
                        src={item.Image}
                        alt={item.Name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-800">{item.Name}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-4">
                        <span>Color: {item.SelectedColor}</span>
                        <span>Size: {item.SelectedSize}</span>
                        <span>Qty: {item.Quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">
                        {(item.DiscountedPrice * item.Quantity).toFixed(2)}Tk
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Section */}
            <div className="w-full md:w-1/3 rounded-r-md bg-white p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Order Summary
                </h3>
                <div className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="text-blue-700 font-semibold capitalize">
                      {selectedOrder[0].PaymentMethod.toLowerCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span
                      className={`font-medium ${selectedOrder[0].PaymentStatus === 'Paid'
                          ? "text-green-600"
                          : "text-red-500"
                        }`}
                    >
                      {selectedOrder[0].PaymentStatus || 'Unpaid'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span
                      className={`font-medium ${selectedOrder[0].ShipmentStatus === 0
                          ? "text-yellow-600"
                          : selectedOrder[0].ShipmentStatus === 1
                            ? "text-blue-700"
                            : selectedOrder[0].ShipmentStatus === 2
                              ? "text-[#845cd6]"
                              : selectedOrder[0].ShipmentStatus === 3
                                ? "text-green-700"
                                : "text-gray-500"
                        }`}
                    >
                      {selectedOrder[0].ShipmentStatus === 0
                        ? "Order Placed"
                        : selectedOrder[0].ShipmentStatus === 1
                          ? "Processing"
                          : selectedOrder[0].ShipmentStatus === 2
                            ? "Shipped"
                            : selectedOrder[0].ShipmentStatus === 3
                              ? "Delivered"
                              : "Unknown Status"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-700">
                      {selectedOrder
                        .reduce((sum, item) => sum + item.DiscountedPrice * item.Quantity, 0)
                        .toFixed(2)}Tk
                    </span>
                  </div>
                  {selectedOrder[0].DeliveryCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-gray-700">
                        {selectedOrder[0].DeliveryCharge.toFixed(2)}Tk
                      </span>
                    </div>
                  )}
                  {selectedOrder[0].Discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        -{selectedOrder[0].Discount.toFixed(2)}Tk
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-400 pt-3 flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>{selectedOrder[0].Total.toFixed(2)}Tk</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-x-3 text-right">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm border rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="px-4 py-2 text-sm text-white bg-[#32BBAB] hover:bg-[#279185] rounded-md transition"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </motion.div>

          <style jsx>{`
      .custom-scroll::-webkit-scrollbar {
        width: 0;
        height: 0;
      }
      .custom-scroll {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}</style>
        </div>
      )}
    </>
  );
};

export default MyOrders;