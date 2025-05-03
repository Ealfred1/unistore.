"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  User,
  ShoppingBag,
  Heart,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Grid3X3,
  Sparkles,
  Plus,
  X,
  Store,
  PanelLeft,
  Zap,
  Brain,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useToast } from "@/components/ui/use-toast"
import { useUniversities } from "@/providers/university-provider"
import { useMessagingContext } from "@/providers/messaging-provider"
import { cn } from "@/lib/utils"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, upgradeToMerchant } = useAuth()
  const { products, categories, isLoading, fetchProducts } = useProducts()
  const { getUniversityById } = useUniversities()
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 1024px)")
  const { toast } = useToast()
  const { unreadCount } = useMessagingContext()

  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [requestForm, setRequestForm] = useState({
    productName: "",
    description: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [merchantName, setMerchantName] = useState("")
  const [universityAbbreviation, setUniversityAbbreviation] = useState<string | null>(null)
  const [aiButtonHovered, setAiButtonHovered] = useState(false)
  const [showAIButton, setShowAIButton] = useState(true)

  useEffect(() => {
    const getUniversityInfo = () => {
      // First check if user has a university in their profile
      if (user?.university) {
        const university = getUniversityById(user.university)
        if (university?.abbreviation) {
          setUniversityAbbreviation(university.abbreviation)
          return
        }
      }

      // Otherwise check localStorage for selected university
      const storedUniversityId = localStorage.getItem("unistore_university")
      if (storedUniversityId) {
        const university = getUniversityById(Number(storedUniversityId))
        if (university?.abbreviation) {
          setUniversityAbbreviation(university.abbreviation)
          return
        }
      }

      // Default to null if no university found
      setUniversityAbbreviation(null)
    }

    getUniversityInfo()
  }, [user, getUniversityById])

  // Handle scroll for AI button visibility
  useEffect(() => {
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setShowAIButton(currentScrollY <= 100 || currentScrollY < lastScrollY)
      lastScrollY = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Add keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        if (isMobile) {
          setMobileOpen(!mobileOpen)
        } else {
          setExpanded(!expanded)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [expanded, isMobile, mobileOpen])

  // Get university abbreviation
  useEffect(() => {
    const getUniversityInfo = () => {
      // First check if user has a university in their profile
      if (user?.university) {
        const university = getUniversityById(user.university)
        if (university?.abbreviation) {
          setUniversityAbbreviation(university.abbreviation)
          return
        }
      }

      // Otherwise check localStorage for selected university
      const storedUniversityId = localStorage.getItem("unistore_university")
      if (storedUniversityId) {
        const university = getUniversityById(Number(storedUniversityId))
        if (university?.abbreviation) {
          setUniversityAbbreviation(university.abbreviation)
          return
        }
      }

      // Default to null if no university found
      setUniversityAbbreviation(null)
    }

    getUniversityInfo()
  }, [user, getUniversityById])

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

  // Handle merchant upgrade
  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await upgradeToMerchant(merchantName)
      toast({
        title: "Success!",
        description: "Your account has been upgraded to merchant status.",
      })
      setShowUpgradeModal(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upgrade account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle AI button click
  const handleAiButtonClick = () => {
    if (user?.user_type === "MERCHANT") {
      router.push("/dashboard/merchant-requests")
    } else {
      router.push("/dashboard/request-product")
    }
  }

  // Navigation items with authentication checks
  const navItems = [
    // Only show Dashboard, Messages, Notifications for authenticated users
    // {
    //   name: "Dashboard",
    //   href: "/dashboard",
    //   icon: <Home className="h-5 w-5" />,
    //   color: "text-blue-600",
    //   bgColor: "bg-blue-100",
    // },
    ...(user ? [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: <Home className="h-5 w-5" />,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      {
        name: "Messages",
        href: "/dashboard/messages",
        icon: <MessageCircle className="h-5 w-5" />,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        badge: unreadCount > 0 ? unreadCount : null
      },
      {
        name: "Notifications",
        href: "/dashboard/messages",
        icon: <Bell className="h-5 w-5" />,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        badge: unreadCount > 0 ? unreadCount : null
      },
    ] : []),
    // Products always visible
    {
      name: "Products",
      href: "/products",
      icon: <ShoppingBag className="h-5 w-5" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    // My Products only for merchants
    ...(user?.user_type === "MERCHANT" ? [
      {
        name: "My Products",
        href: "/dashboard/my-products",
        icon: <Store className="h-5 w-5" />,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
    ] : []),
    // Saved, Profile, Settings only for authenticated users
    ...(user ? [
      {
        name: "Saved",
        href: "/dashboard/favorites",
        icon: <Heart className="h-5 w-5" />,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      {
        name: "Profile",
        href: "/dashboard/profile",
        icon: <User className="h-5 w-5" />,
        color: "text-pink-600",
        bgColor: "bg-pink-100",
      },
      {
        name: "Settings",
        href: "/dashboard/settings",
        icon: <Settings className="h-5 w-5" />,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      },
    ] : []),
  ]

  // Update categories display count based on authentication
  const displayCategoryCount = user ? 5 : 10;

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
          <div className="lg:ml-12">
            <Logo size="lg" universityAbbreviation={universityAbbreviation} />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* AI Button with animation */}
          {/* <motion.button
            className="relative p-2 rounded-lg bg-gradient-to-r from-indigo-500 via-orange-500 to-indigo-500 text-white overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setAiButtonHovered(true)}
            onHoverEnd={() => setAiButtonHovered(false)}
            onClick={handleAiButtonClick}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-orange-600 via-orange-300 to-purple-600"
              animate={{
                x: aiButtonHovered ? ["0%", "100%", "0%"] : "0%",
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
            <motion.div className="relative flex items-center gap-1">
              <motion.div
                animate={{
                  rotate: aiButtonHovered ? [0, 360] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Brain className="h-5 w-5" />
              </motion.div>
              <motion.span
                animate={{
                  opacity: aiButtonHovered ? 1 : 1,
                }}
                className="hidden sm:inline-block"
              >
                AI Request
              </motion.span>
              <motion.div
                animate={{
                  y: aiButtonHovered ? [-2, 2, -2] : 0,
                }}
                transition={{
                  duration: 0.5,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              >
                <Zap className="h-4 w-4" />
              </motion.div>
            </motion.div>
          </motion.button> */}

          {/* <button
            onClick={() => setShowRequestModal(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus className="h-5 w-5" />
          </button> */}
          <div className="flex items-center gap-1">
            {user && (
              <>
                {/* Messages Icon */}
                <Link
                  href="/dashboard/messages"
                  className="relative p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Icon */}
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>

          { user && (
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
                <p className="font-medium">
                  {user?.first_name} {user?.last_name}
                </p>
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
          )}
        </div>
      </header>

      <AnimatePresence>
        {showAIButton && (
          <motion.button
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={() => setAiButtonHovered(true)}
            onMouseLeave={() => setAiButtonHovered(false)}
            onClick={() => router.push("/coming-soon")}
            className="fixed bottom-20 right-6 z-50 p-5 rounded-full bg-gradient-to-r from-indigo-500 to-orange-500 text-white overflow-hidden transition-all duration-300"
          >
            <motion.div
              animate={{ opacity: aiButtonHovered ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Brain className="h-8 w-8" />
            </motion.div>
            <motion.div
              animate={{ opacity: aiButtonHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Zap className="h-8 w-8" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

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
        className="fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm"
        initial={isMobile ? { x: -280 } : { x: 0, width: 60 }}
        animate={isMobile ? { x: mobileOpen ? 0 : -280, width: 280 } : { x: 0, width: expanded ? 280 : 60 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className={cn("p-4 flex items-center justify-between", isMobile ? "pt-4" : "pt-4")}>
            {(expanded || isMobile) && (
              <div className="flex items-center">
                <Logo size="lg" universityAbbreviation={universityAbbreviation} />
                {/* {isMobile && (
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="absolute top-20 right-4 p-1 rounded-full bg-gray-100 text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )} */}
              </div>
            )}
            {!isMobile && (
              <button
                onClick={() => setExpanded(!expanded)}
                className={cn(
                  "p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700",
                  expanded ? "" : "mx-auto",
                )}
              >
                <PanelLeft className={`h-5 w-5 transition-transform ${expanded ? "" : "rotate-180"}`} />
              </button>
            )}
          </div>

          {/* User profile */}
          { user && (
          <div className="px-4 py-2">
            <div className={`flex items-center ${expanded || isMobile ? "space-x-3" : "justify-center"}`}>
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={user?.profile_picture || ""} alt={user?.first_name || "User"} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              {(expanded || isMobile) && (
                <div className="overflow-hidden">
                  <p className="font-medium truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
            <nav className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-xl px-3 py-2.5 transition-all relative group ${
                    pathname === item.href ? `${item.color} font-medium` : `hover:${item.bgColor}`
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
                  {categories.slice(0, displayCategoryCount).map((category) => (
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
                  {user?.user_type === "PERSONAL" && (
                    <div className="mr-3 p-2 rounded-lg bg-[#f58220]/20">
                      <Sparkles className="h-5 w-5 text-[#f58220]" />
                    </div>
                  )}
                  {user?.user_type === "PERSONAL" && (
                    <div>
                      <p className="text-sm font-medium">Upgrade to Merchant</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Sell your products</p>
                    </div>
                  )}
                </div>
                {user?.user_type === "PERSONAL" ? (
                  <Button
                    className="w-full mt-3 bg-[#f58220] hover:bg-[#f58220]/90"
                    onClick={() => setShowUpgradeModal(true)}
                  >
                    Upgrade Now
                  </Button>
                ) : (
                  <Button
                    className="w-full mt-3 bg-[#f58220] hover:bg-[#f58220]/90"
                    onClick={() => router.push("/dashboard/my-products")}
                  >
                    { user ? 'View My Products' : 'Login to View Products' }
                  </Button>
                )}
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
      <main className={`pt-16 bg-white transition-all duration-300 ${expanded ? "lg:pl-[280px]" : "lg:pl-[60px]"}`}>
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

      {/* Merchant upgrade modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Merchant</DialogTitle>
            <DialogDescription>Become a merchant to start selling your products on UniStore.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpgradeSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="merchantName" className="text-sm font-medium">
                  Merchant Name
                </label>
                <Input
                  id="merchantName"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="e.g. John's Electronics"
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" className="bg-[#f58220] hover:bg-[#f58220]/90" disabled={isSubmitting}>
                {isSubmitting ? "Upgrading..." : "Upgrade Now"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div> 
  )
}