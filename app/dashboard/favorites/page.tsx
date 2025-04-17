"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import ProductCard from "@/components/products/product-card"
import { Heart, Search, Filter, ChevronDown, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

export default function FavoritesPage() {
  const { getFavoriteProducts, toggleFavorite } = useProducts()
  
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "price_low" | "price_high">("newest")
  const [searchQuery, setSearchQuery] = useState("")

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

  // Add price formatting function
  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) return "N/A"
    
    // If price is already a string with proper formatting
    if (typeof price === "string") {
      // Handle "k" suffix (e.g. "13k" -> "13,000") 
      if (price.toLowerCase().endsWith('k')) {
        const numValue = parseFloat(price.toLowerCase().replace('k', '')) * 1000
        return numValue.toLocaleString("en-US")
      }

      // If already formatted with commas, just return the string
      if (price.includes(",")) {
        // Remove any spaces
        return price.replace(/\s/g, '')
      }

      // Try parsing as number, preserving any decimals
      const numValue = parseFloat(price.replace(/,/g, ''))
      if (!isNaN(numValue)) {
        return numValue.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        })
      }

      // If parsing fails, return original string
      return price
    }
    
    // Handle numeric input
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  }

  // Fetch favorite products
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true)
        const favorites = await getFavoriteProducts()
        setFavoriteProducts(favorites || [])
      } catch (error) {
        console.error("Error fetching favorites:", error)
        toast.error("Failed to load favorites")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [getFavoriteProducts])

  // Handle removing from favorites
  const handleRemoveFavorite = async (productId: number) => {
    try {
      await toggleFavorite(productId)
      setFavoriteProducts((prev) => prev.filter((product) => product.id !== productId))
      toast.success("Removed from favorites")
    } catch (error) {
      console.error("Error removing favorite:", error)
      toast.error("Failed to remove from favorites")
    }
  }

  // Filter products based on search query
  const filteredProducts = favoriteProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price_low") return parseFloat(a.price || "0") - parseFloat(b.price || "0")
    if (sortBy === "price_high") return parseFloat(b.price || "0") - parseFloat(a.price || "0")
    // Default: newest
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-8">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2472]">Favorites</h1>
          <p className="text-gray-500">
            {favoriteProducts.length} {favoriteProducts.length === 1 ? "item" : "items"} saved
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search favorites..."
              className="pl-10"
            />
          </div>

          {/* Sort and View Controls */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("newest")}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price_low")}>
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("price_high")}>
                  Price: High to Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "bg-gray-100" : ""}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-gray-100" : ""}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className={viewMode === "grid" ? "space-y-3" : "flex h-32"}>
                {/* Image skeleton */}
                <div className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${
                  viewMode === "grid" ? "aspect-square w-full" : "w-32 h-32"
                }`} />
                
                {/* Content skeleton */}
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="w-3/4 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                  <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  {viewMode === "list" && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="w-24 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
          {sortedProducts.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard 
                product={{
                  ...product,
                  primary_image: getProperImageUrl(product.primary_image),
                  price: formatPrice(product.price || product.price_range || product.fixed_price)
                }} 
                viewMode={viewMode}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFavorite(product.id)}
              >
                <Heart className="h-4 w-4 fill-current" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
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
