"use client"

import { useState, useEffect, useRef, Fragment, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/products/product-card"
import {
  Filter,
  Plus,
  Search,
  Grid,
  List,
  ChevronDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  LayoutGrid,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { optimizeImageUrl } from "@/lib/image-utils"


export default function DashboardPage() {
  const { 
    products, 
    categories, 
    isLoading: apiIsLoading, 
    fetchProducts,
    getProductsByCategory,
    toggleFavorite 
  } = useProducts();
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const welcomeRef = useRef(null)
  const isWelcomeInView = useInView(welcomeRef, { once: false })

  // Update initial page state to use safe localStorage access
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalPages, setTotalPages] = useState(1)

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [sortBy, setSortBy] = useState<string>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  // Update categoryProducts state to handle full response
  const [categoryProducts, setCategoryProducts] = useState<Record<string, {
    results: any[],
    count: number,
    current_page: number,
    total_pages: number
  }>>({});
  const [isLoadingCategory, setIsLoadingCategory] = useState<Record<string, boolean>>({});

  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  // Rename to avoid conflict with apiIsLoading
  const [isLoadingData, setIsLoadingData] = useState(true)
  const fetchInProgress = useRef(false)
  const hasInitiallyLoaded = useRef(false)

  // Load stored values after component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const storedPage = localStorage.getItem('dashboard_page')
    if (storedPage) {
      setCurrentPage(parseInt(storedPage))
    }
  }, [])

  // Update pagination state
  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('dashboard_page', currentPage.toString())
  }, [currentPage])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard_page', page.toString())
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Get display price string - updated to match products page exactly
  const getDisplayPrice = (product: any) => {
    // Case 1: Regular price (e.g., "20000.00")
    if (product.price) {
      return product.price
    }
    
    // Case 2: Price range with emoji or text (e.g., "🏷️3500" or "Mini pack ranges from #1300-#1900")
    if (product.price_range) {
      return product.price_range
    }
    
    // Case 3: Fixed price
    if (product.fixed_price) {
      return product.fixed_price
    }
    
    // Case 4: Custom range
    if (product.custom_range) {
      return product.custom_range
    }

    // Fallback
    return "Contact for price"
  }

  // Function to fetch products for a specific category
  const fetchCategoryProducts = async (categoryId: string) => {
    setIsLoadingCategory(prev => ({ ...prev, [categoryId]: true }));
    try {
      const filters = {
        category: categoryId,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCondition && { condition: selectedCondition }),
        ...(selectedUniversity && { university: selectedUniversity }),
        ...(priceRange[0] > 0 && { price_min: priceRange[0] }),
        ...(priceRange[1] < 2000 && { price_max: priceRange[1] }),
        ...(sortBy && { ordering: getSortOrder(sortBy) })
      };

      // Use the getProductsByCategory function from useProducts
      const response = await fetchProducts(filters);
      
      setCategoryProducts(prev => ({ 
        ...prev, 
        [categoryId]: response 
      }));
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error);
    } finally {
      setIsLoadingCategory(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Helper function for sort order
  const getSortOrder = (sort: string) => {
    switch (sort) {
      case "newest": return "-created_at";
      case "price_low": return "price";
      case "price_high": return "-price";
      case "popular": return "-view_count";
      default: return "-created_at";
    }
  };

  // Update tab change handler
  useEffect(() => {
    const handleTabChange = async () => {
      if (activeTab === "all") {
        // Fetch all products with current filters
        const filters = {
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCondition && { condition: selectedCondition }),
          ...(selectedUniversity && { university: selectedUniversity }),
          ...(priceRange[0] > 0 && { price_min: priceRange[0] }),
          ...(priceRange[1] < 2000 && { price_max: priceRange[1] }),
          ...(sortBy && { ordering: getSortOrder(sortBy) })
        };
        await fetchProducts(filters);
      } else if (!categoryProducts[activeTab]) {
        // Fetch category-specific products
        await fetchCategoryProducts(activeTab);
      }
    };

    handleTabChange();
  }, [activeTab, searchQuery, selectedCondition, selectedUniversity, priceRange, sortBy]);

  // Update fetchProductsData function
  const fetchProductsData = useCallback(async (fetchFilters: any) => {
    if (fetchInProgress.current) return null

    fetchInProgress.current = true
    setIsLoadingData(true)

    try {
      const response = await fetchProducts({
        ...fetchFilters,
        page_size: pageSize,
      })

      if (response) {
        setFilteredProducts(response.results || [])
        setTotalPages(response.total_pages || 1)
        setTotalCount(response.count || 0)
      }
      return response
    } catch (error) {
      console.error("Error fetching products:", error)
      setFilteredProducts([])
      setTotalPages(1)
      setTotalCount(0)
    } finally {
      setIsLoadingData(false)
      fetchInProgress.current = false
    }
  }, [fetchProducts, pageSize])

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      if (hasInitiallyLoaded.current) return

      const storedPage = localStorage.getItem("dashboard_page")
      const page = storedPage ? parseInt(storedPage) : 1

      const initialFilters = {
        page,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        university: selectedUniversity || undefined,
        price_min: priceRange[0] > 0 ? priceRange[0] : undefined,
        price_max: priceRange[1] < 2000 ? priceRange[1] : undefined,
        ordering: getSortOrder(sortBy),
      }

      await fetchProductsData(initialFilters)
      hasInitiallyLoaded.current = true
    }

    loadInitialData()
  }, []) // Empty dependency array for initial load only

  // Update products when filters change
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false)
      return
    }

    const updateProducts = async () => {
      const filters = {
        page: currentPage,
        category: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        university: selectedUniversity || undefined,
        search: searchQuery || undefined,
        sort_by: sortBy || undefined,
        ...(priceRange[0] > 0 && { price_min: priceRange[0] }),
        ...(priceRange[1] < 2000 && { price_max: priceRange[1] })
      }

      await fetchProductsData(filters)
    }

    const timer = setTimeout(updateProducts, 300)
    return () => clearTimeout(timer)
  }, [currentPage, selectedCategory, selectedCondition, selectedUniversity, searchQuery, sortBy, priceRange])

  // Get unique conditions from products
  const conditions = Array.from(new Set(products.map((p) => p.condition))).filter(Boolean)

  // Get unique universities from products
  const universities = Array.from(new Set(products.map((p) => p.university_name))).filter(Boolean)

  // Stats (mock data)
  const stats = [
    {
      title: "Trending",
      value: "+24%",
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-500/10",
      textColor: "text-emerald-500",
    },
    {
      title: "New Today",
      value: "18",
      icon: <Zap className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-500/10",
      textColor: "text-amber-500",
    },
    {
      title: "Recently Added",
      value: "32",
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500/10",
      textColor: "text-blue-500",
    },
  ]

  // Add handler for favorite toggle
  const handleFavoriteToggle = async (productId: number) => {
    try {
      await toggleFavorite(productId);
      // Refresh products after toggling favorite
      if (activeTab === "all") {
        await fetchProducts();
      } else {
        await fetchCategoryProducts(activeTab);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedCategory) count++
    if (selectedCondition) count++
    if (priceRange[0] > 0 || priceRange[1] < 2000) count++
    if (searchQuery) count++
    return count
  }

  // Update loading check in the ProductList component
  const isLoadingDisplay = isLoadingData || apiIsLoading

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <div ref={welcomeRef} className="rounded-2xl border bg-orange-100 border-unistore-orange p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#f58220]/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#f58220]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome, {user?.first_name}!</h1>
            </div>
            <p className="text-gray-600 mt-2 max-w-xl">
              Discover amazing products from fellow students at {user?.university_name}. Browse the latest listings or
              create your own.
            </p>
          </div> 

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard/my-products/new">
              <Button className="bg-[#f58220] hover:bg-[#f58220]/90 text-white border-none w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Upload Product
              </Button>
            </Link>
            <Link href="/dashboard/products">
              <Button
                variant="outline"
                className="border-[#0a2472] text-[#0a2472] hover:bg-[#0a2472]/5 w-full sm:w-auto"
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Browse All
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="space-y-4">
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
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2 h-12"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-1 bg-[#f58220]">{getActiveFiltersCount()}</Badge>
              )}
            </Button>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12">
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

            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-10 w-10"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-10 w-10"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              >
                {filter}
              </Badge>
            ))}
            <Button
              onClick={() => {
                setSelectedCategory(null)
                setSelectedCondition(null)
                setSelectedUniversity(null)
                setPriceRange([0, 2000])
                setSearchQuery("")
                setSortBy("newest")
              }}
              variant="ghost"
              size="sm"
              className="text-[#f58220] hover:text-[#f58220]/90 hover:bg-[#f58220]/10 h-7 px-2"
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
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Categories</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center">
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategory === category.id.toString()}
                            onCheckedChange={(checked) => setSelectedCategory(checked ? category.id.toString() : null)}
                            className="data-[state=checked]:bg-[#f58220] data-[state=checked]:border-[#f58220]"
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Condition</h3>
                    <div className="space-y-2">
                      {conditions.map((condition) => (
                        <div key={condition} className="flex items-center">
                          <Checkbox
                            id={`condition-${condition}`}
                            checked={selectedCondition === condition}
                            onCheckedChange={(checked) => setSelectedCondition(checked ? condition : null)}
                            className="data-[state=checked]:bg-[#f58220] data-[state=checked]:border-[#f58220]"
                          />
                          <Label
                            htmlFor={`condition-${condition}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            {condition.replace("_", " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">University</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {universities.map((university) => (
                        <div key={university} className="flex items-center">
                          <Checkbox
                            id={`university-${university}`}
                            checked={selectedUniversity === university}
                            onCheckedChange={(checked) => setSelectedUniversity(checked ? university : null)}
                            className="data-[state=checked]:bg-[#f58220] data-[state=checked]:border-[#f58220]"
                          />
                          <Label
                            htmlFor={`university-${university}`}
                            className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            {university}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-3">Price Range</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">${priceRange[0]}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">${priceRange[1]}</span>
                      </div>
                      <Slider
                        defaultValue={[0, 2000]}
                        max={2000}
                        step={50}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="[&_[role=slider]]:bg-[#f58220] [&_[role=slider]]:border-[#f58220] [&_[role=slider]]:focus:ring-[#f58220]/20 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:mt-[-8px] [&>[data-disabled]]:bg-gray-100 [&_[data-orientation=horizontal]]:h-2 [&_[data-orientation=horizontal]]:bg-[#f58220]/20"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                            min="0"
                            max={priceRange[1]}
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                            min={priceRange[0]}
                            max="2000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => {
                      setSelectedCategory(null)
                      setSelectedCondition(null)
                      setSelectedUniversity(null)
                      setPriceRange([0, 2000])
                      setSearchQuery("")
                      setSortBy("newest")
                    }}
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Categories Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-[#f58220] data-[state=active]:shadow-none"
          >
            All Products
          </TabsTrigger>
          {categories.slice(0, 5).map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id.toString()}
              className="hidden md:inline-flex rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-950 data-[state=active]:text-[#f58220] data-[state=active]:shadow-none"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalCount)}
              </span> of{" "}
              <span className="font-medium">{totalCount}</span> products
            </p>

            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[180px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="40">40 per page</SelectItem>
                <SelectItem value="60">60 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading state */}
          {isLoadingDisplay ? (
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
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProductCard 
                        product={{
                          ...product,
                          primary_image: optimizeImageUrl(product.primary_image),
                          price: getDisplayPrice(product)
                        }} 
                        onFavoriteToggle={handleFavoriteToggle}
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
                      className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:border-[#f58220]/50"
                    >
                      <Link href={`/products/${product.id}`} className="flex">
                        <div className="w-32 h-32 sm:w-48 sm:h-48 relative flex-shrink-0">
                          <img
                            src={optimizeImageUrl(product.primary_image)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <Badge
                              variant="outline"
                              className="bg-gray-100/50 dark:bg-gray-800/50 text-xs border-gray-200 truncate dark:border-gray-700"
                            >
                              {product.category_name}
                            </Badge>
                            <div className="flex items-center">
                              <span className="text-xs hidden lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                                {product.university_name}
                              </span>
                            </div>
                          </div>
                          <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                            {product.condition.replace("_", " ")} • {product.merchant_name}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base">
                                {getDisplayPrice(product)}
                              </span>
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
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {filteredProducts.length === 0 && !isLoadingDisplay && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                  <Button onClick={() => {
                    setSelectedCategory(null)
                    setSelectedCondition(null)
                    setSelectedUniversity(null)
                    setPriceRange([0, 2000])
                    setSearchQuery("")
                    setSortBy("newest")
                  }} className="bg-[#f58220] hover:bg-[#f58220]/90">
                    Reset Filters
                  </Button>
                </div>
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
        </TabsContent>

        {/* Category-specific tabs */}
        {categories.slice(0, 5).map((category) => (
          <TabsContent key={category.id} value={category.id.toString()} className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{category.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-medium">
                  {(categoryProducts[category.id.toString()]?.results || []).length}
                </span>{" "}
                products
              </p>
            </div>

            {isLoadingCategory[category.id.toString()] ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-3" />
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 w-3/4 rounded mb-2" />
                    <div className="bg-gray-200 dark:bg-gray-700 h-4 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : (categoryProducts[category.id.toString()]?.results || []).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(categoryProducts[category.id.toString()]?.results || []).map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard 
                      product={{
                        ...product,
                        primary_image: optimizeImageUrl(product.primary_image),
                        price: getDisplayPrice(product)
                      }} 
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No products found in this category</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={() => {
                  setSelectedCategory(null)
                  setSelectedCondition(null)
                  setSelectedUniversity(null)
                  setPriceRange([0, 2000])
                  setSearchQuery("")
                  setSortBy("newest")
                }} className="bg-[#f58220] hover:bg-[#f58220]/90">
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ddd;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ccc;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  )
}
