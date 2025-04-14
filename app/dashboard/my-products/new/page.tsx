"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Upload, X, Camera, DollarSign, Tag, Info, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [minPrice, setMinPrice] = useState<number>(0)
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    condition: "",
    quantity: "1",
    priceNegotiable: false,
    minPrice: "",
    university: user?.university?.toString() || "",
  })

  // Calculate form completion progress
  useEffect(() => {
    const requiredFields = ["name", "description", "price", "category", "condition"]
    const completedFields = requiredFields.filter((field) => productForm[field as keyof typeof productForm])
    const progress = (completedFields.length / requiredFields.length) * 100
    setFormProgress(progress)
  }, [productForm])

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

  // Handle min price change
  const handleMinPriceChange = (value: number[]) => {
    setMinPrice(value[0])
    setProductForm((prev) => ({
      ...prev,
      minPrice: value[0].toString(),
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newImages = Array.from(e.dataTransfer.files)
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => URL.createObjectURL(file))

      setProductImages((prev) => [...prev, ...newImages].slice(0, 5))
    }
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
      
      // Prepare product data
      const productData = {
        ...productForm,
        images: imageFiles,
        price_negotiable: productForm.priceNegotiable,
        min_price: productForm.priceNegotiable ? minPrice : undefined
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

  // Format currency
  const formatCurrency = (value: string) => {
    if (!value) return ""
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Number(value))
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header with progress bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 pt-4 pb-2">
        <div className="flex items-center mb-4">
          <motion.button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold">Add New Product</h1>
            <p className="text-gray-500 dark:text-gray-400">List a new product for sale</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-uniOrange"
            initial={{ width: 0 }}
            animate={{ width: `${formProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Form Tabs */}
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-uniOrange/10 data-[state=active]:text-uniOrange"
          >
            <Info className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="images"
            className="data-[state=active]:bg-uniOrange/10 data-[state=active]:text-uniOrange"
          >
            <Camera className="h-4 w-4 mr-2" />
            Images
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-uniOrange/10 data-[state=active]:text-uniOrange"
          >
            <Tag className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Product Information</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Fill in the details of your product</p>
            </div>

            <div className="p-6">
              <TabsContent value="details" className="mt-0 space-y-6">
                {/* Basic Information */}
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
                      placeholder="e.g. iPhone 12 Pro"
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
                <div>
                  <Label className="text-base font-medium">Product Images</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Add up to 5 images. First image will be the cover image.
                  </p>

                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      dragActive
                        ? "border-uniOrange bg-uniOrange/5"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      id="image-upload"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <Upload className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">Drag and drop your images here</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          or{" "}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-uniOrange hover:text-uniOrange-600 font-medium"
                          >
                            browse files
                          </button>
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supported formats: JPG, PNG, GIF (Max 5MB each)
                      </p>
                    </div>
                  </div>

                  {/* Preview Images */}
                  {productImages.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Uploaded Images</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {productImages.map((image, index) => (
                          <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                          >
                            <Image
                              src={image}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="p-1.5 bg-white rounded-full"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-uniOrange text-white text-xs px-2 py-1 rounded">
                                Cover
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

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
                {/* Pricing Information */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="price" className="text-base font-medium">
                      Price*
                    </Label>
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
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

                  <div>
                    <Label htmlFor="originalPrice" className="text-base font-medium">
                      Original Price (Optional)
                    </Label>
                    <div className="relative mt-2">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="originalPrice"
                        name="originalPrice"
                        min="0"
                        step="0.01"
                        value={productForm.originalPrice}
                        onChange={handleChange}
                        className="w-full pl-10 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-uniOrange focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      If your item is on sale, enter the original price here
                    </p>
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

                      <div className="space-y-4">
                        <Slider
                          value={[minPrice]}
                          min={0}
                          max={productForm.price ? Number(productForm.price) : 1000}
                          step={1}
                          onValueChange={handleMinPriceChange}
                          className="py-4"
                        />

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Min: {formatCurrency("0")}
                          </span>
                          <span className="text-lg font-semibold text-uniOrange">
                            {formatCurrency(minPrice.toString())}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Max: {formatCurrency(productForm.price || "0")}
                          </span>
                        </div>
                      </div>
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
