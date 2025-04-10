"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/providers/product-provider"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  User,
  Package,
  ShoppingBag,
  Heart,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  ChevronRight,
  Grid3X3,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { useMediaQuery } from "@/hooks/use-media-query"
import Image from "next/image"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { categories } = useProducts()
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 1024px)")

  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [requestForm, setRequestForm] = useState({
    productName: "",
    description: "",
    category: "",
  })

  // Set expanded state based on screen size
  useEffect(() => {
    setExpanded(!isMobile)
  }, [isMobile])

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false)
    }
  }, [pathname, isMobile, mobileOpen])

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"
    return `${user.first_name?.charAt(0)}${user.last_name?.charAt(0)}`
  }

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/products?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  // Handle request submit
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would call an API to submit the request
    alert(`Request submitted: ${requestForm.productName}`)
    setShowRequestModal(false)
    setRequestForm({
      productName: "",
      description: "",
      category: "",
    })
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      color: "text-[#f58220]",
      bgColor: "bg-[#f58220]/10",
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <User className="h-5 w-5" />,
      color: "text-[#0a2472]",
      bgColor: "bg-[#0a2472]/10",
    },
    {
      name: "My Products",
      href: "/dashboard/my-products",
      icon: <Package className="h-5 w-5" />,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      name: "Browse Products",
      href: "/dashboard/products",
      icon: <ShoppingBag className="h-5 w-5" />,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      name: "Favorites",
      href: "/dashboard/favorites",
      icon: <Heart className="h-5 w-5" />,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: <MessageCircle className="h-5 w-5" />,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      badge: 3,
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: <Bell className="h-5 w-5" />,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      badge: 5,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
    },
  ]

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 z-40 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => (isMobile ? setMobileOpen(!mobileOpen) : setExpanded(!expanded))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo className="text-xl" />
        </div>

        <div className="hidden md:flex relative w-96">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              5
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile_picture} alt={user?.first_name} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="w-[200px] truncate text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500" onSelect={() => logout()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        initial={isMobile ? "mobileClosed" : "expanded"}
        animate={isMobile ? (mobileOpen ? "mobileOpen" : "mobileClosed") : expanded ? "expanded" : "collapsed"}
        className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-16 overflow-hidden ${
          isMobile ? "w-[280px]" : ""
        }`}
      >
        <div className="h-full flex flex-col">
          {/* User info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#f58220]/30">
                  <Image
                    src={user?.profile_picture || "/placeholder.svg?height=40&width=40"}
                    alt={user?.first_name || "User"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
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
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.user_type === "MERCHANT" ? "Merchant" : "Personal User"}
                    </p>
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
                    pathname === item.href ? `${item.bgColor} ${item.color} font-medium` : `hover:${item.bgColor}`
                  }`}
                >
                  <div
                    className={`flex items-center justify-center ${
                      expanded || isMobile ? "mr-3" : "mx-auto"
                    } transition-all ${item.color}`}
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
                        className="truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Badge */}
                  {item.badge && (
                    <AnimatePresence>
                      {expanded || isMobile ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="ml-auto"
                        >
                          <Badge variant="secondary" className="bg-red-500 text-white hover:bg-red-600">
                            {item.badge}
                          </Badge>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white"
                        >
                          {item.badge}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Active indicator */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full ${item.color.replace("text-", "bg-")}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Tooltip for collapsed state */}
                  {!expanded && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Categories section */}
            {(expanded || isMobile) && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
                  <Link
                    href="/dashboard/categories"
                    className="text-xs text-[#f58220] hover:text-[#f58220]/80 flex items-center"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>

                <div className="space-y-1">
                  {categories.slice(0, 5).map((category) => (
                    <Link
                      key={category.id}
                      href={`/dashboard/categories/${category.id}`}
                      className={`flex items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                        pathname === `/dashboard/categories/${category.id}`
                          ? "bg-[#f58220]/10 text-[#f58220] font-medium"
                          : "hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span className="mr-2">{category.icon || <Grid3X3 className="h-4 w-4" />}</span>
                      <span>{category.name}</span>
                      <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{category.product_count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            {expanded || isMobile ? (
              <div className="p-3 rounded-xl bg-[#f58220]/10 border border-[#f58220]/20">
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-lg bg-[#f58220]/20">
                    <Sparkles className="h-5 w-5 text-[#f58220]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upgrade to Merchant</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sell your products</p>
                  </div>
                </div>
                <Button className="w-full mt-3 bg-[#f58220] hover:bg-[#f58220]/90">Upgrade Now</Button>
              </div>
            ) : (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <main className={`pt-16 transition-all duration-300 ${expanded ? "lg:pl-[280px]" : "lg:pl-[80px]"}`}>
        <div className="container py-8">{children}</div>
      </main>

      {/* Request product modal */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Product</DialogTitle>
            <DialogDescription>Let other students know what you're looking for.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="productName" className="text-sm font-medium">
                  Product Name
                </label>
                <Input
                  id="productName"
                  value={requestForm.productName}
                  onChange={(e) => setRequestForm({ ...requestForm, productName: e.target.value })}
                  placeholder="e.g. MacBook Pro 2021"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  value={requestForm.category}
                  onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={requestForm.description}
                  onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe what you're looking for in detail..."
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-[#f58220] hover:bg-[#f58220]/90">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
