"use client";
import * as React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { IoFilterSharp } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { MdCancel, MdLocalShipping, MdPayment } from 'react-icons/md';
import { BsBoxSeam, BsCashCoin } from 'react-icons/bs';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { TbTruckDelivery } from 'react-icons/tb';
import Image from 'next/image';
import { AnimatePresence, motion } from "framer-motion";
import config from '@/config';
export default function OrderManage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedOrders, setExpandedOrders] = React.useState({});
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [orderData, setOrderData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  //   const [orderToDelete, setOrderToDelete] = React.useState(null);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [orderToCancel, setOrderToCancel] = React.useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = React.useState({});
  const [selectedStatus, setSelectedStatus] = React.useState({});

  // Shipment status configuration
  const shipmentStatus = {
    [-1]: { label: 'Cancelled', color: '#F44336', bgColor: '#FFEBEE', icon: <MdCancel className="text-[#F44336]" /> },
    0: { label: 'Pending', color: '#FFA500', bgColor: '#FFF3E0', icon: <AiOutlineShoppingCart className="text-[#FFA500]" /> },
    1: { label: 'Processing', color: '#2196F3', bgColor: '#E3F2FD', icon: <BsBoxSeam className="text-[#2196F3]" /> },
    2: { label: 'Shipped', color: '#4CAF50', bgColor: '#E8F5E9', icon: <TbTruckDelivery className="text-[#4CAF50]" /> },
    3: { label: 'Delivered', color: '#9C27B0', bgColor: '#F3E5F5', icon: <MdLocalShipping className="text-[#9C27B0]" /> },
  };

  //Payment method icons
  const paymentMethodIcons = {
    Cash: <BsCashCoin className="text-[#4CAF50]" />,
    Bkash: <MdPayment className="text-[#E91E63]" />,
    Bank: <MdPayment className="text-[#2196F3]" />,
  };

  React.useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}api/EOrder/GetOrderWithItems`, {
          headers: {
            'TenantId': config.tenantId,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order data');
        }

        const data = await response.json();
        //console.log('Data', data)
        const ordersMap = {};

        data.forEach((item) => {
          if (!ordersMap[item.OrderId]) {
            ordersMap[item.OrderId] = {
              OrderId: item.OrderId,
              InvoiceNo: item.InvoiceNo,
              CustomerName: item.CustomerName,
              Email: item.Email,
              Phone: item.Phone,
              ShippingAddress: item.ShippingAddress,
              ShippingCity: item.ShippingCity,
              ShippingArea: item.ShippingArea,
              ShippingPhone: item.ShippingPhone,
              OrderDate: item.OrderDate,
              DueDate: item.DueDate,
              PaymentMethod: item.PaymentMethod,
              TransactionId: item.TransactionId,
              Subtotal: item.Subtotal,
              Discount: item.Discount,
              DeliveryCharge: item.DeliveryCharge,
              Total: item.Total,
              TotalVat: item.TotalVat,
              ShipmentStatus: item.ShipmentStatus,
              Notes: item.Notes,
              CouponCode: item.CouponCode,
              items: []
            };
          }

          ordersMap[item.OrderId].items.push({
            ItemId: item.ItemId,
            Name: item.Name,
            Price: item.Price,
            DiscountedPrice: item.DiscountedPrice,
            Quantity: item.Quantity,
            Image: item.Image,
            SelectedColor: item.SelectedColor,
            SelectedSize: item.SelectedSize,
            Barcode: item.Barcode,
            Brand: item.Brand,
            VatType: item.VatType,
            VatAmount: item.VatAmount,
            VatPercent: item.VatPercent,
            SKU: item.SKU
          });
        });

        setOrderData(Object.values(ordersMap));
      } catch (err) {
        console.error('Error fetching order data:', err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(`${config.API_BASE_URL}api/EOrder/GetOrderWithItems`, {
        headers: {
          'TenantId': config.tenantId,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order data');
      }

      const data = await response.json();
      const ordersMap = {};

      data.forEach((item) => {
        if (!ordersMap[item.OrderId]) {
          ordersMap[item.OrderId] = {
            OrderId: item.OrderId,
            InvoiceNo: item.InvoiceNo,
            CustomerName: item.CustomerName,
            Email: item.Email,
            Phone: item.Phone,
            ShippingAddress: item.ShippingAddress,
            ShippingCity: item.ShippingCity,
            ShippingArea: item.ShippingArea,
            ShippingPhone: item.ShippingPhone,
            OrderDate: item.OrderDate,
            DueDate: item.DueDate,
            PaymentMethod: item.PaymentMethod,
            TransactionId: item.TransactionId,
            Subtotal: item.Subtotal,
            Discount: item.Discount,
            DeliveryCharge: item.DeliveryCharge,
            Total: item.Total,
            TotalVat: item.TotalVat,
            ShipmentStatus: item.ShipmentStatus,
            Notes: item.Notes,
            CouponCode: item.CouponCode,
            items: []
          };
        }

        ordersMap[item.OrderId].items.push({
          ItemId: item.ItemId,
          Name: item.Name,
          Price: item.Price,
          DiscountedPrice: item.DiscountedPrice,
          Quantity: item.Quantity,
          Image: item.Image,
          SelectedColor: item.SelectedColor,
          SelectedSize: item.SelectedSize,
          Barcode: item.Barcode,
          Brand: item.Brand,
          SKU: item.SKU,
          VatType: item.VatType,
          VatAmount: item.VatAmount,
          VatPercent: item.VatPercent
        });
      });

      setOrderData(Object.values(ordersMap));
    } catch (err) {
      console.error('Error refreshing order data:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const filteredOrders = orderData.filter(order =>
    (order.InvoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.CustomerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.Phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const updateShipmentStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/EOrder/UpdateShipmentStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'TenantId': config.tenantId,
        },
        body: JSON.stringify({
          Id: orderId,
          ShipmentStatus: newStatus
        }),
      });

      if (response.ok) {
        toast.success('Shipment status updated successfully!');
        handleRefresh();
      } else {
        throw new Error('Failed to update shipment status');
      }
    } catch (error) {
      console.error('Error updating shipment status:', error);
      toast.error('Failed to update shipment status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/EOrder/DeleteOrder/${orderId}`, {
        method: 'DELETE',
        headers: {
          'TenantId': config.tenantId,
        }
      });

      if (response.ok) {
        toast.success('Order deleted successfully!');
        handleRefresh();
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`${config.API_BASE_URL}api/EOrder/UpdateShipmentStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'TenantId': config.tenantId,
        },
        body: JSON.stringify({
          Id: orderId,
          ShipmentStatus: -1
        }),
      });

      if (response.ok) {
        toast.success('Order cancelled successfully!');
        handleRefresh();
      } else {
        throw new Error('Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setShowCancelModal(false);
    }
  };

  const handlePrintInvoice = (order) => {
    const COLORS = {
      primary: '#1F2937',
      secondary: '#2563EB',
      light: '#F3F4F6',
      border: '#E5E7EB',
      text: '#111827',
      muted: '#6B7280'
    };

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${order.InvoiceNo}</title>
    <style>
        @page { size: A4; margin: 18mm 15mm; }
        * { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', Arial, sans-serif;
            color: ${COLORS.text};
            -webkit-print-color-adjust: exact;
            display: flex;
            flex-direction: column;
            min-height: 100vh;
        }
        .invoice { flex: 1; display: flex; flex-direction: column; width: 100%; }
        .content { flex: 1; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .company h1 { margin: 0; font-size: 22px; font-weight: 700; }
        .company p { margin: 2px 0; font-size: 12px; color: ${COLORS.muted}; }
        .invoice-meta { text-align: right; font-size: 12px; }
        .invoice-meta strong { display: block; font-size: 16px; margin-bottom: 4px; }
        .client-box { background: ${COLORS.light}; padding: 14px; border-radius: 6px; margin-bottom: 24px; }
        .client-box strong { font-size: 13px; }
        .client-box p { font-size: 12px; margin: 3px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead { background: ${COLORS.primary}; color: white; }
        th, td { padding: 8px; border-bottom: 1px solid ${COLORS.border}; }
        th { text-align: left; }
        td.right, th.right { text-align: right; }
        tr { page-break-inside: avoid; }
        .totals { width: 100%; margin-top: 20px; page-break-inside: avoid; }
        .totals table { width: 300px; margin-left: auto; font-size: 12px; }
        .totals td { padding: 6px; }
        .totals tr.final td { font-weight: 700; border-top: 2px solid ${COLORS.primary}; font-size: 14px; }
        .footer { text-align: center; font-size: 11px; color: ${COLORS.muted}; padding: 20px 0; page-break-inside: avoid; }
        .invoice-logo { height: 40px; object-fit: contain; display: block; margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="content">
            <div class="header">
                <div class="company">
                    <img src="/images/logo/mingle-style.png" alt="Mingle Fashion" class="invoice-logo" />
                    <p>01332546940</p>
                    <p>mingle1@minglefashionbd.com</p>
                </div>
                <div class="invoice-meta">
                    <strong>INVOICE</strong>
                    Invoice No: ${order.InvoiceNo}<br>
                    Date: ${formatDate(order.OrderDate)}<br>
                    Payment: ${order.PaymentMethod}
                </div>
            </div>
            <div class="client-box">
                <strong>Bill To</strong>
                <p>${order.CustomerName}</p>
                <p>${order.ShippingAddress}</p>
                <p>${order.ShippingArea}, ${order.ShippingCity}</p>
                <p>Phone: ${order.Phone}</p>
                ${order.Email ? `<p>Email: ${order.Email}</p>` : ''}
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width:40%">Item</th>
                        <th class="right">Price</th>
                        <th class="right">Qty</th>
                        <th class="right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(i => `
                        <tr>
                            <td>
                                <strong>${i.Name}</strong><br>
                                <span style="color:${COLORS.muted}">
                                    ${i.SelectedColor ? `Color: ${i.SelectedColor}` : ''}
                                    ${i.SelectedSize ? ` | Size: ${i.SelectedSize}` : ''}
                                </span>
                            </td>
                            <td class="right">${i.DiscountedPrice.toFixed(2)}</td>
                            <td class="right">${i.Quantity}</td>
                            <td class="right">${(i.DiscountedPrice * i.Quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="totals">
                <table>
                    <tr><td>Subtotal</td><td class="right">${order.Subtotal.toFixed(2)}</td></tr>
                    ${order.Discount > 0 ? `<tr><td>Discount</td><td class="right">-${order.Discount.toFixed(2)}</td></tr>` : ''}
                    ${order.DeliveryCharge > 0 ? `<tr><td>Shipping</td><td class="right">${order.DeliveryCharge.toFixed(2)}</td></tr>` : ''}
                    <tr class="final"><td>Total Due</td><td class="right">${order.Total.toFixed(2)}</td></tr>
                </table>
            </div>
        </div>
        <div class="footer">
            Thank you for shopping with Mingle Fashion
        </div>
    </div>
</body>
</html>
`;

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    };
  };
  return (
    <>
      <section className="overflow-hidden relative pb-2 pt-2">
        <div className="bg-white rounded-sm shadow-md overflow-hidden">
          <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar { display: none; }
            .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            .scroll-container { max-height: calc(98vh - 158px); overflow-y: auto; }
          `}</style>

          {/* Header */}
          <div className="bg-linear-to-r from-teal-600 to-teal-800 p-3 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-4">
              <h1 className="text-white font-semibold text-lg">ORDER MANAGEMENT</h1>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search Orders..."
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
              </div>
            </div>
          </div>

          {/* Orders list */}
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
              filteredOrders.length > 0 ? (
                <div className="divide-y divide-gray-300">
                  {filteredOrders
                    .sort((a, b) => new Date(b.OrderDate).getTime() - new Date(a.OrderDate).getTime())
                    .map(order => (
                      <div key={order.OrderId} className="text-gray-700 transition-colors">
                        {/* Order header row */}
                        <div className="grid grid-cols-12 items-center py-1.5 px-4 gap-4">
                          <div className="col-span-5 flex items-center gap-4">
                            <div className={`p-2 rounded-full ${shipmentStatus[order.ShipmentStatus]?.bgColor} shrink-0`}>
                              {shipmentStatus[order.ShipmentStatus]?.icon}
                            </div>
                            <div className="min-w-0">
                              <h2 className="font-semibold text-base text-[#279185] truncate">#{order.InvoiceNo}</h2>
                              <p className="text-xs text-gray-500 truncate">{order.CustomerName}</p>
                            </div>
                          </div>

                          <div className="col-span-3 flex items-center justify-center gap-2">
                            {!showStatusDropdown[order.OrderId] ? (
                              <span
                                className="text-xs font-medium px-1.5 py-[4.2px] border rounded w-19 text-center truncate"
                                style={{
                                  backgroundColor: shipmentStatus[order.ShipmentStatus]?.bgColor,
                                  color: shipmentStatus[order.ShipmentStatus]?.color,
                                  borderColor: shipmentStatus[order.ShipmentStatus]?.color
                                }}
                              >
                                {shipmentStatus[order.ShipmentStatus]?.label}
                              </span>
                            ) : (
                              <select
                                className="text-xs font-medium px-2 py-1.5 border rounded w-24 text-center truncate bg-white"
                                value={selectedStatus[order.OrderId] ?? order.ShipmentStatus}
                                onChange={(e) => setSelectedStatus(prev => ({
                                  ...prev,
                                  [order.OrderId]: parseInt(e.target.value)
                                }))}
                              >
                                {Object.entries(shipmentStatus)
                                  .filter(([status]) => parseInt(status) >= order.ShipmentStatus && parseInt(status) <= 3)
                                  .map(([status, info]) => (
                                    <option
                                      key={status}
                                      value={status}
                                      style={{
                                        color: info.color,
                                        backgroundColor: info.bgColor
                                      }}
                                    >
                                      {info.label}
                                    </option>
                                  ))}
                              </select>
                            )}

                            {order.ShipmentStatus < 3 ? (
                              <button
                                className={`px-1.5 py-1.25 text-xs font-medium rounded w-18 ${showStatusDropdown[order.OrderId]
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-[#32BBAB] hover:bg-[#258d81] text-white'
                                  } transition-colors`}
                                onClick={() => {
                                  if (showStatusDropdown[order.OrderId]) {
                                    if (selectedStatus[order.OrderId] !== undefined) {
                                      updateShipmentStatus(order.OrderId, selectedStatus[order.OrderId]);
                                    }
                                  }
                                  setShowStatusDropdown(prev => ({
                                    ...prev,
                                    [order.OrderId]: !prev[order.OrderId]
                                  }));
                                }}
                                title={showStatusDropdown[order.OrderId] ? 'Confirm status update' : 'Update status'}
                              >
                                {showStatusDropdown[order.OrderId] ? 'Confirm' : 'Update'}
                              </button>
                            ) : (
                              <button
                                className="px-1.5 py-1.25 text-xs font-medium rounded bg-gray-300 text-gray-500 cursor-not-allowed w-18"
                                disabled
                                title="Order already delivered"
                              >
                                Update
                              </button>
                            )}
                          </div>

                          <div className="col-span-4 flex items-center justify-end gap-4">
                            <div className="text-right">
                              <p className="font-semibold text-gray-600 text-sm">{order.Total.toFixed(2)} Tk</p>
                              <p className="text-xs text-gray-500">{formatDate(order.OrderDate)}</p>
                            </div>
                            <div className="flex justify-end">
                              {expandedOrders[order.OrderId] ? (
                                <FaChevronUp
                                  className="text-gray-500 text-sm cursor-pointer"
                                  onClick={() => toggleOrder(order.OrderId)}
                                />
                              ) : (
                                <FaChevronDown
                                  className="text-gray-500 text-sm cursor-pointer"
                                  onClick={() => toggleOrder(order.OrderId)}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded content */}
                        <AnimatePresence>
                          {expandedOrders[order.OrderId] && (
                            <motion.div
                              key={`expanded-${order.OrderId}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gray-100 lg:bg-gray-50 text-gray-700 overflow-hidden"
                            >
                              <div className="p-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {/* Customer Information */}
                                  <div className="bg-white py-3 rounded shadow-sm">
                                    <h3 className="font-semibold text-gray-700 mb-3 px-3 border-b border-gray-300 pb-2">
                                      Customer Information
                                    </h3>
                                    <div className="space-y-2 p-3">
                                      <div className="flex items-start">
                                        <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <div>
                                          <p className="text-gray-700 text-sm">{order.CustomerName}</p>
                                          <p className="text-gray-500 text-xs">{order.Email}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start">
                                        <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <div>
                                          <p className="text-gray-700 text-sm">{order.Phone}</p>
                                          {order.ShippingPhone && order.ShippingPhone !== order.Phone && (
                                            <p className="text-gray-500 text-xs">Shipping: {order.ShippingPhone}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-start">
                                        <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <div>
                                          <p className="text-gray-700 text-sm">{order.ShippingAddress}</p>
                                          <p className="text-gray-500 text-xs">{order.ShippingArea}, {order.ShippingCity}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start">
                                        {paymentMethodIcons[order.PaymentMethod] || <MdPayment className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" />}
                                        <div className='ml-2'>
                                          <p className="text-gray-700 text-sm">{order.PaymentMethod}</p>
                                          <p className="text-gray-500 text-xs">Paid: {order.Total.toFixed(2)} Tk</p>
                                        </div>
                                      </div>
                                      <div className="flex items-start">
                                        <svg className="w-4 h-4 text-gray-400 mt-0.5 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <div>
                                          <p className="text-gray-700 text-sm">Transaction ID</p>
                                          <p className="text-gray-500 text-xs">{order.TransactionId || 'Not available'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Order Items */}
                                  <div className="bg-white rounded shadow-sm">
                                    <div className="flex p-3 justify-between items-center mb-3 border-b border-gray-300 pb-2">
                                      <h3 className="font-semibold text-gray-700">
                                        Order Items ({order.items?.length || 0})
                                      </h3>
                                      <span
                                        className="text-xs font-medium px-2 py-1 rounded-full"
                                        style={{
                                          backgroundColor: shipmentStatus[order.ShipmentStatus]?.bgColor,
                                          color: shipmentStatus[order.ShipmentStatus]?.color,
                                        }}
                                      >
                                        {shipmentStatus[order.ShipmentStatus]?.label}
                                      </span>
                                    </div>

                                    <div className="max-h-56 p-3 overflow-y-auto space-y-2">
                                      {order.items?.map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex gap-3 border-b border-gray-300 pb-3 last:border-b-0 last:pb-0"
                                        >
                                          <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden shrink-0">
                                            <Image
                                              src={item.Image}
                                              alt={item.Name}
                                              width={100}
                                              height={100}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{item.Name}</h4>
                                            <div className="flex items-center justify-between mt-1">
                                              <div className='flex flex-col'>
                                                <div className="text-xs text-gray-500">
                                                  {item.Brand && <span>{item.Brand} | </span>}
                                                  {item.SelectedColor && <span>Color: {item.SelectedColor.trim()} | </span>}
                                                  {item.SelectedSize && <span>Size: {item.SelectedSize}</span>}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {item.Barcode && <span>Barcode: {item.Barcode} | </span>}

                                                  {item.SKU && <span>{item.SKU.trim()}</span>}
                                                </div>
                                              </div>
                                              <div className="text-sm font-medium shrink-0">
                                                {item.DiscountedPrice.toFixed(2)} Tk x {item.Quantity}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-4 pt-3 border-t p-3 border-teal-500">
                                      <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">{order.Subtotal.toFixed(2)} Tk</span>
                                      </div>
                                      {order.TotalVat > 0 && (
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-600">VAT:</span>
                                          <span className="font-medium">+{order.TotalVat.toFixed(2)} Tk</span>
                                        </div>
                                      )}
                                      {order.Discount > 0 && (
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-600">Discount ({order.CouponCode}):</span>
                                          <span className="font-medium text-red-600">-{order.Discount.toFixed(2)} Tk</span>
                                        </div>
                                      )}
                                      {order.DeliveryCharge > 0 && (
                                        <div className="flex justify-between text-sm mb-1">
                                          <span className="text-gray-600">Delivery Charge:</span>
                                          <span className="font-medium">+{order.DeliveryCharge.toFixed(2)} Tk</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-base font-semibold mt-2">
                                        <span>Total:</span>
                                        <span>{order.Total.toFixed(2)} Tk</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Notes + Actions */}
                                <div className="mt-2 bg-white p-4 rounded shadow-sm">
                                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    {order.Notes && (
                                      <div className="flex-1">
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Customer Notes:</h4>
                                        <p className="text-sm text-gray-600 bg-[#f7efd2] p-2 rounded">
                                          {order.Notes?.trim() ? order.Notes : 'No Notes Available'}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex flex-wrap pt-5 gap-2">
                                      <button
                                        className="px-3 py-2.5 text-xs font-medium rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                                        onClick={() => handlePrintInvoice(order)}
                                      >
                                        Print Invoice
                                      </button>
                                      <button
                                        className="px-3 py-2.5 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-700 transition-colors"
                                        onClick={() => {
                                          setOrderToCancel(order);
                                          setShowCancelModal(true);
                                        }}
                                      >
                                        Cancel Order
                                      </button>
                                      {order.ShipmentStatus < 3 && shipmentStatus[order.ShipmentStatus]?.label !== 'Cancelled' && (
                                        <button
                                          className="px-3 py-2.5 text-xs font-medium rounded bg-[#32BBAB] text-white hover:bg-[#258d81] transition-colors"
                                          onClick={() => updateShipmentStatus(order.OrderId, order.ShipmentStatus + 1)}
                                        >
                                          Update to {shipmentStatus[order.ShipmentStatus + 1]?.label || 'Next Status'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
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
                      {searchTerm ? 'No orders match your search' : 'No orders found'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {searchTerm ? 'Try a different search term' : 'Check back later for new orders'}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

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
              className="bg-white dark:bg-gray-700 shadow-2xl rounded p-6 w-full max-w-md border border-gray-100 dark:border-gray-700"
            >
              {/* Animated Warning Icon */}
              <motion.div
                className="mx-auto mb-1 flex justify-center"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <div className="relative">
                  <svg className="w-14 h-14 text-red-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

              <h3 className="text-xl font-bold text-gray-700 dark:text-white text-center mb-2">
                Confirm Deletion
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                You are about to delete order <span className="font-semibold">#{orderToDelete?.InvoiceNo}</span>.
                <br />
                This action <span className="text-red font-medium">cannot</span> be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => orderToDelete && handleDeleteOrder(orderToDelete.OrderId)}
                  className="px-5 py-2.5 text-sm font-medium rounded bg-linear-to-br from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
                >
                  Delete Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* Cancel Order Confirmation Modal */}
      {showCancelModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-700 shadow-2xl rounded p-6 w-full max-w-md border border-gray-100 dark:border-gray-700"
            >
              {/* Animated Warning Icon */}
              <motion.div
                className="mx-auto mb-1 flex justify-center"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <div className="relative">
                  <svg className="w-14 h-14 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              <h3 className="text-xl font-bold text-gray-700 dark:text-white text-center mb-2">
                Confirm Cancellation
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6">
                You are about to cancel order <span className="font-semibold">#{orderToCancel?.InvoiceNo}</span>.
                <br />
                This will mark the order as <span className="text-red-700 font-medium">Cancelled</span> in the system.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-5 py-2.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200"
                >
                  Go Back
                </button>
                <button
                  onClick={() => orderToCancel && handleCancelOrder(orderToCancel.OrderId)}
                  className="px-5 py-2.5 text-sm font-medium rounded bg-linear-to-br from-[#EF4444] to-[#DC2626] hover:from-[#DC2626] hover:to-[#B91C1C] text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
                >
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

    </>
  );
}