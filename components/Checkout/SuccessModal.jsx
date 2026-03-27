"use client";

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-7 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
        <div className="text-center">
          {/* Animated checkmark circle */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Circle background */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                {/* Animated checkmark */}
                <svg 
                  className="checkmark animate-draw" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 52 52"
                  width="80"
                  height="80"
                >
                  <circle 
                    className="checkmark__circle" 
                    cx="26" 
                    cy="26" 
                    r="24" 
                    fill="none"
                    stroke="#32BBAB"
                    strokeWidth="3"
                  />
                  <path 
                    className="checkmark__check" 
                    fill="none" 
                    stroke="#32BBAB" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully.
          </p>
          <button
            onClick={onClose}
            className="bg-[#32BBAB] text-white font-medium py-2 px-6 rounded-md hover:bg-[#4faa9f] transition duration-200"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;