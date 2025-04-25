/**
 * Image optimization utilities
 */

/**
 * Optimize image URL for better performance
 * @param imageUrl - Original image URL
 * @param options - Image optimization options
 * @returns Optimized image URL
 */
export function optimizeImageUrl(
    imageUrl: string | undefined,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: "auto" | "webp" | "jpg" | "png"
    } = {},
  ): string {
    if (!imageUrl) return "/placeholder.svg?height=200&width=200&text=No+Image"

    // Handle case where Appwrite URL contains a Cloudinary URL
    if (imageUrl.includes("appwrite.io") && imageUrl.includes("cloudinary.com")) {
      const cloudinaryStart = imageUrl.indexOf("https://res.cloudinary.com")
      if (cloudinaryStart !== -1) {
        // Extract the Cloudinary URL and remove the "/view" part if present
        let cloudinaryUrl = imageUrl.substring(cloudinaryStart)
        
        // Remove the "/view" and anything after it (like query parameters)
        if (cloudinaryUrl.includes("/view")) {
          cloudinaryUrl = cloudinaryUrl.split("/view")[0]
        }
        
        // For HEIC images, convert to auto format for better browser compatibility
        if (cloudinaryUrl.toLowerCase().endsWith('.heic')) {
          // Replace the file extension with auto format for Cloudinary nb
          cloudinaryUrl = cloudinaryUrl.replace(/\.heic$/i, '.jpg')
        }
        
        return cloudinaryUrl
      }
    }

    // Handle regular Appwrite URLs
    if (imageUrl.includes("appwrite.io")) {
      const projectId = "67f47c4200273e45c433"
      if (!imageUrl.includes("project=")) {
        return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}project=${projectId}`
      }
      return imageUrl
    }

    return imageUrl
  }

/**
 * Preload critical images to improve perceived performance
 * @param imageUrls - Array of image URLs to preload
 */
export function preloadImages(imageUrls: string[]): void {
  if (typeof window === "undefined") return

  imageUrls.forEach((url) => {
    if (!url) return

    const img = new Image()
    img.src = url
  })
}

/**
 * Generate a responsive image srcSet
 * @param baseUrl - Base image URL
 * @param widths - Array of widths for srcSet
 * @returns Formatted srcSet string
 */
export function generateSrcSet(baseUrl: string, widths: number[] = [320, 640, 960, 1280]): string {
  if (!baseUrl) return ""

  // For Cloudinary URLs, we can add width parameters
  if (baseUrl.includes("cloudinary.com")) {
    return widths
      .map((width) => {
        const optimizedUrl = baseUrl.includes("/upload/")
          ? baseUrl.replace("/upload/", `/upload/w_${width},q_auto/`)
          : baseUrl
        return `${optimizedUrl} ${width}w`
      })
      .join(", ")
  }

  // For other URLs, just return the original
  return baseUrl
}