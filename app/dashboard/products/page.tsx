"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import ProductCard from "@/components/products/product-card"
import { Search, Filter, ChevronDown, Grid, List, ShoppingBag } from "lucide-react"
import Image from "next/image"

export default function BrowseProductsPage() {
  const { products, categories } = useProducts()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high" | "popular">("newest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Filter products based on search query, category, and price range
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedCategory ? product.category === selectedCategory : true) &&
      product.price >= priceRange[0] &&
      product.price <= priceRange[1],
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price
    if (sortBy === "price_high") return b.price - a.price
    if (sortBy === "popular") return b.reviewCount - a.reviewCount
    // Default: newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Handle price range change
  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = Number.parseInt(e.target.value)
    setPriceRange((prev) => {
      const newRange = [...prev] as [number, number]
      newRange[index] = value
      return newRange as [number, number]
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Browse Products</h1>
        <p className="text-gray-500">Discover products from fellow students</p>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden sticky top-4">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Filters</h2>
            </div>

            {/* Categories */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all-categories"
                    name="category"
                    checked={selectedCategory === null}
                    onChange={() => setSelectedCategory(null)}
                    className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300"
                  />
                  <label htmlFor="all-categories" className="ml-2 text-sm text-gray-700">
                    All Categories
                  </label>
                </div>
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${category.id}`}
                      name="category"
                      checked={selectedCategory === category.id}
                      onChange={() => setSelectedCategory(category.id)}
                      className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300"
                    />
                    <label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">${priceRange[0]}</span>
                  <span className="text-sm text-gray-500">${priceRange[1]}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(e, 0)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(e, 1)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer absolute top-0"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <div>
                    <label htmlFor="min-price" className="block text-xs text-gray-500 mb-1">
                      Min
                    </label>
                    <input
                      type="number"
                      id="min-price"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceRangeChange(e, 0)}
                      className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#f58220] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="max-price" className="block text-xs text-gray-500 mb-1">
                      Max
                    </label>
                    <input
                      type="number"
                      id="max-price"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceRangeChange(e, 1)}
                      className="w-full px-2 py-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#f58220] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Condition */}
            <div className="p-4">
              <h3 className="font-medium mb-3">Condition</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="condition-new"
                    className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300 rounded"
                  />
                  <label htmlFor="condition-new" className="ml-2 text-sm text-gray-700">
                    New
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="condition-like-new"
                    className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300 rounded"
                  />
                  <label htmlFor="condition-like-new" className="ml-2 text-sm text-gray-700">
                    Like New
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="condition-good"
                    className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300 rounded"
                  />
                  <label htmlFor="condition-good" className="ml-2 text-sm text-gray-700">
                    Good
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="condition-fair"
                    className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300 rounded"
                  />
                  <label htmlFor="condition-fair" className="ml-2 text-sm text-gray-700">
                    Fair
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="condition-poor"
                    className="h-4 w-4 text-[#f58220] focus:ring-[#f58220] border-gray-300 rounded"
                  />
                  <label htmlFor="condition-poor" className="ml-2 text-sm text-gray-700">
                    Poor
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products grid */}
        <div className="flex-1">
          {/* Search and sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="px-4 py-2 border border-gray-300 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Sort</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSortBy("newest")
                          setShowSortDropdown(false)
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortBy === "newest" ? "bg-gray-100 font-medium" : ""}`}
                      >
                        Newest First
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("price_low")
                          setShowSortDropdown(false)
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortBy === "price_low" ? "bg-gray-100 font-medium" : ""}`}
                      >
                        Price: Low to High
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("price_high")
                          setShowSortDropdown(false)
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortBy === "price_high" ? "bg-gray-100 font-medium" : ""}`}
                      >
                        Price: High to Low
                      </button>
                      <button
                        onClick={() => {
                          setSortBy("popular")
                          setShowSortDropdown(false)
                        }}
                        className={`block px-4 py-2 text-sm w-full text-left ${sortBy === "popular" ? "bg-gray-100 font-medium" : ""}`}
                      >
                        Most Popular
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"} transition-colors`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"} transition-colors`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Showing {sortedProducts.length} {sortedProducts.length === 1 ? "result" : "results"}
            </p>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
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
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product, index) => (
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
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                  >
                    <div className="flex">
                      <div className="w-32 h-32 sm:w-48 sm:h-48 relative flex-shrink-0">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs uppercase text-gray-500">{product.category}</span>
                          <div className="flex items-center">
                            <div className="flex items-center">
                              <svg
                                className="h-4 w-4 text-yellow-400 fill-current"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                              <span className="ml-1 text-sm font-medium">{product.rating}</span>
                            </div>
                          </div>
                        </div>
                        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {product.description || "No description available"}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                            {product.discount && (
                              <span className="text-sm text-gray-500 line-through">
                                ${product.originalPrice?.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory(null)
                  setPriceRange([0, 2000])
                }}
                className="px-4 py-2 bg-[#f58220] text-white font-medium rounded-lg hover:bg-[#f58220]/90 transition-all"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
