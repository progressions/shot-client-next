"use client"

import { useState, FormEvent, useRef } from "react"
import {
  Box,
  Button,
  Typography,
  Alert,
  Link,
  useTheme,
  CircularProgress,
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import CheckIcon from "@mui/icons-material/Check"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { useClient } from "@/contexts"
import type { Character } from "@/types/types"
import { FormActions, useForm } from "@/reducers/formState"
import { AxiosError } from "axios"
import { HeroTitle } from "@/components/ui"
import { SpeedDial } from "@/components/characters"

type FormStateData = {
  files: File[]
  error: string
}

type UploadProgress = {
  file: File
  status: "pending" | "uploading" | "success" | "error"
  character?: Character
  errorMsg?: string
}

type BackendErrorResponse = {
  name?: string[]
  error?: string
  errors?: Record<string, string[]>
}

export default function UploadForm() {
  const { client } = useClient()
  const theme = useTheme()

  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    files: [],
    error: "",
  })
  const { success, error } = formState
  const { files } = formState.data

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

  const isUploading = uploadProgress.some(p => p.status === "uploading")

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    dispatchForm({ type: FormActions.ERROR, payload: "" })
    dispatchForm({ type: FormActions.SUCCESS, payload: "" })

    const droppedFiles = Array.from(e.dataTransfer?.files || [])
    const pdfFiles = droppedFiles.filter(
      file => file.type === "application/pdf"
    )

    if (pdfFiles.length === 0) {
      dispatchForm({ type: FormActions.UPDATE, name: "files", value: [] })
      dispatchForm({
        type: FormActions.ERROR,
        payload: "Please select valid PDF files.",
      })
      setUploadProgress([])
    } else {
      dispatchForm({ type: FormActions.UPDATE, name: "files", value: pdfFiles })
      setUploadProgress(pdfFiles.map(file => ({ file, status: "pending" })))
      dispatchForm({ type: FormActions.ERROR, payload: "" })
      if (pdfFiles.length < droppedFiles.length) {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Some files were not valid PDFs and were ignored.",
        })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatchForm({ type: FormActions.ERROR, payload: "" })
    dispatchForm({ type: FormActions.SUCCESS, payload: "" })

    const selectedFiles = Array.from(e.target.files || [])
    const pdfFiles = selectedFiles.filter(
      file => file.type === "application/pdf"
    )

    if (pdfFiles.length === 0) {
      dispatchForm({ type: FormActions.UPDATE, name: "files", value: [] })
      dispatchForm({
        type: FormActions.ERROR,
        payload: "Please select valid PDF files.",
      })
      setUploadProgress([])
    } else {
      dispatchForm({ type: FormActions.UPDATE, name: "files", value: pdfFiles })
      setUploadProgress(pdfFiles.map(file => ({ file, status: "pending" })))
      dispatchForm({ type: FormActions.ERROR, payload: "" })
      if (pdfFiles.length < selectedFiles.length) {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Some files were not valid PDFs and were ignored.",
        })
      }
    }
  }

  const updateProgress = (file: File, updates: Partial<UploadProgress>) => {
    setUploadProgress(prev =>
      prev.map(p => (p.file === file ? { ...p, ...updates } : p))
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (files.length === 0) {
      dispatchForm({ type: FormActions.ERROR, payload: "No files selected." })
      return
    }

    const promises = files.map(async file => {
      updateProgress(file, { status: "uploading" })
      const formData = new FormData()
      formData.append("pdf_file", file)

      try {
        const response = await client.uploadCharacterPdf(formData)
        const character = response.data
        updateProgress(file, { status: "success", character })
        return { success: true, character, file }
      } catch (err: unknown) {
        console.error(`Upload error for ${file.name}:`, err)
        let errorMsg = "Failed to upload PDF."
        if (err instanceof AxiosError && err.response && err.response.data) {
          const data = err.response.data as BackendErrorResponse
          if (data.name && Array.isArray(data.name)) {
            errorMsg = `Name ${data.name.join(", ")}`
          } else if (data.error) {
            errorMsg = data.error
          } else if (data.errors) {
            errorMsg = Object.values(data.errors).flat().join(", ")
          } else if (typeof data === "string") {
            errorMsg = data
          }
        } else if (err instanceof Error) {
          errorMsg = err.message
        }
        updateProgress(file, { status: "error", errorMsg })
        return {
          success: false,
          error: `Failed to upload ${file.name}: ${errorMsg}`,
          file,
        }
      }
    })

    const results = await Promise.all(promises)
    const uploadedCharacters = results
      .filter(r => r.success)
      .map(r => r.character as Character)
    const uploadErrors = results
      .filter(r => !r.success)
      .map(r => r.error as string)

    dispatchForm({
      type: FormActions.RESET,
      payload: {
        ...initialFormState,
        formData: { files: [], characters: uploadedCharacters, error: "" },
      },
    })

    if (uploadErrors.length > 0) {
      dispatchForm({
        type: FormActions.ERROR,
        payload: "Some uploads failed. See details below.",
      })
    }

    if (uploadedCharacters.length > 0) {
      dispatchForm({
        type: FormActions.SUCCESS,
        payload: `${uploadedCharacters.length} character${uploadedCharacters.length > 1 ? "s" : ""} created successfully!`,
      })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation() // Prevent click from triggering the file input
  }

  return (
    <>
      <Box sx={{ maxWidth: 700, mx: "auto", mt: 4, position: "relative" }}>
        <SpeedDial />
        <HeroTitle>Upload PDFs to Create Characters</HeroTitle>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        <Box sx={{ marginTop: 4 }} component="form" onSubmit={handleSubmit}>
          <Box
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            sx={{
              border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[500]}`,
              borderRadius: 1,
              p: 4,
              textAlign: "center",
              cursor: isUploading ? "not-allowed" : "pointer",
              mb: 2,
              backgroundColor: isDragActive
                ? theme.palette.grey[100]
                : "transparent",
              opacity: isUploading ? 0.5 : 1,
            }}
          >
            <CloudUploadIcon
              sx={{ fontSize: 48, color: theme.palette.grey[500] }}
            />
            <Typography variant="body1" sx={{ mt: 2 }}>
              Drag and drop your PDFs here or click to select
            </Typography>
            {uploadProgress.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {uploadProgress.map(p => (
                  <Box
                    key={p.file.name}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      p: 1,
                      border: `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 1,
                      backgroundColor: theme.palette.background.default,
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
                      {p.file.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
                      {p.status === "uploading" && (
                        <CircularProgress size={16} />
                      )}
                      {p.status === "success" && (
                        <CheckIcon color="success" fontSize="small" />
                      )}
                      {p.status === "error" && (
                        <ErrorOutlineIcon color="error" fontSize="small" />
                      )}
                      {p.status === "success" && p.character ? (
                        <Link
                          href={`/characters/${p.character.id}`}
                          target="_blank"
                          sx={{
                            ml: 1,
                            fontFamily: theme.typography.fontFamily,
                            textDecoration: "underline",
                            color: theme.palette.primary.main,
                          }}
                          onClick={handleLinkClick}
                        >
                          {p.character.name}
                        </Link>
                      ) : p.status === "error" && p.errorMsg ? (
                        <Typography
                          variant="body2"
                          sx={{ ml: 1, color: theme.palette.error.main }}
                        >
                          {p.errorMsg}
                        </Typography>
                      ) : (
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <input
            type="file"
            accept="application/pdf"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            disabled={isUploading}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            disabled={files.length === 0 || isUploading}
            fullWidth
          >
            {isUploading ? "Processing..." : "Create Characters"}
          </Button>
        </Box>
      </Box>
    </>
  )
}
