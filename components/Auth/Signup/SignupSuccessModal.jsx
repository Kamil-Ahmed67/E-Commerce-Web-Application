'use client';

import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiArrowRight } from "react-icons/fi";

const SignupSuccessModal = ({ open, onLogin }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            <div className="h-1.5 w-full bg-linear-to-r from-teal-500 to-[#32BBAB]" />

            <div className="px-7 pt-9 pb-8 text-center">
              <motion.div
                className="relative mx-auto mb-5 flex h-18 w-18 items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
              >
                <span className="absolute inset-0 rounded-full bg-[#32BBAB]/15 animate-ping" />
                <span className="absolute inset-0 rounded-full bg-linear-to-br from-teal-400 to-[#279487]" />
                <FiCheck className="relative h-9 w-9 text-white" strokeWidth={3} />
              </motion.div>

              <motion.h3
                className="text-xl font-bold text-gray-900"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                You&apos;re All Set!
              </motion.h3>
              <motion.p
                className="mt-2 text-sm leading-relaxed text-gray-500"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                Your account has been created successfully. Log in now to start exploring Mingle in Style.
              </motion.p>

              <motion.button
                type="button"
                onClick={onLogin}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-teal-500 to-[#32BBAB] py-3 px-4 text-base font-medium text-white shadow-sm transition hover:from-[#3c7871] hover:to-[#32BBAB] focus:outline-none focus:ring-2 focus:ring-[#32BBAB] focus:ring-offset-2"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Log In Now
                <FiArrowRight className="h-4.5 w-4.5" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SignupSuccessModal;
