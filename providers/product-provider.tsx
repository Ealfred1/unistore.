"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define product type
interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  images: string[]
  category: string
  categoryId: string
  rating: number
  reviewCount: number
  merchant: {
    id: string
    name: string
    isVerified: boolean
  }
  isFavorite?: boolean
  createdAt: Date
}

// Define category type
interface Category {
  id: string
  name: string
  icon: string
  productCount: number
}

// Define product context type
interface ProductContextType {
  products: Product[]
  categories: Category[]
  isLoading: boolean
  fetchProducts: () => Promise<void>
  fetchCategories: () => Promise<void>
  toggleFavorite: (productId: string) => void
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (categoryId: string) => Product[]
  getUserProducts: (userId: string) => Product[]
  getFavoriteProducts: () => Product[]
}

// Create product context
const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Product provider props
interface ProductProviderProps {
  children: ReactNode
}

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch products on mount
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchProducts(), fetchCategories()])
      setIsLoading(false)
    }

    loadInitialData()
  }, [])

  // Fetch products
  const fetchProducts = async () => {
    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock products data
      const mockProducts: Product[] = [
        {
          id: "product_1",
          name: "MacBook Pro 16-inch",
          description: "Apple M1 Pro chip with 10‑core CPU and 16‑core GPU, 16GB unified memory, 512GB SSD storage.",
          price: 1999.99,
          originalPrice: 2499.99,
          discount: 20,
          images: ["/placeholder.svg?height=400&width=400&text=MacBook"],
          category: "Electronics",
          categoryId: "category_1",
          rating: 4.8,
          reviewCount: 156,
          merchant: {
            id: "merchant_1",
            name: "TechHub",
            isVerified: true,
          },
          isFavorite: false,
          createdAt: new Date(),
        },
        {
          id: "product_2",
          name: "Calculus Textbook",
          description: "Calculus: Early Transcendentals, 8th Edition. Perfect condition, barely used.",
          price: 49.99,
          originalPrice: 89.99,
          discount: 44,
          images: ["/placeholder.svg?height=400&width=400&text=Textbook"],
          category: "Books",
          categoryId: "category_2",
          rating: 4.5,
          reviewCount: 42,
          merchant: {
            id: "merchant_2",
            name: "BookWorm",
            isVerified: true,
          },
          isFavorite: true,
          createdAt: new Date(),
        },
        {
          id: "product_3",
          name: "Desk Lamp",
          description: "LED desk lamp with adjustable brightness and color temperature. USB charging port included.",
          price: 29.99,
          images: ["/placeholder.svg?height=400&width=400&text=Lamp"],
          category: "Home & Dorm",
          categoryId: "category_3",
          rating: 4.2,
          reviewCount: 78,
          merchant: {
            id: "merchant_3",
            name: "DormEssentials",
            isVerified: false,
          },
          isFavorite: false,
          createdAt: new Date(),
        },
        {
          id: "product_4",
          name: "Wireless Headphones",
          description: "Noise-cancelling wireless headphones with 30-hour battery life. Perfect for studying.",
          price: 159.99,
          originalPrice: 199.99,
          discount: 20,
          images: ["/placeholder.svg?height=400&width=400&text=Headphones"],
          category: "Electronics",
          categoryId: "category_1",
          rating: 4.7,
          reviewCount: 112,
          merchant: {
            id: "merchant_1",
            name: "TechHub",
            isVerified: true,
          },
          isFavorite: false,
          createdAt: new Date(),
        },
        {
          id: "product_5",
          name: "Bicycle",
          description: "Lightly used mountain bike, perfect for getting around campus. Lock included.",
          price: 199.99,
          images: ["/placeholder.svg?height=400&width=400&text=Bicycle"],
          category: "Transportation",
          categoryId: "category_4",
          rating: 4.3,
          reviewCount: 28,
          merchant: {
            id: "merchant_4",
            name: "CampusRider",
            isVerified: true,
          },
          isFavorite: false,
          createdAt: new Date(),
        },
        {
          id: "product_6",
          name: "Scientific Calculator",
          description: "TI-84 Plus graphing calculator. Required for most math and science courses.",
          price: 89.99,
          originalPrice: 119.99,
          discount: 25,
          images: ["/placeholder.svg?height=400&width=400&text=Calculator"],
          category: "Electronics",
          categoryId: "category_1",
          rating: 4.9,
          reviewCount: 203,
          merchant: {
            id: "merchant_5",
            name: "MathWiz",
            isVerified: true,
          },
          isFavorite: true,
          createdAt: new Date(),
        },
      ]

      setProducts(mockProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      // In a real app, you would make an API call to your backend
      // This is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Mock categories data
      const mockCategories: Category[] = [
        {
          id: "category_1",
          name: "Electronics",
          icon: "💻",
          productCount: 42,
        },
        {
          id: "category_2",
          name: "Books",
          icon: "📚",
          productCount: 78,
        },
        {
          id: "category_3",
          name: "Home & Dorm",
          icon: "🏠",
          productCount: 35,
        },
        {
          id: "category_4",
          name: "Transportation",
          icon: "🚲",
          productCount: 12,
        },
        {
          id: "category_5",
          name: "Clothing",
          icon: "👕",
          productCount: 56,
        },
        {
          id: "category_6",
          name: "Services",
          icon: "🔧",
          productCount: 23,
        },
        {
          id: "category_7",
          name: "Entertainment",
          icon: "🎮",
          productCount: 31,
        },
      ]

      setCategories(mockCategories)
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Toggle favorite
  const toggleFavorite = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product,
      ),
    )
  }

  // Get product by ID
  const getProductById = (id: string) => {
    return products.find((product) => product.id === id)
  }

  // Get products by category
  const getProductsByCategory = (categoryId: string) => {
    return products.filter((product) => product.categoryId === categoryId)
  }

  // Get user products
  const getUserProducts = (userId: string) => {
    return products.filter((product) => product.merchant.id === userId)
  }

  // Get favorite products
  const getFavoriteProducts = () => {
    return products.filter((product) => product.isFavorite)
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        isLoading,
        fetchProducts,
        fetchCategories,
        toggleFavorite,
        getProductById,
        getProductsByCategory,
        getUserProducts,
        getFavoriteProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

// Custom hook to use product context
export function useProducts() {
  const context = useContext(ProductContext)

  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider")
  }

  return context
}
