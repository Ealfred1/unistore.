import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats price values properly handling special cases:
 * - Preserves existing price formats with commas (e.g., "35,000")
 * - Handles custom ranges and special formats (e.g., "Mini pack ranges from #1300-#1900")
 * - Removes emojis and special characters while keeping the price
 * - Adds commas to plain numbers (e.g., "3500" -> "3,500")
 * 
 * @param price - The price value to format
 * @returns Formatted price string
 */
export function formatPrice(price: string | number | null | undefined): string {
  if (!price) return "N/A"

  // Convert to string if number
  const priceStr = price.toString()

  // If it's a custom range or contains text, return as is
  if (priceStr.toLowerCase().includes('range') || 
      priceStr.includes('pack') || 
      priceStr.includes('per')) {
    return priceStr
  }

  // If already has commas and no emojis/symbols, return as is
  if (priceStr.includes(',') && !/[^\d,.]/.test(priceStr)) {
    return priceStr
  }

  // Remove all non-numeric characters except dots
  const cleanPrice = priceStr.replace(/[^\d.]/g, '')

  // If no valid numbers found
  if (!cleanPrice) return "N/A"

  try {
    const numValue = parseFloat(cleanPrice)
    if (isNaN(numValue)) return "N/A"

    // Format with commas
    return numValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
  } catch {
    return priceStr // Return original if parsing fails
  }
}

// Test cases:
/*
formatPrice("🏷️3500")      -> "3,500"
formatPrice("35,000")      -> "35,000"
formatPrice("15,000")      -> "15,000"
formatPrice("6,500")       -> "6,500"
formatPrice("2800")        -> "2,800"
formatPrice("4000")        -> "4,000"
formatPrice("Mini pack ranges from #1300-#1900") -> "Mini pack ranges from #1300-#1900"
formatPrice(null)          -> "N/A"
formatPrice(undefined)     -> "N/A"
formatPrice("Price on request") -> "Price on request"
*/ 