"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Tag, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { motion } from "framer-motion"

interface ProductCardProps {
  product: {
    id: number
    name: string
    price: string
    primary_image?: string
    category_name: string
    condition: string
    price_negotiable: boolean
    is_favorited: boolean
    merchant_name: string
    price_range: string
  }
  onFavoriteToggle: (id: number) => void
}

export default function ProductCard({ product, onFavoriteToggle }: ProductCardProps) {
  const { id, name, price, primary_image, price_range, category_name, condition, price_negotiable, is_favorited } = product
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorited, setIsFavorited] = useState(is_favorited)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // Display price or price range
  const displayPrice = price_range || price ? formatPrice(price_range || price) : "Price on request";
  
  // Condition display mapping
  const conditionMap = {
    "new": { label: "New", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    "like_new": { label: "Like New", color: "bg-blue-50 text-blue-600 border-blue-200" },
    "good": { label: "Good", color: "bg-amber-50 text-amber-600 border-amber-200" },
    "fair": { label: "Fair", color: "bg-orange-50 text-orange-600 border-orange-200" },
    "poor": { label: "Poor", color: "bg-red-50 text-red-600 border-red-200" },
  }

  // Get condition display data
  const conditionKey = condition.toLowerCase().replace(" ", "_")
  const conditionDisplay = conditionMap[conditionKey] || { label: condition.replace("_", " "), color: "bg-gray-50 text-gray-600 border-gray-200" }

  // Handle favorite toggle with animation
  const handleFavoriteToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteToggle(id)
  }

  // Update internal state if prop changes
  useEffect(() => {
    setIsFavorited(is_favorited)
  }, [is_favorited])

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-xl overflow-hidden border border-gray-100 group hover:shadow-lg transition-all duration-300"
      style={{ 
        background: "linear-gradient(to bottom right, #ffffff, #f9fafb)",
        boxShadow: isHovered ? "0 10px 30px rgba(0, 0, 0, 0.08)" : "0 4px 6px rgba(0, 0, 0, 0.02)" 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full flex flex-col">
        {/* Premium product indicator */}
        {price && (
          <div className="absolute top-3 left-3 z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-medium"
            >
              <Sparkles className="w-3 h-3" /> 
            </motion.div>
          </div>
        )}

        {/* Favorite button with animation */}
        <motion.div 
          className="absolute top-3 right-3 z-10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 w-9 h-9 rounded-full"
            onClick={handleFavoriteToggle}
          >
            <motion.div
              animate={isFavorited ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Heart 
                className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                strokeWidth={isFavorited ? 2 : 1.5}
              />
            </motion.div>
          </Button>
        </motion.div>

        <Link href={`/products/${id}`} className="h-full flex flex-col">
          {/* Image container with animations */}
          <div className="relative h-[220px] lg:h-[240px] overflow-hidden bg-gray-50">
            <motion.div
              animate={{ 
                scale: isHovered ? 1.05 : 1,
                filter: isImageLoaded ? "blur(0px)" : "blur(10px)"
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full w-full"
            >
              <Image
                src={primary_image || "/placeholder.svg?height=400&width=300&text=No+Image"}
                alt={name}
                fill
                className="object-cover"
                onLoadingComplete={() => setIsImageLoaded(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </motion.div>
            
            {/* Image overlay with gradient */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{ opacity: isHovered ? 0.6 : 0 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Quick view button that appears on hover */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <motion.span 
                className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-sm font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Quick View
              </motion.span>
            </motion.div>
          </div>
          
          {/* Content area with hover animations */}
          <motion.div 
            className="p-4 flex-1 flex flex-col"
            animate={{ 
              y: isHovered ? -5 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <motion.div 
                className="flex items-center gap-1 text-xs uppercase tracking-wider text-gray-500"
                animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Tag className="w-3 h-3" /> {category_name}
              </motion.div>
              
              <motion.div 
                className={`text-xs px-2 py-0.5 rounded-full border ${conditionDisplay.color}`}
                initial={{ x: 5, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {conditionDisplay.label}
              </motion.div>
            </div>
            
            <motion.h3 
              className="font-medium text-base lg:text-lg mb-2 line-clamp-2 h-12"
              animate={{ y: isHovered ? -2 : 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              {name}
            </motion.h3>
            
            <div className="mt-auto pt-2 flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2"
                animate={{ 
                  scale: isHovered ? 1.02 : 1,
                  y: isHovered ? -2 : 0 
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <span className="font-bold text-base lg:text-lg bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                  {displayPrice}
                </span>
                {price_negotiable && (
                  <motion.span 
                    className="text-xs text-gray-500 flex items-center gap-1"
                    initial={{ opacity: 0, x: 5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <TrendingUp className="w-3 h-3" /> Negotiable
                  </motion.span>
                )}
              </motion.div>
              
              {/* Merchant info on hover */}
              {product.merchant_name && (
                <motion.div
                  className="text-xs text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  {product.merchant_name}
                </motion.div>
              )}
            </div>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  )
}