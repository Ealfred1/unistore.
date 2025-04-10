"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import axios from "@/lib/axios"

// Define category type
interface Category {
  id: number
  name: string
  description: string
  icon: string
  parent: number | null
  parent_name: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  product_count: number
  children: Category[]
}

// Define product type
interface Product {
  id: number
  name: string
  description?: string
  price: string
  price_negotiable: boolean
  min_price?: string
  condition: string
  quantity: number
  is_available: boolean
  status: string
  is_verified: boolean
  is_featured: boolean
  view_count: number
  created_at: string
  updated_at?: string
  university_name: string
  university?: number
  category_name: string
  category?: number
  merchant_name: string
  merchant_info?: {
    id: number
    full_name: string
    profile_picture?: string
    university: string
    joined_date: string
    rating: number
  }
  primary_image?: string
  images?: {
    id: number
    image_id: string
    is_primary: boolean
    created_at: string
    image_url: string
  }[]
  is_favorited: boolean
}

// Define product context type
interface ProductContextType {
  products: Product[]
  categories: Category[]
  isLoading: boolean
  fetchProducts: (filters?: Record<string, any>) => Promise<void>
  fetchCategories: () => Promise<void>
  getProductById: (id: number) => Promise<Product | undefined>
  getProductsByCategory: (categoryId: number) => Promise<Product[]>
  getUserProducts: () => Promise<Product[]>
  getFavoriteProducts: () => Promise<Product[]>
  toggleFavorite: (productId: number) => Promise<void>
  createProduct: (productData: any) => Promise<Product>
  updateProduct: (id: number, productData: any) => Promise<Product>
  deleteProduct: (id: number) => Promise<void>
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

  // Fetch products with optional filters
  const fetchProducts = async (filters?: Record<string, any>) => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            queryParams.append(key, String(value))
          }
        })
      }

      const response = await axios.get(`/products/products/?${queryParams.toString()}`)
      setProducts(response.data.results)
      return response.data.results
    } catch (error) {
      console.error("Error fetching products:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("/products/categories/")
      setCategories(response.data.results)
      return response.data.results
    } catch (error) {
      console.error("Error fetching categories:", error)
      throw error
    }
  }

  // Get product by ID
  const getProductById = async (id: number) => {
    try {
      const response = await axios.get(`/products/products/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error)
      throw error
    }
  }

  // Get products by category
  const getProductsByCategory = async (categoryId: number) => {
    try {
      const response = await axios.get(`/products/products/?category=${categoryId}`)
      return response.data.results
    } catch (error) {
      console.error(`Error fetching products for category ${categoryId}:`, error)
      throw error
    }
  }

  // Get user's products
  const getUserProducts = async () => {
    try {
      // Assuming there's an endpoint for user's products or we can filter by current user
      const response = await axios.get("/products/products/?my_products=true")
      return response.data.results
    } catch (error) {
      console.error("Error fetching user products:", error)
      throw error
    }
  }

  // Get favorite products
  const getFavoriteProducts = async () => {
    try {
      const response = await axios.get("/products/favorites/")
      // Extract product details from favorites
      return response.data.map((favorite: any) => favorite.product_details)
    } catch (error) {
      console.error("Error fetching favorite products:", error)
      throw error
    }
  }

  // Toggle favorite
  const toggleFavorite = async (productId: number) => {
    try {
      const response = await axios.post(`/products/favorites/toggle/${productId}/`)

      // Update local state
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, is_favorited: !product.is_favorited } : product,
        ),
      )

      return response.data
    } catch (error) {
      console.error(`Error toggling favorite for product ${productId}:`, error)
      throw error
    }
  }

  // Create product
  const createProduct = async (productData: any) => {
    try {
      const response = await axios.post("/products/products/", productData)
      return response.data
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  // Update product
  const updateProduct = async (id: number, productData: any) => {
    try {
      const response = await axios.patch(`/products/products/${id}/`, productData)
      return response.data
    } catch (error) {
      console.error(`Error updating product ${id}:`, error)
      throw error
    }
  }

  // Delete product
  const deleteProduct = async (id: number) => {
    try {
      await axios.delete(`/products/products/${id}/`)
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error)
      throw error
    }
  }

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await Promise.all([fetchProducts(), fetchCategories()])
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [])

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        isLoading,
        fetchProducts,
        fetchCategories,
        getProductById,
        getProductsByCategory,
        getUserProducts,
        getFavoriteProducts,
        toggleFavorite,
        createProduct,
        updateProduct,
        deleteProduct,
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
