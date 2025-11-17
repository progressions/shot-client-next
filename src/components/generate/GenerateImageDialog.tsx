"use client"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { ImagePreview } from "@/components/generate"
import type { Entity } from "@/types"
import { useForm } from "@/reducers"
import { useToast, useCampaign, useClient } from "@/contexts"
import { useImageGeneration } from "@/hooks/useImageGeneration"

interface GenerateImageDialogProps {
  open: boolean
  onClose: () => void
  title: string
  entity: Entity
  setEntity?: (entity: Entity) => void
}

type FormStateData = {
  image_urls: string[]
}

export function GenerateImageDialog({
  open,
  onClose,
  title,
  entity,
  setEntity,
}: GenerateImageDialogProps) {
  const { client } = useClient()
  const { campaign } = useCampaign()
  const { toastSuccess, toastError } = useToast()

  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const { formState, dispatchForm } = useForm<FormStateData>({
    image_urls: [],
  })
  const { image_urls } = formState.data
  const { pending, generateImages } = useImageGeneration({
    client,
    campaignId: campaign?.id,
    entity,
    dispatchForm,
  })

  const handleClose = () => {
    setIsConfirmDialogOpen(true)
  }

  const handleConfirmClose = () => {
    setIsConfirmDialogOpen(false)
    onClose()
  }

  const handleCancelClose = () => {
    setIsConfirmDialogOpen(false)
  }

  const handleSelect = async (imageUrl: string) => {
    try {
      const response = await client.attachImage({
        entity,
        imageUrl,
      })

      // Update local entity state with the response data which includes the new image_url
      if (setEntity && response.data?.entity) {
        setEntity(response.data.entity)
      }

      toastSuccess("Image attached successfully")
      handleConfirmClose()
    } catch (error) {
      console.error("Error attaching image:", error)
      toastError("Failed to attach image")
    }
  }

  const placeholderImages = pending
    ? [{ image_url: null }, { image_url: null }, { image_url: null }]
    : [
        { image_url: image_urls[0] || null },
        { image_url: image_urls[1] || null },
        { image_url: image_urls[2] || null },
      ]

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionProps={{ timeout: 0 }}
        PaperProps={{
          sx: {
            bgcolor: "grey.800",
            color: "white",
            borderRadius: 2,
            border: "2px solid",
            borderColor: "primary.main",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.5)",
            minWidth: { xs: "90%", sm: 600 },
            maxWidth: 800,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: "grey.800", color: "white" }}>
          {title}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "grey.800", color: "white", py: 2 }}>
          <Typography mb={2}>Generate an image for {entity.name}</Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
              mx: "auto",
              display: "block",
              mb: 2,
            }}
            onClick={generateImages}
            disabled={pending || image_urls.length > 0}
          >
            Generate
          </Button>
          <Box sx={{ display: "flex", gap: 2 }}>
            {placeholderImages.map((item, index) => (
              <ImagePreview
                key={index}
                imageUrl={item.image_url}
                alt={`Option ${index + 1}`}
                isPending={pending}
                onSelect={handleSelect}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "grey.800", p: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "grey.700" },
            }}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            onClick={generateImages}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            }}
            disabled={pending || image_urls.length > 0}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onClose={handleCancelClose}
        onConfirm={handleConfirmClose}
        title="Confirm Close"
      >
        Are you sure you want to close this dialog? Any unsaved changes will be
        lost.
      </ConfirmDialog>
    </>
  )
}
