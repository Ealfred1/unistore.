"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { useProducts } from "@/providers/product-provider"
import { Plus, Search, Filter, ChevronDown, Grid, List, Edit, Trash2, Eye, EyeOff, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function MyProductsPage() {
  const { products } = useProducts()
  const [myProducts, setMyProducts] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high" | "popular">("newest")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive" | "sold">("all")

  // Simulate loading and get user's products
  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, you would filter products by the current user's ID
      // For now, we'll just use the first few products as mock data
      const userProducts = products.slice(0, 5).map((product, index) => ({
        ...product,
        status: index === 0 ? "inactive" : index === 1 ? "sold" : "active",
      }))
      setMyProducts(userProducts)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [products])

  // Filter products based on search query and active filter
  const filteredProducts = myProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeFilter === "all" || product.status === activeFilter),
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_low") return a.price - b.price
    if (sortBy === "price_high") return b.price - a.price
    if (sortBy === "popular") return b.reviewCount - a.reviewCount
    // Default: newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Handle product deletion
  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setMyProducts((prev) => prev.filter((product) => product.id !== productId))
    }
  }

  // Handle product visibility toggle
  const handleToggleVisibility = (productId: string) => {
    setMyProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, status: product.status === "active" ? "inactive" : "active" }
          : product,
      ),
    )
  }

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "sold":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2472]">My Products</h1>
          <p className="text-gray-500">
            {myProducts.length} {myProducts.length === 1 ? "product" : "products"} listed
          </p>
        </div>

        <Link href="/dashboard/my-products/new">
          <Button className="bg-[#f58220] hover:bg-[#f58220]/90">
            <Plus className="h-5 w-5 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex overflow-x-auto pb-2 md:pb-0 space-x-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
            className={
              activeFilter === "all"
                ? "bg-[#f58220] hover:bg-[#f58220]/90"
                : "border border-gray-200 dark:border-gray-700"
            }
          >
            All Products
          </Button>
          <Button
            variant={activeFilter === "active" ? "default" : "outline"}
            onClick={() => setActiveFilter("active")}
            className={
              activeFilter === "active"
                ? "bg-[#f58220] hover:bg-[#f58220]/90"
                : "border border-gray-200 dark:border-gray-700"
            }
          >
            Active
          </Button>
          <Button
            variant={activeFilter === "inactive" ? "default" : "outline"}
            onClick={() => setActiveFilter("inactive")}
            className={
              activeFilter === "inactive"
                ? "bg-[#f58220] hover:bg-[#f58220]/90"
                : "border border-gray-200 dark:border-gray-700"
            }
          >
            Inactive
          </Button>
          <Button
            variant={activeFilter === "sold" ? "default" : "outline"}
            onClick={() => setActiveFilter("sold")}
            className={
              activeFilter === "sold"
                ? "bg-[#f58220] hover:bg-[#f58220]/90"
                : "border border-gray-200 dark:border-gray-700"
            }
          >
            Sold
          </Button>
        </div>

        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
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
                <DropdownMenuItem
                  onClick={() => setSortBy("popular")}
                  className={sortBy === "popular" ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}
                >
                  Most Popular
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
          {Array.from({ length: 4 }).map((_, index) => (
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
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-[#f58220]/50 transition-all group"
              >
                <div className="relative">
                  <div className="aspect-square relative">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className={`${getStatusBadgeColor(product.status)}`}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleVisibility(product.id)}
                        className="h-8 w-8 bg-white/90 backdrop-blur-sm border border-gray-200"
                      >
                        {product.status === "active" ? (
                          <EyeOff className="h-4 w-4 text-gray-700" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-700" />
                        )}
                      </Button>
                      <Link
                        href={`/dashboard/my-products/edit/${product.id}`}
                        className="h-8 w-8 flex items-center justify-center rounded-md bg-white/90 backdrop-blur-sm border border-gray-200 hover:bg-white transition-colors"
                      >
                        <Edit className="h-4 w-4 text-gray-700" />
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="h-8 w-8 bg-white/90 backdrop-blur-sm border border-gray-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 truncate">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                    <div className="text-sm text-gray-500">
                      {product.reviewCount} {product.reviewCount === 1 ? "view" : "views"}
                    </div>
                  </div>
                </div>
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
                className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-[#f58220]/50 transition-all"
              >
                <div className="flex">
                  <div className="w-32 h-32 sm:w-48 sm:h-48 relative flex-shrink-0">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge variant="outline" className={`${getStatusBadgeColor(product.status)}`}>
                        {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs uppercase text-gray-500">{product.category}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleVisibility(product.id)}
                          className="h-8 w-8 border border-gray-200 dark:border-gray-700"
                        >
                          {product.status === "active" ? (
                            <EyeOff className="h-4 w-4 text-gray-700" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-700" />
                          )}
                        </Button>
                        <Link
                          href={`/dashboard/my-products/edit/${product.id}`}
                          className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-gray-700" />
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-8 w-8 border border-gray-200 dark:border-gray-700"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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
                      <div className="text-sm text-gray-500">
                        {product.reviewCount} {product.reviewCount === 1 ? "view" : "views"}
                      </div>
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-gray-500 mb-6">You haven't listed any products for sale yet</p>
            <Link href="/dashboard/my-products/new">
              <Button className="bg-[#f58220] hover:bg-[#f58220]/90">
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
