import { StaticImageData } from "next/image"

// ImageKit CDN base URL
const IMAGEKIT_BASE = "https://ik.imagekit.io/nvqgwnjgv"

// Marketing image paths
export const MARKETING_IMAGES = {
  heroes: {
    background: "/images/marketing/heroes/hero-background.jpg",
  },
  screenshots: {
    dashboard: `${IMAGEKIT_BASE}/marketing/screenshots/chi-war-dashboard.png?tr=ar-16-9,c-at_max,fo-auto`,
    characterSheet: `${IMAGEKIT_BASE}/marketing/screenshots/chi-war-character-detail.png?tr=ar-16-9,c-at_max,fo-auto&v=2`,
    combat: `${IMAGEKIT_BASE}/marketing/screenshots/chi-war-fight-detail.png?tr=ar-16-9,c-at_max,fo-auto`,
    aiGeneration: `${IMAGEKIT_BASE}/marketing/screenshots/chi-war-ai-character-complete.png?tr=ar-16-9,c-at_max,fo-center`,
    fightsList: `${IMAGEKIT_BASE}/marketing/screenshots/chi-war-fights-list.png?tr=ar-16-9,c-at_max,fo-auto`,
  },
  junctures: {
    ancient: `${IMAGEKIT_BASE}/marketing/Ancient%20Juncture.png`,
    past: `${IMAGEKIT_BASE}/marketing/Past%20Juncture.png`,
    modern: `${IMAGEKIT_BASE}/marketing/Modern%20Juncture.png`,
    future: `${IMAGEKIT_BASE}/marketing/Future%20Juncture.png`,
    futureWasteland: `${IMAGEKIT_BASE}/marketing/Future%20Wasteland.png?updatedAt=1756431151496`,
    cyberpunk: `${IMAGEKIT_BASE}/marketing/Cyberpunk%20Future.png`,
    netherworld: `${IMAGEKIT_BASE}/marketing/Netherworld.png`,
  },
  assets: {
    logo: "/images/marketing/assets/chi-war-logo.svg",
    campaign: `${IMAGEKIT_BASE}/marketing/Campaign.png?updatedAt=1756431194135`,
    eatersOfTheLotus: `${IMAGEKIT_BASE}/marketing/screenshots/Eaters%20of%20the%20Lotus.png?updatedAt=1756432982466`,
  },
} as const

// Placeholder image data URIs for blur effect
export const PLACEHOLDER_BLUR = {
  default: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAQFB//EACQQAAIBAwQBBQEAAAAAAAAAAAECAwAEEQUSITFBBhMiUWGR/8QAFQEBAQAAAAAAAAAAAAAAAAAABAX/xAAZEQEAAwEBAAAAAAAAAAAAAAABAAIRIRL/2gAMAwEAAhEDEQA/AMttbKTU7sRWqO5aQqCoOM55PHHNa",
  hero: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKABADASIAAhEBAxEB/8QAFwAAAwEAAAAAAAAAAAAAAAAAAAUGB//EACYQAAICAQMDBAMBAAAAAAAAAAECAxEABBIhBTFBEyJRYQZxgZH/xAAVAQEBAAAAAAAAAAAAAAAAAAAAAf/EABcRAQEBAQAAAAAAAAAAAAAAAAEAESH/2gAMAwEAAhEDEQA/AKbRdO",
}

// Fallback gradient styles for missing images
export const FALLBACK_GRADIENTS = {
  hero: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  ancient: "linear-gradient(135deg, #d4af37 0%, #8b4513 100%)",
  past: "linear-gradient(135deg, #4a5d23 0%, #8b4513 100%)",
  modern: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  future: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  default: "linear-gradient(135deg, #ff8f00 0%, #f50057 100%)",
}

interface ImageWithFallback {
  src: string
  fallback?: string
  blurDataURL?: string
  alt: string
}

/**
 * Creates an image configuration with fallback support
 */
export function createMarketingImage(
  src: string,
  alt: string,
  fallbackType: keyof typeof FALLBACK_GRADIENTS = "default"
): ImageWithFallback {
  return {
    src,
    alt,
    fallback: FALLBACK_GRADIENTS[fallbackType],
    blurDataURL: PLACEHOLDER_BLUR.default,
  }
}

/**
 * Image loading state hook
 */
export function useImageLoadingState() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => new Set(prev).add(src))
  }

  const handleImageError = (src: string) => {
    setFailedImages((prev) => new Set(prev).add(src))
    console.warn(`Failed to load marketing image: ${src}`)
  }

  const isImageLoaded = (src: string) => loadedImages.has(src)
  const isImageFailed = (src: string) => failedImages.has(src)

  return {
    handleImageLoad,
    handleImageError,
    isImageLoaded,
    isImageFailed,
  }
}

// Import React hooks at the top of the file
import { useState } from "react"