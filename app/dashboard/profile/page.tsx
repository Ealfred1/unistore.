"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/providers/product-provider"
import { Camera, Edit, MapPin, Calendar, Star, ShoppingBag, MessageCircle, Share2, Save, Loader2 } from "lucide-react"
import ProductCard from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import axios from "@/lib/axios"

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const { products } = useProducts()
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings")
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    bio: "",
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get user's products
  const [userProducts, setUserProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Image handling function
  const getProperImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return "/placeholder.svg?height=200&width=200&text=No+Image"

    // Check if the URL contains both Appwrite and Cloudinary
    if (imageUrl.includes("appwrite.io") && imageUrl.includes("cloudinary.com")) {
      const cloudinaryStart = imageUrl.indexOf("https://res.cloudinary.com")
      if (cloudinaryStart !== -1) {
        return imageUrl.substring(cloudinaryStart).split("/view")[0]
      }
    }

    return imageUrl
  }

  // Format price for display
  const formatPrice = (price: string | number | null) => {
    if (price === null || price === undefined) return "N/A"
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return `₦${numPrice.toLocaleString()}`
  }

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      reviewer: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40&text=JS",
      },
      rating: 5,
      comment: "Great seller! The product was exactly as described and shipping was fast.",
      date: "2 weeks ago",
    },
    {
      id: 2,
      reviewer: {
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      },
      rating: 4,
      comment: "Good communication and fair price. Would buy from again.",
      date: "1 month ago",
    },
  ]

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/users/profile/")
      const profileData = response.data
      
      setProfileData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        bio: profileData.bio || "",
      })
      
      // Update user in auth context if needed
      if (setUser) {
        setUser(profileData)
      }
      
      return profileData
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast.error("Failed to load profile data")
    }
  }

  // Fetch user's products
  const fetchUserProducts = async () => {
    setLoadingProducts(true)
    try {
      const response = await axios.get("/products/products/", {
        params: { merchant: user?.id }
      })
      setUserProducts(response.data.results || [])
    } catch (error) {
      console.error("Error fetching user products:", error)
      toast.error("Failed to load your listings")
    } finally {
      setLoadingProducts(false)
    }
  }

  // Handle profile image change and immediate upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Upload image immediately
      await uploadProfileImage(file)
    }
  }
  
  // Upload profile image
  const uploadProfileImage = async (file: File) => {
    setIsUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append("profile_image_file", file)
      
      const response = await axios.patch("/users/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      })
      
      // Update user in auth context
      if (setUser) {
        setUser(response.data)
      }
      
      toast.success("Profile image updated successfully")
    } catch (error) {
      console.error("Error uploading profile image:", error)
      toast.error("Failed to update profile image")
      
      // Reset preview if upload fails
      setPreviewUrl(null)
      setProfileImage(null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async () => {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append("first_name", profileData.first_name)
      formData.append("last_name", profileData.last_name)
      formData.append("bio", profileData.bio)
      
      const response = await axios.patch("/users/profile/", formData)
      
      // Update user in auth context
      if (setUser) {
        setUser(response.data)
      }
      
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      const profileData = await fetchUserProfile()
      if (profileData) {
        await fetchUserProducts()
      }
    }
    
    initializeData()
  }, [])

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  return ( 
    <div className="space-y-8">
      {/* Profile header */}
      <div className="relative">
        <div className="h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-[#0a2472]/10">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
        </div>
        <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end">
          <div className="relative">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-white dark:border-gray-900 bg-white">
              {isUploadingImage ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  <Loader2 className="h-8 w-8 animate-spin text-[#f58220]" />
                </div>
              ) : (
                <Image
                  src={previewUrl || getProperImageUrl(user?.profile_image) || "/placeholder.svg?height=96&width=96"}
                  alt={user?.first_name || "User"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <button 
              className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#f58220] text-white border border-white"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          {isEditing ? (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  if (user) {
                    setProfileData({
                      first_name: user.first_name || "",
                      last_name: user.last_name || "",
                      bio: user.bio || "",
                    })
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#f58220] hover:bg-[#f58220]/90 text-white"
                onClick={handleProfileUpdate}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button 
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0a2472]"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-16 px-4">
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                <Input 
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                <Input 
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bio</label>
              <Textarea 
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0a2472]">
                {user?.first_name} {user?.last_name}
              </h1>
              <div className="flex items-center mt-1 text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm">{user?.university_name || "University Student"}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-sm">
                  Joined {new Date(user?.date_joined || "").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="flex items-center mt-4 md:mt-0 space-x-2">
              <div className="flex items-center px-3 py-1.5 rounded-lg bg-[#f58220]/10 text-[#f58220] border border-[#f58220]/20">
                <Star className="h-4 w-4 mr-1 fill-[#f58220]" />
                <span className="font-medium">4.8</span>
                <span className="text-xs ml-1">(24 reviews)</span>
              </div>
              <Button variant="outline" size="icon" className="border border-gray-200 dark:border-gray-700">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="border border-gray-200 dark:border-gray-700">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {!isEditing && (
          <Card className="mt-6 border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.bio || `Hi there! I'm a student at ${user?.university_name || "University"} studying. I sell textbooks, electronics, and other items that I no longer need. Feel free to message me if you have any questions!`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs 
        defaultValue="listings" 
        onValueChange={(value) => setActiveTab(value as "listings" | "reviews")}
        className="mt-8"
      >
        <TabsList className="border-b border-gray-200 dark:border-gray-700 w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger
            value="listings"
            className={`py-4 px-6 font-medium text-sm border-b-2 rounded-none transition-colors ${
              activeTab === "listings"
                ? "border-[#f58220] text-[#f58220]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Listings
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className={`py-4 px-6 font-medium text-sm border-b-2 rounded-none transition-colors ${
              activeTab === "reviews"
                ? "border-[#f58220] text-[#f58220]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Reviews
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <h2 className="text-xl font-semibold mb-6">My Listings</h2>
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : userProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard 
                    product={{
                      ...product,
                      primary_image: getProperImageUrl(product.primary_image),
                    }} 
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 border border-gray-200 dark:border-gray-700">
              <CardContent>
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No listings yet</h3>
                <p className="text-gray-500 mb-6">You haven't listed any products for sale yet.</p>
                <Button className="bg-[#f58220] hover:bg-[#f58220]/90">Create Listing</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <h2 className="text-xl font-semibold mb-6">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-4 border border-gray-200 dark:border-gray-700">
                        <Image
                          src={review.reviewer.avatar || "/placeholder.svg"}
                          alt={review.reviewer.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{review.reviewer.name}</h3>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex items-center mt-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 border border-gray-200 dark:border-gray-700">
              <CardContent>
                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                <p className="text-gray-500">You haven't received any reviews yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
