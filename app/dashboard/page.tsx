"use client"

import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import ProductCard from "@/components/products/product-card"
import { ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const { products, categories } = useProducts()
  const { user } = useAuth()

  // Get the first 4 products
  const featuredProducts = products.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism rounded-2xl p-6 md:p-8"
      >
        <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
        <p className="text-foreground/70 mt-2">
          Discover products and services from fellow students at {user?.university}.
        </p>
      </motion.div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          <Link
            href="/dashboard/categories"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.slice(0, 5).map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                href={`/dashboard/categories/${category.id}`}
                className="glassmorphism rounded-xl p-4 h-full flex flex-col items-center justify-center text-center hover:bg-primary-50 transition-all"
              >
                <div className="w-12 h-12 rounded-full glassmorphism-dark flex items-center justify-center mb-3">
                  <span className="text-xl">{category.icon}</span>
                </div>
                <h3 className="font-medium">{category.name}</h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Products</h2>
          <Link
            href="/dashboard/products"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
