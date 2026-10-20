'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMenu, FiX, FiChevronRight } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PiSignOutBold } from 'react-icons/pi';
import { FaRegHeart } from 'react-icons/fa';
import { MdOutlineAccountCircle } from 'react-icons/md';
import { RiAdminFill } from 'react-icons/ri';
const CartSlider = dynamic(() => import('../CartSlider/CartSlider'), { ssr: false, loading: () => null });
import dynamic from 'next/dynamic';
import MobileDrawer from './MobileMenu';
import { menuData } from '@/lib/server/menuData';
import { getProducts } from '@/lib/server/shopData';
import { useAuth } from '@/provider/AuthProvider';
import { useCart } from '@/provider/CartProvider';
import { IoBagOutline } from 'react-icons/io5';
import { trackEvent } from '@/lib/trackEvent';
import { isMenCategory, isWomenCategory } from '@/utils/genderHelpers';
import { sortByCategoryOrder } from '@/utils/categoryOrder';
import { getCategoryOrder } from '@/lib/server/categoryOrderData';
export default function Navbar() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [navLinks, setNavLinks] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);

    const lastClickedMenuId = useRef(null);
    const headerRef = useRef(null);
    const navRowRef = useRef(null);
    const dropdownRef = useRef(null);
    const moreRef = useRef(null);
    const searchInputRef = useRef(null);
    const cachedProductsRef = useRef(null);
    const searchIndexRef = useRef(null);
    const [catalogProducts, setCatalogProducts] = useState([]);
    const [categoryOrder, setCategoryOrder] = useState({ men: new Map(), women: new Map() });

    const pathname = usePathname();
    const router = useRouter();

    // Keep --header-height in sync with the real, rendered header height so
    // page wrappers (pt-[var(--header-height)]) never guess a fixed px value
    // that drifts out of sync with the nav (e.g. when nav links wrap to 2 lines).
    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;

        const setHeight = () => {
            // The lower nav row is transparent and overlays the page, so it must not reserve space
            const navH = navRowRef.current?.offsetHeight || 0;
            document.documentElement.style.setProperty('--header-height', `${el.offsetHeight - navH}px`);
        };

        setHeight();
        const observer = new ResizeObserver(setHeight);
        observer.observe(el);
        if (navRowRef.current) observer.observe(navRowRef.current);
        return () => observer.disconnect();
    }, [navLinks]);

    const BRAND_SLUGS = ['avasa', 'mingle', 'purenorth', 'vidjar'];
    const _brandMatch = pathname.match(/^\/brands\/([^/]+)/);
    const brandSlug = _brandMatch && BRAND_SLUGS.includes(_brandMatch[1]) ? _brandMatch[1] : null;

    const { loginData, logout } = useAuth();
    const {
        itemCount,
        isCartOpen: cartOpen,
        openCart,
        closeCart
    } = useCart();

    /* Close mobile menu on route change */
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    /* Scroll effect */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Close more dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) setIsMoreOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    /* Close search on Escape */
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') setIsSearchOpen(false); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    /* Focus input when search opens */
    useEffect(() => {
        if (isSearchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
        else { setSearchQuery(''); setSearchResults([]); }
    }, [isSearchOpen]);

    /* Fetch products once on mount for search — also pre-builds index */
    useEffect(() => {
        getProducts().then(data => {
            cachedProductsRef.current = data;
            setCatalogProducts(data);
            searchIndexRef.current = data.map(p => ({
                product: p,
                searchText: [p.description, p.brand, p.styleNo, p.productType, p.category]
                    .filter(Boolean).join(' ').toLowerCase(),
            }));
        }).catch(() => { });
    }, []);

    /* Fetch admin-editable category display order once on mount */
    useEffect(() => {
        getCategoryOrder().then(setCategoryOrder).catch(() => { });
    }, []);

    /* Search — builds keyword suggestions with match counts */
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(() => {
            const index = searchIndexRef.current;
            const products = cachedProductsRef.current;
            if (!index || !products) return;

            const q = searchQuery.toLowerCase().trim();

            // Single .includes() per product against the pre-built string
            const countForKeyword = (kw) => {
                const k = kw.toLowerCase();
                return index.filter(({ searchText }) => searchText.includes(k)).length;
            };

            const suggestions = [];
            const seen = new Set();

            // 1. Raw query itself
            const rawCount = countForKeyword(q);
            if (rawCount > 0) {
                suggestions.push({ keyword: searchQuery.trim(), count: rawCount });
                seen.add(q);
            }

            // 2. All unique productTypes in the catalog that contain the query
            const allProductTypes = [...new Set(products.map(p => p.productType).filter(Boolean))];
            allProductTypes.forEach(pt => {
                if (pt.toLowerCase().includes(q) && !seen.has(pt.toLowerCase())) {
                    seen.add(pt.toLowerCase());
                    suggestions.push({ keyword: pt, count: countForKeyword(pt) });
                }
            });

            // 3. All unique categories in the catalog that contain the query (e.g. "Panjabi")
            const allCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
            allCategories.forEach(cat => {
                if (cat.toLowerCase().includes(q) && !seen.has(cat.toLowerCase())) {
                    seen.add(cat.toLowerCase());
                    suggestions.push({ keyword: cat, count: countForKeyword(cat) });
                }
            });

            // 4. All unique brands in the catalog that contain the query
            const allBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
            allBrands.forEach(brand => {
                if (brand.toLowerCase().includes(q) && !seen.has(brand.toLowerCase())) {
                    seen.add(brand.toLowerCase());
                    suggestions.push({ keyword: brand, count: countForKeyword(brand) });
                }
            });

            // Raw query first, rest by count descending
            suggestions.sort((a, b) => {
                if (a.keyword.toLowerCase() === q) return -1;
                if (b.keyword.toLowerCase() === q) return 1;
                return b.count - a.count;
            });

            setSearchResults(suggestions.slice(0, 6));
            setIsSearching(false);
        }, 200);

        setIsSearching(true);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    /* Fetch menu */
    useEffect(() => {
        menuData().then((data) => setNavLinks((data || []).filter((m) => m.IsActive)));
    }, []);

    /* Active menu */
    useEffect(() => {
        const matches = navLinks.filter(l => l.Path === pathname);
        if (matches.length) {
            const stored = lastClickedMenuId.current;
            const match = matches.find(m => m.Id === stored) || matches[0];
            setActiveMenuId(match.Id);
        } else {
            setActiveMenuId(null);
        }
    }, [pathname, navLinks]);

    const handleMenuClick = (id) => {
        lastClickedMenuId.current = id;
        setActiveMenuId(id);
    };
    const CATEGORIES = [
        { id: 1, name: 'Mingle', image: '/images/logo/4.png', brand: 'Mingle', href: '/brands/mingle' },
        { id: 2, name: 'Vidjar', image: '/images/logo/2.png', brand: 'Vidjar', href: '/brands/vidjar' },

        { id: 4, name: 'PureNorth', image: '/images/logo/1.png', brand: 'PureNorth', href: '/brands/purenorth' },
        { id: 3, name: 'Avasaa', image: '/images/logo/3.png', brand: 'Avasaa', href: '/brands/avasa' },
    ];
    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
        router.push('/');
    };

    const BRAND_LINKS = [
        { name: 'Mingle', slug: 'mingle', logo: '/images/logo/4.png', href: '/brands/mingle' },
        { name: 'Vidjar', slug: 'vidjar', logo: '/images/logo/2.png', href: '/brands/vidjar' },
        { name: 'Pure North', slug: 'purenorth', logo: '/images/logo/1.png', href: '/brands/purenorth' },
        { name: 'Avasaa', slug: 'avasa', logo: '/images/logo/3.png', href: '/brands/avasa' },
    ];

    // Product-type submenus for the mobile Men/Women "+" expanders — built from
    // whatever product types actually exist in the catalog, same as the gender landing pages.
    const menCategories = sortByCategoryOrder([...new Set(
        catalogProducts.filter(p => isMenCategory(p.category)).map(p => p.productType).filter(Boolean)
    )], categoryOrder.men).map(type => ({ name: type, href: `/men/${encodeURIComponent(type)}` }));

    const womenCategories = sortByCategoryOrder([...new Set(
        catalogProducts.filter(p => isWomenCategory(p.category)).map(p => p.productType).filter(Boolean)
    )], categoryOrder.women).map(type => ({ name: type, href: `/women/${encodeURIComponent(type)}` }));

    return (
        <>
            <header ref={headerRef} className="fixed manrope w-full z-50 py-0">
                {/* Brand top bar — mobile only */}
                <div className="md:hidden bg-white border-b border-gray-100 h-10 flex items-center justify-center">
                    <div className="flex items-center divide-x divide-gray-200">
                        {BRAND_LINKS.map(({ name, slug, logo, href }) => {
                            const isActive = slug === brandSlug;
                            return (
                                <Link key={name} href={href} prefetch={false}
                                    className={`px-3 flex items-center justify-center h-full transition-opacity ${isActive ? 'opacity-100' : brandSlug ? 'opacity-30 hover:opacity-70' : 'hover:opacity-70'}`}>
                                    <Image src={logo} alt={name} width={55} height={22} className="object-contain h-5 w-auto" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
                {/* Only the top row keeps a solid backdrop — the lower nav (below) stays fully transparent */}
                <div className={`relative z-20 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
                    {/* Main row — Logo | Brand Logos | Icons */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3 relative">
                        {/* Left: logo only */}
                        <div className="flex items-center shrink-0">
                            <Link href="/" className="shrink-0" aria-label="Home">
                                <Image
                                    src="/images/logo/mingle-style.png"
                                    alt="Mingle Fashion Logo"
                                    width={80}
                                    height={40}
                                    priority
                                    quality={75}
                                    loading="eager"
                                    placeholder="blur"
                                    blurDataURL="/images/logo/mingle-01-blur.png"
                                    className="h-10 lg:h-12 w-auto"
                                />
                            </Link>
                        </div>

                        {/* Brand Logos — absolutely centered, desktop only */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center divide-x divide-gray-200">
                            {BRAND_LINKS.map(({ name, slug, logo, href }) => {
                                const isActive = slug === brandSlug;
                                return (
                                    <Link
                                        key={name}
                                        href={href}
                                        prefetch={false}
                                        className={`px-4 lg:px-6 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : brandSlug ? 'opacity-30 hover:opacity-70' : 'hover:opacity-70'}`}
                                    >
                                        <Image
                                            src={logo}
                                            alt={name}
                                            width={120}
                                            height={48}
                                            className="object-contain h-11 w-auto max-w-[120px]"
                                        />
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-4 shrink-0">
                            {/* Search icon — all sizes */}
                            <button
                                aria-label="Search"
                                onClick={() => setIsSearchOpen(true)}
                                className="text-gray-600 hover:text-[#32BBAB] transition-colors"
                            >
                                <FiSearch size={20} />
                            </button>

                            {/* User / Sign In */}
                            {loginData ? (
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                        className="text-gray-600 hover:text-[#32BBAB] transition-colors flex items-center"
                                        aria-label="Account"
                                    >
                                        <MdOutlineAccountCircle size={22} />
                                    </button>
                                    <div className={`absolute right-0 top-9 w-48 bg-white rounded-sm shadow-lg z-50 border border-gray-200 transition-all duration-200 origin-top ${isUserDropdownOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}`}
                                        onMouseLeave={() => setIsUserDropdownOpen(false)}
                                    >
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-800 truncate">{loginData.Name}</p>
                                            <p className="text-xs text-gray-500 truncate">{loginData.UserRole}</p>
                                        </div>
                                        <div className="py-1">
                                            {loginData.UserRole !== 'Customer' && (
                                                <Link href="/admin" prefetch={false} onClick={() => setIsUserDropdownOpen(false)}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors">
                                                    <RiAdminFill className="w-4 h-4 mr-3 shrink-0" />Admin Panel
                                                </Link>
                                            )}
                                            <Link href={`/my-orders/${loginData.Id}`} prefetch={false} onClick={() => setIsUserDropdownOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors">
                                                <MdOutlineAccountCircle className="w-4 h-4 mr-3 shrink-0" />My Account
                                            </Link>
                                            <Link href="/wishlist" prefetch={false} onClick={() => setIsUserDropdownOpen(false)}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors">
                                                <FaRegHeart className="w-4 h-4 mr-3 shrink-0" />Wishlist
                                            </Link>
                                            <button onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-200 mt-1">
                                                <PiSignOutBold className="w-4 h-4 mr-3 shrink-0" />Sign out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link prefetch={false} href="/signin" aria-label="Sign in"
                                    className="text-gray-600 hover:text-[#32BBAB] transition-colors">
                                    <MdOutlineAccountCircle size={22} />
                                </Link>
                            )}

                            {/* Wishlist */}
                            <Link href="/wishlist" aria-label="Wishlist">
                                <FaRegHeart size={20} className="text-gray-600 hover:text-[#32BBAB] transition-colors" />
                            </Link>

                            {/* Cart */}
                            <button aria-label="Cart" onClick={openCart}
                                className="text-gray-600 hover:text-[#32BBAB] transition-colors relative">
                                <IoBagOutline size={22} />
                                {mounted && itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#32BBAB] font-semibold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </button>

                            {/* Mobile Menu Button — far right, mobile only */}
                            <button
                                aria-label={isOpen ? "Close menu" : "Open menu"}
                                className="md:hidden text-gray-700 hover:text-[#32BBAB] transition-colors z-50"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                            </button>

                            {/* 3-dot more menu — desktop only */}
                            <div className="hidden md:block relative" ref={moreRef}>
                                <button
                                    onClick={() => { setIsMoreOpen(!isMoreOpen); setIsPoliciesOpen(false); }}
                                    className="text-gray-600 hover:text-[#32BBAB] transition-colors p-1"
                                    aria-label="More options"
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="4" cy="4" r="1.7" />
                                        <circle cx="9" cy="4" r="1.7" />
                                        <circle cx="14" cy="4" r="1.7" />
                                        <circle cx="4" cy="9" r="1.7" />
                                        <circle cx="9" cy="9" r="1.7" />
                                        <circle cx="14" cy="9" r="1.7" />
                                        <circle cx="4" cy="14" r="1.7" />
                                        <circle cx="9" cy="14" r="1.7" />
                                        <circle cx="14" cy="14" r="1.7" />
                                    </svg>
                                </button>
                                <div className={`absolute right-0 top-9 w-52 bg-white rounded-sm shadow-lg border border-gray-200 z-50 transition-all duration-200 origin-top-right ${isMoreOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                                    {[
                                        { label: 'Our Story', href: '/about' },
                                        { label: 'Customer Service', href: '/contact' },
                                        { label: 'News & Events', href: '/news-events' },
                                        { label: 'Blog', href: '/blog' },
                                    ].map((item, i) => (
                                        <Link key={item.label} href={item.href} prefetch={false}
                                            onClick={() => setIsMoreOpen(false)}
                                            className={`block px-4 py-2.5 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                                            {item.label}
                                        </Link>
                                    ))}

                                    {/* Policies with inline submenu */}
                                    <div className="border-t border-gray-100">
                                        <button
                                            onClick={() => setIsPoliciesOpen(v => !v)}
                                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors"
                                        >
                                            <span>More</span>
                                            <FiChevronRight className={`transition-transform duration-200 ${isPoliciesOpen ? 'rotate-90' : ''}`} size={14} />
                                        </button>
                                        {isPoliciesOpen && (
                                            <div className="bg-gray-50 border-t border-gray-100">
                                                {[
                                                    { label: 'Terms & Conditions', href: '/terms' },
                                                    { label: 'Privacy Policy', href: '/privacy-policy' },

                                                    { label: 'Return & Refund Policy', href: '/replacement-policy' },
                                                ].map(({ label, href }) => (
                                                    <Link key={label} href={href} prefetch={false}
                                                        onClick={() => setIsMoreOpen(false)}
                                                        className="block pl-7 pr-4 py-2 text-sm text-gray-500 hover:text-[#32BBAB] transition-colors border-t border-gray-100 first:border-0">
                                                        {label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Mobile Navigation */}
                    <MobileDrawer
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        brandCategories={CATEGORIES}
                        menCategories={menCategories}
                        womenCategories={womenCategories}
                    />
                </div>

                {/* Second Line - Desktop Navigation: fully transparent (no backdrop, invisible text) until hovered */}
                <div ref={navRowRef}>
                    <nav className={`group/nav hidden md:flex items-center transition-colors duration-300 justify-center py-2.5 relative ${scrolled ? 'bg-transparent hover:bg-black' : 'bg-black'}`}>
                        <div className="flex flex-wrap justify-center gap-x-4 lg:gap-x-8 px-2">
                            {navLinks.filter(link => !['OUR STORY', 'CUSTOMER SERVICE', 'BLOG', 'SHOP'].includes(link.Title?.toUpperCase())).map((link) => (
                                <div
                                    key={link.Id}
                                    className={`relative ${link.submenu.length > 0 ? 'has-submenu' : ''}`}
                                >
                                    {link.Title === "Brands" ? (
                                        <span
                                            className={`relative uppercase font-medium text-[11px] lg:text-sm ${scrolled ? 'text-transparent group-hover/nav:text-gray-50' : 'text-gray-50'} transition-colors cursor-default group`}
                                        >
                                            {link.Title}
                                        </span>
                                    ) : (
                                    <Link
                                        prefetch={false}
                                        href={link.Path}
                                        onClick={() => handleMenuClick(link.Id)}
                                        className={`relative uppercase font-medium text-[11px] lg:text-sm transition-colors ${activeMenuId === link.Id
                                            ? (scrolled ? 'text-transparent group-hover/nav:text-teal-400' : 'text-teal-400')
                                            : (scrolled ? 'text-transparent group-hover/nav:text-gray-50 hover:!text-[#32BBAB]' : 'text-gray-50 hover:text-[#32BBAB]')
                                            } group`}
                                        aria-current={activeMenuId === link.Id ? "page" : undefined}
                                    >
                                        {link.Title}
                                    </Link>
                                    )}
                                    {/* Mega Dropdown */}
                                    {link.submenu.length > 0 && (
                                        link.Title === "Brands" ? (
                                            /* Brands Mega Menu */
                                            <div className="mega-dropdown absolute left-0 right-0 top-8 bg-white shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                                <div className="px-10 py-10 bg-cover bg-center " style={{ backgroundImage: "url('/images/banner/rock-wall.jpg')" }}>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                        {CATEGORIES.map((category) => (
                                                            <Link
                                                                key={category.id}
                                                                href={category.href}
                                                                prefetch={false}
                                                                className="group relative block cursor-pointer overflow-hidden rounded-none transition duration-300 h-full"
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                <div className="w-full h-44 flex flex-col items-center justify-center p-4 gap-2">
                                                                    <Image
                                                                        src={category.image}
                                                                        alt={category.name}
                                                                        width={380}
                                                                        height={180}
                                                                        className="object-contain w-full h-32 hover:scale-105 transition ease-in-out duration-400"
                                                                        priority
                                                                    />
                                                                    {/* <span className="text-xs font-semibold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">{category.name}</span> */}
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) :
                                            <div className="mega-dropdown absolute left-0 right-0 top-8 bg-white shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                                <div className="px-6 py-10">
                                                    {/* Dynamic Categories */}
                                                    {(() => {
                                                        const categories = [...new Set(link.submenu.map(sub => sub.Category))];
                                                        const firstRowCats = categories.slice(0, 3);
                                                        const restCats = categories.slice(3);

                                                        return (
                                                            <>
                                                                {/* First Row: 3 Columns + Image */}
                                                                <div className="flex gap-18 mb-4">
                                                                    {/* Category Columns */}
                                                                    <div className="grid grid-cols-3 gap-10 flex-1">
                                                                        {firstRowCats.map((category, idx) => (
                                                                            <div
                                                                                key={category}
                                                                                className={`space-y-2 ${idx !== firstRowCats.length - 1 ? 'border-r border-gray-400 pr-10' : ''}`}
                                                                            >
                                                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider ">
                                                                                    {category === 'Brand' ? 'Brands' :
                                                                                        category === 'Featured' ? 'Featured' :
                                                                                            category === 'Category' ? 'Categories' : category}
                                                                                </h3>
                                                                                <ul className="space-y-2">
                                                                                    {link.submenu
                                                                                        .filter(sub => sub.Category === category)
                                                                                        .map((subItem) => (
                                                                                            <li key={subItem.Id}>
                                                                                                <Link
                                                                                                    prefetch={false}
                                                                                                    href={subItem.Path}
                                                                                                    onClick={() => {
                                                                                                        handleMenuClick(link.Id);
                                                                                                        setIsOpen(false);
                                                                                                    }}
                                                                                                    className="block text-gray-600 hover:text-[#32BBAB] text-base font-medium transition-all duration-200 hover:translate-x-1"
                                                                                                >
                                                                                                    {subItem.Title}
                                                                                                </Link>
                                                                                            </li>
                                                                                        ))}
                                                                                </ul>
                                                                            </div>
                                                                        ))}
                                                                    </div>

                                                                    {/* Promo Image */}
                                                                    <div className="w-80 shrink-0">
                                                                        <div className="relative rounded-none overflow-hidden shadow-lg group">
                                                                            {link.PromoImage && (
                                                                                <Image
                                                                                    src={link.PromoImage}
                                                                                    alt="Promo"
                                                                                    width={320}
                                                                                    height={400}
                                                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Remaining Rows: 4 Columns per Row */}
                                                                {restCats.length > 0 && (
                                                                    <div className="grid grid-cols-4 gap-10 border-t border-gray-200 pt-10">
                                                                        {restCats.map((category, idx) => (
                                                                            <div
                                                                                key={category}
                                                                                className={`space-y-5 ${idx < restCats.length - 1 ? 'border-r border-gray-200 pr-10' : ''}`}
                                                                            >
                                                                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b-2 border-[#32BBAB]/20">
                                                                                    {category}
                                                                                </h3>
                                                                                <ul className="space-y-2.5">
                                                                                    {link.submenu
                                                                                        .filter(sub => sub.Category === category)
                                                                                        .map((subItem) => (
                                                                                            <li key={subItem.Id}>
                                                                                                <Link
                                                                                                    prefetch={false}
                                                                                                    href={subItem.Path}
                                                                                                    onClick={() => {
                                                                                                        handleMenuClick(link.Id);
                                                                                                        setIsOpen(false);
                                                                                                    }}
                                                                                                    className="block text-gray-600 hover:text-[#32BBAB] text-sm font-medium transition-all duration-200 hover:translate-x-1"
                                                                                                >
                                                                                                    {subItem.Title}
                                                                                                </Link>
                                                                                            </li>
                                                                                        ))}
                                                                                </ul>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </nav>
                </div>
            </header>
            {/* Search Modal */}
            {isSearchOpen && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[80px] px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsSearchOpen(false); }}>
                    <div className="absolute inset-0 bg-black/40" onClick={() => setIsSearchOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white shadow-2xl rounded-sm z-10">
                        <div className="flex items-center border-b border-gray-200 px-4">
                            <FiSearch size={18} className="text-gray-400 shrink-0" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search for products..."
                                className="flex-1 py-3.5 px-3 text-sm text-gray-700 focus:outline-none bg-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        setIsSearchOpen(false);
                                        trackEvent('search', { query: searchQuery.trim() });
                                        setSearchQuery('');
                                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                    }
                                }}
                                aria-label="Search products"
                            />
                            <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-gray-600 ml-2">
                                <FiX size={20} />
                            </button>
                        </div>
                        {isSearching && (
                            <div className="px-4 py-3 text-xs text-gray-400">Searching...</div>
                        )}
                        {searchQuery && !isSearching && searchResults.length === 0 && (
                            <div className="px-4 py-3 text-xs text-gray-400">No products found</div>
                        )}
                        {searchResults.length > 0 && (
                            <div className="overflow-hidden">
                                {searchResults.map(({ keyword, count }) => (
                                    <button
                                        key={keyword}
                                        className="flex items-center justify-between w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left"
                                        onClick={() => {
                                            setIsSearchOpen(false);
                                            trackEvent('search', { query: keyword });
                                            setSearchQuery('');
                                            router.push(`/search?q=${encodeURIComponent(keyword)}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FiSearch size={13} className="text-gray-400 shrink-0" />
                                            <span className="font-medium text-gray-800">{keyword}</span>
                                        </div>
                                        <span className="text-gray-400 text-xs shrink-0">{count}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <CartSlider
                isOpen={cartOpen}
                onClose={closeCart}
            />
        </>
    );
}
