"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, Share2, Star, Check } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

// Mock data for the product
const product = {
  id: "1",
  name: "Light Hooded Tracksuit",
  price: 1259.0,
  originalPrice: 1519.8,
  discount: 20,
  description: "A comfortable and stylish tracksuit perfect for casual wear or light exercise.",
  images: [
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
    "/placeholder.svg?height=600&width=600",
  ],
  rating: 4.7,
  reviewCount: 128,
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: ["#EFEFEF", "#000000", "#7E57C2"],
  merchant: {
    name: "WinterElegance",
    isVerified: true,
  },
  characteristics: [
    { name: "Material", value: "100% Cotton" },
    { name: "Style", value: "Casual" },
    { name: "Season", value: "Winter" },
  ],
}

export default function ProductDetailPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('#EFEFEF');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCharacteristicsOpen, setIsCharacteristicsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price);

  const formattedOriginalPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.originalPrice);

  return (
    <div className="pb-20 lg:pb-10">
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <Link href="/dashboard/products" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative">
        {product.discount > 0 && (
          <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
            -{product.discount}%
          </div>
        )}
        <div className="relative aspect-square">
          <Image
            src={product.images[currentImageIndex] || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="carousel-nav">
          {product.images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentImageIndex ? 'carousel-dot-active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="verified-merchant">
            <span>{product.merchant.name}</span>
            {product.merchant.isVerified && (
              <Check className="verified-badge w-4 h-4" />
            )}
          </div>
          <div className="rating">
            <Star className="rating-star w-4 h-4" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-gray-500">({product.reviewCount})</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl font-bold">{formattedPrice}</span>
          {product.discount > 0 && (
            <span className="text-gray-500 line-through">{formattedOriginalPrice}</span>
          )}
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>

        <div className="mb


I found some issues in the code block.

- unexpected token `\`

I will fix them.

\
