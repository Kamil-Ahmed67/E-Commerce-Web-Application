"use client";
import config from "@/config";
import { useFeatures } from "@/hooks/useFeatures";
import { useState } from "react";

const Coupon = ({ onApplyCoupon, subtotal }) => {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { features, loading } = useFeatures();
  const isCouponEnabled = features?.enable_coupon === true;
  // Don't render anything if coupon feature is disabled
  if (!isCouponEnabled && !loading) {
    return null;
  }
   // Show loading state while checking features
  if (loading) {
    return (
      <div className="mt-6">
        <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-20 bg-gray-200 animate-pulse rounded mt-2"></div>
      </div>
    );
  }
  const handleApply = async () => {
    if (!couponCode.trim() || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${config.API_BASE_URL}api/Procedure/GetData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TenantId': config.tenantId
        },
        body: JSON.stringify({
          operation: "",
          procedureName: "SP_EcomItem",
          parameters: {
            QueryChecker: 4,
            Code: couponCode.trim()
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate coupon');
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error('Invalid coupon code');
      }

      const coupon = data[0];
      const discountAmount = coupon.Type === "flat"
        ? coupon.Value
        : (subtotal * coupon.PercentValue / 100);

      onApplyCoupon(couponCode, discountAmount);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid coupon code";
      setError(errorMessage);
      onApplyCoupon("", 0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white mt-5">
      <div className="py-1 px-1">
        <h3 className="font-medium text-lg text-start text-gray-500">Have any Coupon Code?</h3>
      </div>

      <div className="py-2 px-1">
        <div className="flex gap-2">
          <input
            type="text"
            name="coupon"
            id="coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="Enter coupon code"
            className="rounded-sm border border-gray-300 bg-gray-100 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-teal-500/20"
            disabled={isLoading}
          />

          <button
            type="button"
            onClick={handleApply}
            disabled={isLoading || !couponCode.trim()}
            className={`inline-flex items-center justify-center font-medium text-white text-sm bg-teal-600 py-2 px-3 rounded-sm cursor-pointer ease-out duration-200 hover:bg-teal-900 ${isLoading || !couponCode.trim() ? "opacity-75" : ""
              }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Apply"
            )}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default Coupon;