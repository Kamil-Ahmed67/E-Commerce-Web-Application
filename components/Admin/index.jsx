"use client";
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiShoppingCart, FiTrendingUp, FiPackage } from 'react-icons/fi';
import config from '@/config';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic imports with loading states
const PieChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Pie),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
);

const BarChart = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  {
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
  }
);

// Register Chart.js components
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function AnimatedNumber({ value, duration = 1000, decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);
  const start = useRef(null);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (currentTime) => {
      if (!start.current) start.current = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const current = value * progress;
      setDisplayValue(Number(current.toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration, decimals]);

  return <>{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals })}</>;
}

export default function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}api/EOrder/GetOrderWithItems`, {
          headers: {
            'TenantId': config.tenantId,
          },
          cache: 'force-cache'
        });

        if (!response.ok) throw new Error('Failed to fetch order data');

        const data = await response.json();

        const ordersMap = {};
        data.forEach(item => {
          if (!ordersMap[item.OrderId]) {
            ordersMap[item.OrderId] = {
              OrderId: item.OrderId,
              Total: item.Total,
              OrderDate: item.OrderDate,
              ShipmentStatus: item.ShipmentStatus
            };
          }
        });

        setOrders(Object.values(ordersMap));
      } catch (err) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, []);

  // Data processing
  const validOrders = useMemo(() => 
    orders.filter(order => order.ShipmentStatus !== -1), 
    [orders]
  );

  const totalRevenue = validOrders.reduce((sum, order) => sum + order.Total, 0);
  const totalOrdersCount = validOrders.length;

  const newOrdersCount = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return orders.filter(order => new Date(order.OrderDate) >= sevenDaysAgo).length;
  }, [orders]);

  const pendingOrdersCount = orders.filter(order => order.ShipmentStatus === 0).length;

  // Pie chart data
  const pieChartData = useMemo(() => {
    const statusCounts = {
      pending: orders.filter(order => order.ShipmentStatus === 0).length,
      processing: orders.filter(order => order.ShipmentStatus === 1).length,
      shipped: orders.filter(order => order.ShipmentStatus === 2).length,
      delivered: orders.filter(order => order.ShipmentStatus === 3).length,
      cancelled: orders.filter(order => order.ShipmentStatus === -1).length,
    };

    const labels = Object.keys(statusCounts)
      .filter(key => statusCounts[key] > 0)
      .map(key => {
        switch (key) {
          case 'pending': return 'Pending';
          case 'processing': return 'Processing';
          case 'shipped': return 'Shipped';
          case 'delivered': return 'Delivered';
          case 'cancelled': return 'Cancelled';
          default: return key;
        }
      });

    const data = Object.values(statusCounts).filter(count => count > 0);

    const backgroundColors = [
      'rgba(245, 158, 11, 0.8)',   // yellow
      'rgba(59, 130, 246, 0.8)',   // blue
      'rgba(16, 185, 129, 0.8)',   // green
      'rgba(139, 92, 246, 0.8)',   // purple
      'rgba(239, 68, 68, 0.8)',    // red
    ];

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors.slice(0, data.length),
        borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
        borderWidth: 1,
      }]
    };
  }, [orders]);

  // Bar chart data (last 7 days)
  const barChartData = useMemo(() => {
    const now = new Date();
    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      const dateString = date.toISOString().split('T')[0];
      const dayRevenue = orders
        .filter(order => order.OrderDate.includes(dateString))
        .reduce((sum, order) => sum + order.Total, 0);

      data.push(dayRevenue);
    }

    return {
      labels,
      datasets: [{
        label: 'Revenue (BDT)',
        data,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 1,
      }]
    };
  }, [orders]);

  const formatCurrency = (value) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECF0F4] pt-4">
        <div className="max-w-292.5 w-full mx-auto px-2 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white h-32 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 mt-6">
            <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#ECF0F4] pt-4 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-xl max-w-md mx-auto">
          Error loading statistics: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECF0F4] pt-4 pb-2">
      <div className="px-2 sm:px-8 xl:px-0">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-sm border border-blue-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  TOTAL REVENUE
                </p>
                <div className="flex items-end">
                  <span className="text-2xl font-bold text-blue-600">
                    <AnimatedNumber value={totalRevenue} decimals={2} />
                  </span>
                  <span className="text-xs text-gray-500 ml-1 mb-1">BDT</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white p-6 rounded-sm border border-green-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  TOTAL ORDERS
                </p>
                <span className="text-2xl font-bold text-green-600">
                  <AnimatedNumber value={totalOrdersCount} />
                </span>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <FiShoppingCart className="text-green-500" size={20} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white p-6 rounded-sm border border-purple-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  NEW ORDERS (7D)
                </p>
                <span className="text-2xl font-bold text-purple-600">
                  <AnimatedNumber value={newOrdersCount} />
                </span>
              </div>
              <div className="p-3 rounded-lg bg-purple-50">
                <FiTrendingUp className="text-purple-500" size={20} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white p-6 rounded-sm border border-orange-200 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  PENDING ORDERS
                </p>
                <span className="text-2xl font-bold text-orange-600">
                  <AnimatedNumber value={pendingOrdersCount} />
                </span>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <FiPackage className="text-orange-500" size={20} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 sm:p-6 rounded-sm shadow-sm border border-gray-100 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-700 mb-4">Order Status Distribution</h3>
              <div className="h-48 sm:h-64 w-full relative">
                <PieChart
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: dimensions.width < 1024 ? 'bottom' : 'right',
                        labels: {
                          boxWidth: 12,
                          padding: 12,
                          font: {
                            size: dimensions.width < 640 ? 10 : 12
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((Number(value) / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-medium text-gray-700 mb-4">Revenue Trend (Last 7 Days)</h3>
              <div className="h-48 sm:h-64 w-full relative">
                <BarChart
                  data={barChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `BDT ${formatCurrency(Number(value))}`,
                          font: {
                            size: dimensions.width < 640 ? 10 : 12
                          }
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            size: dimensions.width < 640 ? 10 : 12
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: {
                          font: {
                            size: dimensions.width < 640 ? 10 : 12
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${formatCurrency(Number(value))}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-50 p-5 rounded">
            <h3 className="text-md font-medium text-gray-700 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {pieChartData.labels.map((label, index) => (
                <div key={index} className="flex items-center bg-white p-3 rounded shadow-xs hover:shadow-sm transition-shadow">
                  <span
                    className="w-2 h-2 rounded-full mr-3"
                    style={{ backgroundColor: pieChartData.datasets[0].backgroundColor[index] }}
                  ></span>
                  <span className="text-sm font-medium text-gray-700">
                    {pieChartData.datasets[0].data[index]} {label.toLowerCase()} orders
                  </span>
                </div>
              ))}
              <div className="flex items-center bg-white p-3 rounded-lg shadow-xs hover:shadow-sm transition-shadow">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                <span className="text-sm font-medium text-gray-700">
                  {newOrdersCount} new orders in last 7 days
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}