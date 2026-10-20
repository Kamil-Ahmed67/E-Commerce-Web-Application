'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZap, FiLock, FiArrowRight } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { initiateSSLCommerzPayment } from '@/app/utils/sslcommerzService';
import toast from 'react-hot-toast';

const VTO_PACK_TRIES = 5;
const VTO_PACK_PRICE = 10;

export default function VtoCreditModal({ isOpen, onClose, loginData, currentProductId }) {
  const [loading, setLoading] = useState(false);

  const userId = loginData?.Id || loginData?.CustomerId || loginData?.Email || 'guest';

  const handlePay = async () => {
    if (!loginData) {
      toast.error('Please log in first');
      return;
    }
    setLoading(true);
    try {
      const tranId = `VTO-${userId}-${Date.now()}`;
      const origin = window.location.origin;
      const returnPath = currentProductId ? `/vto/${currentProductId}` : '/shop';

      const result = await initiateSSLCommerzPayment(
        VTO_PACK_PRICE,
        tranId,
        {
          name: loginData.Name || loginData.FullName || 'Customer',
          email: loginData.Email || '',
          phone: loginData.Phone || loginData.Mobile || '',
          address: 'N/A',
          city: 'N/A',
          postcode: 'N/A',
          area: 'N/A',
        },
        `${origin}/vto/success?tries=${VTO_PACK_TRIES}&userId=${encodeURIComponent(userId)}&tranId=${encodeURIComponent(tranId)}&amount=${VTO_PACK_PRICE}&returnTo=${encodeURIComponent(returnPath)}`,
        `${origin}${returnPath}?vto_cancel=1`,
        `${origin}${returnPath}?vto_fail=1`,
        `${origin}/api/payment/ipn`,
        [{ product_name: 'VTO Credit Pack', unit_price: VTO_PACK_PRICE, quantity: 1 }],
        userId,
        { value_c: JSON.stringify({ type: 'vto_pack', tries: VTO_PACK_TRIES }) }
      );

      window.location.href = result.gateway_url;
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-300 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="fixed inset-0 z-301 flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-5 pt-5 pb-7">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#32BBAB]/10 rounded-full blur-2xl" />

                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-7 h-7 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>

                <div className="relative flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-[#32BBAB]/20 rounded-xl flex items-center justify-center border border-[#32BBAB]/30 shrink-0">
                    <FiLock className="w-4 h-4 text-[#32BBAB]" />
                  </div>
                  <div>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                      Virtual Try-On
                    </p>
                    <h2 className="text-white text-base font-extrabold leading-tight">
                      Free Tries Used
                    </h2>
                  </div>
                </div>

                <p className="relative text-white/60 text-xs mt-1.5 leading-snug">
                  You&apos;ve used your 2 free tries. Get more to keep experimenting.
                </p>
              </div>

              {/* Body */}
              <div className="-mt-4 bg-white rounded-t-2xl relative z-10 px-5 pb-5 pt-4">

                {/* Pack card */}
                <div className="border-2 border-[#32BBAB] rounded-xl p-4 mb-4 bg-[#32BBAB]/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <HiSparkles className="w-4 h-4 text-[#32BBAB]" />
                      <span className="text-sm font-extrabold text-gray-900">Credit Pack</span>
                    </div>
                    <span className="text-xs bg-[#32BBAB] text-white font-bold px-2 py-0.5 rounded-full">Best Value</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900">৳{VTO_PACK_PRICE}</span>
                    <span className="text-gray-400 text-xs font-medium">/ {VTO_PACK_TRIES} tries</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Only ৳{(VTO_PACK_PRICE / VTO_PACK_TRIES).toFixed(1)} per try</p>
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 mb-4">
                  <FiZap className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-400 leading-snug">
                    Credits are saved to your account and never expire. Securely processed via SSLCommerz.
                  </p>
                </div>

                {/* Pay button */}
                <motion.button
                  onClick={handlePay}
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Redirecting to payment…</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ৳{VTO_PACK_PRICE}</span>
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
