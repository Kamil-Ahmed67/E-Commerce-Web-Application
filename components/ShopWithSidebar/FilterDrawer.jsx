"use client";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";

// Filter panel. On lg+ screens it is a sticky left sidebar (shown/hidden via `sidebarOpen`);
// below lg it is the slide-over drawer (opened/closed via `isOpen`).
const FilterDrawer = ({
    isOpen,
    onClose,
    sidebarOpen,
    resultCount,
    onClearAll,
    hasActiveFilters,
    children,
}) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        const originalOverflow = document.body.style.overflow;
        // Only lock page scroll when the panel is an overlay (below lg)
        if (!window.matchMedia("(min-width: 1024px)").matches) {
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen, onClose]);

    return (
        <div
            className={`fixed inset-0 z-999 lg:static lg:inset-auto lg:z-auto lg:w-[280px] lg:shrink-0 lg:pointer-events-auto ${
                isOpen ? "" : "pointer-events-none"
            } ${sidebarOpen ? "" : "lg:hidden"}`}
            aria-hidden={!isOpen}
        >
            {/* Backdrop (mobile only) */}
            <div
                onClick={onClose}
                className={`lg:hidden absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
            />

            {/* Panel */}
            <aside
                aria-label="Filters"
                className={`absolute right-0 top-0 h-full w-full max-w-[90vw] sm:max-w-[380px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-out
                    lg:h-[calc(100vh-10rem)] lg:max-w-none lg:w-full lg:translate-x-0 lg:shadow-none lg:border lg:border-gray-200 lg:rounded-sm lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] ${
                    isOpen ? "translate-x-0" : "translate-x-full"
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 shrink-0">
                    <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClearAll}
                            disabled={!hasActiveFilters}
                            className={`text-sm underline underline-offset-2 transition-colors ${
                                hasActiveFilters ? "text-gray-500 hover:text-[#32BBAB]" : "text-gray-300 cursor-not-allowed"
                            }`}
                        >
                            Reset
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close filters"
                            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="filter-scroll flex-1 min-h-0 overflow-y-scroll px-5 [&>*:last-child]:border-b-0">
                    {children}
                </div>

                {/* Footer (mobile only — filtering is live on desktop) */}
                <div className="lg:hidden shrink-0 border-t border-gray-100 px-5 py-4 bg-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 rounded-full text-sm font-semibold bg-[#32BBAB] text-white hover:bg-[#279487] transition-colors"
                    >
                        Show {resultCount} products
                    </button>
                </div>
            </aside>
        </div>
    );
};

export default FilterDrawer;
