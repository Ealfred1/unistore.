"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, ShoppingBag, ChevronRight, Store, Book, Laptop, Smartphone, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative bg-white py-20 md:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr] lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block rounded-lg bg-[#f58220]/10 px-3 py-1 text-sm text-[#f58220]"
            >
              Campus Marketplace
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl"
            >
              <span className="text-[#f58220]">Uni</span>
              <span className="text-[#0a2472]">store</span>: Your Campus Marketplace
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
            >
              Buy, sell, and discover products within your university community. Connect with fellow students and find
              what you need.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col gap-2 min-[400px]:flex-row"
            >
              <Link href="/products">
                <Button className="bg-[#f58220] text-white hover:bg-[#f58220]/90">
                  Shop Now
                  <Store className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button className="bg-transparent" variant="outline">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mx-auto lg:ml-auto hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-[700px] aspect-square">
              <motion.div
                initial={{ rotate: 0, scale: 1 }}
                animate={{ rotate: 3, scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-br from-[#f58220]/20 to-[#0a2472]/20 rounded-2xl"
              ></motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="relative bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-[#0a2472] flex items-center justify-center text-white">
                        <Store className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold">Campus Store</p>
                        <p className="text-gray-500">Your University Marketplace</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((item) => (
                      <motion.div
                        key={item}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + item * 0.1 }}
                        className="bg-gradient-to-br from-[#f58220]/5 to-[#0a2472]/5 rounded-xl p-4 aspect-square flex items-center justify-center relative overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#f58220]/10 to-[#0a2472]/10 transform scale-105 group-hover:scale-100 transition-transform duration-300"></div>
                        <div className="relative z-10 text-center">
                          <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center">
                            {item === 1 && <Book className="h-6 w-6 text-[#f58220]" />}
                            {item === 2 && <Laptop className="h-6 w-6 text-[#0a2472]" />}
                            {item === 3 && <Smartphone className="h-6 w-6 text-[#f58220]" />}
                            {item === 4 && <Headphones className="h-6 w-6 text-[#0a2472]" />}
                          </div>
                          <p className="text-sm font-medium">
                            {item === 1 && "Books"}
                            {item === 2 && "Electronics"}
                            {item === 3 && "Gadgets"}
                            {item === 4 && "Accessories"}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm font-medium">Discover More Categories</p>
                    <ArrowRight className="h-4 w-4 text-[#f58220]" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
