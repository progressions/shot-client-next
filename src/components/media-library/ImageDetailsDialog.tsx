"use client"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  IconButton,
} from "@mui/material"
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material"
import type { MediaImage } from "@/types"

interface ImageDetailsDialogProps {
  image: MediaImage | null
  open: boolean
  onClose: () => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onDownload: (image: MediaImage) => void
  isGamemaster: boolean
}

export default function ImageDetailsDialog({
  image,
  open,
  onClose,
  onDelete,
  onDuplicate,
  onDownload,
  isGamemaster,
}: ImageDetailsDialogProps) {
  if (!image) return null

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown"
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    return `${(kb / 1024).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleOpenInNewTab = () => {
    window.open(image.imagekit_url, "_blank")
  }

  const handleDelete = () => {
    onDelete(image.id)
    onClose()
  }

  const handleDuplicate = () => {
    onDuplicate(image.id)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 6 }}>
        Image Details
        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {/* Image Preview */}
          <Box
            sx={{
              flex: "1 1 300px",
              maxWidth: "100%",
            }}
          >
            <Box
              component="img"
              src={image.imagekit_url}
              alt={image.filename || "AI Generated Image"}
              sx={{
                width: "100%",
                maxHeight: 400,
                objectFit: "contain",
                borderRadius: 1,
                backgroundColor: "action.hover",
              }}
            />
          </Box>

          {/* Metadata */}
          <Box sx={{ flex: "1 1 250px", minWidth: 250 }}>
            <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
              <Chip
                label={image.status}
                size="small"
                color={image.status === "attached" ? "success" : "warning"}
                sx={{ textTransform: "capitalize" }}
              />
              <Chip
                label={
                  image.source === "ai_generated" ? "AI Generated" : "Uploaded"
                }
                size="small"
                color={
                  image.source === "ai_generated" ? "secondary" : "primary"
                }
              />
            </Box>

            {image.entity_name && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Entity
                </Typography>
                <Typography variant="body1">
                  {image.entity_name}
                  {image.entity_type && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      {" "}
                      ({image.entity_type})
                    </Typography>
                  )}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Filename
                </Typography>
                <Typography variant="body2">
                  {image.filename || "Unnamed"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  File Size
                </Typography>
                <Typography variant="body2">
                  {formatFileSize(image.byte_size)}
                </Typography>
              </Box>

              {image.width && image.height && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Dimensions
                  </Typography>
                  <Typography variant="body2">
                    {image.width} × {image.height} pixels
                  </Typography>
                </Box>
              )}

              {image.ai_provider && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    AI Provider
                  </Typography>
                  <Typography variant="body2">{image.ai_provider}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body2">
                  {formatDate(image.inserted_at)}
                </Typography>
              </Box>

              {image.prompt && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prompt
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      maxHeight: 100,
                      overflow: "auto",
                    }}
                  >
                    {image.prompt}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          startIcon={<OpenInNewIcon />}
          onClick={handleOpenInNewTab}
          size="small"
        >
          Open Full Size
        </Button>
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => onDownload(image)}
          size="small"
        >
          Download
        </Button>
        {isGamemaster && (
          <>
            <Button
              startIcon={<DuplicateIcon />}
              onClick={handleDuplicate}
              size="small"
            >
              Duplicate
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              color="error"
              size="small"
            >
              Delete
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}
