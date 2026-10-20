"use client";
import { useState } from "react";
import Image from "next/image";
import { FiSearch } from "react-icons/fi";

// Collapsible option list used in the filter sidebar (Audience / Brands / Categories).
// options: [{ name, count, logo? }]; selected: string[]; onToggle(name)
// allLabel + onSelectAll: adds a leading "All ..." row, checked when nothing is selected.
// variant: "checkbox" (default) | "radio"; searchable: adds a search box + scrollable list.
const FilterOptionGroup = ({
    title,
    options,
    selected,
    onToggle,
    allLabel,
    onSelectAll,
    variant = "checkbox",
    searchable = false,
}) => {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState("");

    const isRadio = variant === "radio";
    const q = query.trim().toLowerCase();
    const visibleOptions = q ? options.filter((o) => o.name.toLowerCase().includes(q)) : options;

    const renderRow = ({ key, label, count, logo, isSelected, onClick }) => (
        <button
            key={key}
            type="button"
            onClick={onClick}
            className={`${isSelected ? "text-[#32BBAB]" : "text-gray-700"} flex items-center gap-2.5 w-full text-left ease-out duration-200 hover:text-[#4faa9f]`}
        >
            <span
                className={`shrink-0 flex items-center justify-center w-4 h-4 border ${isRadio ? "rounded-full" : "rounded-xs"} ${
                    isSelected ? "border-[#32BBAB] bg-[#32BBAB]" : "bg-white border-gray-300"
                }`}
            >
                {isSelected && (isRadio
                    ? <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.33317 2.5L3.74984 7.08333L1.6665 5" stroke="white" strokeWidth="1.94437" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ))}
            </span>
            {logo && <Image src={logo} alt={label} width={20} height={20} className="w-5 h-5 object-contain" />}
            <span className="text-sm">{label}</span>
            {count !== undefined && <span className="text-sm text-gray-400">({count})</span>}
        </button>
    );

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="w-full cursor-pointer flex items-center justify-between"
            >
                <p className="text-gray-800 font-semibold text-base">{title}</p>
                <span className={`text-gray-700 ease-out duration-200 ${open ? "" : "rotate-180"}`}>
                    <svg className="fill-current" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.43057 15.4881C4.70014 15.8026 5.17361 15.839 5.48811 15.5694L12 9.98782L18.5119 15.5694C18.8264 15.839 19.2999 15.8026 19.5695 15.4881C19.839 15.1736 19.8026 14.7001 19.4881 14.4305L12.4881 8.43054C12.2072 8.18982 11.7928 8.18982 11.5119 8.43054L4.51192 14.4305C4.19743 14.7001 4.161 15.1736 4.43057 15.4881Z" fill="" />
                    </svg>
                </span>
            </button>

            <div className={`mt-3 ${open ? "block" : "hidden"}`}>
                {searchable && (
                    <div className="relative mb-3">
                        <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search ${title.toLowerCase()}`}
                            aria-label={`Search ${title.toLowerCase()}`}
                            className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#32BBAB]"
                        />
                    </div>
                )}

                <div className={`flex flex-col gap-3 ${searchable ? "filter-scroll max-h-[280px] overflow-y-scroll pr-2" : ""}`}>
                    {allLabel && !q && renderRow({
                        key: "__all",
                        label: allLabel,
                        isSelected: selected.length === 0,
                        onClick: onSelectAll,
                    })}
                    {visibleOptions.length === 0 && <p className="text-sm text-gray-400">No options</p>}
                    {visibleOptions.map((opt) => renderRow({
                        key: opt.name,
                        label: opt.name,
                        count: opt.count,
                        logo: opt.logo,
                        isSelected: selected.includes(opt.name),
                        onClick: () => onToggle(opt.name),
                    }))}
                </div>
            </div>
        </div>
    );
};

export default FilterOptionGroup;
