"use client"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star } from "lucide-react"

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    images: string[]
    category: string
    rating: number
    discount?: number
    isFavorite?: boolean
  }
  onFavoriteToggle?: (id: string) => void
}

export default function ProductCard({ product, onFavoriteToggle }: ProductCardProps) {
  const { id, name, price, images, category, rating, discount, isFavorite } = product

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)

  const discountedPrice = discount
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price * (1 - discount / 100))
    : null

  return (
    <div className="product-card">
      {discount && <div className="discount-badge">-{discount}%</div>}
      <button
        className="favorite-button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onFavoriteToggle?.(id)
        }}
      >
        <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>
      <Link href={`/dashboard/products/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={images[0] || "/placeholder.svg?height=400&width=300"}
            alt={name}
            fill
            className="product-card-image object-cover"
          />
        </div>
        <div className="product-card-content">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase text-gray-500 dark:text-gray-400">{category}</span>
            <div className="rating">
              <Star className="rating-star w-4 h-4" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
          <h3 className="font-medium text-base mb-1 truncate">{name}</h3>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${discount ? "text-red-500" : ""}`}>{discountedPrice || formattedPrice}</span>
            {discount && <span className="text-sm text-gray-500 line-through">{formattedPrice}</span>}
          </div>
        </div>
      </Link>
    </div>
  )
}
