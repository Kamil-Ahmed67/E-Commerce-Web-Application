import { MdOutlinePayment } from "react-icons/md";
import { TbTruckDelivery } from "react-icons/tb";
import { useFeatures } from "@/hooks/useFeatures"; // IMPORT this

const PaymentMethod = ({
  onPaymentMethodChange,
  currentMethod
}) => {
  // USE the hook
  const { features, loading } = useFeatures();
  
  // Log to see what features are coming
  console.log('PaymentMethod - features:', features);
  console.log('PaymentMethod - loading:', loading);

  // Define which feature keys control which payment methods
  const isCashEnabled = features?.enable_cash_payment === true;
  const isOnlineEnabled = features?.enable_online_payment === true;
  const isPaymentSectionEnabled = features?.enable_payment_methods !== false; // Default to true if not set

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white mt-4">
        <div className="py-2 px-1">
          <div className="h-6 bg-gray-200 animate-pulse w-40 rounded"></div>
        </div>
        <div className="p-2">
          <div className="flex flex-col gap-3">
            <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-16 bg-gray-200 animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // If payment section is explicitly disabled, don't render
  if (features?.enable_payment_methods === false) {
    console.log('Payment section disabled');
    return null;
  }

  // If no payment methods are enabled, don't render
  if (!isCashEnabled && !isOnlineEnabled) {
    console.log('No payment methods enabled');
    return null;
  }

  return (
    <div className="bg-white mt-4">
      <div className="py-2 px-1">
        <h3 className="font-medium text-lg text-gray-700">Payment Method</h3>
      </div>

      <div className="p-2">
        <div className="flex flex-col gap-3">
          {/* Cash On Delivery - Only show if enabled */}
          {isCashEnabled && (
            <label
              htmlFor="cash"
              className="flex cursor-pointer select-none items-center gap-4"
            >
              <div className="relative">
                <input
                  type="radio" // Changed to radio for single selection
                  name="paymentMethod"
                  id="cash"
                  className="sr-only"
                  checked={currentMethod === "cash"}
                  onChange={() => onPaymentMethodChange("cash")}
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    currentMethod === "cash"
                      ? "border-4 border-teal-500"
                      : "border border-gray-400"
                  }`}
                ></div>
              </div>

              <div
                className={`rounded text-gray-600 hover:text-teal-600 transition w-full border-[0.5px] py-2.5 px-5 ease-out duration-200 hover:bg-gray-200 hover:border-transparent hover:shadow-none min-w-60 ${
                  currentMethod === "cash"
                    ? "border-transparent bg-gray-200 text-teal-600"
                    : "border-gray-400 shadow-1"
                }`}
              >
                <div className="flex items-center ">
                  <div className="pr-2.5">
                    <TbTruckDelivery className="text-2xl " />
                  </div>

                  <div className="border-l border-teal-700 pl-2.5">
                    <p>Cash on delivery</p>
                  </div>
                </div>
              </div>
            </label>
          )}

          {/* Online Payment - Only show if enabled */}
          {isOnlineEnabled && (
            <label
              htmlFor="sslcommerz"
              className="flex cursor-pointer select-none items-center gap-4"
            >
              <div className="relative">
                <input
                  type="radio" // Changed to radio for single selection
                  name="paymentMethod"
                  id="sslcommerz"
                  className="sr-only"
                  checked={currentMethod === "sslcommerz"}
                  onChange={() => onPaymentMethodChange("sslcommerz")}
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    currentMethod === "sslcommerz"
                      ? "border-4 border-teal-500"
                      : "border border-gray-400"
                  }`}
                ></div>
              </div>
              <div
                className={`rounded text-gray-600 hover:text-red-600 transition w-full border-[0.5px] py-2.5 px-4 ease-out duration-200 hover:bg-gray-200 hover:border-transparent hover:shadow-none min-w-60 ${
                  currentMethod === "sslcommerz"
                    ? "border-transparent bg-gray-200 text-red-600"
                    : "border-gray-400 shadow-1"
                }`}
              >
                <div className="flex items-center">
                  <div className="pr-3.5">
                    <MdOutlinePayment className="text-2xl " />
                  </div>
                  <div className="border-l border-gray-400 pl-2.5">
                    <p>Pay Online</p>
                  </div>
                </div>
              </div>
            </label>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;