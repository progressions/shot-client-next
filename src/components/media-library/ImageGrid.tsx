"use client"
import { Box, Grid, Typography, CircularProgress } from "@mui/material"
import type { MediaImage } from "@/types"
import ImageCard from "./ImageCard"

interface ImageGridProps {
  images: MediaImage[]
  loading: boolean
  selectedIds: Set<string>
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onDownload: (image: MediaImage) => void
  onShowDetails: (image: MediaImage) => void
  isGamemaster: boolean
}

export default function ImageGrid({
  images,
  loading,
  selectedIds,
  onSelect,
  onDelete,
  onDuplicate,
  onDownload,
  onShowDetails,
  isGamemaster,
}: ImageGridProps) {
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (images.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No images found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate AI images for your characters, vehicles, and other entities
          to see them here.
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={2}>
      {images.map(image => (
        <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ImageCard
            image={image}
            selected={selectedIds.has(image.id)}
            onSelect={onSelect}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onDownload={onDownload}
            onShowDetails={onShowDetails}
            isGamemaster={isGamemaster}
          />
        </Grid>
      ))}
    </Grid>
  )
}
