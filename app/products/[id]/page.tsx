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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { getProductById, toggleFavorite } = useProducts()
  const { user, isAuthenticated } = useAuth()

  const [product, setProduct] = useState<any>(null)
  const [similarProducts, setSimilarProducts] = useState<any[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showContactModal, setShowContactModal] = useState(false)
  const [message, setMessage] = useState("")
  const [contactCopied, setContactCopied] = useState(false)

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
      } finally {
        setIsLoading(false)
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
  const handleContactMerchant = (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would call an API to send the message
    toast({
      title: "Message Sent",
      description: "Your message has been sent to the seller",
    })

    setShowContactModal(false)
    setMessage("")
  }

  // Copy contact number
  const copyContactNumber = () => {
    if (product?.merchant_info?.contact_number) {
      navigator.clipboard.writeText(product.merchant_info.contact_number)
      setContactCopied(true)
      setTimeout(() => setContactCopied(false), 2000)

      toast({
        title: "Contact Copied",
        description: "Seller's contact number copied to clipboard",
      })
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8 animate-pulse">
            <div className="w-full lg:w-1/2">
              <div className="aspect-square rounded-xl bg-gray-200"></div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-gray-200"></div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 space-y-4">
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
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product images */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-white shadow-md">
              <Image
                src={
                  product.images && product.images.length > 0
                    ? product.images[currentImageIndex].image_url
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
                        src={image.image_url || "/placeholder.svg"}
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
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="px-3 py-1 bg-[#f58220]/10 text-[#f58220] text-xs font-medium rounded-full">
                    {product.category_name}
                  </div>
                  {product.is_verified && (
                    <div className="ml-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Verified
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="relative">
                    <Heart className={`h-5 w-5 ${product.is_favorited ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">${Number.parseFloat(product.price).toFixed(2)}</span>
                {product.price_negotiable && <span className="ml-2 text-sm text-gray-500">(Negotiable)</span>}
              </div>

              <div className="flex items-center text-gray-500 text-sm mb-6">
                <Clock className="h-4 w-4 mr-1" />
                <span>Posted on {formatDate(product.created_at)}</span>
                <span className="mx-2">•</span>
                <MapPin className="h-4 w-4 mr-1" />
                <span>{product.university_name}</span>
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
                <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-6">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src={product.merchant_info.profile_picture || "/placeholder.svg?height=48&width=48&text=Seller"}
                      alt={product.merchant_info.full_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{product.merchant_info.full_name}</h3>
                    <p className="text-sm text-gray-500">
                      Member since {new Date(product.merchant_info.joined_date).getFullYear()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={() => setShowContactModal(true)}
                  className="flex-1 bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Contact Seller
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
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 mt-6">
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
                  {contactCopied ? "Contact Copied!" : "Copy Seller Contact"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 group"
                >
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm shadow-sm"
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
                          src={product.primary_image || "/placeholder.svg?height=200&width=200&text=No+Image"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs uppercase text-gray-500">{product.category_name}</span>
                          <div className="flex items-center">
                            <span className="text-sm font-medium">${Number.parseFloat(product.price).toFixed(2)}</span>
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
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Seller</DialogTitle>
            <DialogDescription>Send a message to the seller about this product.</DialogDescription>
          </DialogHeader>

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
              {product.name} - ${Number.parseFloat(product.price).toFixed(2)}
            </p>
          </div>

          <form onSubmit={handleContactMerchant}>
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
              />
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              <p>Your contact details will be shared with the seller.</p>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full bg-[#f58220] hover:bg-[#f58220]/90 text-white">
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
