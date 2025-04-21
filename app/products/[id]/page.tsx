"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import {
  Heart,
  Share2,
  Check,
  MessageCircle,
  ShoppingCart,
  MapPin,
  Clock,
  Copy,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import Navbar from "@/components/navbar"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Header } from "@/components/landing/header"
import { formatPrice } from "@/lib/utils"
import { useStartConversation } from '@/utils/start-conversation'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProductById, toggleFavorite } = useProducts()
  const { user, isAuthenticated } = useAuth()
  const { startChatWithMerchant, isLoading: isStartingChat } = useStartConversation()

  const [product, setProduct] = useState<any>(null)
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [message, setMessage] = useState("Hi, I'm interested in your product. Is it still available?")
  const [contactCopied, setContactCopied] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const productId = Number(params.id)
        if (isNaN(productId)) {
          router.push("/products")
          return
        }

        const productData = await getProductById(productId)
        setProduct(productData)

        // Fetch similar products (same category)
        if (productData.category) {
          const response = await fetch(`/api/products/products/?category=${productData.category}&limit=4`)
          const data = await response.json()
          // Filter out the current product
          const filtered = data.results.filter((p: any) => p.id !== productId)
          setSimilarProducts(filtered.slice(0, 3))
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      }
    }

    fetchProductData()
  }, [params.id, getProductById, router])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login")
      return
    }

    if (!product) return

    try {
      await toggleFavorite(product.id)
      setProduct({ ...product, is_favorited: !product.is_favorited })
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  // Handle contact merchant
  const handleContactMerchant = async () => {
    if (!isAuthenticated) {
      const currentPath = encodeURIComponent(window.location.pathname)
      router.push(`/auth/login?next=${currentPath}`)
      return
    }

    // If we have a message dialog, show it
    if (product?.merchant_id && product?.merchant_id !== user?.id) {
      setIsMessageDialogOpen(true)
    }
  }

  // Handle message submit
  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!product?.merchant_id || !message.trim()) return
    
    try {
      await startChatWithMerchant(product.merchant_id, message.trim())
      setIsMessageDialogOpen(false)
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  // Copy contact number
  const copyContactNumber = () => {
    if (product?.merchant_info?.contact_number) {
      // Check if it's a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

      if (isMobile) {
        // On mobile, make a phone call
        window.location.href = `tel:${product.merchant_info.contact_number}`
      } else {
        // On desktop, copy to clipboard
        navigator.clipboard.writeText(product.merchant_info.contact_number)
        setContactCopied(true)
        setTimeout(() => setContactCopied(false), 2000)

        toast({
          title: "Contact Copied",
          description: "Seller's contact number copied to clipboard",
        })
      }
    }
  }

  // Handle share functionality
  const handleShare = async () => {
    const productUrl = window.location.href
    const title = `Check out this product: ${product.name}`

    // Check if Web Share API is available (mostly on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `${product.name} - ₦${formatPrice(product.price)} - ${product.university_name}`,
          url: productUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback for desktop - copy link to clipboard
      navigator.clipboard.writeText(productUrl)
      toast({
        title: "Link Copied",
        description: "Product link copied to clipboard",
      })
    }
  }

  // Get proper image URL function
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

    // Handle Cloudinary-only URLs
    if (imageUrl.includes("cloudinary.com")) {
      return imageUrl
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

  // // Format price for display
  // const formatPrice = (price: string | number | null) => {
  //   if (price === null || price === undefined) return "N/A"
    
  //   // If price is already a string with proper formatting, return as-is
  //   if (typeof price === "string" && price.includes(",")) {
  //     return price
  //   }
    
  //   // Convert to number if string without formatting
  //   const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    
  //   // Format with commas and preserve decimals if present
  //   return numPrice.toLocaleString("en-US", {
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 2
  //   })
  // }

  // Loading state
  if (isStartingChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-4 md:py-8">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8 animate-pulse">
            <div className="w-full lg:w-1/2">
              <div className="aspect-square rounded-xl bg-gray-200"></div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gray-200"></div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container px-4 py-4 md:py-8">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-8 animate-pulse">
            <div className="w-full lg:w-1/2">
              <div className="aspect-square rounded-xl bg-gray-200"></div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gray-200"></div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container px-4 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Product images */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white border border-gray-200">
              <Image
                src={
                  product.images && product.images.length > 0
                    ? getProperImageUrl(product.images[currentImageIndex].image_url)
                    : "/placeholder.svg?height=600&width=600&text=No+Image"
                }
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {product.images.map((image: any, index: number) => (
                  <div
                    key={image.id}
                    className={`aspect-square rounded-lg overflow-hidden cursor-pointer border-2 ${
                      index === currentImageIndex ? "border-[#f58220]" : "border-transparent"
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={getProperImageUrl(image.image_url) || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product details */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1 bg-[#f58220]/10 text-[#f58220] text-xs font-medium rounded-full">
                    {product.category_name}
                  </div>
                  {product.is_verified && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="relative">
                    <Heart className={`h-5 w-5 ${product.is_favorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <h1 className="text-xl md:text-2xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-baseline mb-4">
                <span className="text-2xl md:text-3xl font-bold">
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
                {product.price_negotiable && <span className="ml-2 text-sm text-gray-500">(Negotiable)</span>}
              </div>

              <div className="flex flex-wrap items-center text-gray-500 text-sm mb-6">
                <div className="flex items-center mr-3 mb-1">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Posted on {formatDate(product.created_at)}</span>
                </div>
                <div className="flex items-center mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{product.university_name}</span>
                </div>
              </div>

              {product.description && (
                <div className="border-t border-b py-4 mb-6">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{product.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Condition</span>
                  <span className="font-medium">{product.condition.replace("_", " ")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Quantity</span>
                  <span className="font-medium">{product.quantity} available</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="font-medium">{product.status}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Views</span>
                  <span className="font-medium">{product.view_count}</span>
                </div>
              </div>

              {product.merchant_info && (
                <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden mr-3 md:mr-4">
                    <Image
                      src={product.merchant_info.profile_picture || "/placeholder.svg?height=48&width=48&text=Seller"}
                      alt={product.merchant_info.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.merchant_info.first_name} {product.merchant_info.last_name}</h3>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(product.merchant_info.date_joined).getFullYear()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleContactMerchant}
                  className="flex-1 bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isAuthenticated ? "Message Seller" : "Login to Message Seller"}
                </Button>
                <Button
                  className="flex-1 border border-[#0a2472] text-[#0a2472] hover:bg-[#0a2472]/5"
                  variant="outline"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Make Offer
                </Button>
              </div>
            </div>

            {/* Purchase Instructions */}
            <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 mt-4 md:mt-6">
              <h2 className="text-lg font-semibold mb-4">Purchase Instructions</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#f58220]/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-[#f58220]">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Click "Copy Seller Contact" to get the seller's phone number.</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#f58220]/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-[#f58220]">2</span>
                  </div>
                  <p className="text-sm text-gray-600">Contact the seller directly to discuss the product.</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#f58220]/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-[#f58220]">3</span>
                  </div>
                  <p className="text-sm text-gray-600">Arrange to meet in a safe place for delivery.</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-[#f58220]/20 flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-bold text-[#f58220]">4</span>
                  </div>
                  <p className="text-sm text-gray-600">Make payment only after inspecting the product.</p>
                </li>
              </ul>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="font-medium mb-3">Security Measures</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-600">Verify the seller's details and reviews.</p>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-600">Use secure payment methods within the chat.</p>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-600">Inspect the product before completing payment.</p>
                  </li>
                  <li className="flex items-start">
                    <Shield className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-600">Avoid sharing personal information.</p>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Button onClick={copyContactNumber} className="w-full bg-[#0a2472] hover:bg-[#0a2472]/90 text-white">
                  <Copy className="h-5 w-5 mr-2" />
                  {contactCopied
                    ? "Contact Copied!"
                    : /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
                      ? "Call Seller"
                      : "Copy Seller Contact"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="text-xl font-bold mb-4 md:mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 group">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm border border-gray-100"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(product.id)
                      }}
                    >
                      <Heart
                        className={`w-5 h-5 ${product.is_favorited ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                      />
                    </Button>
                    <Link href={`/products/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={
                            getProperImageUrl(product.primary_image) ||
                            "/placeholder.svg?height=200&width=200&text=No+Image"
                          }
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs uppercase text-gray-500">{product.category_name}</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">₦{formatPrice(product.price)}</span>
                          </div>
                        </div>
                        <h3 className="font-medium text-base mb-1 truncate">{product.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{product.merchant_name}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact modal */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message Seller</DialogTitle>
            <DialogDescription>
              Send a message to the seller about this product.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMessageSubmit}>
            <div className="flex items-center mb-4">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={product.merchant_info?.profile_picture || "/placeholder.svg?height=40&width=40&text=Seller"}
                  alt={product.merchant_info?.full_name || "Seller"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-medium">{product.merchant_info?.full_name || "Seller"}</h4>
                <p className="text-sm text-gray-500">{product.university_name}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium mb-1">About the product</h4>
              <p className="text-sm text-gray-600">
                {product.name} - ₦{formatPrice(product.price)}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <Textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'm interested in your product. Is it still available?"
                className="w-full"
                required
                disabled={isStartingChat}
              />
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              <p>Your contact details will be shared with the seller.</p>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                disabled={isStartingChat}
              >
                {isStartingChat ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
