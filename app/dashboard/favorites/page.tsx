"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import ProductCard from "@/components/products/product-card"
import { Heart, Search, Filter, ChevronDown, Grid, List, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
          <h1 className="text-2xl font-bold text-[#0a2472]">Favorites</h1>
          <p className="text-gray-500">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorites..."
              className="pl-10 pr-4 py-2"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu open={showSortDropdown} onOpenChange={setShowSortDropdown}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border border-gray-200 dark:border-gray-700">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border border-gray-200 dark:border-gray-700">
                <DropdownMenuItem
                  onClick={() => setSortBy("newest")}
                  className={sortBy === "newest" ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price_low")}
                  className={sortBy === "price_low" ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price_high")}
                  className={sortBy === "price_high" ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}
                >
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
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
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
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
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity z-10"
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
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-[#f58220]/50 transition-all relative group"
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
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
        <Card className="text-center py-16 border border-gray-200 dark:border-gray-700">
          <CardContent>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
            <p className="text-gray-500 mb-6">Items you save will appear here</p>
            <Button className="bg-[#f58220] hover:bg-[#f58220]/90">Browse Products</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
