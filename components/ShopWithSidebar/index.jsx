"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiGrid, FiList, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import { getProducts } from "@/lib/server/shopData";
import MingleLoader from "@/components/MingleLoader/MingleLoader";
import FilterOptionGroup from "./FilterOptionGroup";
//import SizeDropdown from "./SizeDropdown";
import PriceDropdown from "./PriceDropdown";
import SingleGridItem from "./SingleGridItem";
import SingleListItem from "./SingleListItem";
import FilterDrawer from "./FilterDrawer";
import { BRAND_CONFIGS } from "@/lib/brandConfig";
import { trackEvent } from "@/lib/trackEvent";

// Import gender helpers
import { normalizeGender } from "@/utils/genderHelpers";
import { normalizeCategoryName } from "@/utils/categoryOrder";

// Brand names match ignoring case and spaces ("PURE NORTH" === "PureNorth")
const brandKey = (s) => (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const sameBrand = (a, b) => brandKey(a) !== "" && brandKey(a) === brandKey(b);

const ShopWithSidebar = ({ defaultGender = null, defaultCategory = null, defaultBrand = null, searchMode = false, hideSidebar = true }) => {
    const [productStyle, setProductStyle] = useState("grid");
    const searchParams = useSearchParams();
    const brandFromUrl = searchParams?.get('brand') || defaultBrand;
    const categoryFromUrl = searchParams?.get('category') || defaultCategory;
    const genderFromUrl = searchParams?.get('gender') || defaultGender;
    const searchQuery = searchMode ? (searchParams?.get('q') || '') : '';
    const isNewArrivalMode = searchParams.get('new') === '1';

    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        categories: categoryFromUrl ? [categoryFromUrl] : [],
        genders: genderFromUrl ? [genderFromUrl] : [],
        brands: brandFromUrl ? [brandFromUrl] : [],
        size: null,
        color: null,
        priceRange: { from: 0, to: 10000 }
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleInPage, setVisibleInPage] = useState(10);
    const [isFilterOpen, setIsFilterOpen] = useState(false);   // slide-over drawer (below lg)
    const [showSidebar, setShowSidebar] = useState(true);      // persistent sidebar (lg+)

    // Restore the customer's sidebar preference
    useEffect(() => {
        try {
            if (localStorage.getItem('shopFiltersHidden') === '1') setShowSidebar(false);
        } catch {}
    }, []);

    const handleFilterToggle = () => {
        if (window.matchMedia('(min-width: 1024px)').matches) {
            const next = !showSidebar;
            setShowSidebar(next);
            try { localStorage.setItem('shopFiltersHidden', next ? '0' : '1'); } catch {}
        } else {
            setIsFilterOpen(true);
        }
    };

    const sentinelRef = useRef(null);
    const isObservingRef = useRef(false);
    const topRef = useRef(null);

    const sizeDropdownRef = useRef(null);
    const priceDropdownRef = useRef(null);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const productData = await getProducts();

                const sortedProducts = [...productData].sort((a, b) => {
                    const dateA = a.EntryDate ? new Date(a.EntryDate).getTime() : 0;
                    const dateB = b.EntryDate ? new Date(b.EntryDate).getTime() : 0;
                    if (!dateA && !dateB) return 0;
                    if (!dateA) return 1;
                    if (!dateB) return -1;
                    return dateB - dateA;
                });

                setProducts(sortedProducts);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Update filters from URL (fall back to defaults when no query params are present)
    useEffect(() => {
        const newCategory = searchParams.get('category') || defaultCategory;
        const newGender = searchParams.get('gender') || defaultGender;
        const newBrand = searchParams.get('brand') || defaultBrand;

        setFilters(prev => ({
            ...prev,
            categories: newCategory ? [newCategory] : [],
            genders: newGender ? [newGender] : [],
            brands: newBrand ? [newBrand] : []
        }));
        setCurrentPage(1);
        setVisibleInPage(10);
    }, [searchParams, defaultGender, defaultCategory]);

    // Reset page when new arrival mode changes
    useEffect(() => {
        setCurrentPage(1);
        setVisibleInPage(10);
    }, [isNewArrivalMode]);

    // Pre-built search index — one lowercase string per product, computed once per products load
    const searchIndex = useMemo(() =>
        products.map(p => ({
            product: p,
            searchText: [p.description, p.brand, p.styleNo, p.productType, p.category]
                .filter(Boolean).join(' ').toLowerCase(),
        }))
    , [products]);

    // Brands with product counts
    const brands = useMemo(() =>
        Object.values(BRAND_CONFIGS).map(b => ({
            name: b.name,
            logo: b.logo,
            products: products.filter(p => sameBrand(p.brand, b.name)).length,
        })), [products]);

    // Audience options (Men / Women) with product counts
    const audienceOptions = useMemo(() =>
        ['Men', 'Women'].map(name => ({
            name,
            count: products.filter(p => normalizeGender(p.category) === name.toLowerCase()).length,
        })), [products]);

    // Category (product type) options for a given audience + brand selection,
    // merged by normalized name, most-stocked first
    const getCategoryOptions = (genders, brands) => {
        const map = new Map();
        products.forEach(p => {
            if (!p.productType) return;
            if (genders.length > 0 && !genders.some(g => normalizeGender(p.category) === g.toLowerCase())) return;
            if (brands.length > 0 && !brands.some(b => sameBrand(b, p.brand))) return;
            const key = normalizeCategoryName(p.productType);
            if (!map.has(key)) map.set(key, { name: p.productType, count: 0 });
            map.get(key).count += 1;
        });
        return Array.from(map.values()).sort((a, b) => b.count - a.count);
    };

    // Categories follow the selected audience and brands
    const categoryOptions = useMemo(
        () => getCategoryOptions(filters.genders, filters.brands),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [products, filters.genders, filters.brands]
    );

    // Change audience/brands and drop any checked category that no longer exists for the new selection
    const updateScope = (patch) => setFilters(prev => {
        const next = { ...prev, ...patch };
        const available = new Set(getCategoryOptions(next.genders, next.brands).map(o => normalizeCategoryName(o.name)));
        next.categories = next.categories.filter(c => available.has(normalizeCategoryName(c)));
        return next;
    });

    const toggleFilter = (key, name) => setFilters(prev => ({
        ...prev,
        [key]: prev[key].some(v => normalizeCategoryName(v) === normalizeCategoryName(name))
            ? prev[key].filter(v => normalizeCategoryName(v) !== normalizeCategoryName(name))
            : [...prev[key], name],
    }));

    // Active brand config, when this view is scoped to a single brand (e.g. brand collection quick-filter pages)
    const activeBrand = useMemo(() =>
        defaultBrand ? Object.values(BRAND_CONFIGS).find(b => sameBrand(b.name, defaultBrand)) : null,
    [defaultBrand]);

    // Breadcrumb trail — Home / Brand / Gender / Category — so customers always know where they are
    const breadcrumbs = useMemo(() => {
        const crumbs = [{ label: 'Home', href: '/' }];
        if (activeBrand) {
            crumbs.push({ label: activeBrand.name, href: `/brands/${activeBrand.slug}/collection` });
        }
        if (genderFromUrl) {
            crumbs.push({
                label: genderFromUrl,
                href: activeBrand ? `/brands/${activeBrand.slug}/${genderFromUrl.toLowerCase()}` : `/${genderFromUrl.toLowerCase()}`,
            });
        }
        if (categoryFromUrl) {
            crumbs.push({ label: categoryFromUrl, href: null });
        }
        return crumbs;
    }, [activeBrand, genderFromUrl, categoryFromUrl]);

    // Plain "all products" view (no brand/gender/category/new-arrival/search scope) — shows a centered title instead of the breadcrumb
    const isAllProductsView = !activeBrand && !genderFromUrl && !categoryFromUrl && !isNewArrivalMode && !(searchMode && searchQuery);

    // Filtered products - MOVED BEFORE it's used
    const filteredProducts = useMemo(() => {
        if (isNewArrivalMode) {
            return products.filter(p => p.IsNewArraival === true);
        }

        const q = searchQuery.toLowerCase().trim();

        return searchIndex
          .filter(({ searchText, product }) => {
            // Search query filter — single .includes() against pre-built string
            if (q && !searchText.includes(q)) return false;
            // Brand filter
            if (filters.brands.length > 0 && !filters.brands.some(b => sameBrand(b, product.brand))) return false;

            // Category filter — compare normalized so "T-Shirt"/"T-shirt"-style variants match
            if (filters.categories.length > 0 && !filters.categories.some(c => normalizeCategoryName(c) === normalizeCategoryName(product.productType))) return false;

            // Gender filter - works with all variations and combined selection
            if (filters.genders.length > 0) {
                const normalizedProductGender = normalizeGender(product.category);
                const isMenMatch = filters.genders.includes('Men') && normalizedProductGender === 'men';
                const isWomenMatch = filters.genders.includes('Women') && normalizedProductGender === 'women';
                const isUnisexMatch = filters.genders.includes('Unisex') && normalizedProductGender === 'unisex';

                // If multiple genders are selected, show all of them
                if (!isMenMatch && !isWomenMatch && !isUnisexMatch) return false;
            }

            // Size filter (commented out for now)
            // if (filters.size && !product.sizes?.includes(filters.size)) return false;

            // Price filter
            if (product.sellingPrice < filters.priceRange.from || product.sellingPrice > filters.priceRange.to) return false;

            return true;
        })
        .map(({ product }) => product);
    }, [filters, searchIndex, isNewArrivalMode, searchQuery]);

    // Pagination calculations - NOW filteredProducts is defined
    const productsPerPage = 25;
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const pageProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Products progressively revealed within the current page (infinite-scroll-like)
    const currentProducts = pageProducts.slice(0, visibleInPage);
    const hasMoreInPage = visibleInPage < pageProducts.length;

    // GA4 view_item_list — fires once per page/filter change (not on every
    // infinite-scroll reveal) with the set of products actually shown on this page.
    useEffect(() => {
        if (pageProducts.length === 0) return;
        const listName = searchMode
            ? 'Search Results'
            : isNewArrivalMode
                ? 'New Arrivals'
                : (categoryFromUrl || brandFromUrl || genderFromUrl || 'Shop');

        trackEvent('view_item_list', {
            contentIds: pageProducts.map((p) => String(p.id)),
            contents: pageProducts.map((p) => ({
                id: p.id,
                title: p.title,
                price: p.sellingPrice ?? p.price ?? 0,
                quantity: 1,
                brand: p.brand,
                category: p.productType,
            })),
            numItems: pageProducts.length,
            listName,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredProducts, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
        setVisibleInPage(10);
    }, [filters]);

    // Reset progressive reveal whenever the current page changes
    useEffect(() => {
        setVisibleInPage(10);
    }, [currentPage]);

    // Infinite-scroll-style progressive reveal within the current page
    useEffect(() => {
        if (!hasMoreInPage) return;
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isObservingRef.current) {
                isObservingRef.current = true;
                setVisibleInPage((prev) => Math.min(prev + 10, pageProducts.length));
            }
        }, { rootMargin: "200px" });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMoreInPage, pageProducts.length]);

    // Allow the next intersection to trigger another load once visibleInPage updates
    useEffect(() => {
        isObservingRef.current = false;
    }, [visibleInPage]);

    // Clean all filters
    const handleCleanAll = () => {
        setFilters({
            categories: [],
            genders: [],
            size: null,
            color: null,
            brands: [],
            priceRange: { from: 0, to: 10000 }
        });

        sizeDropdownRef.current?.reset();
        priceDropdownRef.current?.reset();
    };

    // Clean filters when new arrival mode is active
    useEffect(() => {
        if (isNewArrivalMode) handleCleanAll();
    }, [isNewArrivalMode]);

    // Pagination helper
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;
        const halfVisible = Math.floor(maxVisiblePages / 2);
        let startPage = Math.max(1, currentPage - halfVisible);
        let endPage = Math.min(totalPages, currentPage + halfVisible);

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= halfVisible) endPage = maxVisiblePages;
            if (currentPage >= totalPages - halfVisible) startPage = totalPages - maxVisiblePages + 1;

            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) pageNumbers.push('...');
            }

            for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) pageNumbers.push('...');
                pageNumbers.push(totalPages);
            }
        }

        return pageNumbers;
    };

    const handlePageChange = (page) => {
        if (typeof page === 'number') {
            setCurrentPage(page);
            topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const activeFilterCount =
        filters.brands.length +
        filters.genders.length +
        filters.categories.length +
        (filters.priceRange.from > 0 || filters.priceRange.to < 10000 ? 1 : 0);

    if (isLoading) return <MingleLoader fullScreen={false} />;

    return (
        <section ref={topRef} className="pb-20 pt-[112px] md:pt-32 lg:pt-[140px] xl:pt-[140px] bg-[#f3f4f6]">

            {searchMode && searchQuery && (
                <div className="w-full mx-auto px-3 sm:px-8 xl:px-4 mb-4">
                    <h1 className="text-lg font-semibold text-gray-800">
                        Results for <span className="text-[#32BBAB]">&ldquo;{searchQuery}&rdquo;</span>
                        <span className="ml-2 text-sm font-normal text-gray-400">({filteredProducts.length} products)</span>
                    </h1>
                </div>
            )}

            {!searchMode && (
                <div className="w-full mx-auto px-3 sm:px-8 xl:px-4 mb-4">
                    {isAllProductsView ? (
                        <>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 text-center uppercase">
                                Discover Everything We Offer
                            </h1>
                        </>
                    ) : (
                        <Breadcrumb items={breadcrumbs} />
                    )}
                </div>
            )}

            <div className="w-full mx-auto px-3 sm:px-8 xl:px-4">
                <div className="flex flex-col lg:flex-row gap-7.5">

                    <FilterDrawer
                        isOpen={isFilterOpen}
                        sidebarOpen={showSidebar}
                        onClose={() => setIsFilterOpen(false)}
                        onClearAll={handleCleanAll}
                        hasActiveFilters={activeFilterCount > 0}
                        resultCount={filteredProducts.length}
                    >
                        <FilterOptionGroup
                            title="Audience"
                            variant="radio"
                            options={audienceOptions}
                            selected={filters.genders}
                            allLabel="All"
                            onSelectAll={() => updateScope({ genders: [] })}
                            onToggle={(name) => updateScope({ genders: [name] })}
                        />
                        <FilterOptionGroup
                            title="Brands"
                            options={brands.map(b => ({ name: b.name, logo: b.logo, count: b.products }))}
                            selected={filters.brands}
                            allLabel="All Brands"
                            onSelectAll={() => updateScope({ brands: [] })}
                            onToggle={(name) => updateScope({
                                brands: filters.brands.includes(name)
                                    ? filters.brands.filter(b => b !== name)
                                    : [...filters.brands, name],
                            })}
                        />
                        <FilterOptionGroup
                            title="Categories"
                            searchable
                            options={categoryOptions}
                            selected={filters.categories}
                            allLabel="All Categories"
                            onSelectAll={() => setFilters(prev => ({ ...prev, categories: [] }))}
                            onToggle={(name) => toggleFilter('categories', name)}
                        />
                        <PriceDropdown
                            ref={priceDropdownRef}
                            priceRange={filters.priceRange}
                            onChange={(range) => setFilters(prev => ({ ...prev, priceRange: range }))}
                        />
                    </FilterDrawer>

                    {/* Products Area */}
                    <div className="w-full min-w-0 flex flex-col">
                        <div className="rounded-sm bg-white border border-gray-200 shadow-1 pl-3 pr-2.5 py-2.5 mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleFilterToggle}
                                    aria-label="Show or hide filters"
                                    className={`relative flex items-center gap-2 pl-3 pr-3.5 h-9 rounded-sm border text-sm font-medium transition-colors ${
                                        activeFilterCount > 0
                                            ? "bg-[#32BBAB] border-[#32BBAB] text-white"
                                            : "text-gray-700 bg-gray-100 border-gray-300 hover:text-white hover:bg-[#32BBAB] hover:border-[#32BBAB]"
                                    }`}
                                >
                                    <FiFilter size={16} />
                                    <span>Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#279487] text-[11px] font-semibold leading-none">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">{filteredProducts.length}</span> Products
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <button onClick={() => setProductStyle("grid")} className={`flex items-center justify-center w-10.5 h-9 rounded-sm border ${productStyle === "grid" ? "bg-[#32BBAB] border-[#32BBAB] text-white" : "text-gray-700 bg-gray-100 border-gray-300 hover:text-white hover:bg-[#32BBAB] hover:border-[#32BBAB]"}`}>
                                    <FiGrid size={18} />
                                </button>
                                <button onClick={() => setProductStyle("list")} className={`flex items-center justify-center w-10.5 h-9 rounded-sm border ${productStyle === "list" ? "bg-[#32BBAB] border-[#32BBAB] text-white" : "text-gray-700 bg-gray-100 border-gray-300 hover:text-white hover:bg-[#32BBAB] hover:border-[#32BBAB]"}`}>
                                    <FiList size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grow">
                            <div className={`${productStyle === "grid" ? "grid grid-cols-3 sm:grid-cols-4 gap-3" : "flex flex-col gap-7.5"}`}>
                                {currentProducts.length > 0 ? (
                                    currentProducts.map((product, key) =>
                                        productStyle === "grid"
                                            ? <SingleGridItem product={product} key={key} />
                                            : <SingleListItem product={product} key={key} />
                                    )
                                ) : (
                                    <div className="col-span-3 text-center py-10">
                                        <p className="text-lg text-gray-600">No products found matching your filters</p>
                                        <button onClick={handleCleanAll} className="mt-4 px-4 py-2 bg-[#32BBAB] text-white rounded hover:bg-[#279487] transition-colors">
                                            Clear all filters
                                        </button>
                                    </div>
                                )}
                            </div>

                            {hasMoreInPage && (
                                <div ref={sentinelRef} className="w-full flex items-center justify-center py-8">
                                    <div className="w-6 h-6 border-2 border-gray-300 border-t-[#32BBAB] rounded-full animate-spin" />
                                </div>
                            )}
                        </div>

                        {filteredProducts.length > 0 && (
                            <div className="mt-auto pt-8">
                                <div className="flex justify-center">
                                    <ul className="flex items-center space-x-2 select-none">
                                        <li>
                                            <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`w-10 h-10 flex items-center justify-center text-sm transition ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:text-black hover:bg-gray-100 rounded-full"}`}>
                                                <FiChevronLeft size={22} />
                                            </button>
                                        </li>
                                        {getPageNumbers().map((page, index) => (
                                            <li key={index}>
                                                {typeof page === "number" ? (
                                                    <button onClick={() => handlePageChange(page)} className={`w-10 h-10 flex items-center justify-center text-sm tracking-wide transition rounded-full ${currentPage === page ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}>
                                                        {page}
                                                    </button>
                                                ) : (
                                                    <span className="w-10 h-10 flex items-center justify-center text-gray-500 text-sm">{page}</span>
                                                )}
                                            </li>
                                        ))}
                                        <li>
                                            <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`w-10 h-10 flex items-center justify-center text-sm transition ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:text-black hover:bg-gray-100 rounded-full"}`}>
                                                <FiChevronRight size={22} />
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShopWithSidebar;