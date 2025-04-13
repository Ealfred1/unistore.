"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useProducts } from "@/providers/product-provider"
import { Grid3X3, Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriesPage() {
  const { categories, isLoading, fetchCategories } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCategories, setFilteredCategories] = useState(categories)

  useEffect(() => {
    // Filter categories based on search query
    if (searchQuery.trim() === "") {
      setFilteredCategories(categories)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredCategories(
        categories.filter((category) => category.name.toLowerCase().includes(query))
      )
    }
  }, [searchQuery, categories])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-gray-500 dark:text-gray-400">Browse all product categories</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/dashboard/categories/${category.id}`}>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 h-full transition-all hover:border-[#f58220] hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#f58220]/10 flex items-center justify-center text-[#f58220]">
                      {category.icon || <Grid3X3 className="h-6 w-6" />}
                    </div>
                    <span className="text-sm font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      {category.product_count} items
                    </span>
                  </div>
                  <h3 className="font-medium text-lg mb-1">{category.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                    {category.description || `Browse all ${category.name} products`}
                  </p>
                  <div className="flex items-center text-[#f58220] text-sm font-medium">
                    View Category
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {filteredCategories.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No categories found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  )
}
