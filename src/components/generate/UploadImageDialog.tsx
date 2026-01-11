"use client"
import { useRef } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  useTheme,
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CheckIcon from "@mui/icons-material/Check"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import type { Entity } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useToast, useClient } from "@/contexts"

interface UploadImageDialogProps {
  open: boolean
  onClose: () => void
  title: string
  entity: Entity
  setEntity?: (entity: Entity) => void
  creationMode?: boolean
}

type FormStateData = {
  image_urls: string[]
  isConfirmDialogOpen: boolean
  hasUploaded: boolean
  uploadStatus: "pending" | "uploading" | "success" | "error"
  uploadErrorMsg?: string
  isDragging: boolean
}

export function UploadImageDialog({
  open,
  onClose,
  title,
  entity,
  setEntity,
  creationMode = false,
}: UploadImageDialogProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const theme = useTheme()
  const { formState, dispatchForm } = useForm<FormStateData>({
    image_urls: [],
    isConfirmDialogOpen: false,
    hasUploaded: false,
    uploadStatus: "pending",
    uploadErrorMsg: "",
    isDragging: false,
  })
  const {
    isDragging,
    isConfirmDialogOpen,
    hasUploaded,
    image_urls,
    uploadStatus,
    uploadErrorMsg,
  } = formState.data
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClose = () => {
    if (hasUploaded) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "isConfirmDialogOpen",
        value: true,
      })
    } else {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "isConfirmDialogOpen",
        value: false,
      })
      onClose()
    }
  }

  const handleConfirmClose = () => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "isConfirmDialogOpen",
      value: false,
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "hasUploaded",
      value: false,
    })
    dispatchForm({ type: FormActions.UPDATE, name: "image_urls", value: [] })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "uploadStatus",
      value: "pending",
    })
    dispatchForm({
      type: FormActions.UPDATE,
      name: "uploadErrorMsg",
      value: "",
    })
    dispatchForm({ type: FormActions.UPDATE, name: "isDragging", value: false })
    onClose()
  }

  const handleCancelClose = () => {
    dispatchForm({
      type: FormActions.UPDATE,
      name: "isConfirmDialogOpen",
      value: false,
    })
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    // Check file size before attempting upload
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      dispatchForm({
        type: FormActions.UPDATE,
        name: "uploadStatus",
        value: "error",
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "uploadErrorMsg",
        value: `File too large (${sizeMB}MB). Maximum size is 50MB.`,
      })
      toastError(`File too large (${sizeMB}MB). Maximum size is 50MB.`)
      return
    }

    if (file.type.startsWith("image/")) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "uploadStatus",
        value: "uploading",
      })

      try {
        if (creationMode) {
          // In creation mode, just create a preview URL and update the entity locally
          const imageUrl = URL.createObjectURL(file)
          const updatedEntity = {
            ...entity,
            image_url: imageUrl,
            _tempImageFile: file, // Store the file for form submission later
          }
          setEntity?.(updatedEntity)

          dispatchForm({
            type: FormActions.UPDATE,
            name: "image_urls",
            value: [imageUrl, ...image_urls],
          })
          dispatchForm({
            type: FormActions.UPDATE,
            name: "hasUploaded",
            value: true,
          })
          dispatchForm({
            type: FormActions.UPDATE,
            name: "uploadStatus",
            value: "success",
          })
          toastSuccess("Image selected for upload")
          handleConfirmClose()
        } else {
          // Normal mode: upload to backend immediately
          const formData = new FormData()
          formData.set(
            entity.entity_class.toLowerCase(),
            JSON.stringify(entity)
          )
          if (file) {
            formData.append("image", file)
          }
          const response = await client[`update${entity.entity_class}`](
            entity.id,
            formData
          )
          setEntity?.(response.data)
          const imageUrl = response.data.image_url
          dispatchForm({
            type: FormActions.UPDATE,
            name: "image_urls",
            value: [imageUrl, ...image_urls],
          })
          dispatchForm({
            type: FormActions.UPDATE,
            name: "hasUploaded",
            value: true,
          })
          dispatchForm({
            type: FormActions.UPDATE,
            name: "uploadStatus",
            value: "success",
          })
          toastSuccess("Image uploaded successfully")
          handleConfirmClose()
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        let errorMsg = "Failed to upload image"

        // Provide more meaningful error messages
        if (error instanceof Error) {
          if (error.message === "Network Error") {
            errorMsg =
              "Upload failed. The file may be too large or there was a connection issue."
          } else if (error.message.includes("timeout")) {
            errorMsg = "Upload timed out. Please try again with a smaller file."
          } else {
            errorMsg = error.message
          }
        }

        dispatchForm({
          type: FormActions.UPDATE,
          name: "uploadStatus",
          value: "error",
        })
        dispatchForm({
          type: FormActions.UPDATE,
          name: "uploadErrorMsg",
          value: errorMsg,
        })
        toastError(creationMode ? "Failed to select image" : errorMsg)
      }
    } else {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "uploadStatus",
        value: "error",
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "uploadErrorMsg",
        value: "Please select a valid image file.",
      })
      toastError("Please select a valid image file.")
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dispatchForm({ type: FormActions.UPDATE, name: "isDragging", value: true })
  }

  const handleDragLeave = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "isDragging", value: false })
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dispatchForm({ type: FormActions.UPDATE, name: "isDragging", value: false })
    handleFileChange(e.dataTransfer.files)
  }

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
          <Typography mb={2}>Upload an image for {entity.name}:</Typography>
          <Box
            onClick={() =>
              uploadStatus !== "uploading" && fileInputRef.current?.click()
            }
            onDragEnter={handleDragOver}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.grey[500]}`,
              borderRadius: 1,
              p: 4,
              textAlign: "center",
              cursor: uploadStatus === "uploading" ? "not-allowed" : "pointer",
              backgroundColor: isDragging
                ? theme.palette.grey[700]
                : "transparent",
              opacity: uploadStatus === "uploading" ? 0.5 : 1,
            }}
          >
            <CloudUploadIcon
              sx={{ fontSize: 48, color: theme.palette.grey[500] }}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Drag and drop your image here or click to select
            </Typography>
            {image_urls.length > 0 || uploadStatus !== "pending" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 2,
                  p: 1,
                  border: `1px solid ${theme.palette.grey[300]}`,
                  borderRadius: 1,
                  backgroundColor: theme.palette.grey[800],
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {image_urls[0] ? "Selected image" : "Image upload"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                  {uploadStatus === "uploading" && (
                    <CircularProgress size={16} />
                  )}
                  {uploadStatus === "success" && (
                    <CheckIcon color="success" fontSize="small" />
                  )}
                  {uploadStatus === "error" && (
                    <ErrorOutlineIcon color="error" fontSize="small" />
                  )}
                  {uploadStatus === "error" && uploadErrorMsg ? (
                    <Typography
                      variant="body2"
                      sx={{ ml: 1, color: theme.palette.error.main }}
                    >
                      {uploadErrorMsg}
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {uploadStatus.charAt(0).toUpperCase() +
                        uploadStatus.slice(1)}
                    </Typography>
                  )}
                </Box>
              </Box>
            ) : null}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={e => handleFileChange(e.target.files)}
              disabled={uploadStatus === "uploading"}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: "grey.800", p: 2 }}>
          <Button
            onClick={handleClose}
            sx={{
              color: "white",
              "&:hover": { bgcolor: "grey.700" },
            }}
          >
            Cancel
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
