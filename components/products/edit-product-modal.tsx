"use client"

import { useState, useRef, useEffect } from "react"
import { useProducts } from "@/providers/product-provider"
import { 
  X, 
  Upload, 
  Camera, 
  CheckCircle2, 
  Loader2,
  Star,
  StarOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface EditProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  onSuccess: () => void
}

export default function EditProductModal({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess 
}: EditProductModalProps) {
  const { categories, updateProduct, deleteProductImage, setPrimaryImage } = useProducts()
  
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [priceType, setPriceType] = useState<"fixed" | "range" | "custom" | "none">("fixed")
  const [priceRange, setPriceRange] = useState<string>("")
  const [customPrice, setCustomPrice] = useState<string>("")
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setEditingProduct(product)
      
      // Determine price type based on which price field is populated
      if (product.fixed_price || product.price) {
        setPriceType("fixed")
      } else if (product.price_range) {
        setPriceType("range")
        setPriceRange(product.price_range)
      } else if (product.custom_range) {
        setPriceType("custom")
        setCustomPrice(product.custom_range)
      } else {
        setPriceType("none")
      }
      
      // Reset state
      setImagesToDelete([])
      setNewImages([])
      setActiveTab("details")
    }
  }, [product])
  
  // Format currency in Naira
  const formatCurrency = (value: string) => {
    if (!value) return "₦0.00"
    const number = parseFloat(value)
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(number)
  }
  
  // Handle form change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle switch change
  const handleSwitchChange = (checked: boolean, name: string) => {
    setEditingProduct(prev => ({
      ...prev,
      [name]: checked
    }))
  }
  
  // Handle file input click
  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }
  
  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    const totalImages = (editingProduct?.images?.length || 0) - imagesToDelete.length + newImages.length
    const remainingSlots = 5 - totalImages
    
    if (remainingSlots <= 0) {
      toast.error("Maximum 5 images allowed")
      return
    }
    
    const filesToAdd = Array.from(files).slice(0, remainingSlots)
    setNewImages(prev => [...prev, ...filesToAdd])
    
    // Reset file input
    e.target.value = ""
  }
  
  // Handle remove new image
  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }
  
  // Handle remove existing image
  const handleRemoveExistingImage = (imageId: number) => {
    setImagesToDelete(prev => [...prev, imageId])
  }
  
  // Handle set primary image
  const handleSetPrimaryImage = async (imageId: number) => {
    try {
      await setPrimaryImage(imageId)
      
      // Update local state
      if (editingProduct && editingProduct.images) {
        const updatedImages = editingProduct.images.map((img: any) => ({
          ...img,
          is_primary: img.id === imageId
        }))
        
        setEditingProduct({
          ...editingProduct,
          images: updatedImages,
          primary_image: updatedImages.find((img: any) => img.id === imageId)?.image_url
        })
        
        toast.success("Primary image updated")
      }
    } catch (error) {
      console.error("Error setting primary image:", error)
      toast.error("Failed to set primary image")
    }
  }
  
  // Handle save product
  const handleSaveProduct = async () => {
    if (!editingProduct) return
    
    setIsSubmitting(true)
    
    try {
      const productData: Record<string, any> = {
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        condition: editingProduct.condition,
        quantity: editingProduct.quantity,
        status: editingProduct.status,
        delete_images: imagesToDelete,
      }
      
      // Set price fields based on selected price type
      if (priceType === "fixed") {
        productData.price = editingProduct.price
        productData.fixed_price = editingProduct.price
        productData.price_negotiable = editingProduct.price_negotiable
        if (editingProduct.price_negotiable) {
          productData.min_price = editingProduct.min_price
        }
        // Clear other price fields
        productData.price_range = null
        productData.custom_range = null
      } else if (priceType === "range") {
        productData.price_range = priceRange
        // Clear other price fields
        productData.price = null
        productData.fixed_price = null
        productData.min_price = null
        productData.price_negotiable = false
        productData.custom_range = null
      } else if (priceType === "custom") {
        productData.custom_range = customPrice
        // Clear other price fields
        productData.price = null
        productData.fixed_price = null
        productData.min_price = null
        productData.price_negotiable = false
        productData.price_range = null
      } else {
        // No price
        productData.price = null
        productData.fixed_price = null
        productData.min_price = null
        productData.price_negotiable = false
        productData.price_range = null
        productData.custom_range = null
      }
      
      // Add new images
      if (newImages.length > 0) {
        productData.images = newImages
      }
      
      // Update product
      await updateProduct(editingProduct.id, productData)
      
      toast.success("Product updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (!editingProduct) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update your product information and images
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={editingProduct.name} 
                  onChange={handleFormChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description"
                  value={editingProduct.description || ''} 
                  onChange={handleFormChange}
                  className="mt-1 min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={editingProduct.category?.toString() || ''} 
                    onValueChange={(value) => setEditingProduct({...editingProduct, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select 
                    value={editingProduct.condition} 
                    onValueChange={(value) => setEditingProduct({...editingProduct, condition: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="LIKE_NEW">Like New</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="FAIR">Fair</SelectItem>
                      <SelectItem value="POOR">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    name="quantity"
                    type="number" 
                    min="1"
                    value={editingProduct.quantity} 
                    onChange={handleFormChange}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editingProduct.status} 
                    onValueChange={(value) => setEditingProduct({...editingProduct, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="SOLD">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4">
            <div>
              <Label className="block mb-2">Current Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {editingProduct.images && editingProduct.images
                  .filter((img: any) => !imagesToDelete.includes(img.id))
                  .map((image: any) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img 
                          src={image.image_url} 
                          alt="Product" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex space-x-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveExistingImage(image.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        {!image.is_primary && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleSetPrimaryImage(image.id)}
                            title="Set as primary"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {image.is_primary && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <Label className="block mb-2">Add New Images</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-md overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="New product" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6 rounded-full absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {/* Add image button */}
                {(editingProduct.images?.length || 0) - imagesToDelete.length + newImages.length < 5 && (
                  <button
                    type="button"
                    onClick={handleFileInputClick}
                    className="aspect-square rounded-md border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center hover:border-gray-400 dark:hover:border-gray-600 transition-colors"
                  >
                    <Upload className="h-6 w-6 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-500">Add Image</span>
                  </button>
                )}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />
              
              <p className="text-sm text-gray-500 mt-2">
                You can upload up to 5 images. Supported formats: JPG, PNG, GIF.
              </p>
            </div>
          </TabsContent>
          
          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <div>
              <Label className="block mb-2">Price Type</Label>
              <RadioGroup 
                value={priceType} 
                onValueChange={(value) => setPriceType(value as any)}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="fixed" />
                  <Label htmlFor="fixed">Fixed Price</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range">Price Range</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom Price</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none">No Price</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Fixed Price Input */}
            {priceType === "fixed" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="price" className="text-base font-medium">
                    Price (₦)*
                  </Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={editingProduct.price}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    required
                    className="mt-2"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="priceNegotiable"
                    checked={editingProduct.price_negotiable}
                    onCheckedChange={(checked) => handleSwitchChange(checked, "price_negotiable")}
                  />
                  <Label htmlFor="priceNegotiable">Price is negotiable</Label>
                </div>
                
                {editingProduct.price_negotiable && (
                  <div>
                    <Label htmlFor="minPrice" className="text-base font-medium">
                      Minimum Acceptable Price (₦)*
                    </Label>
                    <Input
                      type="number"
                      id="minPrice"
                      name="min_price"
                      value={editingProduct.min_price || ''}
                      onChange={handleFormChange}
                      min="0"
                      step="0.01"
                      required
                      className="mt-2"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* Range Price Input */}
            {priceType === "range" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="priceRange" className="text-base font-medium">
                    Price Range (₦)*
                  </Label>
                  <Input
                    type="text"
                    id="priceRange"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    required
                    className="mt-2"
                    placeholder="e.g. 5000-10000"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter a price range like "5000-10000"
                  </p>
                </div>
              </div>
            )}
            
            {/* Custom Price Input */}
            {priceType === "custom" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customPrice" className="text-base font-medium">
                    Custom Price Description*
                  </Label>
                  <Input
                    type="text"
                    id="customPrice"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    required
                    className="mt-2"
                    placeholder="e.g. Starting at ₦5,000 per hour"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Use this for services, variable pricing, or other special pricing arrangements
                  </p>
                </div>
              </div>
            )}
            
            {/* No Price Selected */}
            {priceType === "none" && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">
                  No price will be displayed on your listing. Interested buyers will need to contact you for pricing information.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSaveProduct}
            disabled={isSubmitting}
            className="bg-uniOrange hover:bg-uniOrange-600 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 