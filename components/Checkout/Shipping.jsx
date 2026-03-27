'use client';
import { getDistricts, getSubDistrictsByDistrict } from "@/lib/server/addressData";
import { useState, useEffect } from "react";
import SearchableDropdown from "../SearchableDropdown/SearchableDropdown";
const Shipping = ({
  data,
  onChange,
  onDistrictChange,
  onSubDistrictChange,
  disabled = false,
}) => {
  const [dropdown, setDropdown] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Load districts once ──
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

  // ── Load sub-districts when district changes ──
  useEffect(() => {
    const fetchSubDistricts = async () => {
      if (data.districtId2) {
        try {
          const subDistrictsData = await getSubDistrictsByDistrict(data.districtId2);
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
  }, [data.districtId2]);

  const districtOptions = districts.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  const subDistrictOptions = subDistricts.map((sd) => ({
    id: sd.id,
    name: sd.name,
  }));

  return (
    <div className="bg-white shadow-1 rounded mt-2">
      {/* Toggle */}
      <div
        onClick={() => !disabled && setDropdown((prev) => !prev)}
        className={`cursor-pointer flex items-center gap-2.5 font-medium text-lg py-5 px-5.5 ${
          disabled ? "text-gray-400" : "text-gray-700"
        }`}
      >
        Ship to a different address?
        <svg
          className={`fill-current ease-out duration-500 ${dropdown && "rotate-180"}`}
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
            fill=""
          />
        </svg>
      </div>

      {/* Form – hidden when collapsed */}
      <div className={`p-4 sm:p-8.5 ${dropdown ? "block" : "hidden"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-x-5">
          {/* Name */}
          <div className="mb-2.5">
            <label htmlFor="name2" className="block mb-2 text-sm">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name2"
              value={data.name2}
              onChange={onChange}
              className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Phone */}
          <div className="mb-2.5">
            <label htmlFor="phone2" className="block mb-2 text-sm">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone2"
              value={data.phone2}
              onChange={onChange}
              className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Email */}
          <div className="mb-2.5">
            <label htmlFor="email2" className="block mb-2 text-sm">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email2"
              value={data.email2}
              onChange={onChange}
              className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* Address */}
          <div className="mb-2.5">
            <label htmlFor="address2" className="block text-sm mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address2"
              value={data.address2}
              onChange={onChange}
              placeholder="House number and street name"
              disabled={disabled}
              className="rounded border border-gray-300 placeholder:text-gray-500 w-full py-1.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* District */}
          <div className="mb-2.5">
            <label htmlFor="district2" className="block text-sm mb-2">
              District <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="rounded border border-gray-300 w-full py-1.5 px-5 text-gray-500">
                Loading districts...
              </div>
            ) : (
              <SearchableDropdown
                options={districtOptions}
                value={data.districtId2}
                onChange={onDistrictChange}
                placeholder="Select district"
                disabled={disabled}
              />
            )}
          </div>

          {/* Sub-district */}
          <div className="mb-2.5">
            <label htmlFor="subDistrict2" className="block text-sm mb-2">
              Sub-district <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              options={subDistrictOptions}
              value={data.subDistrictId2}
              onChange={onSubDistrictChange}
              placeholder="Select sub-district"
              disabled={!data.districtId2 || disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;