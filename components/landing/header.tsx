"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-b-gray-100 bg-white/80 backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between">
        <Logo size="lg" />
        <nav className="hidden md:flex items-center gap-6">
          {["Features", "How It Works", "Testimonials", "Browse Products"].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.1 }}
            >
              <Link
                href={item === "Browse Products" ? "/products" : `#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-sm font-medium hover:text-[#f58220] transition-colors"
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Link href="/auth/login">
              <Button variant="outline" className="hidden bg-transparent sm:flex">
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
      </div>
    </motion.header>
  )
}
