"use client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiLogIn, FiUser } from "react-icons/fi";

const CheckoutAuthModal = ({ isOpen, onClose, onGuestCheckout }) => {
  const router = useRouter();

  const handleSignInClick = (e) => {
    e.preventDefault();
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    router.push('/signin');
    onClose();
  };

  const handleGuestCheckout = () => {
    onGuestCheckout(); // Call the passed function
    onClose();
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        mass: 0.5
      } 
    },
    exit: { opacity: 0, y: 50, scale: 0.95 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative"
            variants={modalVariants}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Continue to Checkout</h2>
              <p className="text-gray-600 mt-1">Please choose how you&apos;d like to proceed</p>
            </div>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignInClick}
                className="w-full flex items-center justify-center gap-2 bg-[#32BBAB] hover:bg-[#2aa899] text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <FiLogIn className="h-5 w-5" />
                Sign In to Your Account
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGuestCheckout}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                <FiUser className="h-5 w-5" />
                Continue as Guest
              </motion.button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Sign in for faster checkout and order tracking</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutAuthModal;