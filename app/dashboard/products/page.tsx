"use client"

import { useState, useEffect, Fragment } from "react"
import { motion } from "framer-motion"
import { Search, Filter, ChevronDown, Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import ProductCard from "@/components/products/product-card"
import { useProducts } from "@/providers/product-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/utils"
import { optimizeImageUrl } from "@/lib/image-utils"

export default function DashboardProductsPage() {
  const { products, categories, isLoading, fetchProducts, toggleFavorite } = useProducts()
  
  // State for UI and filters
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [sortBy, setSortBy] = useState<string>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState(products)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  // Load initial state including page number
  useEffect(() => {
    const loadInitialData = async () => {
      if (typeof window === 'undefined') return

      // Load stored values first
      const storedPage = localStorage.getItem("dashboard_products_currentPage")
      const storedCategory = localStorage.getItem("dashboard_products_category")
      const storedCondition = localStorage.getItem("dashboard_products_condition")
      const storedUniversity = localStorage.getItem("dashboard_products_university")
      const storedPriceRange = localStorage.getItem("dashboard_products_priceRange")
      const storedSortBy = localStorage.getItem("dashboard_products_sortBy")
      const storedSearchQuery = localStorage.getItem("dashboard_products_searchQuery")
      const storedViewMode = localStorage.getItem("dashboard_products_viewMode")

      // Set initial states from localStorage
      if (storedPage) setCurrentPage(parseInt(storedPage))
      if (storedCategory) setSelectedCategory(storedCategory)
      if (storedCondition) setSelectedCondition(storedCondition)
      if (storedUniversity) setSelectedUniversity(storedUniversity)
      if (storedPriceRange) setPriceRange(JSON.parse(storedPriceRange))
      if (storedSortBy) setSortBy(storedSortBy)
      if (storedSearchQuery) setSearchQuery(storedSearchQuery)
      if (storedViewMode === "list") setViewMode("list")

      // Fetch products with stored filters
      const initialFilters = {
        page: storedPage ? parseInt(storedPage) : 1,
        page_size: pageSize,
        ...(storedSearchQuery && { search: storedSearchQuery }),
        ...(storedCategory && { category: storedCategory }),
        ...(storedCondition && { condition: storedCondition }),
        ...(storedUniversity && { university: storedUniversity }),
        ...(storedPriceRange && {
          price_min: JSON.parse(storedPriceRange)[0],
          price_max: JSON.parse(storedPriceRange)[1]
        }),
        ...(storedSortBy && { ordering: getSortOrder(storedSortBy) })
      }

      try {
        const response = await fetchProducts(initialFilters)
        if (response) {
          setFilteredProducts(response.results)
          setTotalPages(response.total_pages)
          setTotalCount(response.count)
        }
      } catch (error) {
        console.error("Error fetching initial products:", error)
      }
    }

    loadInitialData()
  }, [])

  // Save values to localStorage - wrap in window check
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem("dashboard_products_viewMode", viewMode)
  }, [viewMode])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedCategory) {
      localStorage.setItem("dashboard_products_category", selectedCategory)
    } else {
      localStorage.removeItem("dashboard_products_category")
    }
  }, [selectedCategory])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedCondition) {
      localStorage.setItem("dashboard_products_condition", selectedCondition)
    } else {
      localStorage.removeItem("dashboard_products_condition")
    }
  }, [selectedCondition])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedUniversity) {
      localStorage.setItem("dashboard_products_university", selectedUniversity)
    } else {
      localStorage.removeItem("dashboard_products_university")
    }
  }, [selectedUniversity])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem("dashboard_products_priceRange", JSON.stringify(priceRange))
  }, [priceRange])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem("dashboard_products_currentPage", currentPage.toString())
  }, [currentPage])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sortBy) {
      localStorage.setItem("dashboard_products_sortBy", sortBy)
    } else {
      localStorage.removeItem("dashboard_products_sortBy")
    }
  }, [sortBy])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (searchQuery) {
      localStorage.setItem("dashboard_products_searchQuery", searchQuery)
    } else {
      localStorage.removeItem("dashboard_products_searchQuery")
    }
  }, [searchQuery])

  // Helper function to get sort order
  const getSortOrder = (sort: string) => {
    switch (sort) {
      case "newest":
        return "-created_at"
      case "price_low":
        return "price"
      case "price_high":
        return "-price"
      case "popular":
        return "-view_count"
      default:
        return "-created_at"
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (typeof window !== 'undefined') {
      localStorage.setItem("dashboard_products_currentPage", page.toString())
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle filter changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      const filters = {
        page: localStorage.getItem("dashboard_products_currentPage") ? parseInt(localStorage.getItem("dashboard_products_currentPage")!) : 1,
        page_size: pageSize,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedCondition && { condition: selectedCondition }),
        ...(selectedUniversity && { university: selectedUniversity }),
        ...(priceRange[0] > 0 && { price_min: priceRange[0] }),
        ...(priceRange[1] < 2000 && { price_max: priceRange[1] }),
        ...(sortBy && { ordering: getSortOrder(sortBy) })
      }

      try {
        const response = await fetchProducts(filters)
        if (response) {
          setFilteredProducts(response.results)
          setTotalPages(response.total_pages)
          setTotalCount(response.count)
        }
      } catch (error) {
        console.error("Error fetching filtered products:", error)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [currentPage, searchQuery, selectedCategory, selectedCondition, selectedUniversity, priceRange, sortBy, pageSize])

  // Improved favorite toggle handler
  const handleFavoriteToggle = async (productId: number) => {
    try {
      await toggleFavorite(productId)
      // Update the products list immediately after toggling
      setFilteredProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? {...product, is_favorited: !product.is_favorited}
            : product
        )
      )
      
      const product = filteredProducts.find(p => p.id === productId)
      toast({
        title: product?.is_favorited ? "Removed from favorites" : "Added to favorites",
        description: product?.is_favorited 
          ? "This product has been removed from your favorites"
          : "This product has been added to your favorites",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  // Update handleResetFilters
  const handleResetFilters = () => {
    setSelectedCategory(null)
    setSelectedCondition(null)
    setSelectedUniversity(null)
    setPriceRange([0, 2000])
    setSortBy("newest")
    setSearchQuery("")
    setCurrentPage(1)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem("dashboard_products_category")
      localStorage.removeItem("dashboard_products_condition")
      localStorage.removeItem("dashboard_products_university")
      localStorage.removeItem("dashboard_products_priceRange")
      localStorage.removeItem("dashboard_products_sortBy")
      localStorage.removeItem("dashboard_products_searchQuery")
      localStorage.removeItem("dashboard_products_currentPage")
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-gray-500">Find recent products</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent bg-white dark:bg-gray-800 dark:text-gray-100"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex h-12 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
            <Button
              onClick={() => setViewMode("grid")}
              variant="ghost"
              size="icon"
              className={`h-full rounded-none ${viewMode === "grid" ? "bg-[#f58220] text-white hover:bg-[#f58220]/90" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"}`}
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-full" />
            <Button
              onClick={() => setViewMode("list")}
              variant="ghost"
              size="icon"
              className={`h-full rounded-none ${viewMode === "list" ? "bg-[#f58220] text-white hover:bg-[#f58220]/90" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"}`}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <>
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-3"
          }>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all ${
                  viewMode === "list" ? "w-full" : ""
                }`}
              >
                {viewMode === "grid" ? (
                  <ProductCard 
                    product={{
                      ...product,
                      primary_image: optimizeImageUrl(product.primary_image),
                      price: formatPrice(product)
                    }} 
                    onFavoriteToggle={() => handleFavoriteToggle(product.id)}
                  />
                ) : (
                  <Link 
                    href={`/dashboard/products/${product.id}`} 
                    className="flex h-32"
                  >
                    {/* Image Container */}
                    <div className={viewMode === "list" ? "w-32 h-32 relative flex-shrink-0" : "aspect-square relative"}>
                      <img
                        src={optimizeImageUrl(product.primary_image) || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.is_featured && (
                        <div className="absolute top-2 left-2 bg-[#f58220] text-white text-xs px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Content Container */}
                    <div className={`flex-1 p-4 ${viewMode === "list" ? "flex flex-col justify-between" : ""}`}>
                      <div>
                        {/* Category and University */}
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {product.category_name}
                          </Badge>
                          <span className="text-xs hidden text-gray-500 dark:text-gray-400">
                            {product.university_name}
                          </span>
                        </div>

                        {/* Title and Status */}
                        <h3 className="font-medium text-sm mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                          {product.condition} • {product.status}
                        </p>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base">
                            {formatPrice(product)}
                          </span>
                          {product.price_negotiable && 
                            <span className="text-xs text-gray-500">(Negotiable)</span>
                          }
                        </div>
                        <Badge 
                          variant={product.is_available ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {product.is_available ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search criteria</p>
              <Button onClick={() => setSearchQuery("")} className="bg-[#f58220] hover:bg-[#f58220]/90 text-white">
                Clear Search
              </Button>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-10 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1))
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <Fragment key={`ellipsis-${page}`}>
                            <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="icon"
                              onClick={() => handlePageChange(page)}
                              className={`h-10 w-10 border-gray-200 dark:border-gray-700 ${
                                currentPage === page
                                  ? "bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                                  : "bg-white dark:bg-gray-800"
                              }`}
                            >
                              {page}
                            </Button>
                          </Fragment>
                        )
                      }
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(page)}
                          className={`h-10 w-10 border-gray-200 dark:border-gray-700 ${
                            currentPage === page
                              ? "bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                              : "bg-white dark:bg-gray-800"
                          }`}
                        >
                          {page}
                        </Button>
                      )
                    })}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-10 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
