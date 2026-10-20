"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from 'next/navigation';
import {
    FiGrid,
    FiList,
    FiChevronLeft,
    FiChevronRight,
} from 'react-icons/fi';
import { getNewProducts } from "@/lib/server/shopData";
import CategoryNewDropdown from "./CategoryNewDropdown";
import GenderNewDropdown from "./GenderNewDropdown";
//import SizeNewDropdown from "./SizeNewDropdown";
import PriceNewDropdown from "./PriceNewDropdown";
import SingleNewGridItem from "./SingleNewGridItem";
import SingleNewListItem from "./SingleNewListItem";
import { fetchCategories } from "@/lib/server/categoryData";
import { isMenCategory, isWomenCategory, normalizeGender } from "@/utils/genderHelpers";
import { BRAND_CONFIGS } from "@/lib/brandConfig";
import { isSameBrand } from "@/utils/brandHelpers";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import { trackEvent } from "@/lib/trackEvent";
import MingleLoader from "@/components/MingleLoader/MingleLoader";
const ShopNewWithSidebar = () => {
    const [productStyle, setProductStyle] = useState("grid");
    const searchParams = useSearchParams();
    const [categoryList, setCategoryList] = useState([]);
    const brandFromUrl = searchParams?.get('brand') || null;
    const categoryFromUrl = searchParams?.get('category');
    const genderFromUrl = searchParams?.get('gender');
    const isNewArrivalMode = searchParams.get('new') === '1';
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        categories: categoryFromUrl ? [categoryFromUrl] : [],
        genders: genderFromUrl ? [genderFromUrl] : [],
        brand: brandFromUrl,
        size: null,
        color: null,
        priceRange: { from: 0, to: 10000 }
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [visibleInPage, setVisibleInPage] = useState(10);
    const categoryDropdownRef = useRef(null);
    const genderDropdownRef = useRef(null);
    const sizeDropdownRef = useRef(null);
    const priceDropdownRef = useRef(null);
    const brandDropdownRef = useRef(null);
    const sentinelRef = useRef(null);
    const isObservingRef = useRef(false);
    const topRef = useRef(null);

    const activeBrand = useMemo(() =>
        brandFromUrl ? Object.values(BRAND_CONFIGS).find(b => b.name === brandFromUrl) : null,
    [brandFromUrl]);

    // Breadcrumb trail — Home / New Arrivals / Brand / Gender / Category
    const breadcrumbs = useMemo(() => {
        const crumbs = [{ label: 'Home', href: '/' }, { label: 'New Arrivals', href: '/new-arrival' }];
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const [productData, categoriesData] = await Promise.all([
                    getNewProducts(),
                    fetchCategories()
                ]);

                const sortedProducts = [...productData].sort((a, b) => {
                    const dateA = a.EntryDate ? new Date(a.EntryDate).getTime() : 0;
                    const dateB = b.EntryDate ? new Date(b.EntryDate).getTime() : 0;
                    if (!dateA && !dateB) return 0;
                    if (!dateA) return 1;
                    if (!dateB) return -1;
                    return dateB - dateA;
                });

                setProducts(sortedProducts);
                setCategoryList(categoriesData);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);


    // Update filters from URL
    useEffect(() => {
        const newCategory = searchParams.get('category');
        const newGender = searchParams.get('gender');
        const newBrand = searchParams.get('brand');

        setFilters(prev => ({
            ...prev,
            categories: newCategory ? [newCategory] : [],
            genders: newGender ? [newGender] : [],
            brand: newBrand || null
        }));
        setCurrentPage(1);
        setVisibleInPage(10);
    }, [searchParams]);

    // Reset page when new arrival mode changes
    useEffect(() => {
        setCurrentPage(1);
        setVisibleInPage(10);
    }, [isNewArrivalMode]);

    // Categories with product counts
    const categories = useMemo(() =>
        categoryList.map(cat => ({
            name: cat.ProductType, // Change from cat.Title to cat.ProductType
            products: products.filter(p => p.productType === cat.ProductType).length // Use productType
        })), [categoryList, products]
    );

    // Genders with product counts
    const genders = useMemo(() => [
        {
            name: "Men",
            products: products.filter(p => isMenCategory(p.category)).length,
        },
        {
            name: "Women",
            products: products.filter(p => isWomenCategory(p.category)).length,
        },
    ], [products]);

    // Filtered products - MOVED BEFORE it's used
    const filteredProducts = useMemo(() => {
        if (isNewArrivalMode) {
            return products.filter(p => p.IsNewArraival === true);
        }

        return products.filter(product => {
            // Brand filter
            if (filters.brand && !isSameBrand(product.brand, filters.brand)) return false;

            // Category filter
            if (filters.categories.length > 0 && !filters.categories.includes(product.productType)) return false;

            // Gender filter - works with all variations and combined selection
            if (filters.genders.length > 0) {
                const normalizedProductGender = normalizeGender(product.category);
                const isMenMatch = filters.genders.includes('Men') && normalizedProductGender === 'men';
                const isWomenMatch = filters.genders.includes('Women') && normalizedProductGender === 'women';

                // If both Men and Women are selected, show both
                if (!isMenMatch && !isWomenMatch) return false;
            }

            // Size filter (commented out for now)
            // if (filters.size && !product.sizes?.includes(filters.size)) return false;

            // Price filter
            if (product.sellingPrice < filters.priceRange.from || product.sellingPrice > filters.priceRange.to) return false;

            return true;
        });
    }, [filters, products, isNewArrivalMode]);

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
    // infinite-scroll reveal) with the set of products actually shown.
    useEffect(() => {
        if (pageProducts.length === 0) return;
        const listName = brandFromUrl || categoryFromUrl || genderFromUrl || 'New Arrivals';
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
            brand: null,
            priceRange: { from: 0, to: 10000 }
        });

        categoryDropdownRef.current?.reset();
        genderDropdownRef.current?.reset();
        sizeDropdownRef.current?.reset();
        priceDropdownRef.current?.reset();
        brandDropdownRef.current?.reset();
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

    if (isLoading) return <MingleLoader fullScreen={false} />;

    return (
        <section ref={topRef} className="pb-20 pt-[112px] md:pt-32 lg:pt-[140px] xl:pt-[140px] bg-white">

            <div className="w-full mx-auto px-3 sm:px-8 xl:px-4 mb-4">
                <Breadcrumb items={breadcrumbs} />
            </div>

            {/* Filter dropdowns hidden — filtering still works via URL params */}
            <div className="hidden">
                <CategoryNewDropdown
                    ref={categoryDropdownRef}
                    categories={categories}
                    selectedCategories={filters.categories}
                    onChange={(selected) => setFilters(prev => ({ ...prev, categories: selected }))}
                />
                <GenderNewDropdown
                    ref={genderDropdownRef}
                    genders={genders}
                    selectedGenders={filters.genders}
                    onChange={(selected) => setFilters(prev => ({ ...prev, genders: selected }))}
                />
                <PriceNewDropdown
                    ref={priceDropdownRef}
                    priceRange={filters.priceRange}
                    onChange={(range) => setFilters(prev => ({ ...prev, priceRange: range }))}
                />
            </div>

            <div className="w-full border-gray-300 mx-auto px-3 sm:px-8 xl:px-4">
                <div className="py-2">
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-800">New Arrivals</h3>
                </div>
                <div className="flex flex-col lg:flex-row gap-7.5">

                    <div className="w-full flex flex-col">
                        <div className="rounded-sm pl-3 pr-2.5 py-2 mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium text-gray-800">{filteredProducts.length}</span> Products
                                </p>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => setProductStyle("grid")}
                                    className={`flex items-center justify-center w-10.5 h-9 rounded-sm border ease-out duration-200 ${productStyle === "grid" ? "bg-[#32BBAB] border-[#32BBAB] text-white" : "text-gray-700 bg-gray-100 border-gray-300 hover:text-white hover:bg-[#32BBAB] hover:border-[#32BBAB]"}`}
                                >
                                    <FiGrid size={18} />
                                </button>
                                <button
                                    onClick={() => setProductStyle("list")}
                                    className={`flex items-center justify-center w-10.5 h-9 rounded-sm border ease-out duration-200 ${productStyle === "list" ? "bg-[#32BBAB] border-[#32BBAB] text-white" : "text-gray-700 bg-gray-100 border-gray-300 hover:text-white hover:bg-[#32BBAB] hover:border-[#32BBAB]"}`}
                                >
                                    <FiList size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grow">
                            <div className={`${productStyle === "grid" ? "grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3" : "flex flex-col gap-7.5"}`}>
                                {currentProducts.length > 0 ? (
                                    currentProducts.map((product, key) =>
                                        productStyle === "grid"
                                            ? <SingleNewGridItem product={product} key={key} />
                                            : <SingleNewListItem product={product} key={key} />
                                    )
                                ) : (
                                    <div className="col-span-3 text-center py-10">
                                        <p className="text-lg text-gray-600">No products found matching your filters</p>
                                        <button
                                            onClick={handleCleanAll}
                                            className="mt-4 px-4 py-2 bg-[#32BBAB] text-white rounded hover:bg-[#279487] transition-colors"
                                        >
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
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className={`w-10 h-10 flex items-center justify-center text-sm transition ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:text-black hover:bg-gray-100 rounded-full"}`}
                                            >
                                                <FiChevronLeft size={22} />
                                            </button>
                                        </li>

                                        {getPageNumbers().map((page, index) => (
                                            <li key={index}>
                                                {typeof page === "number" ? (
                                                    <button
                                                        onClick={() => handlePageChange(page)}
                                                        className={`min-w-10 h-10 flex items-center justify-center text-sm tracking-wide transition rounded-full ${currentPage === page ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100 hover:text-black"}`}
                                                    >
                                                        {page}
                                                    </button>
                                                ) : (
                                                    <span className="min-w-10 h-10 flex items-center justify-center text-gray-500 text-sm">{page}</span>
                                                )}
                                            </li>
                                        ))}

                                        <li>
                                            <button
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`w-10 h-10 flex items-center justify-center text-sm transition ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:text-black hover:bg-gray-100 rounded-full"}`}
                                            >
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

export default ShopNewWithSidebar;
