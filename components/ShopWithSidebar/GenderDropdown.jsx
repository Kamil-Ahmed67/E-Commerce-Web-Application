"use client";
import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const GenderItem = ({ gender, selected, onChange }) => {
  return (
    <button
      className={`${
        selected ? "text-[#32BBAB]" : "text-gray-700"
      } group flex items-center justify-between ease-out duration-200 hover:text-[#4faa9f]`}
      onClick={() => onChange(gender.name, !selected)}
    >
      <div className="flex items-center gap-2">
        <div
          className={`cursor-pointer flex items-center justify-center rounded-xs w-4 h-4 border ${
            selected ? "border-[#32BBAB] bg-[#32BBAB]" : "bg-white border-gray-3"
          }`}
        >
          <svg
            className={selected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span>{gender.name}</span>
      </div>
      <span
        className={`${
          selected ? "text-white bg-[#32BBAB]" : "bg-gray-100"
        } inline-flex rounded-sm text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-[#32BBAB]`}
      >
        {gender.products}
      </span>
    </button>
  );
};

const GENDER_ROUTES = { Men: '/men', Women: '/women' };

const GenderDropdown = forwardRef(({ genders, selectedGenders = [], onChange }, ref) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [internalSelected, setInternalSelected] = useState(selectedGenders);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect active category from /shop/[cat], /men/[cat], /women/[cat] or ?category= param
  const getActiveCategory = () => {
    const match = pathname.match(/^\/(?:shop|men|women)\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : (searchParams.get('category') || null);
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setInternalSelected([]);
      onChange([]);
      const cat = getActiveCategory();
      router.push(cat ? `/shop/${encodeURIComponent(cat)}` : '/shop');
    }
  }));

  useEffect(() => {
    setInternalSelected(selectedGenders);
  }, [selectedGenders]);

  const handleGenderChange = (genderName, isSelected) => {
    let newSelected;
    if (isSelected) {
      newSelected = [...internalSelected, genderName];
    } else {
      newSelected = internalSelected.filter(name => name !== genderName);
    }
    setInternalSelected(newSelected);
    onChange(newSelected);

    const cat = getActiveCategory();

    if (newSelected.length === 0) {
      router.push(cat ? `/shop/${encodeURIComponent(cat)}` : '/shop');
      return;
    }

    const genderRoute = GENDER_ROUTES[newSelected[0]] ?? '/shop';
    router.push(cat ? `${genderRoute}/${encodeURIComponent(cat)}` : genderRoute);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown ? "shadow-filter" : ""
        }`}
      >
        <p className="text-gray-700 font-semibold text-base">Gender</p>
        <button
          onClick={() => setToggleDropdown(!toggleDropdown)}
          aria-label="button for gender dropdown"
          className={`text-gray-500 ease-out duration-200 ${
            toggleDropdown ? "rotate-180" : ""
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"}`}>
        {genders.map((gender) => (
          <GenderItem
            key={gender.name}
            gender={gender}
            selected={internalSelected.includes(gender.name)}
            onChange={handleGenderChange}
          />
        ))}
      </div>
    </div>
  );
});

GenderDropdown.displayName = "GenderDropdown";

export default GenderDropdown;
