'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiPlus, FiMinus } from 'react-icons/fi'
import { useContext } from 'react'
import { AuthContext } from '@/provider/AuthProvider'
import { useRouter } from 'next/navigation'

const MOBILE_NAV_PRIMARY = [
    { id: 'new-arrivals', title: 'New Arrivals', path: '/new-arrival' },
    { id: 'women', title: 'Women', path: '/women' },
    { id: 'men', title: 'Men', path: '/men' },
    { id: 'brands', title: 'Brands', path: '/shop', isBrands: true },
    { id: 'latest-offers', title: 'Offers', path: '/latest-offers' },
]

const MOBILE_NAV_SECONDARY = [
    { id: 'about', title: 'Our Story', path: '/about' },
    { id: 'store-location', title: 'Store Location', path: '/store-location' },
    { id: 'customer-service', title: 'Customer Service', path: '/contact' },
    { id: 'news-events', title: 'News & Events', path: '/news-events' },
    { id: 'blog', title: 'Blog', path: '/blog' },
    {
        id: 'more',
        title: 'More',
        path: '#',
        submenu: [
            { title: 'Terms & Condition', path: '/terms' },
            { title: 'Privacy Policy', path: '/privacy-policy' },

            { title: 'Refund Policy', path: '/replacement-policy' },
            { title: 'Shipping & Delivery', path: '/delivery-timeline' },
        ],
    },
]

export default function MobileDrawer({ isOpen, onClose, brandCategories = [], navLinks = [], menCategories = [], womenCategories = [] }) {
    const pathname = usePathname()
    const router = useRouter()
    const { loginData, logout } = useContext(AuthContext)

    const BRAND_SLUGS = ['avasa', 'mingle', 'purenorth', 'vidjar'];
    const _brandMatch = pathname.match(/^\/brands\/([^/]+)/);
    const brandSlug = _brandMatch && BRAND_SLUGS.includes(_brandMatch[1]) ? _brandMatch[1] : null;

    /* Lock body scroll while drawer is open */
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const handleLogout = () => {
        logout()
        onClose()
        router.push('/')
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop — fixed, never scrolls */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 md:hidden bg-black/40"
                        style={{ touchAction: 'none' }}
                    />

                    {/* Drawer — full height from top */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 left-0 h-screen bg-white z-50 md:hidden w-[85vw] max-w-sm shadow-2xl flex flex-col"
                    >
                        {/* Drawer header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                            <span className="font-semibold text-gray-800 text-base">
                                My Account
                            </span>
                            <button
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                                aria-label="Close menu"
                            >
                                ×
                            </button>
                        </div>

                        {/* Auth action */}
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
                            {loginData ? (
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{loginData.Name}</p>
                                        <p className="text-xs text-gray-500">{loginData.Email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/signin"
                                    onClick={onClose}
                                    className="flex items-center justify-center w-full py-3 bg-[#32BBAB] text-white rounded font-medium text-sm hover:bg-[#279487] transition-colors"
                                >
                                    Sign In / Register
                                </Link>
                            )}
                        </div>

                        {/* Navigation — scrollable area only */}
                        <nav className="flex-1 overflow-y-auto overscroll-contain">
                            <div className="px-5 py-2">
                                {MOBILE_NAV_PRIMARY.map((item) => (
                                    <MobileNavItem
                                        key={item.id}
                                        item={item}
                                        pathname={pathname}
                                        onClose={onClose}
                                        brandCategories={
                                            item.isBrands ? brandCategories
                                                : item.id === 'men' ? menCategories
                                                    : item.id === 'women' ? womenCategories
                                                        : null
                                        }
                                        dark={false}
                                    />
                                ))}
                            </div>
                            <div className="px-5 py-2 bg-gray-900">
                                {MOBILE_NAV_SECONDARY.map((item) => (
                                    <MobileNavItem
                                        key={item.id}
                                        item={item}
                                        pathname={pathname}
                                        onClose={onClose}
                                        brandCategories={item.isBrands ? brandCategories : null}
                                        dark={true}
                                    />
                                ))}
                            </div>
                        </nav>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function MobileNavItem({ item, pathname, onClose, brandCategories, dark = false }) {
    const [open, setOpen] = useState(false)
    const hasSubmenu = (brandCategories && brandCategories.length > 0) || (item.submenu && item.submenu.length > 0)
    const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

    const labelClass = `text-sm font-medium uppercase tracking-wider transition-colors truncate ${isActive
        ? 'text-[#32BBAB]'
        : dark
            ? 'text-white hover:text-[#32BBAB]'
            : 'text-gray-800 hover:text-[#32BBAB]'
        }`

    const subItems = brandCategories
        ? brandCategories.map(c => ({ title: c.name, path: c.href }))
        : item.submenu || []

    return (
        <div className={`border-b last:border-0 ${dark ? 'border-white/10' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between min-h-[48px] py-2">
                {item.isBrands ? (
                    <span className={`flex-1 cursor-default ${labelClass}`}>
                        {item.title}
                    </span>
                ) : (
                    <Link
                        href={item.path === '#' ? '#' : item.path}
                        prefetch={false}
                        onClick={() => { if (item.path !== '#') onClose() }}
                        className={`flex-1 ${labelClass}`}
                    >
                        {item.title}
                    </Link>
                )}

                {hasSubmenu && (
                    <button
                        onClick={() => setOpen(!open)}
                        className={`p-2 -mr-2 ${dark ? 'text-white/50 hover:text-[#32BBAB]' : 'text-gray-400 hover:text-[#32BBAB]'}`}
                        aria-label={open ? 'Collapse' : 'Expand'}
                    >
                        {open ? <FiMinus className="w-5 h-5" /> : <FiPlus className="w-5 h-5" />}
                    </button>
                )}
            </div>

            {hasSubmenu && (
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="pb-2 pl-4 space-y-0.5 border-l-2 border-[#32BBAB]/30 ml-1">
                                {subItems.map((sub) => (
                                    <Link
                                        key={sub.path}
                                        href={sub.path}
                                        prefetch={false}
                                        onClick={onClose}
                                        className={`block py-2 text-sm transition-colors hover:text-[#32BBAB] ${dark ? 'text-white/70' : 'text-gray-600'}`}
                                    >
                                        {sub.title}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    )
}
