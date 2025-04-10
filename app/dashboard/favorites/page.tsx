"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import ProductCard from "@/components/products/product-card"
import { Heart, Search, Filter, ChevronDown, Grid, List, Trash2 } from "lucide-react"
import Image from "next/image"

export default function FavoritesPage() {
  const { products } = useProducts()
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high">("newest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading and get favorite products
  useEffect(() => {
    const timer = setTimeout(() => {
      // Filter products that are marked as favorite
      const favorites = products.filter((product) => product.isFavorite)
      setFavoriteProducts(favorites)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [products])

  // Handle removing from favorites
  const handleRemoveFavorite = (productId: string) => {
    setFavoriteProducts((prev) => prev.filter((product) => product.id !== productId))
  }

  // Filter products based on search query
  const filteredProducts = favoriteProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price
    if (sortBy === "price_high") return b.price - a.price
    // Default: newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-gray-500">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorites..."
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
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative group"
              >
                <ProductCard product={product} />
                <button
                  onClick={() => handleRemoveFavorite(product.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </button>
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
                className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all relative group"
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
                        <Heart className="h-4 w-4 text-red-500 fill-red-500 mr-1" />
                        <span className="text-xs text-gray-500">Saved</span>
                      </div>
                    </div>
                    <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.condition} • {product.university}
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
                      <button
                        onClick={() => handleRemoveFavorite(product.id)}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">Items you save will appear here</p>
          <button className="px-4 py-2 bg-[#f58220] text-white font-medium rounded-lg hover:bg-[#f58220]/90 transition-all">
            Browse Products
          </button>
        </div>
      )}
    </div>
  )
}
