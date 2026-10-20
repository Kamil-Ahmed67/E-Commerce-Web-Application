'use client'

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiLogOut } from 'react-icons/fi';
import { RxHamburgerMenu } from 'react-icons/rx';
import { LuUserRoundPlus } from 'react-icons/lu';
import { FaRegCircleUser, FaList, FaChevronDown } from 'react-icons/fa6';
import { AiOutlineDashboard, AiOutlineLogout } from 'react-icons/ai';
import { MdEditCalendar, MdPeopleAlt } from 'react-icons/md';
import { GoDotFill } from 'react-icons/go';
import { useAuth } from '@/provider/AuthProvider';
import { usePathname } from 'next/navigation';
import { useBrandContext } from '@/provider/BrandProvider';
import Image from 'next/image';

export default function Navbar({ initialUserName = '' }) {
    const { loginData, logout } = useAuth();
    const dropdownRef = useRef(null);
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const pathname = usePathname();
    const userName = initialUserName || loginData?.Name || '';
    const { isCollapsed, setIsCollapsed } = useBrandContext();
    const [displayName, setDisplayName] = useState('');

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleDropdown = (index) => {
        setActiveDropdown(activeDropdown === index ? null : index);
    };

    const isActive = (href) => pathname.startsWith(href);

    useEffect(() => {
        // defer updating state to the next frame
        const id = requestAnimationFrame(() => {
            setDisplayName(userName);
        });

        const preconnectLink = document.createElement('link');
        preconnectLink.rel = 'preconnect';
        preconnectLink.href = window.location.origin;
        document.head.appendChild(preconnectLink);

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }

            const mobileMenu = document.querySelector('.mobile-sidebar');
            if (isMobileMenuOpen && mobileMenu && !mobileMenu.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            cancelAnimationFrame(id); // cleanup
            document.removeEventListener('mousedown', handleClickOutside);
            if (document.head.contains(preconnectLink)) {
                document.head.removeChild(preconnectLink);
            }
        };
    }, [isMobileMenuOpen, userName]);

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/10 backdrop-blur-sm bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`mobile-sidebar sm:hidden block fixed top-0 left-0 h-full bg-white z-50 shadow-xl transform transition-all duration-300 ease-in-out 
                      ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between mb-3 py-3 px-4">
                        <Link prefetch={false} href="/" onClick={() => setIsMobileMenuOpen(false)}>
                            <Image
                                src="/images/logo/mingle-01.png"
                                alt="Logo"
                                width={90}
                                height={20}
                                priority
                                quality={75}
                                loading="eager"
                                className="h-auto w-auto"
                                placeholder="blur"
                                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                            />
                        </Link>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            aria-label="Close menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Sidebar Menu */}
                    <nav className="flex-1 space-y-2 overflow-y-auto">
                        {/* Dashboard */}
                        <Link
                            prefetch={false}
                            href="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 ${isActive('/admin') ? 'bg-gray-100 text-[#46c0c0]' : 'text-gray-700'}`}>
                                <AiOutlineDashboard className="w-5 h-5" />
                                <span className="ml-3 text-sm font-medium">Dashboard</span>
                            </div>
                        </Link>

                        {/* Product Management */}
                        {loginData?.UserRole !== "Client" && (
                            <div className="text-gray-700">
                                <div
                                    className="flex items-center justify-between px-4 py-3 rounded-md hover:bg-gray-100 cursor-pointer"
                                    onClick={() => toggleDropdown(2)}
                                >
                                    <div className="flex items-center">
                                        <MdEditCalendar className="w-5 h-5" />
                                        <span className="ml-3 text-sm font-medium">Product Manage</span>
                                    </div>
                                    <FaChevronDown className={`text-xs transition-transform ${activeDropdown === 2 ? "rotate-180" : "rotate-0"}`} />
                                </div>
                                <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === 2 ? "max-h-32" : "max-h-0"}`}>
                                    <Link
                                        href="/manage-product"
                                        prefetch={false}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 px-8 py-2 text-sm hover:bg-gray-100 ${isActive('/manage-product') ? 'bg-gray-100 text-[#46c0c0]' : 'text-gray-700'}`}
                                    >
                                        <GoDotFill size={10} />
                                        Add New Product
                                    </Link>
                                    <Link
                                        href="/product-list"
                                        prefetch={false}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 px-8 py-2 text-sm hover:bg-gray-100 ${isActive('/product-list') ? 'bg-gray-100 text-[#46c0c0]' : 'text-gray-700'}`}
                                    >
                                        <GoDotFill size={10} />
                                        Product List
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Manage Customer */}
                        <Link
                            prefetch={false}
                            href="/manage-customer"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 ${isActive('/manage-customer') ? 'bg-gray-100 text-[#46c0c0]' : 'text-gray-700'}`}>
                                <MdPeopleAlt className="w-5 h-5" />
                                <span className="ml-3 text-sm font-medium">Manage Customer</span>
                            </div>
                        </Link>

                        {/* Order List */}
                        <Link
                            prefetch={false}
                            href="/manage-order-demo"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 ${isActive('/manage-order-demo') ? 'bg-gray-100 text-[#46c0c0]' : 'text-gray-700'}`}>
                                <FaList className="w-5 h-5" />
                                <span className="ml-3 text-sm font-medium">Order List</span>
                            </div>
                        </Link>

                        {/* Discount */}
                        <Link
                            prefetch={false}
                            href="/discount-management"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <div className={`flex items-center px-4 py-3 rounded-md hover:bg-gray-100 ${isActive('/discount-management') ? 'bg-gray-100 text-[#46c0c0]' : 'text-gray-700'}`}>
                                <FaList className="w-5 h-5" />
                                <span className="ml-3 text-sm font-medium">Discount</span>
                            </div>
                        </Link>
                    </nav>

                    {/* Logout */}
                    <div className="mt-auto pt-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                logout();
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-red-500 rounded-md"
                        >
                            <AiOutlineLogout className="w-5 h-5" />
                            <span className="ml-3 text-sm font-medium">Log Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <div className="navbar z-30 flex py-5 font-roboto justify-between p-2 shadow-lg bg-gray-600 text-gray-100">
                {/* Mobile menu button - shown only on mobile */}
                <div className="block sm:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="btn btn-ghost btn-circle"
                        aria-label="Toggle menu"
                    >
                        <RxHamburgerMenu className="text-2xl text-gray-100" />
                    </button>
                </div>
                <div className="hidden sm:block">
                    <div className="btn btn-ghost btn-circle" onClick={toggleSidebar}>
                        <RxHamburgerMenu className="text-2xl text-gray-1" />
                    </div>
                </div>

                {/* Center placeholder */}
                <div className="navbar-center"></div>

                {/* User dropdown */}
                <div className="navbar-end flex gap-2 items-center">
                    <div
                        className="relative group"
                        ref={dropdownRef}
                    >
                        {/* Clickable area that's larger than just the text */}
                        <div
                            className="px-4 py-2 -mx-2 -my-2 rounded-lg transition-colors duration-200 group-hover:bg-gray-600/20"
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                            onMouseEnter={() => setDropdownOpen(true)}
                        >
                            <h1
                                className="text-xs text-gray-100 lg:text-sm cursor-pointer whitespace-nowrap"
                                style={{
                                    fontFamily: 'var(--font-roboto)',
                                    fontWeight: 500,
                                    opacity: displayName ? 1 : 0,
                                    transition: 'opacity 0.2s ease'
                                }}
                            >
                                Hello, {displayName}
                            </h1>
                        </div>

                        {/* Dropdown with better positioning and transitions */}
                        <div className={`
                        absolute right-0 top-full mt-1 w-56 bg-white rounded  border border-gray-200 z-50
                        transition-all duration-200 origin-top
                        ${isDropdownOpen ?
                                'opacity-100 scale-y-100' :
                                'opacity-0 scale-y-95 pointer-events-none'
                            }
                           `}>
                            <div className="px-4 py-3 border-b border-gray-200">
                                <p className="text-base font-medium text-gray-800 truncate">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {loginData?.UserRole}
                                </p>
                            </div>

                            <div className="py-1">
                                <Link
                                    href="/profile"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setDropdownOpen(false)}
                                    prefetch={false}
                                >
                                    <FaRegCircleUser className="w-4 h-4 mr-3 shrink-0" />
                                    My Profile
                                </Link>

                                {loginData?.UserRole !== 'Client' && (
                                    <Link
                                        href="/client-registration"
                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => setDropdownOpen(false)}
                                        prefetch={false}
                                    >
                                        <LuUserRoundPlus className="w-4 h-4 mr-3 shrink-0" />
                                        Client Registration
                                    </Link>
                                )}

                                <button
                                    onClick={() => {
                                        logout();
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-200 mt-1"
                                >
                                    <FiLogOut className="w-4 h-4 mr-3 shrink-0" />
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}