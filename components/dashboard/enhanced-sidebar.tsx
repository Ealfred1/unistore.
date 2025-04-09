"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/providers/product-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Package,
  ShoppingBag,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ChevronLeft,
  Home,
  Heart,
} from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function EnhancedSidebar() {
  const { user, logout } = useAuth()
  const { categories } = useProducts()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setMobileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMobile, mobileOpen])

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false)
    }
  }, [pathname, isMobile, mobileOpen])

  // Set expanded state based on screen size
  useEffect(() => {
    setExpanded(!isMobile)
  }, [isMobile])

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setExpanded(!expanded)
    }
  }, [expanded, isMobile, mobileOpen])

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
    },
    {
      name: "My Products",
      href: "/dashboard/my-products",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Browse Products",
      href: "/dashboard/products",
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: <Heart className="h-5 w-5" />,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5)

  // Sidebar variants for animations
  const sidebarVariants = {
    expanded: {
      width: "280px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    collapsed: {
      width: "80px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    mobileOpen: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    mobileClosed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full glassmorphism"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop toggle button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex fixed bottom-6 left-6 z-50 p-3 rounded-full glassmorphism items-center justify-center"
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        <motion.div animate={{ rotate: expanded ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <ChevronLeft className="h-5 w-5" />
        </motion.div>
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        ref={sidebarRef}
        variants={sidebarVariants}
        initial={isMobile ? "mobileClosed" : "expanded"}
        animate={isMobile ? (mobileOpen ? "mobileOpen" : "mobileClosed") : expanded ? "expanded" : "collapsed"}
        className={`fixed top-0 left-0 h-full z-40 glassmorphism border-r border-white/20 overflow-hidden ${
          isMobile ? "w-[280px]" : ""
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Logo and user info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center">
              <motion.div
                animate={{ scale: [0.9, 1, 0.9], rotate: [0, 5, 0, -5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-700 flex items-center justify-center mr-3"
              >
                <span className="text-white font-bold text-lg">U</span>
              </motion.div>

              <AnimatePresence>
                {(expanded || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 min-w-0"
                  >
                    <h1 className="font-bold text-xl text-gradient">UniStore</h1>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User info */}
            <div className={`mt-4 flex items-center ${expanded || isMobile ? "justify-start" : "justify-center"}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-300">
                  <img
                    src={user?.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={user?.firstName || "User"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              <AnimatePresence>
                {(expanded || isMobile) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 flex-1 min-w-0"
                  >
                    <p className="font-medium truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-foreground/70 truncate">{user?.university || "University Student"}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-xl px-3 py-2.5 transition-all relative group ${
                    pathname === item.href ? "bg-primary-500/10 text-primary-600" : "hover:bg-white/10"
                  }`}
                >
                  <div className={`flex items-center justify-center ${expanded || isMobile ? "mr-3" : "mx-auto"}`}>
                    {item.icon}
                  </div>

                  <AnimatePresence>
                    {(expanded || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!expanded && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Categories section */}
            {(expanded || isMobile) && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="px-3 mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground/70">Categories</h3>
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="text-xs text-primary-500 hover:text-primary-600 flex items-center"
                  >
                    {showAllCategories ? "Show Less" : "View All"}
                    <ChevronRight
                      className={`h-3 w-3 ml-1 transition-transform ${showAllCategories ? "rotate-90" : ""}`}
                    />
                  </button>
                </div>

                <div className="space-y-1">
                  {displayedCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/dashboard/categories/${category.id}`}
                      className={`flex items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname === `/dashboard/categories/${category.id}`
                          ? "bg-primary-500/10 text-primary-600"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <span>{category.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Logout button */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={logout}
              className={`flex items-center rounded-xl px-3 py-2.5 text-red-500 hover:bg-red-500/10 transition-all w-full ${
                expanded || isMobile ? "justify-start" : "justify-center"
              }`}
            >
              <LogOut className="h-5 w-5" />

              <AnimatePresence>
                {(expanded || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
