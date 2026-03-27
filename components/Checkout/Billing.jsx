// components/Billing.jsx
'use client';
import { getDistricts, getSubDistrictsByDistrict } from "@/lib/server/addressData";
import { useState, useEffect } from "react";
import SearchableDropdown from "../SearchableDropdown/SearchableDropdown";
const Billing = ({
  data,
  onChange,
  onDistrictChange,
  onSubDistrictChange,
  onSameAsBillingChange,
  isSameAsBilling
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

  const districtOptions = districts.map(district => ({
    id: district.id,
    name: district.name
  }));

  const subDistrictOptions = subDistricts.map(subDistrict => ({
    id: subDistrict.id,
    name: subDistrict.name
  }));

  return (
    <div className="mt-2">
      <div className="bg-white shadow-1 rounded-sm p-4 sm:p-8.5">
        <h2 className="font-medium text-gray-700 text-xl sm:text-2xl mb-3">
          Billing details
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-x-5">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-8 mb-3">
            <div className="w-full">
              <label htmlFor="firstName" className="block text-sm mb-2">
                Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={data.name}
                onChange={onChange}
                placeholder="Enter your name"
                className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="companyName" className="block text-sm mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={data.phone}
              onChange={onChange}
              className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="Email" className="block text-sm mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={data.email}
              onChange={onChange}
              className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="block text-sm mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={data.address}
              onChange={onChange}
              placeholder="House number and street name"
              className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="district" className="block text-sm mb-2">
              District <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="rounded border border-gray-300 w-full py-1.5 px-5 text-gray-500">
                Loading districts...
              </div>
            ) : (
              <SearchableDropdown
                options={districtOptions}
                value={data.districtId}
                onChange={onDistrictChange}
                placeholder="Select district"
              />
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="subDistrict" className="block text-sm mb-2">
              Sub-district <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              options={subDistrictOptions}
              value={data.subDistrictId}
              onChange={onSubDistrictChange}
              placeholder="Select sub-district"
              disabled={!data.districtId}
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isSameAsBilling}
              onChange={(e) => onSameAsBillingChange(e.target.checked)}
              className="rounded border-gray-300 text-blue focus:ring-blue-500/20"
            />
            <span className="ml-2 text-sm">Is the billing address and shipping address same?</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Billing;