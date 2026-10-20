"use client";
import { forwardRef, useState, useImperativeHandle, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const CategoryItem = ({ category, selected, onChange }) => {
  return (
    <button
      type="button"
      className={`${
        selected ? "text-[#32BBAB]" : "text-gray-700"
      } group flex items-center justify-between ease-out duration-200 hover:text-[#4faa9f] w-full`}
      onClick={() => onChange(category.name, !selected)}
    >
      <div className="flex items-center gap-2">
        <div
          className={`cursor-pointer flex items-center justify-center rounded-xs w-4 h-4 border ${
            selected ? "border-teal-500 bg-teal-500" : "bg-white border-gray-3"
          }`}
        >
          {selected && (
            <svg
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
          )}
        </div>
        <span className="text-sm lg:text-base">{category.name}</span>
      </div>
      <span
        className={`${
          selected ? "text-white bg-teal-500" : "bg-gray-100"
        } inline-flex rounded-sm text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-teal-500`}
      >
        {category.products}
      </span>
    </button>
  );
};

const CategoryDropdown = forwardRef(({ categories, selectedCategories = [], onChange }, ref) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const [internalSelected, setInternalSelected] = useState(selectedCategories);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Detect active gender base route from /men, /men/[cat], /women, /women/[cat] or ?gender= param
  const getActiveGender = () => {
    if (pathname === '/men' || pathname.startsWith('/men/')) return '/men';
    if (pathname === '/women' || pathname.startsWith('/women/')) return '/women';
    const g = searchParams.get('gender');
    if (g === 'Men') return '/men';
    if (g === 'Women') return '/women';
    return null;
  };

  useImperativeHandle(ref, () => ({
    reset: () => {
      setInternalSelected([]);
      onChange([]);
      const genderRoute = getActiveGender();
      router.push(genderRoute ?? '/shop');
    }
  }));

  useEffect(() => {
    setInternalSelected(selectedCategories);
  }, [selectedCategories]);

  const handleCategoryChange = (categoryName, isSelected) => {
    const newSelected = isSelected ? [categoryName] : [];
    setInternalSelected(newSelected);
    onChange(newSelected);

    const genderRoute = getActiveGender(); // e.g. '/men' or null

    if (!isSelected) {
      router.push(genderRoute ?? '/shop');
      return;
    }

    // Category selected — keep gender if one is active
    router.push(
      genderRoute
        ? `${genderRoute}/${encodeURIComponent(categoryName)}`
        : `/shop/${encodeURIComponent(categoryName)}`
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`w-full cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-gray-700 font-semibold text-base">Category</p>
        <span
          aria-hidden="true"
          className={`text-gray-700 ease-out duration-200 ${
            toggleDropdown && "rotate-180"
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
        </span>
      </button>

      <div className={`flex-col gap-3 py-6 pl-6 pr-5.5 ${toggleDropdown ? "flex" : "hidden"}`}>
        {categories.map((category) => (
          <CategoryItem
            key={category.name}
            category={category}
            selected={internalSelected.includes(category.name)}
            onChange={handleCategoryChange}
          />
        ))}
      </div>
    </div>
  );
});

CategoryDropdown.displayName = "CategoryDropdown";

export default CategoryDropdown;