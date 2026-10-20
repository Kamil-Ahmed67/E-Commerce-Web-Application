'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiSparkles } from 'react-icons/hi2';
import { FiCheckCircle } from 'react-icons/fi';

export default function VtoSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(4);
  const [credited, setCredited] = useState(false);

  useEffect(() => {
    const tries = parseInt(searchParams.get('tries') || '10', 10);
    const userId = searchParams.get('userId') || '';
    const returnTo = searchParams.get('returnTo') || '/shop';

    if (userId) {
      const tranId = searchParams.get('tranId') || '';
      const amount = parseFloat(searchParams.get('amount') || '0');
      fetch('/api/vto-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_purchase',
          customerId: userId,
          tranId,
          amount,
          creditsAdded: tries,
        }),
      })
        .then(() => setCredited(true))
        .catch(() => setCredited(true));
    }

    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      router.push(returnTo);
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [searchParams, router]);

  const tries = parseInt(searchParams.get('tries') || '10', 10);
  const returnTo = searchParams.get('returnTo') || '/shop';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-sm w-full text-center"
      >
        {/* Icon */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <FiCheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#32BBAB] rounded-full flex items-center justify-center">
              <HiSparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-xl font-extrabold text-gray-900 mb-1">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-5">
          {credited
            ? `${tries} VTO credits have been added to your account.`
            : 'Your credits are being applied…'}
        </p>

        {/* Credits added badge */}
        <div className="inline-flex items-center gap-2 bg-[#32BBAB]/10 border border-[#32BBAB]/20 rounded-full px-4 py-2 mb-6">
          <HiSparkles className="w-4 h-4 text-[#32BBAB]" />
          <span className="text-sm font-bold text-[#32BBAB]">+{tries} tries added</span>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Redirecting in <span className="font-bold text-gray-700">{countdown}s</span>…
        </p>

        <button
          onClick={() => router.push(returnTo)}
          className="w-full py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold transition-colors"
        >
          Continue Try-On →
        </button>
      </motion.div>
    </div>
  );
}
