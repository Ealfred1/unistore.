"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import ProductCard from "@/components/products/product-card"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ArrowUpDown,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import EditProductModal from "@/components/products/edit-product-modal"
import { optimizeImageUrl } from "@/lib/image-utils"

export default function MyProductsPage() {
  const { user } = useAuth()
  const { getUserProducts, updateProduct, deleteProduct, toggleFavorite, getProductById } = useProducts()
  
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOption, setSortOption] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [productToEdit, setProductToEdit] = useState<any>(null)
  
  // Fetch products
  const fetchMyProducts = async (page = 1) => {
    setIsLoading(true)
    try {
      const filters: Record<string, any> = { page }
      
      if (statusFilter && statusFilter !== "all") {
        filters.status = statusFilter
      }
      
      if (searchQuery) {
        filters.search = searchQuery
      }
      
      const response = await getUserProducts(filters)
      setProducts(response.results)
      setTotalPages(response.total_pages)
      setCurrentPage(response.current_page)
      setTotalCount(response.count)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial fetch
  useEffect(() => {
    fetchMyProducts()
  }, [])
  
  // Fetch when filters change
  useEffect(() => {
    fetchMyProducts(currentPage)
  }, [statusFilter, searchQuery, currentPage])
  
  // Handle toggle visibility
  const handleToggleVisibility = async (productId: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    
    const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    
    try {
      await updateProduct(productId, { status: newStatus })
      toast.success(`Product ${newStatus === "ACTIVE" ? "activated" : "deactivated"}`)
      
      // Update local state
      setProducts(products.map(p => 
        p.id === productId ? { ...p, status: newStatus } : p
      ))
    } catch (error) {
      console.error("Error updating product status:", error)
      toast.error("Failed to update product status")
    }
  }
  
  // Handle delete product
  const handleDeleteProduct = (productId: number) => {
    setProductToDelete(productId)
    setDeleteConfirmOpen(true)
  }

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
  
  // Confirm delete
  const handleConfirmDelete = async (productId: number) => {
    try {
      await deleteProduct(productId)
      toast.success("Product deleted successfully")
      
      // Update local state
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
    }
  }
  
  // Get sorted products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price)
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price)
      case "views":
        return b.view_count - a.view_count
      default:
        return 0
    }
  })
  
  // Handle edit click
  const handleEditClick = async (product: any) => {
    try {
      // Fetch complete product details including images
      const completeProduct = await getProductById(product.id)
      setProductToEdit(completeProduct)
      setEditModalOpen(true)
    } catch (error) {
      console.error("Error fetching product details:", error)
      toast.error("Failed to load product details")
    }
  }
  
  // Handle edit success
  const handleEditSuccess = () => {
    // Refresh the products list
    fetchMyProducts(currentPage)
    toast.success("Product updated successfully")
  }
  
  // Format price for display with proper fallbacks
  const formatPrice = (price: any) => {
    if (!price) return "Contact for price";
    
    // If it's a number or numeric string, format it as currency
    if (!isNaN(parseFloat(price))) {
      return new Intl.NumberFormat('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(parseFloat(price));
    }
    
    // Otherwise return as is (for price ranges or custom prices)
    return price;
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Products</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your product listings
          </p>
        </div>
        <Link href="/dashboard/my-products/new">
          <Button className="bg-[#f58220] hover:bg-[#f58220]/90">
            <Plus className="h-5 w-5 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-200 dark:border-gray-700"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px] border-gray-200 dark:border-gray-700">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex h-10 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <Button
                onClick={() => setViewMode("grid")}
                variant="ghost"
                size="icon"
                className={`h-full rounded-none ${viewMode === "grid" ? "bg-[#f58220] text-white hover:bg-[#f58220]/90" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"}`}
              >
                <Grid3X3 className="h-5 w-5" />
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
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="h-48 bg-gray-100 dark:bg-gray-700 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-700 animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-700 animate-pulse mb-4" />
                <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-700 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedProducts.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {sortedProducts.map((product) => (
                <div key={product.id} className="relative group">
                  <ProductCard 
                    product={{
                      ...product,
                      primary_image: optimizeImageUrl(product.primary_image),
                      price: formatPrice(product.price)
                    }} 
                    viewMode={viewMode}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 shadow-sm"
                      onClick={() => handleEditClick(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 shadow-sm"
                      onClick={() => handleToggleVisibility(product.id)}
                    >
                      {product.status === "ACTIVE" ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                    <div className="relative w-full md:w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                      <Link href={`/products/${product.id}`}>
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                            <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </Link>
                      <Badge 
                        className={`absolute top-2 left-2 ${
                          product.status === "ACTIVE" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : product.status === "PENDING" 
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : product.status === "SOLD"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : product.status === "DRAFT"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {product.status}
                      </Badge>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg mb-1">{product.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {product.condition} • {product.university_name}
                          </p>
                          <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                            {product.description || "No description provided"}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
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
                            <span className="text-sm text-gray-500">
                              • {product.view_count} {product.view_count === 1 ? "view" : "views"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(product)}
                            className="h-8 w-8 mr-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleVisibility(product.id)}
                            className="h-8 w-8 mr-1"
                            title={product.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          >
                            {product.status === "ACTIVE" ? (
                              <Eye className="h-4 w-4 text-green-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="h-8 w-8"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * products.length + 1}-
                {Math.min(currentPage * products.length, totalCount)} of {totalCount} products
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10 border-gray-200 dark:border-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 || page === totalPages || 
                           (page >= currentPage - 1 && page <= currentPage + 1);
                  })
                  .map((page, index, array) => {
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return (
                        <div key={`ellipsis-${page}`} className="flex items-center">
                          <span className="px-2 text-gray-400">...</span>
                          <Button
                            variant={currentPage === page ? "default" : "outline"}
                            size="icon"
                            onClick={() => setCurrentPage(page)}
                            className={`h-10 w-10 border-gray-200 dark:border-gray-700 ${
                              currentPage === page
                                ? "bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                                : ""
                            }`}
                          >
                            {page}
                          </Button>
                        </div>
                      );
                    }
                    
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(page)}
                        className={`h-10 w-10 border-gray-200 dark:border-gray-700 ${
                          currentPage === page
                            ? "bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                            : ""
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  })}
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10 border-gray-200 dark:border-gray-700"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
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
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => productToDelete && handleConfirmDelete(productToDelete)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Product Modal */}
      <EditProductModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        product={productToEdit}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
