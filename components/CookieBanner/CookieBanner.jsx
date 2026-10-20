'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieBanner({ show, onAcceptAll, onRejectAll, onSavePreferences }) {
  const [showManage, setShowManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            {!showManage ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <p className="flex-1 text-sm text-gray-600">
                  We use cookies to improve your experience and show relevant ads.{' '}
                  <a href="/privacy-policy" className="underline hover:text-black">Learn more</a>
                </p>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    onClick={() => setShowManage(true)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Manage Preferences
                  </button>
                  <button
                    onClick={onRejectAll}
                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={onAcceptAll}
                    className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-semibold text-gray-800">Manage Cookie Preferences</p>

                <div className="flex flex-col gap-3">
                  <Toggle
                    label="Essential"
                    description="Login, cart, and security. Always active."
                    checked={true}
                    disabled
                  />
                  <Toggle
                    label="Analytics"
                    description="Helps us understand how visitors use the site (Google Analytics)."
                    checked={analytics}
                    onChange={setAnalytics}
                  />
                  <Toggle
                    label="Marketing"
                    description="Personalised ads from Meta (Facebook/Instagram) and TikTok."
                    checked={marketing}
                    onChange={setMarketing}
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowManage(false)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => onSavePreferences({ analytics, marketing })}
                    className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors"
                  >
                    Save My Choices
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none
          ${checked ? 'bg-black' : 'bg-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white shadow transform transition-transform
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}
