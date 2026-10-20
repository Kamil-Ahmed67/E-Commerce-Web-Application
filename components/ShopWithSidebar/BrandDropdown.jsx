"use client";
import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";

const BrandDropdown = forwardRef(({ brands, selectedBrand, onChange }, ref) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [internalSelected, setInternalSelected] = useState(selectedBrand);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useImperativeHandle(ref, () => ({
    reset: () => {
      setInternalSelected(null);
      onChange(null);
    }
  }));

  useEffect(() => {
    setInternalSelected(selectedBrand);
  }, [selectedBrand]);

  const handleBrandChange = (brandName) => {
    const newSelected = internalSelected === brandName ? null : brandName;
    setInternalSelected(newSelected);
    onChange(newSelected);

    const params = new URLSearchParams(searchParams.toString());
    if (newSelected) {
      params.set('brand', newSelected);
    } else {
      params.delete('brand');
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm">
      <button
        type="button"
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`w-full cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${toggleDropdown && "shadow-filter"}`}
      >
        <p className="text-gray-700 font-semibold text-base">Brand</p>
        <span className={`text-gray-700 ease-out duration-200 ${toggleDropdown && "rotate-180"}`}>
          <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z" fill="" />
          </svg>
        </span>
      </button>

      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"}`}>
        {brands.map((brand) => {
          const selected = internalSelected === brand.name;
          return (
            <button
              key={brand.name}
              type="button"
              className={`${selected ? "text-[#32BBAB]" : "text-gray-700"} group flex items-center justify-between ease-out duration-200 hover:text-[#4faa9f] w-full`}
              onClick={() => handleBrandChange(brand.name)}
            >
              <div className="flex items-center gap-2">
                <div className={`cursor-pointer flex items-center justify-center rounded-xs w-4 h-4 border ${selected ? "border-teal-500 bg-teal-500" : "bg-white border-gray-300"}`}>
                  {selected && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {brand.logo && (
                  <Image src={brand.logo} alt={brand.name} width={20} height={20} className="w-5 h-5 object-contain" />
                )}
                <span className="text-sm lg:text-base">{brand.name}</span>
              </div>
              <span className={`${selected ? "text-white bg-teal-500" : "bg-gray-100"} inline-flex rounded-sm text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-teal-500`}>
                {brand.products}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

BrandDropdown.displayName = "BrandDropdown";

export default BrandDropdown;
