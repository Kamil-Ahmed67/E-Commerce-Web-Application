'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FiChevronDown } from 'react-icons/fi'
import { useContext } from 'react'
import { AuthContext } from '@/provider/AuthProvider'
export default function MobileDrawer({ isOpen, onClose, navLinks, activeMenuId, onMenuClick }) {
  const pathname = usePathname()
  const router = useRouter()
  const { loginData, logout } = useContext(AuthContext)
  const [navbarHeight, setNavbarHeight] = useState(80) // fallback

  // Measure navbar height dynamically
  useEffect(() => {
    const navbar = document.querySelector('header')
    if (!navbar) return

    const updateHeight = () => setNavbarHeight(navbar.offsetHeight)

    updateHeight()
    window.addEventListener('resize', updateHeight)

    const observer = new ResizeObserver(updateHeight)
    observer.observe(navbar)

    return () => {
      window.removeEventListener('resize', updateHeight)
      observer.disconnect()
    }
  }, [])

  const handleLogout = () => {
    logout()
    onClose()
    router.push('/')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 md:hidden bg-white"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 bg-white z-50 md:hidden overflow-y-auto"
            style={{
              top: navbarHeight,
              maxHeight: `calc(100vh - ${navbarHeight}px)`,
            }}
          >
            <div className="flex flex-col h-full min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-3 px-6 space-y-1 overflow-y-auto">
                {navLinks.map((link) => (
                  <MobileNavItem
                    key={link.Id}
                    link={link}
                    isActive={activeMenuId === link.Id || pathname.startsWith(link.Path)}
                    onMenuClick={onMenuClick}
                    onClose={onClose}
                  />
                ))}
              </nav>

              {/* Auth Footer */}
              <div className="border-t mb-12 border-gray-200 p-6 bg-gray-50">
                {loginData ? (
                  <div className="space-y-2 text-center">
                    <p className="text-lg font-semibold text-gray-900">{loginData.Name}</p>
                    <p className="text-sm text-gray-500">{loginData.Email}</p>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-700 text-white rounded hover:bg-red-800 font-medium text-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/signin"
                    onClick={onClose}
                    className="block w-full py-4 bg-[#32BBAB] text-white text-center rounded-xl hover:bg-[#2aa89a] font-medium text-lg"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// MobileNavItem component
function MobileNavItem({ link, isActive, onMenuClick, onClose }) {
  const [open, setOpen] = useState(false)
  const hasSubmenu = link.submenu && link.submenu.length > 0

  const handleClick = () => {
    if (hasSubmenu) setOpen(!open)
    else {
      onMenuClick(link.Id)
      onClose()
    }
  }

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span
          className={`text-lg font-medium transition-colors ${
            isActive ? 'text-[#32BBAB]' : 'text-gray-800 group-hover:text-[#32BBAB]'
          }`}
        >
          {link.Title}
        </span>
        {hasSubmenu && (
          <FiChevronDown
            className={`w-6 h-6 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {hasSubmenu && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="py-3 pl-8 space-y-3 border-l-2 border-[#32BBAB]/20">
                {link.submenu.map((sub) => (
                  <Link
                    key={sub.Id}
                    href={sub.Path}
                    prefetch={false}
                    onClick={() => {
                      onMenuClick(link.Id)
                      onClose()
                    }}
                    className="block py-3 text-gray-600 hover:text-[#32BBAB] hover:translate-x-1 transition-all font-medium"
                  >
                    {sub.Title}
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
