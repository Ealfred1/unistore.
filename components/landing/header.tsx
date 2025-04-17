"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/providers/auth-provider"
import { useUniversities } from "@/providers/university-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const { getUniversityById } = useUniversities()
  const [universityAbbreviation, setUniversityAbbreviation] = useState<string | null>(null)

  // Get university abbreviation from localStorage or user profile
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

  const navItems = [
    { name: "Features", href: "/#features" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "Testimonials", href: "/#testimonials" },
    { name: "Browse Products", href: "/products" },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-b-gray-100 bg-white/80 backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <Logo size="lg" universityAbbreviation={universityAbbreviation} />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
            >
              <Link href={item.href} className="text-sm font-medium hover:text-[#f58220] transition-colors">
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Auth Buttons or User Profile */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="bg-transparent">
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={user?.profile_picture || ""} alt={user?.first_name || "User"} />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline" className="bg-transparent">
                  Log In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-[#0a2472] text-white hover:bg-[#0a2472]/90">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-gray-100 p-4">
                  <Logo size="md" universityAbbreviation={universityAbbreviation} />
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      {/* <X className="h-5 w-5" /> */}
                    </Button>
                  </SheetTrigger>
                </div>

                <nav className="flex-1 overflow-auto py-6 px-4">
                  <div className="space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center py-2 text-base font-medium hover:text-[#f58220] transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profile_picture || ""} alt={user?.first_name || "User"} />
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-[#0a2472] text-white hover:bg-[#0a2472]/90">
                            Dashboard
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <>
                        <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full mb-3 bg-transparent">
                            Log In
                          </Button>
                        </Link>
                        <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                          <Button className="w-full bg-[#0a2472] text-white hover:bg-[#0a2472]/90">Sign Up</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}
