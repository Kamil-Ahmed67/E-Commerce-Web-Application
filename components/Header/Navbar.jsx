'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { PiSignOutBold } from 'react-icons/pi';
import { FaPhoneAlt, FaRegHeart } from 'react-icons/fa';
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
    const [activeMenuId, setActiveMenuId] = useState(null);

    const lastClickedMenuId = useRef(null);
    const dropdownRef = useRef(null);

    const pathname = usePathname();
    const router = useRouter();

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

    /* Search debounce */
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const products = await getProducts();
                const results = products
                    .filter(p =>
                        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.styleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.productType.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 5);

                setSearchResults(results);
            } catch {
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    /* Fetch menu */
    useEffect(() => {
        menuData().then(setNavLinks);
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
        { id: 3, name: 'Avasaa', image: '/images/logo/3.png', brand: 'Avasaa', href: '/brands/avasa' },
        { id: 4, name: 'PureNorth', image: '/images/logo/1.png', brand: 'PureNorth', href: '/brands/purenorth' },
    ];
    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
        router.push('/');
    };

    return (
        <>
            <header className={`fixed manrope  w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-0' : 'bg-white/90 backdrop-blur-sm py-0'}`}>
                <div>
                    {/* First Line - Logo, Search, Icons */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-3">
                        {/* Mobile Menu Button - Left of Logo */}
                        <button
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                            className="md:hidden text-gray-700 hover:text-[#32BBAB] transition-colors z-50"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                        </button>
                        {/* Logo */}
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
                        {/* Wide Search Bar - Hidden on mobile */}
                        <div className="hidden md:flex flex-1  mx-4 max-w-xl relative min-w-0">
                            <div className="relative w-full" suppressHydrationWarning>
                                <input
                                    type="text"
                                    placeholder="Search for products..."
                                    className="w-full py-2.5 px-3 pr-8 rounded-none border text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#32BBAB] focus:border-transparent text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    aria-label="Search products"
                                />
                                <button
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#32BBAB]"
                                    aria-label="Search"
                                >
                                    <FiSearch size={18} />
                                </button>
                            </div>

                            {/* Search Results Dropdown */}
                            {(searchQuery && searchResults.length > 0) && (
                                <div className="absolute z-50 mt-1 w-full max-h-64 overflow-y-auto rounded-md bg-white shadow-lg border border-gray-200 top-full scrollbar-hide">
                                    {searchResults.map((item) => (
                                        <Link
                                            prefetch={false}
                                            key={item.id}
                                            href={`/shop-details/${item.id}`}
                                            className="flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-100"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSearchResults([]);
                                            }}
                                        >
                                            <div className="relative mr-2 h-10 w-10 shrink-0 overflow-hidden rounded-none border border-gray-200">
                                                {/* Image element */}
                                                <Image
                                                    src={item.imgs?.thumbnails[0] || '/images/placeholder.png'}
                                                    alt={item.styleNo || 'Product Image'}
                                                    width={40}
                                                    height={40}
                                                    className="h-full w-full object-cover object-center"

                                                />

                                                {/* Fallback background box */}
                                                <div className="hidden absolute inset-0 bg-gray-200 text-gray-500 text-[10px] items-center justify-center">
                                                    N/A
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between">
                                                    <h3 className="font-medium text-gray-900 truncate text-sm">{item.description}</h3>
                                                    <p className="ml-1 font-medium text-teal-700 text-sm">{item.sellingPrice} Tk</p>
                                                </div>
                                                <div className="flex items-center text-[0.65rem] text-gray-500">
                                                    <span>{item.productType}</span>
                                                    <span className="mx-0.5">-</span>
                                                    <span className='uppercase'>{item.brand}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {searchQuery && searchResults.length === 0 && !isSearching && (
                                <div className="absolute z-50 mt-1 w-full  rounded-md bg-white shadow-lg border border-gray-200 top-full p-3 text-xs text-gray-500">
                                    No products found
                                </div>
                            )}

                            {isSearching && (
                                <div className="absolute z-50 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 top-full p-3 text-xs text-gray-500">
                                    Searching...
                                </div>
                            )}
                        </div>

                        {/* Icons - Cart (visible on all screens) and Account (desktop only) */}
                        {/* Icons - Cart and User */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            {/* Cart Button - Visible on all screens */}
                            <div className="hidden lg:flex items-center gap-1">
                                <FaPhoneAlt size={18} className="text-[#32BBAB]" />
                                <span className=" text-gray-700 ">01302815322</span>
                            </div>
                            <Link href='/wishlist'>
                                <FaRegHeart size={24} className='text-[#32BBAB] hover:text-teal-900 pt-0.5' />
                            </Link>
                            <button
                                aria-label="Cart"
                                className="text-gray-600 hover:text-[#32BBAB] transition-colors relative"
                                onClick={openCart}
                            >
                                <IoBagOutline size={22} />
                                {mounted && itemCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-[#32BBAB] font-semibold text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {itemCount}
                                    </span>
                                )}
                            </button>

                            {/* User Section - Visible on all screens */}
                            {loginData ? (
                                <div className="relative group" ref={dropdownRef}>
                                    {/* Clickable area */}
                                    <div
                                        className="px-3 py-1.5 -mx-1 -my-1 rounded-lg transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                    >
                                        <span className="text-xs lg:text-sm text-gray-800 whitespace-nowrap">
                                            Hello, {loginData.Name}
                                        </span>
                                    </div>

                                    {/* Dropdown Menu - Same for both mobile and desktop */}
                                    <div className={`
        absolute right-0 top-10 mt-1 w-48 bg-white rounded-sm shadow-lg z-50 border border-gray-200
        transition-all duration-200 origin-top
        ${isUserDropdownOpen ?
                                            'opacity-100 scale-y-100' :
                                            'opacity-0 scale-y-95 pointer-events-none'
                                        }
      `}
                                        onMouseLeave={() => setIsUserDropdownOpen(false)}
                                    >
                                        <div className="px-4 py-3 border-b border-gray-200">
                                            <p className="text-sm font-medium text-gray-800 truncate">
                                                {loginData.Name}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {loginData.UserRole}
                                            </p>
                                        </div>

                                        <div className="py-1">
                                            {loginData.UserRole !== 'Customer' && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserDropdownOpen(false)}
                                                    prefetch={false}
                                                >
                                                    <RiAdminFill className="w-4 h-4 mr-3 shrink-0" />
                                                    Admin Panel
                                                </Link>
                                            )}

                                            <Link
                                                href={`/my-orders/${loginData.Id}`}
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                                prefetch={false}
                                            >
                                                <MdOutlineAccountCircle className="w-4 h-4 mr-3 shrink-0" />
                                                My Account
                                            </Link>
                                            <Link
                                                href="/wishlist"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-[#32BBAB] hover:bg-gray-50 transition-colors"
                                                onClick={() => setIsUserDropdownOpen(false)}
                                                prefetch={false}
                                            >
                                                <FaRegHeart className="w-4 h-4 mr-3 shrink-0" />
                                                Wishlist
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors border-t border-gray-200 mt-1"
                                            >
                                                <PiSignOutBold className="w-4 h-4 mr-3 shrink-0" />
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Sign In - Hidden on mobile */}
                                    <Link
                                        prefetch={false}
                                        href="/signin"
                                        className="hidden md:flex items-center gap-2.5"
                                        aria-label="Sign in"
                                    >
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M12 1.25C9.37666 1.25 7.25001 3.37665 7.25001 6C7.25001 8.62335 9.37666 10.75 12 10.75C14.6234 10.75 16.75 8.62335 16.75 6C16.75 3.37665 14.6234 1.25 12 1.25ZM8.75001 6C8.75001 4.20507 10.2051 2.75 12 2.75C13.7949 2.75 15.25 4.20507 15.25 6C15.25 7.79493 13.7949 9.25 12 9.25C10.2051 9.25 8.75001 7.79493 8.75001 6Z"
                                                fill="#32BBAB"
                                            />
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M12 12.25C9.68646 12.25 7.55494 12.7759 5.97546 13.6643C4.4195 14.5396 3.25001 15.8661 3.25001 17.5L3.24995 17.602C3.24882 18.7638 3.2474 20.222 4.52642 21.2635C5.15589 21.7761 6.03649 22.1406 7.22622 22.3815C8.41927 22.6229 9.97424 22.75 12 22.75C14.0258 22.75 15.5808 22.6229 16.7738 22.3815C17.9635 22.1406 18.8441 21.7761 19.4736 21.2635C20.7526 20.222 20.7512 18.7638 20.7501 17.602L20.75 17.5C20.75 15.8661 19.5805 14.5396 18.0246 13.6643C16.4451 12.7759 14.3136 12.25 12 12.25ZM4.75001 17.5C4.75001 16.6487 5.37139 15.7251 6.71085 14.9717C8.02681 14.2315 9.89529 13.75 12 13.75C14.1047 13.75 15.9732 14.2315 17.2892 14.9717C18.6286 15.7251 19.25 16.6487 19.25 17.5C19.25 18.8078 19.2097 19.544 18.5264 20.1004C18.1559 20.4022 17.5365 20.6967 16.4762 20.9113C15.4193 21.1252 13.9742 21.25 12 21.25C10.0258 21.25 8.58075 21.1252 7.5238 20.9113C6.46354 20.6967 5.84413 20.4022 5.4736 20.1004C4.79033 19.544 4.75001 18.8078 4.75001 17.5Z"
                                                fill="#32BBAB"
                                            />
                                        </svg>

                                        <div>
                                            <span className="block text-xs text-gray-500 uppercase">
                                                account
                                            </span>
                                            <p className="font-medium text-sm text-gray-800">
                                                Sign In
                                            </p>
                                        </div>
                                    </Link>

                                    {/* Mobile Sign In - Simple icon */}
                                    <Link
                                        prefetch={false}
                                        href="/signin"
                                        className="md:hidden text-gray-600 hover:text-[#32BBAB] transition-colors"
                                        aria-label="Sign in"
                                    >
                                        <MdOutlineAccountCircle className="w-6 h-6" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Second Line - Desktop Navigation */}
                    <nav className="hidden md:flex items-center h-11.5 border-t bg-black border-gray-100 justify-center py-2.75  relative">
                        <div className="flex space-x-8">
                            {navLinks.map((link) => (
                                <div
                                    key={link.Id}
                                    className={`relative ${link.submenu.length > 0 ? 'has-submenu' : ''}`}
                                >
                                    <Link
                                        prefetch={false}
                                        href={link.Path}
                                        onClick={() => handleMenuClick(link.Id)}
                                        className={`relative uppercase font-medium transition-colors ${activeMenuId === link.Id ? 'text-teal-400' : 'text-gray-50 hover:text-[#32BBAB]'
                                            } group`}
                                        aria-current={activeMenuId === link.Id ? "page" : undefined}
                                    >
                                        {link.Title}
                                        <span className={`
                                       absolute left-0 -bottom-3 h-1 bg-linear-to-r from-[#32BBAB] to-[#22a596]
                                       transition-all duration-300 ease-out
                                     ${activeMenuId === link.Id ? 'w-full' : 'w-0 group-hover:w-full'}
                                     `}></span>
                                    </Link>
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
                    {/* Mobile Navigation */}
                    <MobileDrawer
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                        navLinks={navLinks}
                        activeMenuId={activeMenuId}
                        onMenuClick={handleMenuClick}
                    />
                </div>
            </header>
            <CartSlider
                isOpen={cartOpen}
                onClose={closeCart}
            />
        </>
    );
}
