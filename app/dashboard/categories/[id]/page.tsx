"use client"

import { useState, useEffect, Fragment } from "react"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useProducts } from "@/providers/product-provider"
import { ChevronLeft, Search, Grid, List, Filter, ArrowUpDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import ProductCard from "@/components/products/product-card"
import { Skeleton } from "@/components/ui/skeleton"
import axios from "@/lib/axios"

export default function CategoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = Number(params.id)
  
  const { categories } = useProducts()
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null)
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null)

  // Image handling function
  const getProperImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return "/placeholder.svg?height=200&width=200&text=No+Image"

    // Check if the URL contains both Appwrite and Cloudinary
    if (imageUrl.includes("appwrite.io") && imageUrl.includes("cloudinary.com")) {
      // Find the position of the nested https:// for cloudinary
      const cloudinaryStart = imageUrl.indexOf("https://res.cloudinary.com")
      if (cloudinaryStart !== -1) {
        // Extract everything from the cloudinary URL start
        return imageUrl.substring(cloudinaryStart).split("/view")[0]
      }
    }

    // For Appwrite URLs, add project ID query param if missing
    if (imageUrl.includes("appwrite.io")) {
      const projectId = "67f47c4200273e45c433"
      if (!imageUrl.includes("project=")) {
        return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}project=${projectId}`
      }
      return imageUrl
    }

    return imageUrl
  }

  // Format price for display
  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) return "N/A"
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return `₦${numPrice.toLocaleString()}`
  }

  // Fetch products for this category
  const fetchCategoryProducts = async (page = 1) => {
    setIsLoadingProducts(true)
    try {
      const ordering = sortBy === "newest" ? "-created_at" : 
                      sortBy === "oldest" ? "created_at" : 
                      sortBy === "price-low" ? "price" : 
                      sortBy === "price-high" ? "-price" : 
                      sortBy === "name-asc" ? "name" : 
                      sortBy === "name-desc" ? "-name" : "-created_at";
      
      const response = await axios.get("/products/products/", {
        params: {
          category: categoryId,
          page: page,
          page_size: pageSize,
          ordering: ordering,
          search: searchQuery || undefined
        }
      });
      
      const data = response.data;
      setProducts(data.results);
      setTotalPages(data.total_pages);
      setCurrentPage(data.current_page);
      setTotalCount(data.count);
      setNextPageUrl(data.next);
      setPrevPageUrl(data.previous);
    } catch (error) {
      console.error("Error fetching category products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchCategoryProducts(page);
  };

  // Handle next page
  const handleNextPage = () => {
    if (nextPageUrl && currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (prevPageUrl && currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Find category and fetch products on initial load
  useEffect(() => {
    const foundCategory = categories.find((c) => c.id === categoryId);
    if (foundCategory) {
      setCategory(foundCategory);
    }
    
    fetchCategoryProducts(1);
  }, [categoryId, categories, pageSize, sortBy]);

  // Refetch when search query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCategoryProducts(1);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!category && !isLoadingProducts) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium mb-2">Category not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">The category you're looking for doesn't exist</p>
        <Button onClick={() => router.back()} className="bg-[#f58220] hover:bg-[#f58220]/90">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-0 h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{category?.name || "Category"}</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort by" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none ${viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-none ${viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoadingProducts ? (
        <div className={`grid grid-cols-1 ${viewMode === "grid" ? "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : ""} gap-6`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className={`${viewMode === "grid" ? "h-80" : "h-32"} rounded-xl`} />
          ))}
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search criteria</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard 
                    product={{
                      ...product,
                      primary_image: getProperImageUrl(product.primary_image),
                    }} 
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:border-[#f58220]/50"
                >
                  {/* List view product card */}
                  <div className="flex">
                    <div className="w-32 h-32 sm:w-48 sm:h-48 relative flex-shrink-0">
                      <img
                        src={getProperImageUrl(product.primary_image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <div className="bg-gray-100/50 dark:bg-gray-800/50 text-xs border border-gray-200 dark:border-gray-700 rounded-full px-2 py-0.5">
                          {product.category_name}
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {product.university_name}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                        {product.condition.replace("_", " ")} • {product.merchant_name || "Unknown seller"}
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{formatPrice(product.price)}</span>
                          {product.price_negotiable && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">(Negotiable)</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#f58220] hover:text-[#f58220]/90 hover:bg-[#f58220]/10"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing page {currentPage} of {totalPages} ({totalCount} items)
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
    </div>
  )
} 