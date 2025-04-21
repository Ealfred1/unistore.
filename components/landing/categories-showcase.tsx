import { useProducts } from "@/contexts/ProductsContext"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Icon } from "@/components/Icon"
import { formatPrice } from "@/lib/utils"

export function CategoriesShowcase() {
  const { categories } = useProducts()
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([])

  const { getProductsByCategory } = useProducts()

  useEffect(() => {
    if (activeCategory) {
      const loadCategoryProducts = async () => {
        try {
          const response = await getProductsByCategory(activeCategory, { limit: 8 })
          setCategoryProducts(response.results)
        } catch (error) {
          console.error("Error loading category products:", error)
        }
      }
      loadCategoryProducts()
    }
  }, [activeCategory])

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12"
        >
          Shop by Category
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => setActiveCategory(category.id)}
              className={`p-4 rounded-xl border transition-all ${
                activeCategory === category.id
                  ? "border-[#f58220] bg-[#f58220]/5"
                  : "border-gray-200 hover:border-[#f58220]/50"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100">
                  {/* You can add category icons here */}
                  <Icon name={category.icon} className="h-6 w-6 text-[#f58220]" />
                </div>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {categoryProducts.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-white shadow-sm"
                  >
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
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
} 