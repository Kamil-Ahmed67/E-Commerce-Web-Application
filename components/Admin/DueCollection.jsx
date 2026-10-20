"use client";
import * as React from 'react';
import { HiPlus, HiCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { MdCancel, MdLocalShipping } from 'react-icons/md';
import { BsBoxSeam } from 'react-icons/bs';
import { AiOutlineShoppingCart } from 'react-icons/ai';
import { TbTruckDelivery } from 'react-icons/tb';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import config from '@/config';

const shipmentStatus = {
  [-1]: { label: 'Cancelled', color: '#F44336', bgColor: '#FFEBEE', icon: <MdCancel className="text-[#F44336]" /> },
  0: { label: 'Pending', color: '#FFA500', bgColor: '#FFF3E0', icon: <AiOutlineShoppingCart className="text-[#FFA500]" /> },
  1: { label: 'Processing', color: '#2196F3', bgColor: '#E3F2FD', icon: <BsBoxSeam className="text-[#2196F3]" /> },
  2: { label: 'Shipped', color: '#4CAF50', bgColor: '#E8F5E9', icon: <TbTruckDelivery className="text-[#4CAF50]" /> },
  3: { label: 'Delivered', color: '#9C27B0', bgColor: '#F3E5F5', icon: <MdLocalShipping className="text-[#9C27B0]" /> },
};


function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function buildOrdersMap(data) {
  const map = {};
  data.forEach((item) => {
    if (!map[item.OrderId]) {
      map[item.OrderId] = {
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
        PaymentStatus: item.PaymentStatus,
        Notes: item.Notes,
        CouponCode: item.CouponCode,
        items: [],
      };
    }
    map[item.OrderId].items.push({
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
      SKU: item.SKU,
      VariantId: item.VariantId ?? null,
    });
  });
  return Object.values(map).sort((a, b) => b.OrderId - a.OrderId);
}

export default function DueCollection() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [expandedOrders, setExpandedOrders] = React.useState({});
  const [orderData, setOrderData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedOrders, setSelectedOrders] = React.useState(new Set());
  const [isUpdating, setIsUpdating] = React.useState(false);

  const fetchOrders = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
        body: JSON.stringify({
          operation: '',
          procedureName: 'SP_EcomOrder',
          parameters: { QueryChecker: 2 },
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      const all = buildOrdersMap(data);
      // Due Collection: Delivered (3) + anything that is NOT paid (null, empty, 'Unpaid', etc.)
      const filtered = all.filter(
        (o) => o.ShipmentStatus === 3 && o.PaymentStatus?.toLowerCase() !== 'paid'
      );
      setOrderData(filtered);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const toggleOrder = (id) =>
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleSelect = (orderId) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      next.has(orderId) ? next.delete(orderId) : next.add(orderId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.OrderId)));
    }
  };

  const markAsPaid = async () => {
    if (selectedOrders.size === 0) return;
    setIsUpdating(true);
    try {
      await Promise.all(
        [...selectedOrders].map((orderId) =>
          fetch(`${config.API_BASE_URL}api/EOrder/UpdatePaymentStatus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', TenantId: config.tenantId },
            body: JSON.stringify({ Id: orderId, PaymentStatus: 'Paid' }),
          }).then((res) => { if (!res.ok) throw new Error(`Failed for order ${orderId}`); })
        )
      );
      toast.success(`${selectedOrders.size} order${selectedOrders.size > 1 ? 's' : ''} marked as Paid`);
      setSelectedOrders(new Set());
      fetchOrders(true);
    } catch (err) {
      toast.error('Some updates failed. Please refresh and try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orderData.filter(
    (o) =>
      (o.InvoiceNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.CustomerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.Phone || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDue = filteredOrders.reduce((sum, o) => sum + (o.Total || 0), 0);

  const handlePrintInvoice = (order) => {
    const COLORS = { primary: '#1F2937', secondary: '#2563EB', light: '#F3F4F6', border: '#E5E7EB', text: '#111827', muted: '#6B7280' };
    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
    document.body.appendChild(iframe);
    const html = `<!DOCTYPE html><html><head><title>Invoice ${order.InvoiceNo}</title><style>
      @page{size:A4;margin:18mm 15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:${COLORS.text};-webkit-print-color-adjust:exact;display:flex;flex-direction:column;min-height:100vh}
      .invoice{flex:1;display:flex;flex-direction:column}.content{flex:1}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px}
      .company h1{margin:0;font-size:22px;font-weight:700}.company p{margin:2px 0;font-size:12px;color:${COLORS.muted}}.invoice-meta{text-align:right;font-size:12px}
      .invoice-meta strong{display:block;font-size:16px;margin-bottom:4px}.client-box{background:${COLORS.light};padding:14px;border-radius:6px;margin-bottom:24px}
      table{width:100%;border-collapse:collapse;font-size:12px}thead{background:${COLORS.primary};color:white}th,td{padding:8px;border-bottom:1px solid ${COLORS.border}}
      th{text-align:left}td.right,th.right{text-align:right}.totals table{width:300px;margin-left:auto;font-size:12px}.totals td{padding:6px}
      .totals tr.final td{font-weight:700;border-top:2px solid ${COLORS.primary};font-size:14px}.footer{text-align:center;font-size:11px;color:${COLORS.muted};padding:20px 0}
      .invoice-logo{height:40px;object-fit:contain;display:block;margin-bottom:8px}
    </style></head><body><div class="invoice"><div class="content">
      <div class="header"><div class="company"><img src="/images/logo/mingle-style.png" alt="Mingle Fashion" class="invoice-logo"/><p>01332546940</p><p>mingle1@minglefashionbd.com</p></div>
      <div class="invoice-meta"><strong>INVOICE</strong>Invoice No: ${order.InvoiceNo}<br>Date: ${formatDate(order.OrderDate)}<br>Payment: Unpaid</div></div>
      <div class="client-box"><strong>Bill To</strong><p>${order.CustomerName}</p><p>${order.ShippingAddress}</p><p>${order.ShippingArea}, ${order.ShippingCity}</p><p>Phone: ${order.Phone}</p>${order.Email ? `<p>Email: ${order.Email}</p>` : ''}</div>
      <table><thead><tr><th style="width:40%">Item</th><th class="right">Price</th><th class="right">Qty</th><th class="right">Total</th></tr></thead><tbody>
      ${order.items.map(i => `<tr><td><strong>${i.Name}</strong><br><span style="color:${COLORS.muted}">${i.SelectedColor ? `Color: ${i.SelectedColor}` : ''}${i.SelectedSize ? ` | Size: ${i.SelectedSize}` : ''}</span></td><td class="right">${i.DiscountedPrice.toFixed(2)}</td><td class="right">${i.Quantity}</td><td class="right">${(i.DiscountedPrice * i.Quantity).toFixed(2)}</td></tr>`).join('')}
      </tbody></table>
      <div class="totals"><table>
        <tr><td>Subtotal</td><td class="right">${order.Subtotal.toFixed(2)}</td></tr>
        ${order.TotalVat > 0 ? `<tr><td>VAT</td><td class="right">+${order.TotalVat.toFixed(2)}</td></tr>` : ''}
        ${order.Discount > 0 ? `<tr><td>Discount</td><td class="right">-${order.Discount.toFixed(2)}</td></tr>` : ''}
        ${order.DeliveryCharge > 0 ? `<tr><td>Shipping</td><td class="right">${order.DeliveryCharge.toFixed(2)}</td></tr>` : ''}
        <tr class="final"><td>Total Due</td><td class="right">${order.Total.toFixed(2)}</td></tr>
      </table></div>
      </div><div class="footer">Thank you for shopping with Mingle Fashion</div></div></body></html>`;
    const doc = iframe.contentWindow?.document;
    if (!doc) return;
    doc.open(); doc.write(html); doc.close();
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 1000);
    };
  };

  return (
    <>
      <section className="overflow-hidden relative pb-2 pt-2">
        <div className="bg-white rounded-sm shadow-md overflow-hidden">
          <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar{display:none}
            .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
            .scroll-container{max-height:calc(98vh - 158px);overflow-y:auto}
          `}</style>

          {/* Header */}
          <div className="bg-linear-to-r from-teal-600 to-teal-800 p-3 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-4">
              <h1 className="text-white font-semibold text-lg">DUE COLLECTION</h1>
              {!loading && (
                <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">
                  {filteredOrders.length} orders · {totalDue.toFixed(2)} Tk due
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search orders..."
                className="bg-white rounded text-gray-700 px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => fetchOrders(true)}
                disabled={isRefreshing}
                className={`p-2 text-white hover:bg-white/10 rounded-full transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Selection action bar */}
          <AnimatePresence>
            {selectedOrders.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-teal-700 px-4 py-2.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-semibold">
                      {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-teal-200 text-xs">
                      · {filteredOrders.filter(o => selectedOrders.has(o.OrderId)).reduce((s, o) => s + o.Total, 0).toFixed(2)} Tk
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedOrders(new Set())}
                      className="text-teal-200 hover:text-white text-xs underline underline-offset-2 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={markAsPaid}
                      disabled={isUpdating}
                      className="flex items-center gap-1.5 bg-white text-teal-700 px-4 py-1.5 text-xs font-bold uppercase tracking-wide hover:bg-teal-50 transition-colors disabled:opacity-60"
                    >
                      <HiCheck className="w-3.5 h-3.5" />
                      {isUpdating ? 'Updating...' : 'Mark as Paid'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List */}
          <div className="scroll-container no-scrollbar">
            {loading && (
              <div className="flex h-80 items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-3 border-b-3 border-[#32BBAB]" />
              </div>
            )}
            {error && <div className="p-8 text-center text-red-500">{error}</div>}
            {!loading && !error && (
              filteredOrders.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {/* Select-all row */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <button
                      onClick={toggleSelectAll}
                      className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-colors
                        ${selectedOrders.size === filteredOrders.length
                          ? 'bg-teal-600 border-teal-600'
                          : 'bg-white border-gray-300 hover:border-teal-400'}`}
                    >
                      {selectedOrders.size === filteredOrders.length && (
                        <HiCheck className="w-3 h-3 text-white" />
                      )}
                    </button>
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedOrders.size === filteredOrders.length ? 'Deselect all' : 'Select all'}
                    </span>
                  </div>

                  {filteredOrders.map((order) => (
                    <div
                      key={order.OrderId}
                      className={`text-gray-700 transition-colors ${selectedOrders.has(order.OrderId) ? 'bg-teal-50/60' : ''}`}
                    >
                      {/* Row */}
                      <div className="grid grid-cols-12 items-center py-1.5 px-4 gap-4">
                        {/* Checkbox */}
                        <div className="col-span-1 flex items-center">
                          <button
                            onClick={() => toggleSelect(order.OrderId)}
                            className={`w-5 h-5 border-2 flex items-center justify-center shrink-0 transition-all duration-150
                              ${selectedOrders.has(order.OrderId)
                                ? 'bg-teal-600 border-teal-600'
                                : 'bg-white border-gray-300 hover:border-teal-400'}`}
                          >
                            {selectedOrders.has(order.OrderId) && (
                              <HiCheck className="w-3 h-3 text-white" />
                            )}
                          </button>
                        </div>

                        <div className="col-span-4 flex items-center gap-3">
                          <div className={`p-2 rounded-full ${shipmentStatus[order.ShipmentStatus]?.bgColor} shrink-0`}>
                            {shipmentStatus[order.ShipmentStatus]?.icon}
                          </div>
                          <div className="min-w-0">
                            <h2 className="font-semibold text-base text-[#279185] truncate">#{order.InvoiceNo}</h2>
                            <p className="text-xs text-gray-500 truncate">{order.CustomerName}</p>
                          </div>
                        </div>

                        <div className="col-span-3 flex items-center justify-center gap-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full border bg-red-50 text-red-600 border-red-400">
                            Unpaid
                          </span>
                          <span
                            className="text-xs font-medium px-1.5 py-[4.2px] border rounded text-center"
                            style={{
                              backgroundColor: shipmentStatus[order.ShipmentStatus]?.bgColor,
                              color: shipmentStatus[order.ShipmentStatus]?.color,
                              borderColor: shipmentStatus[order.ShipmentStatus]?.color,
                            }}
                          >
                            {shipmentStatus[order.ShipmentStatus]?.label}
                          </span>
                        </div>

                        <div className="col-span-4 flex items-center justify-end gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-gray-600 text-sm">{order.Total.toFixed(2)} Tk</p>
                            <p className="text-xs text-gray-500">{formatDate(order.OrderDate)}</p>
                          </div>
                          <button
                            onClick={() => toggleOrder(order.OrderId)}
                            className={`w-7 h-7 flex items-center justify-center border transition-all duration-200
                              ${expandedOrders[order.OrderId]
                                ? 'bg-teal-50 border-teal-400'
                                : 'bg-white border-gray-200 hover:border-teal-400 hover:bg-teal-50'}`}
                          >
                            <HiPlus
                              className={`w-4 h-4 transition-transform duration-300 ease-in-out
                                ${expandedOrders[order.OrderId] ? 'rotate-45 text-teal-600' : 'text-gray-400'}`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Expanded */}
                      <AnimatePresence>
                        {expandedOrders[order.OrderId] && (
                          <motion.div
                            key={`exp-${order.OrderId}`}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t-2 border-teal-500">

                              {/* Summary strip */}
                              <div className="bg-teal-50 border-b border-teal-100 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-teal-600 flex items-center justify-center shrink-0">
                                    <span className="text-white text-sm font-bold">{order.CustomerName?.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900 leading-none">{order.CustomerName}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{order.Email || order.Phone}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6 flex-wrap">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Invoice</p>
                                    <p className="text-sm font-bold text-teal-700">#{order.InvoiceNo}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Date</p>
                                    <p className="text-sm font-medium text-gray-700">{formatDate(order.OrderDate)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Amount Due</p>
                                    <p className="text-xl font-bold text-red-600 leading-none">{order.Total.toFixed(2)} Tk</p>
                                  </div>
                                </div>
                              </div>

                              {/* Body */}
                              <div className="grid grid-cols-1 lg:grid-cols-12 bg-white">

                                {/* Left: Ship To + Payment */}
                                <div className="lg:col-span-4 border-r border-gray-200 p-5 space-y-5">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-600 mb-2">Ship To</p>
                                    <p className="text-sm font-semibold text-gray-800">{order.CustomerName}</p>
                                    <p className="text-sm text-gray-600 mt-0.5">{order.ShippingAddress}</p>
                                    <p className="text-sm text-gray-600">{order.ShippingArea}, {order.ShippingCity}</p>
                                    <p className="text-sm text-gray-500 mt-1">{order.Phone}</p>
                                    {order.ShippingPhone && order.ShippingPhone !== order.Phone && (
                                      <p className="text-xs text-gray-400">Ship: {order.ShippingPhone}</p>
                                    )}
                                  </div>

                                  <div className="border-t border-dashed border-gray-200" />

                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-600 mb-2">Payment Method</p>
                                    <p className="text-sm font-semibold text-gray-800">{order.PaymentMethod}</p>
                                    {order.TransactionId && (
                                      <p className="text-xs text-gray-400 mt-0.5 break-all">{order.TransactionId}</p>
                                    )}
                                  </div>

                                  {order.Notes?.trim() && (
                                    <>
                                      <div className="border-t border-dashed border-gray-200" />
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-teal-600 mb-2">Customer Notes</p>
                                        <p className="text-xs text-gray-600 bg-amber-50 border-l-2 border-amber-400 pl-3 py-2">{order.Notes}</p>
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* Right: Items + Totals */}
                                <div className="lg:col-span-8 flex flex-col">

                                  {/* Column headers */}
                                  <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-5 py-2">
                                    <div className="col-span-7 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">Product</div>
                                    <div className="col-span-2 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 text-center">Qty</div>
                                    <div className="col-span-3 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 text-right">Total</div>
                                  </div>

                                  {/* Items */}
                                  <div className="divide-y divide-gray-100 overflow-y-auto no-scrollbar" style={{ maxHeight: '220px' }}>
                                    {order.items?.map((item, idx) => (
                                      <div key={idx} className="grid grid-cols-12 items-center px-5 py-3 gap-2 hover:bg-gray-50 transition-colors">
                                        <div className="col-span-7 flex items-center gap-3">
                                          <div className="w-11 h-11 bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                            <Image src={item.Image} alt={item.Name} width={44} height={44} className="w-full h-full object-cover" />
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.Name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                              {[item.Brand, item.SelectedColor && `Color: ${item.SelectedColor.trim()}`, item.SelectedSize && `Size: ${item.SelectedSize}`].filter(Boolean).join(' · ')}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="col-span-2 text-sm text-gray-600 text-center">{item.Quantity}</div>
                                        <div className="col-span-3 text-right">
                                          <p className="text-sm font-semibold text-gray-800">{(item.DiscountedPrice * item.Quantity).toFixed(2)} Tk</p>
                                          <p className="text-xs text-gray-400">{item.DiscountedPrice.toFixed(2)} ea.</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Totals */}
                                  <div className="mt-auto border-t-2 border-teal-500 bg-gray-50 px-5 py-4">
                                    <div className="flex justify-end">
                                      <div className="w-60 space-y-1.5">
                                        <div className="flex justify-between text-xs text-gray-500">
                                          <span>Subtotal</span><span>{order.Subtotal.toFixed(2)} Tk</span>
                                        </div>
                                        {order.TotalVat > 0 && (
                                          <div className="flex justify-between text-xs text-gray-500">
                                            <span>VAT</span><span>+{order.TotalVat.toFixed(2)} Tk</span>
                                          </div>
                                        )}
                                        {order.Discount > 0 && (
                                          <div className="flex justify-between text-xs text-gray-500">
                                            <span>Discount {order.CouponCode ? `(${order.CouponCode})` : ''}</span>
                                            <span className="text-red-500">−{order.Discount.toFixed(2)} Tk</span>
                                          </div>
                                        )}
                                        {order.DeliveryCharge > 0 && (
                                          <div className="flex justify-between text-xs text-gray-500">
                                            <span>Delivery Charge</span><span>+{order.DeliveryCharge.toFixed(2)} Tk</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between items-baseline border-t border-gray-300 pt-2">
                                          <span className="text-xs font-bold uppercase tracking-widest text-gray-700">Total Due</span>
                                          <span className="text-lg font-bold text-red-600">{order.Total.toFixed(2)} Tk</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action bar */}
                              <div className="bg-white border-t border-gray-200 px-5 py-2.5 flex items-center justify-end">
                                <button
                                  className="px-5 py-2 text-xs font-bold uppercase tracking-wide border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                  onClick={() => handlePrintInvoice(order)}
                                >
                                  Print Invoice
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
                      {searchTerm ? 'No orders match your search' : 'No due orders found'}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {searchTerm ? 'Try a different search term' : 'All delivered orders are paid'}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </>
  );
}
