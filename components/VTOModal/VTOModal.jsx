'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPhone, FiMail, FiCalendar, FiArrowRight, FiLock } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';

const STORAGE_KEY = 'vto_user_info';

const INITIAL_FORM = { phone: '', email: '', dob: '' };

export default function VTOModal({ isOpen, onClose, onConfirm }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const dobRef = useRef(null);

  const resetFormState = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setFocused(null);
    setSubmitted(false);
  };

  const handleClose = () => {
    resetFormState();
    onClose?.();
  };

  const validate = () => {
    const e = {};

    if (!form.phone.trim()) e.phone = 'Required';
    else if (!/^[+]?[\d\s\-()]{7,15}$/.test(form.phone.trim())) e.phone = 'Invalid phone number';

    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = 'Invalid email';

    if (!form.dob) e.dob = 'Required';
    else {
      const age = (new Date() - new Date(form.dob)) / (1000 * 60 * 60 * 24 * 365.25);
      if (age < 13) e.dob = 'Must be 13+';
      if (age > 120) e.dob = 'Invalid date';
    }

    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitted(true);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch {}

    setTimeout(() => {
      resetFormState();
      onConfirm?.();
    }, 600);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const fields = [
    {
      key: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: '+880 1XXX-XXXXXX',
      icon: FiPhone,
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      icon: FiMail,
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      type: 'date',
      placeholder: '',
      icon: FiCalendar,
      max: new Date().toISOString().split('T')[0],
    },
  ];

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
            onClick={handleClose}
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
              <div className="relative bg-linear-to-br from-[#32BBAB] via-[#2dd4bf] to-[#0d9488] px-5 pt-5 pb-7">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>

                <div className="relative flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 shrink-0">
                    <HiSparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white/65 text-[10px] font-bold uppercase tracking-[0.2em]">
                      Mingle In Style
                    </p>
                    <h2 className="text-white text-base font-extrabold leading-tight">
                      Virtual Try-On
                    </h2>
                  </div>
                </div>

                <p className="relative text-white/75 text-xs mt-1.5 leading-snug">
                  Quick details before we dress you up ✨
                </p>
              </div>

              <div className="-mt-4 bg-white rounded-t-2xl relative z-10 px-5 pb-5 pt-4">
                <form onSubmit={handleSubmit} noValidate className="space-y-3">
                  {fields.map(({ key, label, type, placeholder, icon: Icon, max }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {label}
                      </label>

                      <div
                        onClick={() => {
                          if (key === 'dob' && dobRef.current) {
                            try {
                              dobRef.current.showPicker();
                            } catch {
                              dobRef.current.focus();
                            }
                          }
                        }}
                        className={`flex items-center rounded-xl border-2 transition-all duration-200
                          ${key === 'dob' ? 'cursor-pointer' : ''}
                          ${
                            errors[key]
                              ? 'border-red-400 bg-red-50'
                              : focused === key
                              ? 'border-[#32BBAB] bg-white shadow-sm shadow-[#32BBAB]/10'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                      >
                        <div
                          className={`pl-3 shrink-0 transition-colors
                            ${
                              focused === key
                                ? 'text-[#32BBAB]'
                                : errors[key]
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        <input
                          ref={key === 'dob' ? dobRef : undefined}
                          type={type}
                          value={form[key]}
                          placeholder={placeholder}
                          max={max}
                          onChange={(e) => handleChange(key, e.target.value)}
                          onFocus={() => setFocused(key)}
                          onBlur={() => setFocused(null)}
                          className="flex-1 bg-transparent px-2.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none font-medium"
                        />

                        {errors[key] && (
                          <span className="pr-3 text-[10px] text-red-500 font-semibold whitespace-nowrap">
                            {errors[key]}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                    <FiLock className="w-3 h-3 text-gray-400 shrink-0" />
                    <p className="text-[10px] text-gray-400 leading-snug">
                      Your info stays private — never shared with third parties.
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300
                      ${
                        submitted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                  >
                    {submitted ? (
                      <>
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-base">
                          ✓
                        </motion.span>
                        <span>Opening Try-On Studio…</span>
                      </>
                    ) : (
                      <>
                        <HiSparkles className="w-4 h-4" />
                        <span>Enter Virtual Try-On</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}