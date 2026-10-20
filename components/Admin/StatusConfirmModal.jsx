"use client";
import { motion, AnimatePresence } from "framer-motion";

const statusLabels = {
  [-1]: 'Cancelled',
  0: 'Pending',
  1: 'Processing',
  2: 'Shipped',
  3: 'Delivered',
};

const statusColors = {
  [-1]: 'text-red-600',
  0: 'text-orange-500',
  1: 'text-blue-600',
  2: 'text-green-600',
  3: 'text-purple-600',
};

export default function StatusConfirmModal({ pendingStatusChange, onConfirm, onCancel }) {
  if (!pendingStatusChange) return null;

  const { order, newStatus } = pendingStatusChange;
  const label = statusLabels[newStatus] ?? 'Unknown';
  const color = statusColors[newStatus] ?? 'text-gray-700';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gray-700/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white shadow-2xl rounded p-6 w-full max-w-md border border-gray-100"
        >
          <motion.div
            className="mx-auto mb-3 flex justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </motion.div>

          <h3 className="text-xl font-bold text-gray-700 text-center mb-2">
            Confirm Status Change
          </h3>

          <p className="text-sm text-gray-600 text-center mb-1">
            Order <span className="font-semibold">#{order.InvoiceNo}</span>
          </p>
          <p className="text-sm text-gray-600 text-center mb-6">
            Are you sure you want to change the status to{' '}
            <span className={`font-semibold ${color}`}>{label}</span>?
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-sm font-medium rounded border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 text-sm font-medium rounded bg-[#32BBAB] hover:bg-[#258d81] text-white shadow-md transition-all"
            >
              Yes, Update
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
