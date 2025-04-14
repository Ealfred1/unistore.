"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

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
        <Logo size="lg" />

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

        <div className="flex items-center gap-4">
          {/* Desktop Auth Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Link href="/auth/login">
                <Button variant="outline" className="bg-transparent">
                  Log In
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Link href="/auth/signup">
                <Button className="bg-[#0a2472] text-white hover:bg-[#0a2472]/90">Sign Up</Button>
              </Link>
            </motion.div>
          </div>

          {/* Mobile Sign Up Button */}
          <div className="sm:hidden">
            <Link href="/auth/signup">
              <Button size="sm" className="bg-[#0a2472] text-white hover:bg-[#0a2472]/90">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <Logo size="md" />
                  <SheetTrigger asChild>
                    {/* <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                    </Button> */}
                  </SheetTrigger>
                </div>

                <nav className="flex-1 overflow-auto py-6 px-4">
                  <div className="space-y-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center py-2 text-base font-medium hover:text-[#f58220] transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link href="/auth/login">
                      <Button variant="outline" className="w-full mb-3 bg-transparent">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="w-full bg-[#0a2472] text-white hover:bg-[#0a2472]/90">Sign Up</Button>
                    </Link>
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
