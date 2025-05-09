"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/providers/product-provider"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  User,
  Package,
  ShoppingBag,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ChevronLeft,
  Home,
  Heart,
  Search,
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
      icon: <Home className="h-5 w-5 text-[#f58220]" />,
      activeColor: "from-[#f58220]/20 to-[#f58220]/10",
      hoverColor: "from-[#f58220]/10 to-[#f58220]/5",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5 text-[#0a2472]" />,
      activeColor: "from-[#0a2472]/20 to-[#0a2472]/10",
      hoverColor: "from-[#0a2472]/10 to-[#0a2472]/5",
    },
    {
      name: "My Products",
      href: "/dashboard/my-products",
      icon: <Package className="h-5 w-5 text-emerald-500" />,
      activeColor: "from-emerald-500/20 to-emerald-500/10",
      hoverColor: "from-emerald-500/10 to-emerald-500/5",
    },
    {
      name: "Browse Products",
      href: "/dashboard/products",
      icon: <ShoppingBag className="h-5 w-5 text-purple-500" />,
      activeColor: "from-purple-500/20 to-purple-500/10",
      hoverColor: "from-purple-500/10 to-purple-500/5",
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: <Heart className="h-5 w-5 text-pink-500" />,
      activeColor: "from-pink-500/20 to-pink-500/10",
      hoverColor: "from-pink-500/10 to-pink-500/5",
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />,
      activeColor: "from-blue-500/20 to-blue-500/10",
      hoverColor: "from-blue-500/10 to-blue-500/5",
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="h-5 w-5 text-amber-500" />,
      activeColor: "from-amber-500/20 to-amber-500/10",
      hoverColor: "from-amber-500/10 to-amber-500/5",
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5 text-gray-500" />,
      activeColor: "from-gray-500/20 to-gray-500/10",
      hoverColor: "from-gray-500/10 to-gray-500/5",
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full glassmorphism shadow-lg"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop toggle button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex fixed bottom-6 left-6 z-50 p-3 rounded-full glassmorphism shadow-lg items-center justify-center"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
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
        className={`fixed top-0 left-0 h-full z-40 glassmorphism shadow-xl border-r border-white/20 overflow-hidden ${
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
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f58220] to-[#0a2472] flex items-center justify-center mr-3 shadow-lg"
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
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#f58220]/30 shadow-md">
                  <Image
                    src={user?.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={user?.firstName || "User"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
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

          {/* Search bar */}
          {(expanded || isMobile) && (
            <div className="px-4 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-xl px-3 py-2.5 transition-all relative group ${
                    pathname === item.href
                      ? `bg-gradient-to-r ${item.activeColor} shadow-md`
                      : `hover:bg-gradient-to-r ${item.hoverColor}`
                  }`}
                >
                  <div
                    className={`flex items-center justify-center ${
                      expanded || isMobile ? "mr-3" : "mx-auto"
                    } transition-all`}
                  >
                    {item.icon}
                  </div>

                  <AnimatePresence>
                    {(expanded || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="truncate font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#f58220] to-[#0a2472] rounded-r-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!expanded && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
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
                    className="text-xs text-[#f58220] hover:text-[#f58220]/80 flex items-center"
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
                          ? "bg-[#f58220]/10 text-[#f58220] font-medium"
                          : "hover:bg-white/10"
                      }`}
                    >
                      <span className="mr-2">{category.icon}</span>
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
                    className="ml-3 font-medium"
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
