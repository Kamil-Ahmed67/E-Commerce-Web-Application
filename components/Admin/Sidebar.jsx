"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";

import { AiOutlineDashboard, AiOutlineLogout } from 'react-icons/ai';
import { GoSidebarCollapse } from 'react-icons/go';
import { FaThList, FaChevronDown } from 'react-icons/fa';
import { MdDiscount, MdEditCalendar, MdFeedback } from 'react-icons/md';
import { CgMenuGridR } from 'react-icons/cg';
import { IoSettings } from "react-icons/io5";
import { useBrandContext } from '@/provider/BrandProvider';
import { AuthContext } from '@/provider/AuthProvider';

const staticMenus = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/admin',
    icon: AiOutlineDashboard,
    children: null
  },
  {
    id: 'product',
    title: 'Product',
    href: null,
    icon: MdEditCalendar,
    children: [
      //{ id: 'add-product', title: 'Add Product', href: '/manage-product' },
      // { id: 'product-list', title: 'Product List', href: '/product-list' },
      { id: 'pos-product', title: 'Product List', href: '/pos-product' },
    ]
  },
  {
    id: 'menu',
    title: 'Menu',
    href: null,
    icon: CgMenuGridR,
    children: [
      { id: 'add-menu', title: 'Add Menu', href: '/menu' },
      { id: 'menu-list', title: 'Menu List', href: '/menu-list' },
      { id: 'add-banner', title: 'Add Banner', href: '/banner' },
      { id: 'banner-list', title: 'Banner List', href: '/manage-banner' }
    ]
  },
  {
    id: 'orders',
    title: 'Order List',
    href: '/manage-order',
    icon: FaThList,
    children: null
  },
  {
    id: 'discounts',
    title: 'Product Discounts',
    href: null,
    icon: MdDiscount,
    children: [
      { id: 'manual-discount', title: 'Manual Discount', href: '/discount' },
      { id: 'available-discounts', title: 'Available Discounts', href: '/discount-management' }
    ]
  },
  {
    id: 'feedback',
    title: 'Customer Feedback',
    href: '/customer-feedback',
    icon: MdFeedback,
    children: null
  },
   {
    id: 'settings',
    title: 'Settings',
    href: null,
    icon: IoSettings,
    children: [
    { id: 'feature-control', title: 'Feature Control', href: '/feature-control' },
    ]
  }
];

const Sidebar = () => {
  const { loginData, logout } = useContext(AuthContext);
  const { isCollapsed, setIsCollapsed } = useBrandContext();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const [userToggled, setUserToggled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Auto-open parent when child route is active
  const getActiveDropdownFromPath = () => {
    if (isCollapsed) return null;

    for (const menu of staticMenus) {
      if (!menu.children) continue;

      const match = menu.children.some(child =>
        pathname === child.href || pathname.startsWith(child.href)
      );

      if (match) return menu.id;
    }

    return null;
  };

  if (!isMounted) return null;

  const toggleDropdown = (id) => {
    if (!isCollapsed) {
      setUserToggled(true);
      setActiveDropdown(prev => (prev === id ? null : id));
    }
  };

  const isActive = (href) => {
    if (!href) return false;
    if (href === '/admin' || href === '/menu' || href === '/discount') {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(href);
  };

  const isSectionActive = (menu) => {
    if (menu.href && isActive(menu.href)) return true;
    if (menu.children) {
      return menu.children.some(child => isActive(child.href));
    }
    return false;
  };

  return (
    <>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
        .custom-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>

      <div
        className={`h-screen font-roboto bg-white text-gray-200 z-50 flex flex-col sticky top-0
          ${isCollapsed ? 'w-16' : 'w-55'} 
          transition-all duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="hidden lg:flex items-center border-b border-gray-300 justify-between h-16 bg-white px-4">
          {!isCollapsed && (
            <Link href="/" className="pl-2">
              <Image
                src="/images/logo/mingle-01.png"
                alt="Logo"
                width={120}
                height={35}
                priority
                quality={80}
                className="h-auto"
              />
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-teal-400 focus:outline-none"
          >
            {isCollapsed ? (
              <Image src="/images/logo/mi.png" alt="Toggle" width={32} height={32} priority />
            ) : (
              <GoSidebarCollapse size={24} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
          <nav className="space-y-1">
            {staticMenus
              .filter(menu =>
                loginData?.UserRole === 'Client'
                  ? !['product', 'menu', 'discounts'].includes(menu.id)
                  : true
              )
              .map((menu) => {
                const hasChildren = !!menu.children;
                const active = isSectionActive(menu);
                const derivedActiveDropdown = getActiveDropdownFromPath();
                const isOpen = userToggled
                  ? activeDropdown === menu.id
                  : derivedActiveDropdown === menu.id;
                return (
                  <div key={menu.id}>
                    {hasChildren ? (
                      <>
                        <div
                          onClick={() => toggleDropdown(menu.id)}
                          className={`group flex items-center px-4 py-2.5 cursor-pointer transition-all duration-200
                            ${active ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-teal-600 hover:text-white'}`}
                        >
                          <menu.icon className="w-5 h-5 shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="ml-3 text-sm font-medium">{menu.title}</span>
                              <FaChevronDown
                                className={`ml-auto text-xs transition-transform duration-300
                                  ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                              />
                            </>
                          )}
                        </div>

                        <AnimatePresence>
                          {!isCollapsed && isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="pl-10 py-1  space-y-1">
                                {menu.children.map((child) => (
                                  <Link key={child.id} href={child.href || '#'}>
                                    <div className='border-l-2 border-gray-300'>
                                      <div
                                        className={`py-1.5 text-sm  pl-2  transition-colors duration-200
                                        ${isActive(child.href)
                                            ? 'bg-teal-400 text-white font-medium'
                                            : 'text-gray-700 hover:bg-teal-600 hover:text-white'}`}
                                      >
                                        {child.title}
                                      </div>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link href={menu.href || '#'}>
                        <div
                          className={`group flex items-center px-4 py-2.5 transition-all duration-200
                            ${active ? 'bg-teal-500 text-white' : 'text-gray-700 hover:bg-teal-600 hover:text-white'}`}
                        >
                          <menu.icon className="w-5 h-5 shrink-0" />
                          {!isCollapsed && (
                            <span className="ml-3 text-sm font-medium">{menu.title}</span>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                );
              })}
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-gray-300 bg-white">
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-4 py-3 w-full text-sm font-medium 
              text-gray-800 hover:text-red-400 hover:bg-red-900/30 transition-all
              ${isCollapsed ? 'justify-center' : ''}`}
          >
            <AiOutlineLogout className="w-5 h-5" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;