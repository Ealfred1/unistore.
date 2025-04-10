"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/products/product-card"
import { ArrowRight, TrendingUp, Users, ShoppingBag, Heart, Clock, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const { products, categories } = useProducts()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Get the first 4 products
  const featuredProducts = products.slice(0, 4)

  // Recent activity (mock data)
  const recentActivity = [
    {
      id: 1,
      type: "view",
      product: "MacBook Pro 2021",
      time: "2 hours ago",
      image: "/placeholder.svg?height=40&width=40&text=Mac",
    },
    {
      id: 2,
      type: "favorite",
      product: "iPhone 13 Pro",
      time: "Yesterday",
      image: "/placeholder.svg?height=40&width=40&text=iPhone",
    },
    {
      id: 3,
      type: "message",
      product: "Sony Headphones",
      time: "2 days ago",
      image: "/placeholder.svg?height=40&width=40&text=Sony",
    },
  ]

  // Stats (mock data)
  const stats = [
    {
      title: "Products Viewed",
      value: 128,
      change: "+12%",
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-500/10",
    },
    {
      title: "Active Listings",
      value: 5,
      change: "+2",
      icon: <ShoppingBag className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500/10",
    },
    {
      title: "Saved Items",
      value: 24,
      change: "+3",
      icon: <Heart className="h-5 w-5 text-pink-500" />,
      color: "bg-pink-500/10",
    },
    {
      title: "New Connections",
      value: 18,
      change: "+5",
      icon: <Users className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glassmorphism rounded-2xl p-6 md:p-8 shadow-lg border border-white/20"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#f58220] to-[#0a2472] bg-clip-text text-transparent">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-foreground/70 mt-2">
              Discover products and services from fellow students at {user?.university}.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-gradient-to-r from-[#f58220] to-[#0a2472] text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              Browse Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-md border border-gray-100"
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-lg ${stat.color} mr-3`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <span className="ml-2 text-xs font-medium text-emerald-500">{stat.change}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Categories</h2>
          <Link
            href="/dashboard/categories"
            className="text-[#f58220] hover:text-[#f58220]/80 text-sm font-medium flex items-center"
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
                className="glassmorphism rounded-xl p-4 h-full flex flex-col items-center justify-center text-center hover:shadow-lg transition-all border border-white/20"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f58220]/20 to-[#0a2472]/20 flex items-center justify-center mb-3 shadow-md">
                  <span className="text-xl">{category.icon}</span>
                </div>
                <h3 className="font-medium">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.productCount} items</p>
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
            className="text-[#f58220] hover:text-[#f58220]/80 text-sm font-medium flex items-center"
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 animate-pulse"
                >
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            : featuredProducts.map((product, index) => (
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold">Recent Activity</h3>
              <Link href="#" className="text-sm text-[#f58220] hover:text-[#f58220]/80 flex items-center">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center">
                  <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                    <Image
                      src={activity.image || "/placeholder.svg"}
                      alt={activity.product}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">
                      {activity.type === "view"
                        ? "You viewed"
                        : activity.type === "favorite"
                          ? "You saved"
                          : "You messaged about"}{" "}
                      <span className="text-[#f58220]">{activity.product}</span>
                    </p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/dashboard/my-products/new"
                className="flex items-center p-3 rounded-lg bg-[#f58220]/10 text-[#f58220] hover:bg-[#f58220]/20 transition-colors"
              >
                <ShoppingBag className="h-5 w-5 mr-3" />
                <span className="font-medium">List a New Product</span>
              </Link>
              <Link
                href="/dashboard/messages"
                className="flex items-center p-3 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
              >
                <Users className="h-5 w-5 mr-3" />
                <span className="font-medium">Check Messages</span>
              </Link>
              <Link
                href="/dashboard/favorites"
                className="flex items-center p-3 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 transition-colors"
              >
                <Heart className="h-5 w-5 mr-3" />
                <span className="font-medium">View Saved Items</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
