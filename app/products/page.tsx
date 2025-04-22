"use client"

import { useState, useEffect, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, ChevronDown, Grid, List, ArrowUpDown, Heart, ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/landing/header"
import ProductCard from "@/components/products/product-card"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/utils"
import { UniversityPopup } from "@/components/university-popup"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function ProductsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { products, categories, isLoading, fetchProducts, toggleFavorite } = useProducts()
  const { isAuthenticated } = useAuth()
  const [showUniversityPopup, setShowUniversityPopup] = useState(false)

  // State for UI
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [sortBy, setSortBy] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState(products)

  // Get initial filters from URL or set defaults
  const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
  
  // State management
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Get current page from URL params or default to 1
  const currentPageParam = searchParams.get('page')
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalCount, setTotalCount] = useState(0)

  // Active filters count
  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedCategory) count++
    if (selectedCondition) count++
    if (selectedUniversity) count++
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++
    if (searchQuery) count++
    return count
  }

  // Initialize search query and filters from URL params
  useEffect(() => {
    const query = searchParams.get("search")
    if (query) { 
      setSearchQuery(query)
    }
   
    const category = searchParams.get("category")
    if (category) {
      setSelectedCategory(category)
    }

    const university = searchParams.get("university")
    if (university) {
      setSelectedUniversity(university)
    } else if (!isAuthenticated) {
      // Only check localStorage for university if user is not authenticated
      const storedUniversity = localStorage.getItem("unistore_university")
      if (storedUniversity) {
        setSelectedUniversity(storedUniversity)
      } else {
        setShowUniversityPopup(true)
      }
    }

    const page = searchParams.get("page")
    if (page) { 
      setCurrentPage(Number.parseInt(page))
    }
  }, [searchParams, isAuthenticated])

  // Update URL and fetch products when filters change
  useEffect(() => {
    if (isInitialLoad) {
      // Ensure page param exists on initial load
      if (!searchParams.has('page')) {
        const params = new URLSearchParams(searchParams)
        params.set('page', '1')
        router.replace(`/products?${params.toString()}`, { scroll: false })
      }
      setIsInitialLoad(false)
      return
    }

    const getProducts = async () => {
      try {
        // Prepare filters object
        const filters: Record<string, any> = {
          page: currentPage,
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          condition: selectedCondition || undefined,
          min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
          max_price: priceRange[1] < 2000 ? priceRange[1] : undefined,
          sort_by: sortBy || undefined,
        }

        // Only include university filter for non-authenticated users
        if (!isAuthenticated && selectedUniversity) {
          filters.university = selectedUniversity
        }

        const response = await fetchProducts(filters)
        setFilteredProducts(response.results)
        setTotalPages(response.total_pages)
        setTotalCount(response.count)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    // Debounce the fetch to prevent multiple calls
    const timeoutId = setTimeout(getProducts, 300)
    return () => clearTimeout(timeoutId)
  }, [currentPage, searchQuery, selectedCategory, selectedCondition, selectedUniversity, priceRange, sortBy, isAuthenticated, searchParams, isInitialLoad])

  // Update URL when page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    router.push(`/products?${params.toString()}`, { scroll: false })
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Update filtered products when products change
  useEffect(() => {
    setFilteredProducts(products)
  }, [products])

  // Handle favorite toggle
  const handleToggleFavorite = async (productId: number) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = "/auth/login"
      return
    }

    try {
      await toggleFavorite(productId)
    } catch (error) {
      console.error(`Error toggling favorite for product ${productId}:`, error)
    }
  }

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory(null)
    setSelectedCondition(null)
    setSelectedUniversity(null)
    setPriceRange([0, 2000])
    setSearchQuery("")
    setSortBy("newest")
    setCurrentPage(1)
  }

  // Get unique conditions from products
  const conditions = ["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]

  // Get unique universities from products
  const universities = Array.from(new Set(products.map((p) => p.university_name))).filter(Boolean)

  // Handle university selection
  const handleSelectUniversity = async (universityId: number) => {
    if (!isAuthenticated) {
      localStorage.setItem("unistore_university", String(universityId))
    }
    setShowUniversityPopup(false)
    setSelectedUniversity(String(universityId))
    
    // Fetch products for the selected university
    try {
      const response = await fetchProducts({ 
        university: universityId,
        page: currentPage 
      })
      setFilteredProducts(response.results)
      setTotalPages(response.total_pages)
      setTotalCount(response.count)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  // Fix image URL function
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* University selection popup */}
      <AnimatePresence>
        {showUniversityPopup && (
          <UniversityPopup
            onClose={() => {
              setShowUniversityPopup(false)
              // Set a default university if user closes without selecting
              if (!selectedUniversity) {
                const defaultUniversity = "1" // Set a default university ID
                setSelectedUniversity(defaultUniversity)
                localStorage.setItem("unistore_university", defaultUniversity)
              }
            }}
            onSelect={handleSelectUniversity}
          />
        )}
      </AnimatePresence>

      <div className="px-3 lg:container py-8">
        {/* Search and filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
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
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2 h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
                {getActiveFiltersCount() > 0 && (
                  <Badge className="ml-1 bg-[#f58220] hover:bg-[#f58220]/90">{getActiveFiltersCount()}</Badge>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Sort by</span>
                  </div>
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

          {/* Active filters */}
          {getActiveFiltersCount() > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {searchQuery && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <span>Search: {searchQuery}</span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </Badge>
              )}

              {selectedCategory && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <span>Category: {categories.find((c) => c.id.toString() === selectedCategory)?.name}</span>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </Badge>
              )}

              {selectedCondition && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <span>Condition: {selectedCondition.replace("_", " ")}</span>
                  <button
                    onClick={() => setSelectedCondition(null)}
                    className="ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </Badge>
              )}

              {(priceRange[0] > 0 || priceRange[1] < 2000) && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  <span>
                    Price: ₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()}
                  </span>
                  <button
                    onClick={() => setPriceRange([0, 2000])}
                    className="ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="text-[#f58220] hover:text-[#f58220]/90 hover:bg-[#f58220]/10"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h3 className="font-medium mb-3 text-[#f58220]">Categories</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategory === category.id.toString()}
                            onCheckedChange={(checked) => setSelectedCategory(checked ? category.id.toString() : null)}
                            className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-[#f58220] data-[state=checked]:border-[#f58220]"
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-[#f58220] transition-colors"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 text-[#f58220]">Condition</h3>
                    <div className="space-y-2">
                      {conditions.map((condition) => (
                        <div key={condition} className="flex items-center">
                          <Checkbox
                            id={`condition-${condition}`}
                            checked={selectedCondition === condition}
                            onCheckedChange={(checked) => setSelectedCondition(checked ? condition : null)}
                            className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-[#f58220] data-[state=checked]:border-[#f58220]"
                          />
                          <Label
                            htmlFor={`condition-${condition}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-[#f58220] transition-colors"
                          >
                            {condition.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 text-[#f58220]">University</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                      {universities.map((university) => (
                        <div key={university} className="flex items-center">
                          <Checkbox
                            id={`university-${university}`}
                            checked={selectedUniversity === university}
                            onCheckedChange={(checked) => setSelectedUniversity(checked ? university : null)}
                            className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-[#f58220] data-[state=checked]:border-[#f58220]"
                          />
                          <Label
                            htmlFor={`university-${university}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-[#f58220] transition-colors"
                          >
                            {university}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3 text-[#f58220]">Price Range</h3>
                    <div className="space-y-6 px-1">
                      <div className="flex items-center justify-between">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-1.5">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            ₦{priceRange[0].toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded px-3 py-1.5">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            ₦{priceRange[1].toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Slider
                        defaultValue={[0, 2000]}
                        max={2000}
                        step={50}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-[#f58220] [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:dark:border-gray-800"
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-price" className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                            Min Price
                          </Label>
                          <input
                            id="min-price"
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-price" className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                            Max Price
                          </Label>
                          <input
                            id="max-price"
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results count and page size */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-600 text-xs lg:text-sm dark:text-gray-400">
              Showing <span className="font-medium text-gray-900 dark:text-gray-100">{filteredProducts.length}</span> of{" "}
              <span className="font-medium text-gray-900 dark:text-gray-100">{totalCount}</span> products
            </p>

            {totalPages > 1 && (
              <p className="text-gray-500 text-xs lg:text-sm dark:text-gray-500">
                • Page {currentPage} of {totalPages}
              </p>
            )}
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Show per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number.parseInt(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[80px] h-9 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: pageSize }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Products grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        primary_image: getProperImageUrl(product.primary_image),
                      }}
                      onFavoriteToggle={() => handleToggleFavorite(product.id)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-[#f58220]/50 dark:hover:border-[#f58220]/50 transition-all"
                  >
                    <Link href={`/products/${product.id}`} className="flex flex-col sm:flex-row">
                      <div className="w-full sm:w-48 h-48 relative flex-shrink-0">
                        <img
                          src={getProperImageUrl(product.primary_image) || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.is_featured && (
                          <div className="absolute top-2 left-2 bg-[#f58220] text-white text-xs px-2 py-1 rounded">
                            Featured
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-1">
                          <Badge
                            variant="outline"
                            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs"
                          >
                            {product.category_name}
                          </Badge>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{product.university_name}</span>
                          </div>
                        </div>
                        <h3 className="font-medium text-lg mb-1 text-gray-900 dark:text-gray-100">{product.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                          {product.condition.replace("_", " ")} • {product.merchant_name}
                        </p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">
                              {product.price ? (
                                `₦${formatPrice(product.price)}`
                              ) : product.price_range ? (
                                `₦${formatPrice(product.price_range)}`
                              ) : product.fixed_price ? (
                                `₦${formatPrice(product.fixed_price)}`
                              ) : product.custom_range ? (
                                product.custom_range
                              ) : (
                                "Contact for price"
                              )}
                            </span>
                            {product.price_negotiable && <span className="text-xs text-gray-500">(Negotiable)</span>}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleToggleFavorite(product.id)
                            }}
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Heart
                              className={`h-5 w-5 ${product.is_favorited ? "fill-red-500 text-red-500" : "text-gray-400 dark:text-gray-500"}`}
                            />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {filteredProducts.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={handleResetFilters} className="bg-[#f58220] hover:bg-[#f58220]/90 text-white">
                  Reset Filters
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
                      .filter((page) => {
                        // Show first page, last page, current page, and pages around current page
                        return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)
                      })
                      .map((page, index, array) => {
                        // Add ellipsis
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
    </div>
  )
}
