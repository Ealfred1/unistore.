"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
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
  Plus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/ui/logo"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Input } from "@/components/ui/input"
import { useProducts } from "@/providers/product-provider"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { products, categories, isLoading, fetchProducts } = useProducts()
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 1024px)")

  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({
    productName: "",
    description: "",
    category: "",
  })

  // Set expanded state based on screen size
  useEffect(() => {
    setExpanded(!isMobile)
  }, [isMobile])

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"
    return `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`.toUpperCase()
  }

  // Handle request submit
  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement request submission
    setShowRequestModal(false)
  }

  // Navigation items - using the correct items from the snippet
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 z-30">
        <div className="flex items-center">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-3 lg:hidden">
            <Logo className="text-xl" />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profile_picture || ""} alt={user?.first_name || "User"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Overlay for mobile - closes sidebar when clicked outside */}
      <AnimatePresence>
        {mobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 bottom-0 z-40 w-[280px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm ${
          isMobile ? "pt-16" : "pt-0"
        }`}
        initial={isMobile ? { x: -280 } : { x: expanded ? 0 : -200 }}
        animate={
          isMobile
            ? { x: mobileOpen ? 0 : -280 }
            : { x: 0, width: expanded ? 280 : 80 }
        }
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Logo className={`${expanded || isMobile ? "text-xl" : "hidden"}`} />
              {isMobile && (
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-full bg-gray-100 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight
                  className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>

          {/* User profile */}
          <div className="px-4 py-2">
            <div className={`flex items-center ${expanded || isMobile ? "space-x-3" : "justify-center"}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profile_picture || ""} alt={user?.first_name || "User"} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              {(expanded || isMobile) && (
                <div className="overflow-hidden">
                  <p className="font-medium truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-xl px-3 py-2.5 transition-all relative group ${
                    pathname === item.href ? `${item.bgColor} ${item.color} font-medium` : `hover:${item.bgColor}`
                  }`}
                  onClick={() => isMobile && setMobileOpen(false)}
                >
                  <div
                    className={`flex items-center justify-center ${
                      expanded || isMobile ? "mr-3" : "mx-auto"
                    } transition-all ${pathname === item.href ? item.color : "text-gray-500"}`}
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
                          className="absolute -top-1 -right-1"
                        >
                          <Badge variant="secondary" className="bg-red-500 text-white hover:bg-red-600 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                            {item.badge}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
                    onClick={() => isMobile && setMobileOpen(false)}
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
                      onClick={() => isMobile && setMobileOpen(false)}
                    >
                      <span className="mr-2 text-gray-500">{category.icon || <Grid3X3 className="h-4 w-4" />}</span>
                      <span className="truncate">{category.name}</span>
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
      <main className={`pt-16 bg-white  transition-all duration-300 ${expanded ? "lg:pl-[280px]" : "lg:pl-[80px]"}`}>
        <div className="container p-2 lg:p-4 py-8">{children}</div>
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
