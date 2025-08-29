"use client"

import { useState } from "react"
import Image from "next/image"
import { Box, Skeleton } from "@mui/material"
import { styled } from "@mui/material/styles"

interface MarketingImageProps {
  src: string
  alt: string
  fallbackGradient?: string
  aspectRatio?: string | number
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down"
  priority?: boolean
  className?: string
  onLoad?: () => void
  onError?: () => void
  overlay?: boolean
  overlayOpacity?: number
}

const ImageContainer = styled(Box)<{ 
  aspectRatio?: string | number
  fallbackGradient?: string 
}>(({ aspectRatio, fallbackGradient }) => ({
  position: "relative",
  width: "100%",
  aspectRatio: aspectRatio || "16/9",
  background: fallbackGradient || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  overflow: "hidden",
}))

const ImageOverlay = styled(Box)<{ opacity: number }>(({ opacity }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `rgba(0, 0, 0, ${opacity})`,
  zIndex: 2,
  pointerEvents: "none",
}))

export function MarketingImage({
  src,
  alt,
  fallbackGradient,
  aspectRatio = "16/9",
  objectFit = "cover",
  priority = false,
  className,
  onLoad,
  onError,
  overlay = false,
  overlayOpacity = 0.3,
}: MarketingImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageLoad = () => {
    setImageLoaded(true)
    onLoad?.()
  }

  const handleImageError = () => {
    setImageError(true)
    console.warn(`Failed to load marketing image: ${src}`)
    onError?.()
  }

  return (
    <ImageContainer 
      aspectRatio={aspectRatio} 
      fallbackGradient={fallbackGradient}
      className={className}
    >
      {!imageLoaded && !imageError && (
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          animation="wave"
          sx={{ position: "absolute", top: 0, left: 0 }}
        />
      )}
      
      {!imageError && (
        <Image
          src={src}
          alt={alt}
          fill
          style={{ 
            objectFit,
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
      
      {overlay && imageLoaded && !imageError && (
        <ImageOverlay opacity={overlayOpacity} />
      )}
    </ImageContainer>
  )
}

// Export a variant specifically for juncture images that might have different aspect ratios
export function JunctureImage({
  src,
  alt,
  fallbackGradient,
  children,
  ...props
}: MarketingImageProps & { children?: React.ReactNode }) {
  const [hasImage, setHasImage] = useState(true)

  return (
    <Box position="relative" sx={{ width: "100%", overflow: "hidden" }}>
      {hasImage ? (
        <MarketingImage
          src={src}
          alt={alt}
          fallbackGradient={fallbackGradient}
          aspectRatio="auto" // Let the image determine its own aspect ratio
          objectFit="cover"
          onError={() => setHasImage(false)}
          overlay={true}
          overlayOpacity={0.3}
          {...props}
        />
      ) : (
        <Box
          sx={{
            aspectRatio: "16/9",
            background: fallbackGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Fallback gradient view */}
        </Box>
      )}
      
      {/* Content overlay (text, etc.) */}
      {children && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
            p: 2,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  )
}