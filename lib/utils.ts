import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: string | number | null | undefined): string {
  if (!price) return "N/A"

  // Convert to string if it's a number
  let priceStr = price.toString()

  // Remove all non-numeric characters except commas, dots and 'k'/'K'
  priceStr = priceStr.replace(/[^\d,.kK]/g, '')

  // Handle 'k' suffix (e.g., "950k" -> "950000")
  if (priceStr.toLowerCase().endsWith('k')) {
    priceStr = (parseFloat(priceStr.toLowerCase().replace('k', '')) * 1000).toString()
  }

  // Remove commas and convert to number
  const numericValue = parseFloat(priceStr.replace(/,/g, ''))

  // Check if it's a valid number
  if (isNaN(numericValue)) return "N/A"

  // Format with commas and two decimal places
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numericValue)
}
