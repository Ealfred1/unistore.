"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useAuth } from "@/providers/auth-provider"
import { Search, Heart, Bell, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user) return "U"
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-4">
                <Logo className="text-xl" />
                <nav className="flex flex-col gap-3">
                  <Link
                    href="/"
                    className={`text-sm font-medium ${
                      pathname === "/" ? "text-[#f58220]" : "hover:text-[#f58220] transition-colors"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/products"
                    className={`text-sm font-medium ${
                      pathname.startsWith("/products") ? "text-[#f58220]" : "hover:text-[#f58220] transition-colors"
                    }`}
                  >
                    Products
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className={`text-sm font-medium ${
                          pathname.startsWith("/dashboard")
                            ? "text-[#f58220]"
                            : "hover:text-[#f58220] transition-colors"
                        }`}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/my-products"
                        className="text-sm font-medium hover:text-[#f58220] transition-colors"
                      >
                        My Products
                      </Link>
                      <Link
                        href="/dashboard/favorites"
                        className="text-sm font-medium hover:text-[#f58220] transition-colors"
                      >
                        Favorites
                      </Link>
                      <button
                        onClick={logout}
                        className="text-sm font-medium text-left text-red-500 hover:text-red-600 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login" className="text-sm font-medium hover:text-[#f58220] transition-colors">
                        Login
                      </Link>
                      <Link href="/auth/signup" className="text-sm font-medium hover:text-[#f58220] transition-colors">
                        Sign Up
                      </Link>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
          <Logo size="lg" />
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium ${
                pathname === "/" ? "text-[#f58220]" : "hover:text-[#f58220] transition-colors"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`text-sm font-medium ${
                pathname.startsWith("/products") ? "text-[#f58220]" : "hover:text-[#f58220] transition-colors"
              }`}
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${
                  pathname.startsWith("/dashboard") ? "text-[#f58220]" : "hover:text-[#f58220] transition-colors"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="hidden md:flex relative w-64 lg:w-80">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard/favorites" className="hidden sm:flex">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favorites</span>
                </Button>
              </Link>
              <Link href="/dashboard/notifications" className="hidden sm:flex">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </Link>
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
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/my-products">My Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/favorites">Favorites</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500 focus:text-red-500" onSelect={() => logout()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hidden sm:flex">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-[#0a2472] hover:bg-[#0a2472]/90">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
