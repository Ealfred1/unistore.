"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  // Format price in Naira
  const formatPrice = (value: string | null | undefined) => {
    if (!value) return "Price on request";
    
    // Check if it's a price range
    if (value.includes("-") || value.includes("to")) {
      return value; // Return the range as is
    }
    
    // Format as Naira
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number.parseFloat(value));
  }

  // Display price or price range
  const displayPrice = price_range || price ? formatPrice(price_range || price) : "Price on request";

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-200 group hover:shadow-md transition-all">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm shadow-sm"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onFavoriteToggle(id)
          }}
        >
          <Heart className={`w-5 h-5 ${is_favorited ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </Button>
        <Link href={`/products/${id}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <Image
              src={primary_image || "/placeholder.svg?height=400&width=300&text=No+Image"}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase text-gray-500">{category_name}</span>
              <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{condition.replace("_", " ")}</div>
            </div>
            <h3 className="font-medium text-base mb-1 truncate">{name}</h3>
            <div className="flex items-center gap-2">
              <span className="font-bold">{displayPrice}</span>
              {price_negotiable && <span className="text-xs text-gray-500">(Negotiable)</span>}
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
