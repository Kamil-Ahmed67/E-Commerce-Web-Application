'use client';

import { motion, AnimatePresence } from 'framer-motion';

function Spinner() {
  return (
    <div className="relative w-16 h-16 mb-5">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <motion.circle
          cx="32" cy="32" r="28" fill="none"
          stroke="#14b8a6" strokeWidth="5" strokeLinecap="round"
          strokeDasharray="175.9"
          animate={{ strokeDashoffset: [175.9, 0, 175.9] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

function Checkmark() {
  return (
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5"
    >
      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <motion.path
          strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        />
      </svg>
    </motion.div>
  );
}

function ModalShell({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function ProcessingModal({ step }) {
  const steps = [
    { key: 'compressing', label: 'Compressing…',  sub: 'Reducing image file sizes.' },
    { key: 'converting',  label: 'Converting…',   sub: 'Converting images to WebP format.' },
    { key: 'done',        label: 'Ready!',         sub: 'Images processed successfully.' },
  ];
  const current      = steps.find(s => s.key === step) || steps[0];
  const currentIndex = steps.findIndex(s => s.key === step);

  return (
    <ModalShell>
      {step === 'done' ? <Checkmark /> : <Spinner />}

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-1">{current.label}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{current.sub}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mt-6">
        {steps.map((s, i) => (
          <motion.div key={s.key}
            animate={{ scale: i === currentIndex ? 1.3 : 1, opacity: i <= currentIndex ? 1 : 0.3 }}
            transition={{ duration: 0.25 }}
            className="w-2 h-2 rounded-full"
            style={{ background: i <= currentIndex ? '#14b8a6' : '#d1d5db' }}
          />
        ))}
      </div>

      {step !== 'done' && (
        <p className="text-xs text-gray-400 mt-4">Please do not close this page.</p>
      )}
    </ModalShell>
  );
}

export function SavingModal({ step }) {
  const steps = [
    { key: 'uploading', label: 'Working…',       sub: 'Uploading your images. This may take a moment.' },
    { key: 'saving',    label: 'Almost there…',  sub: 'Saving your changes. Just a few seconds.' },
    { key: 'done',      label: 'All done!',       sub: 'Your changes have been saved successfully.' },
  ];
  const current      = steps.find(s => s.key === step) || steps[0];
  const currentIndex = steps.findIndex(s => s.key === step);

  return (
    <ModalShell>
      {step === 'done' ? <Checkmark /> : <Spinner />}

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-1">{current.label}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{current.sub}</p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mt-6">
        {steps.map((s, i) => (
          <motion.div key={s.key}
            animate={{ scale: i === currentIndex ? 1.3 : 1, opacity: i <= currentIndex ? 1 : 0.3 }}
            transition={{ duration: 0.25 }}
            className="w-2 h-2 rounded-full"
            style={{ background: i <= currentIndex ? '#14b8a6' : '#d1d5db' }}
          />
        ))}
      </div>

      {step !== 'done' && (
        <p className="text-xs text-gray-400 mt-4">Please do not close this page.</p>
      )}
    </ModalShell>
  );
}
