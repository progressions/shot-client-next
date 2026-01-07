"use client"
import { useState } from "react"
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Box,
} from "@mui/material"
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Info as InfoIcon,
  Link as LinkIcon,
} from "@mui/icons-material"
import type { MediaImage } from "@/types"
import { EntityLink } from "@/components/ui/links"

interface ImageCardProps {
  image: MediaImage
  selected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onDownload: (image: MediaImage) => void
  onShowDetails: (image: MediaImage) => void
  onAttach: (id: string) => void
  isGamemaster: boolean
}

export default function ImageCard({
  image,
  selected,
  onSelect,
  onDelete,
  onDuplicate,
  onDownload,
  onShowDetails,
  onAttach,
  isGamemaster,
}: ImageCardProps) {
  const [imageError, setImageError] = useState(false)

  const thumbnailUrl = image.thumbnail_url || image.imagekit_url

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Card
      sx={theme => ({
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: selected
          ? `2px solid ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        transition: "border-color 0.2s, transform 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
        },
      })}
    >
      {/* Selection checkbox */}
      {isGamemaster && (
        <Checkbox
          checked={selected}
          onChange={() => onSelect(image.id)}
          inputProps={{
            "aria-label": `Select image ${image.filename || image.entity_name || "unnamed"}`,
          }}
          sx={{
            position: "absolute",
            top: 4,
            left: 4,
            zIndex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            },
          }}
        />
      )}

      {/* Status and source chips */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Chip
          label={image.status}
          size="small"
          color={image.status === "attached" ? "success" : "warning"}
          sx={{ textTransform: "capitalize" }}
        />
        <Chip
          label={image.source === "ai_generated" ? "AI" : "Upload"}
          size="small"
          color={image.source === "ai_generated" ? "secondary" : "primary"}
        />
      </Box>

      {/* Image */}
      <CardMedia
        component="img"
        height="160"
        image={imageError ? "/placeholder-image.png" : thumbnailUrl}
        alt={image.filename || "AI Generated Image"}
        onError={() => setImageError(true)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${image.filename || image.entity_name || "image"}`}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onShowDetails(image)
          }
        }}
        sx={{
          cursor: "pointer",
          objectFit: "cover",
          "&:focus": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: 2,
          },
        }}
        onClick={() => onShowDetails(image)}
      />

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {image.entity_name && image.entity_id && image.entity_type && (
          <Box
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "& a": { fontSize: "0.875rem" },
            }}
          >
            <EntityLink
              entity={{
                id: image.entity_id,
                entity_class: image.entity_type,
                name: image.entity_name,
              }}
            />
          </Box>
        )}
        {image.entity_type && (
          <Typography variant="caption" color="text.secondary" display="block">
            {image.entity_type}
          </Typography>
        )}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(image.byte_size)}
            {image.width && image.height && ` • ${image.width}×${image.height}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {formatDate(image.inserted_at)}
          </Typography>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: "flex-end", pt: 0 }}>
        <Tooltip title="Details">
          <IconButton size="small" onClick={() => onShowDetails(image)}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download">
          <IconButton size="small" onClick={() => onDownload(image)}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {isGamemaster && (
          <>
            {image.status === "orphan" && (
              <Tooltip title="Attach to Entity">
                <IconButton size="small" onClick={() => onAttach(image.id)}>
                  <LinkIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Duplicate">
              <IconButton size="small" onClick={() => onDuplicate(image.id)}>
                <DuplicateIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(image.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </CardActions>
    </Card>
  )
}
