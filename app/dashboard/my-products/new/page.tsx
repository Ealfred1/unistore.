"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Upload, X, Camera, Tag, Info, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

export default function NewProductPage() {
  const router = useRouter()
  const { categories, createProduct } = useProducts()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [productImages, setProductImages] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const [priceType, setPriceType] = useState<"fixed" | "range" | "custom" | "none">("fixed")
  const [priceRange, setPriceRange] = useState<string>("")
  const [customPrice, setCustomPrice] = useState<string>("")
  
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    quantity: "1",
    priceNegotiable: false,
    minPrice: "",
    university: user?.university?.toString() || "",
  })

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

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ["name", "description", "category", "condition"]
    let completedFields = requiredFields.filter((field) => productForm[field as keyof typeof productForm])
    
    // Add price validation based on price type
    let priceValid = false
    if (priceType === "fixed" && productForm.price) {
      priceValid = true
    } else if (priceType === "range" && priceRange) {
      priceValid = true
    } else if (priceType === "custom" && customPrice) {
      priceValid = true
    } else if (priceType === "none") {
      priceValid = true
    }
    
    const totalFields = requiredFields.length + 1 // +1 for price field
    const progress = ((completedFields.length + (priceValid ? 1 : 0)) / totalFields) * 100
    setFormProgress(progress)
  }, [productForm, priceType, priceRange, customPrice])

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setProductForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // Handle price negotiable toggle
  const handlePriceNegotiableChange = (checked: boolean) => {
    setProductForm((prev) => ({
      ...prev,
      priceNegotiable: checked,
    }))
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // In a real app, you would upload these files to a server
    // For now, we'll just create object URLs
    const newImages = Array.from(files).map((file) => URL.createObjectURL(file))
    setProductImages((prev) => [...prev, ...newImages].slice(0, 5))
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    // Check if we already have 5 images
    if (productImages.length >= 5) {
      toast.error("Maximum 5 images allowed")
      return
    }

    // Check if adding these would exceed 5 images
    const remainingSlots = 5 - productImages.length
    const filesToAdd = Array.from(files).slice(0, remainingSlots)

    // Create object URLs for the images
    const newImages = filesToAdd.map((file) => URL.createObjectURL(file))
    setProductImages((prev) => [...prev, ...newImages])
  }

  // Remove image
  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Convert images from base64 strings to File objects
      const imageFiles = await Promise.all(
        productImages.map(async (base64String, index) => {
          // Skip empty strings
          if (!base64String) return null
          
          // Convert base64 to blob
          const response = await fetch(base64String)
          const blob = await response.blob()
          
          // Create file from blob
          return new File([blob], `product-image-${index}.jpg`, { type: 'image/jpeg' })
        })
      ).then(files => files.filter(Boolean) as File[])
      
      // Prepare product data based on price type
      const productData: Record<string, any> = {
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        condition: productForm.condition,
        quantity: productForm.quantity,
        university: productForm.university,
        images: imageFiles,
      }
      
      // Set price fields based on selected price type
      if (priceType === "fixed") {
        productData.price = productForm.price
        productData.fixed_price = productForm.price
        productData.price_negotiable = productForm.priceNegotiable
        
        if (productForm.priceNegotiable && productForm.minPrice) {
          productData.min_price = productForm.minPrice
        }
      } else if (priceType === "range") {
        productData.price_range = priceRange
      } else if (priceType === "custom") {
        productData.custom_range = customPrice
      }
      
      // Create product
      const newProduct = await createProduct(productData)
      
      toast.success("Product created successfully!")
      router.push(`/dashboard/my-products`)
    } catch (error: any) {
      console.error("Error creating product:", error)
      toast.error(error.response?.data?.message || "Failed to create product")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Add New Product</h1>
      </div>

      <div className="mb-8">
        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-uniOrange transition-all duration-500 ease-in-out"
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {formProgress < 100
            ? "Please fill in all required fields marked with *"
            : "All required fields completed!"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-uniOrange/10 data-[state=active]:text-uniOrange"
          >
            Product Details
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-uniOrange/10 data-[state=active]:text-uniOrange"
          >
            Images
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-uniOrange/10 data-[state=active]:text-uniOrange"
          >
            Pricing
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="p-6">
              <TabsContent value="details" className="mt-0 space-y-6">
                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-base font-medium">
                      Product Name*
                    </Label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={productForm.name}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-base font-medium">
                      Description*
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={5}
                      value={productForm.description}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                      placeholder="Describe your product in detail. Include specifications, condition, reason for selling, etc."
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category" className="text-base font-medium">
                        Category*
                      </Label>
                      <select
                        id="category"
                        name="category"
                        value={productForm.category}
                        onChange={handleChange}
                        required
                        className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="condition" className="text-base font-medium">
                        Condition*
                      </Label>
                      <select
                        id="condition"
                        name="condition"
                        value={productForm.condition}
                        onChange={handleChange}
                        required
                        className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                      >
                        <option value="">Select condition</option>
                        <option value="NEW">New</option>
                        <option value="LIKE_NEW">Like New</option>
                        <option value="EXCELLENT">Excellent</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="text-base font-medium">
                      Quantity
                    </Label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="1"
                      value={productForm.quantity}
                      onChange={handleChange}
                      className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("images")}
                    className="bg-uniOrange hover:bg-uniOrange-600 text-white"
                  >
                    Next: Add Images
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="images" className="mt-0 space-y-6">
                {/* Image Upload */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                    dragActive
                      ? "border-uniOrange bg-uniOrange/5"
                      : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="text-center">
                    <Upload className="h-10 w-10 mx-auto text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">Drag & drop product images</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      or click to browse (max 5 images)
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-4 border-gray-200 dark:border-gray-700"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Select Images
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Image Preview */}
                {productImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Selected Images ({productImages.length}/5)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {productImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <Image
                              src={image}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-uniOrange text-white text-xs px-2 py-1 rounded-full">
                                Cover
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveTab("pricing")}
                    className="bg-uniOrange hover:bg-uniOrange-600 text-white"
                  >
                    Next: Set Price
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-0 space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Pricing Type</Label>
                    <RadioGroup 
                      value={priceType} 
                      onValueChange={(value) => setPriceType(value as "fixed" | "range" | "custom" | "none")}
                      className="mt-2 grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="fixed" id="fixed" />
                        <Label htmlFor="fixed" className="cursor-pointer">Fixed Price</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="range" id="range" />
                        <Label htmlFor="range" className="cursor-pointer">Price Range</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="cursor-pointer">Custom Price</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="none" id="none" />
                        <Label htmlFor="none" className="cursor-pointer">No Price</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Fixed Price Input */}
                  {priceType === "fixed" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="price" className="text-base font-medium">
                          Price*
                        </Label>
                        <div className="relative mt-2">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">₦</span>
                          </div>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            min="0"
                            step="0.01"
                            value={productForm.price}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="priceNegotiable"
                          checked={productForm.priceNegotiable}
                          onCheckedChange={handlePriceNegotiableChange}
                        />
                        <Label htmlFor="priceNegotiable" className="text-base font-medium">
                          Price is negotiable
                        </Label>
                      </div>

                      {productForm.priceNegotiable && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Label htmlFor="minPrice" className="text-base font-medium">
                            Minimum Acceptable Price
                          </Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Set the lowest price you're willing to accept
                          </p>

                          <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <span className="text-gray-500">₦</span>
                            </div>
                            <input
                              type="number"
                              id="minPrice"
                              name="minPrice"
                              min="0"
                              max={productForm.price ? Number(productForm.price) : undefined}
                              step="0.01"
                              value={productForm.minPrice}
                              onChange={handleChange}
                              required
                              className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price Range Input */}
                  {priceType === "range" && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="priceRange" className="text-base font-medium">
                          Price Range*
                        </Label>
                        <div className="relative mt-2">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">₦</span>
                          </div>
                          <input
                            type="text"
                            id="priceRange"
                            value={priceRange}
                            onChange={(e) => setPriceRange(e.target.value)}
                            required
                            className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                            placeholder="e.g. 5000-10000"
                          />
                        </div>
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
                        <input
                          type="text"
                          id="customPrice"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          required
                          className="mt-2 w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                          placeholder="e.g. Starting at ₦5,000 per hour"
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        Use this for services, variable pricing, or other special pricing arrangements
                      </p>
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
                </div>

                <div className="flex justify-between">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("images")}
                    variant="outline"
                    className="border-gray-200 dark:border-gray-700"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-uniOrange hover:bg-uniOrange-600 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Create Product
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </div>
        </form>
      </Tabs>
    </div>
  )
}
