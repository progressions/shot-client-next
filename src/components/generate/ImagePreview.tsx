"use client"
import React, { useState } from "react"
import { Box, CircularProgress } from "@mui/material"
import { ImageAttacher, FullImageDialog } from "@/components/generate"

interface ImagePreviewProps {
  imageUrl: string | null
  alt: string
  isPending: boolean
  onSelect: (imageUrl: string) => void
}

export function ImagePreview({
  imageUrl,
  alt,
  isPending,
  onSelect,
}: ImagePreviewProps) {
  const [isFullImageDialogOpen, setIsFullImageDialogOpen] = useState(false)

  const handleOpenFullImage = () => {
    if (imageUrl) {
      setIsFullImageDialogOpen(true)
    }
  }

  const handleCloseFullImage = () => {
    setIsFullImageDialogOpen(false)
  }

  return (
    <>
      <Box
        sx={{
          flex: 1,
          border: "2px solid",
          borderColor: "primary.main",
          bgcolor: "grey.800",
          height: 300,
          p: 1,
          borderRadius: 1,
          cursor: imageUrl ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
        onClick={handleOpenFullImage}
      >
        {isPending ? (
          <CircularProgress sx={{ color: "primary.main" }} />
        ) : imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          />
        ) : null}
        {imageUrl && !isPending && (
          <ImageAttacher imageUrl={imageUrl} onSelect={onSelect} />
        )}
      </Box>
      {imageUrl && (
        <FullImageDialog
          open={isFullImageDialogOpen}
          onClose={handleCloseFullImage}
          imageUrl={imageUrl}
          alt={alt}
        />
      )}
    </>
  )
}
