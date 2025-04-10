"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useProducts } from "@/providers/product-provider"
import { useAuth } from "@/providers/auth-provider"
import Link from "next/link"
import Image from "next/image"
import ProductCard from "@/components/products/product-card"
import {
  ArrowRight,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  Clock,
  Layers,
  Plus,
  Filter,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardPage() {
  const { products, categories } = useProducts()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Get the first 4 products
  const featuredProducts = products.slice(0, 4)

  // Recent activity (mock data)
  const recentActivity = [
    {
      id: 1,
      type: "view",
      product: "MacBook Pro 2021",
      time: "2 hours ago",
      image: "/placeholder.svg?height=40&width=40&text=Mac",
    },
    {
      id: 2,
      type: "favorite",
      product: "iPhone 13 Pro",
      time: "Yesterday",
      image: "/placeholder.svg?height=40&width=40&text=iPhone",
    },
    {
      id: 3,
      type: "message",
      product: "Sony Headphones",
      time: "2 days ago",
      image: "/placeholder.svg?height=40&width=40&text=Sony",
    },
  ]

  // Stats (mock data)
  const stats = [
    {
      title: "Products Viewed",
      value: 128,
      change: "+12%",
      icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
      color: "bg-emerald-500/10",
      textColor: "text-emerald-500",
    },
    {
      title: "Active Listings",
      value: 5,
      change: "+2",
      icon: <ShoppingBag className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-500/10",
      textColor: "text-blue-500",
    },
    {
      title: "Saved Items",
      value: 24,
      change: "+3",
      icon: <Heart className="h-5 w-5 text-pink-500" />,
      color: "bg-pink-500/10",
      textColor: "text-pink-500",
    },
    {
      title: "New Connections",
      value: 18,
      change: "+5",
      icon: <Users className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-500/10",
      textColor: "text-purple-500",
    },
  ]

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Sort
            </Button>
            <Button size="sm" className="h-9 bg-[#f58220] hover:bg-[#f58220]/90">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-8">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#0a2472]">Welcome back, {user?.first_name}!</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Discover products and services from fellow students at {user?.university}.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link href="/dashboard/products">
                    <Button className="bg-[#f58220] hover:bg-[#f58220]/90">
                      Browse Products
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${stat.color} mr-3`}>{stat.icon}</div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                        <div className="flex items-baseline">
                          <h3 className="text-2xl font-bold">{stat.value}</h3>
                          <span className={`ml-2 text-xs font-medium ${stat.textColor}`}>{stat.change}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Categories</h2>
              <Link
                href="/dashboard/categories"
                className="text-[#f58220] hover:text-[#f58220]/80 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.slice(0, 5).map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={`/dashboard/categories/${category.id}`}
                    className="rounded-xl p-4 h-full flex flex-col items-center justify-center text-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#f58220]/50 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#f58220]/10 flex items-center justify-center mb-3">
                      <span className="text-xl">{category.icon || <Layers className="h-5 w-5 text-[#f58220]" />}</span>
                    </div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{category.product_count} items</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Featured Products</h2>
              <Link
                href="/dashboard/products"
                className="text-[#f58220] hover:text-[#f58220]/80 text-sm font-medium flex items-center"
              >
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse"
                    >
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                : featuredProducts.map((product, index) => (
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
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Products</h2>
            <Link href="/dashboard/my-products/new">
              <Button className="bg-[#f58220] hover:bg-[#f58220]/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              : products.slice(0, 8).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>
          {products.length > 8 && (
            <div className="flex justify-center mt-8">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Your recent interactions on the platform</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-center">
                    <div className="w-10 h-10 rounded-lg overflow-hidden mr-3 border border-gray-200 dark:border-gray-700">
                      <Image
                        src={activity.image || "/placeholder.svg"}
                        alt={activity.product}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {activity.type === "view"
                          ? "You viewed"
                          : activity.type === "favorite"
                            ? "You saved"
                            : "You messaged about"}{" "}
                        <span className="text-[#f58220]">{activity.product}</span>
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-gray-700 p-4">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Recent conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`/placeholder.svg?height=40&width=40&text=User${i}`} />
                        <AvatarFallback>U{i}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">User {i}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          Hey, I'm interested in your product...
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        New
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button variant="outline" className="w-full">
                  View All Messages
                </Button>
              </CardFooter>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Saved Products</CardTitle>
                <CardDescription>Products you've favorited</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 border border-gray-200 dark:border-gray-600">
                        <Image
                          src={`/placeholder.svg?height=48&width=48&text=P${i}`}
                          alt={`Product ${i}`}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">Product {i}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">$199.99</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Heart className="h-5 w-5 text-pink-500 fill-pink-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button variant="outline" className="w-full">
                  View All Favorites
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
