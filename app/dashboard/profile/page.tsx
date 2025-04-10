"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/providers/product-provider"
import { Camera, Edit, MapPin, Calendar, Star, ShoppingBag, MessageCircle, Share2 } from "lucide-react"
import ProductCard from "@/components/products/product-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user } = useAuth()
  const { products } = useProducts()
  const [activeTab, setActiveTab] = useState<"listings" | "reviews">("listings")

  // Get user's products (mock data)
  const userProducts = products.slice(0, 3)

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
              <Image
                src={user?.avatar || "/placeholder.svg?height=96&width=96"}
                alt={user?.first_name || "User"}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#f58220] text-white border border-white">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          <Button className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-[#0a2472]">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile info */}
      <div className="pt-16 px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0a2472]">
              {user?.first_name} {user?.last_name}
            </h1>
            <div className="flex items-center mt-1 text-gray-500">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{user?.university || "University Student"}</span>
              <span className="mx-2">•</span>
              <Calendar className="h-4 w-4 mr-1" />
              <span className="text-sm">Joined April 2023</span>
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

        <Card className="mt-6 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Hi there! I'm a student at {user?.university || "University"} studying Computer Science. I sell textbooks,
              electronics, and other items that I no longer need. Feel free to message me if you have any questions!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings" onValueChange={(value) => setActiveTab(value as "listings" | "reviews")}>
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
          {userProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
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
