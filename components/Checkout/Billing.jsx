// components/Billing.jsx
'use client';
import { getDistricts, getSubDistrictsByDistrict } from "@/lib/server/addressData";
import { useState, useEffect } from "react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiGlobe,
  FiHash,
  FiMap,
  FiNavigation,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";
import SearchableDropdown from "../SearchableDropdown/SearchableDropdown";

const FieldError = ({ msg }) =>
  msg ? <p className="text-red-500 text-xs mt-1.5">{msg}</p> : null;

const InputField = ({ icon: Icon, label, optional, error, className = '', onBlur, ...props }) => (
  <div className={className}>
    <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}{' '}
      {optional ? (
        <span className="text-gray-400 font-normal">(Optional)</span>
      ) : (
        <span className="text-red-500">*</span>
      )}
    </label>
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#32BBAB] transition-colors pointer-events-none" />
      )}
      <input
        {...props}
        onBlur={onBlur}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50/60 outline-none transition duration-200 focus:bg-white focus:ring-2 ${
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-500/15'
            : 'border-gray-200 focus:border-[#32BBAB] focus:ring-[#32BBAB]/15'
        }`}
      />
    </div>
    <FieldError msg={error} />
  </div>
);

const Billing = ({
  data,
  onChange,
  onDistrictChange,
  onSubDistrictChange,
  fieldErrors = {},
  onPhoneBlur,
  onSaveAddress,
  isSavingAddress = false,
  isAddressUpdate = false,
  saveConfirmed = false,
}) => {
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const districtsData = await getDistricts();
        setDistricts(districtsData);
      } catch (error) {
        console.error("Error fetching districts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDistricts();
  }, []);

  useEffect(() => {
    const fetchSubDistricts = async () => {
      if (data.districtId) {
        try {
          const subDistrictsData = await getSubDistrictsByDistrict(data.districtId);
          setSubDistricts(subDistrictsData);
        } catch (error) {
          console.error("Error fetching sub-districts:", error);
          setSubDistricts([]);
        }
      } else {
        setSubDistricts([]);
      }
    };
    fetchSubDistricts();
  }, [data.districtId]);

  const districtOptions = districts.map(district => ({ id: district.id, name: district.name }));
  const subDistrictOptions = subDistricts.map(subDistrict => ({ id: subDistrict.id, name: subDistrict.name }));
  const phoneValid = /^\d{11}$/.test(data.phone.trim());

  return (
    <div className="mt-2">
      <div className="bg-white shadow-1 rounded-xl p-5 sm:p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-full bg-[#32BBAB]/10 flex items-center justify-center shrink-0">
            <FiUser className="w-5 h-5 text-[#32BBAB]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 text-lg sm:text-xl">
              Delivery Information
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              We&apos;ll use this to confirm and deliver your order
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              icon={FiUser}
              label="First Name"
              type="text"
              name="name"
              id="name"
              value={data.name}
              onChange={onChange}
              placeholder="Enter your first name"
              error={fieldErrors.name}
            />
            <InputField
              icon={FiUser}
              label="Last Name"
              type="text"
              name="lastName"
              id="lastName"
              value={data.lastName}
              onChange={onChange}
              placeholder="Enter your last name"
              error={fieldErrors.lastName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              icon={FiPhone}
              label="Mobile Number"
              type="text"
              name="phone"
              id="phone"
              value={data.phone}
              onChange={onChange}
              onBlur={(e) => onPhoneBlur?.(e.target.value)}
              placeholder="01XXXXXXXXX"
              error={fieldErrors.phone}
            />
            <InputField
              icon={FiMail}
              label="Email Address"
              type="email"
              name="email"
              id="email"
              value={data.email}
              onChange={onChange}
              placeholder="you@example.com"
              error={fieldErrors.email}
            />
          </div>

          <InputField
            icon={FiMapPin}
            label="Street Address"
            type="text"
            name="address"
            id="address"
            value={data.address}
            onChange={onChange}
            placeholder="House number and street name"
            error={fieldErrors.address}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              icon={FiGlobe}
              label="Country/Region"
              type="text"
              name="country"
              id="country"
              value={data.country}
              onChange={onChange}
              placeholder="Enter your country/region"
              error={fieldErrors.country}
            />
            <InputField
              icon={FiHash}
              label="Zip/Postal Code"
              optional
              type="text"
              name="zipCode"
              id="zipCode"
              value={data.zipCode}
              onChange={onChange}
              placeholder="Enter zip/postal code"
              error={fieldErrors.zipCode}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* District */}
            <div id="billing-district">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                District <span className="text-red-500">*</span>
              </label>
              {loading ? (
                <div className="rounded-lg border border-gray-200 w-full py-2.5 pl-10 pr-4 text-gray-400 text-sm bg-gray-50/60 flex items-center gap-2 relative">
                  <FiLoader className="w-4 h-4 animate-spin absolute left-3.5" />
                  Loading districts...
                </div>
              ) : (
                <SearchableDropdown
                  options={districtOptions}
                  value={data.districtId}
                  onChange={onDistrictChange}
                  placeholder="Select district"
                  icon={FiMap}
                  hasError={!!fieldErrors.districtId}
                />
              )}
              <FieldError msg={fieldErrors.districtId} />
            </div>

            {/* Sub-district */}
            <div id="billing-subdistrict">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                City/Area <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={subDistrictOptions}
                value={data.subDistrictId}
                onChange={onSubDistrictChange}
                placeholder="Select City/Area"
                disabled={!data.districtId}
                icon={FiNavigation}
                hasError={!!fieldErrors.subDistrictId}
              />
              <FieldError msg={fieldErrors.subDistrictId} />
            </div>
          </div>
        </div>

        {/* Save / Update address button */}
        {onSaveAddress && (
          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSaveAddress}
              disabled={!phoneValid || isSavingAddress}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer
                bg-white border border-gray-200 text-gray-700 hover:border-[#32BBAB]/40 hover:bg-[#32BBAB]/5 hover:text-[#279487]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200"
            >
              {isSavingAddress ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  {isAddressUpdate ? 'Update Address' : 'Save Address'}
                </>
              )}
            </button>

            {saveConfirmed && (
              <span className="text-sm text-green-600 flex items-center gap-1.5">
                <FiCheckCircle className="w-4 h-4" />
                {isAddressUpdate ? 'Address Updated!' : 'Address Saved!'}
              </span>
            )}

            {!phoneValid && !isSavingAddress && (
              <span className="text-xs text-gray-400">Phone must be exactly 11 digits to save</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
