"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import ProductCard from "@/components/products/product-card"
import { Filter, Plus, Search, Grid, List, ChevronDown, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function DashboardPage() {
  const { products, categories, isLoading, fetchProducts } = useProducts()
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // State for filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null)
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])
  const [sortBy, setSortBy] = useState<string>("newest")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredProducts, setFilteredProducts] = useState(products)

  // Fetch products with filters
  useEffect(() => {
    const getProducts = async () => {
      const filters: Record<string, any> = {}

      if (searchQuery) {
        filters.search = searchQuery
      }

      if (selectedCategory) {
        filters.category = selectedCategory
      }

      if (selectedCondition) {
        filters.condition = selectedCondition
      }

      if (selectedUniversity) {
        filters.university = selectedUniversity
      }

      if (priceRange[0] > 0) {
        filters.price_min = priceRange[0]
      }

      if (priceRange[1] < 2000) {
        filters.price_max = priceRange[1]
      }

      // Handle sorting
      switch (sortBy) {
        case "newest":
          filters.ordering = "-created_at"
          break
        case "price_low":
          filters.ordering = "price"
          break
        case "price_high":
          filters.ordering = "-price"
          break
        case "popular":
          filters.ordering = "-view_count"
          break
      }

      try {
        await fetchProducts(filters)
      } catch (error) {
        console.error("Error fetching products:", error)
      }
    }

    getProducts()
  }, [searchQuery, selectedCategory, selectedCondition, selectedUniversity, priceRange, sortBy, fetchProducts])

  // Update filtered products when products change
  useEffect(() => {
    setFilteredProducts(products)
  }, [products])

  // Reset filters
  const handleResetFilters = () => {
    setSelectedCategory(null)
    setSelectedCondition(null)
    setSelectedUniversity(null)
    setPriceRange([0, 2000])
    setSearchQuery("")
    setSortBy("newest")
  }

  // Get unique conditions from products
  const conditions = Array.from(new Set(products.map((p) => p.condition))).filter(Boolean)

  // Get unique universities from products
  const universities = Array.from(new Set(products.map((p) => p.university_name))).filter(Boolean)

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0a2472]">Welcome, {user?.first_name}!</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Find what you need from fellow students at {user?.university}.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/dashboard/my-products/new">
                <Button className="bg-[#f58220] hover:bg-[#f58220]/90">
                  <Plus className="mr-2 h-4 w-4" />
                  List a Product
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f58220] focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Sort</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border border-gray-300 rounded-xl overflow-hidden">
              <Button
                onClick={() => setViewMode("grid")}
                variant="ghost"
                size="icon"
                className={viewMode === "grid" ? "bg-gray-100" : ""}
              >
                <Grid className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant="ghost"
                size="icon"
                className={viewMode === "list" ? "bg-gray-100" : ""}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-gray-200 p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategory === category.id.toString()}
                        onCheckedChange={(checked) => setSelectedCategory(checked ? category.id.toString() : null)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="ml-2 text-sm text-gray-700">
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
                      />
                      <Label htmlFor={`condition-${condition}`} className="ml-2 text-sm text-gray-700">
                        {condition.replace("_", " ")}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">University</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {universities.map((university) => (
                    <div key={university} className="flex items-center">
                      <Checkbox
                        id={`university-${university}`}
                        checked={selectedUniversity === university}
                        onCheckedChange={(checked) => setSelectedUniversity(checked ? university : null)}
                      />
                      <Label htmlFor={`university-${university}`} className="ml-2 text-sm text-gray-700">
                        {university}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Price Range</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">${priceRange[0]}</span>
                    <span className="text-sm text-gray-700">${priceRange[1]}</span>
                  </div>
                  <Slider
                    defaultValue={[0, 2000]}
                    max={2000}
                    step={50}
                    value={priceRange}
                    onValueChange={(value) => setPriceRange(value as [number, number])}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={handleResetFilters} variant="ghost">
                Reset Filters
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Product Categories Tabs */}
      <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="all">All Products</TabsTrigger>
          {categories.slice(0, 5).map((category) => (
            <TabsTrigger key={category.id} value={category.id.toString()} className="hidden md:inline-flex">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Results count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-medium">{filteredProducts.length}</span> products
            </p>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden border border-gray-200 animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
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
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-all"
                    >
                      <Link href={`/products/${product.id}`} className="flex">
                        <div className="w-32 h-32 sm:w-48 sm:h-48 relative flex-shrink-0">
                          <img
                            src={product.primary_image || "/placeholder.svg?height=200&width=200&text=No+Image"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs uppercase text-gray-500">{product.category_name}</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium">{product.university_name}</span>
                            </div>
                          </div>
                          <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {product.condition.replace("_", " ")} • {product.merchant_name}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">${Number.parseFloat(product.price).toFixed(2)}</span>
                              {product.price_negotiable && <span className="text-xs text-gray-500">(Negotiable)</span>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                  <Button onClick={handleResetFilters} className="bg-[#f58220] hover:bg-[#f58220]/90">
                    Reset Filters
                  </Button>
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
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {filteredProducts.filter((p) => p.category_id === category.id).length}
                </span>{" "}
                products
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts
                .filter((p) => p.category_id === category.id)
                .map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
            </div>

            {filteredProducts.filter((p) => p.category_id === category.id).length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No products found in this category</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <Button onClick={handleResetFilters} className="bg-[#f58220] hover:bg-[#f58220]/90">
                  Reset Filters
                </Button>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
