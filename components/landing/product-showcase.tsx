"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useProducts } from "@/providers/product-provider"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"

export function ProductShowcase() {
  const { products, categories, getProductsByCategory } = useProducts()
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [showcaseProducts, setShowcaseProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      try {
        const response = activeCategory
          ? await getProductsByCategory(activeCategory, { limit: 8, is_featured: true })
          : await getProductsByCategory(1, { limit: 8, is_featured: true }) // Default to first category
        setShowcaseProducts(response.results)
      } catch (error) {
        console.error("Error loading showcase products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [activeCategory])

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link href="/products">
            <Button variant="link" className="text-[#f58220]">
              View All Products
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Category Pills */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-4 scrollbar-hide">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            onClick={() => setActiveCategory(null)}
            className="whitespace-nowrap"
          >
            All Products
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {showcaseProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/products/${product.id}`}>
                <div className="group relative aspect-square overflow-hidden rounded-xl bg-white shadow-sm">
                  <img
                    src={product.primary_image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-medium truncate">{product.name}</p>
                      <p className="text-white/90 text-sm">₦{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
} 