"use client"
import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import {
  Stack,
  Drawer,
  Box,
  Typography,
  Alert,
  IconButton,
  FormControl,
  FormHelperText,
} from "@mui/material"
import {
  HeroImage,
  type Option,
  TextField,
  SaveButton,
  CancelButton,
} from "@/components/ui"
import type { SchtickPath, EditorChangeEvent, Schtick } from "@/types"
import { defaultSchtick } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { Editor } from "@/components/editor"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useState, useEffect } from "react"
import { InfoLink } from "@/components/links"
import {
  SchtickCategoryAutocomplete,
  SchtickPathAutocomplete,
} from "@/components/autocomplete"
import { useClient } from "@/contexts"
import { useEntity } from "@/hooks"
import type { AxiosError } from "axios"

// Define the shape of server error responses
interface ServerErrorResponse {
  errors: Partial<Record<keyof FormStateData, string[]>>
}

// Extend form state to include field-specific errors
type FormStateData = Schtick & {
  image?: File | null
  errors?: Partial<Record<keyof Omit<FormStateData, "errors">, string>>
}

interface SchtickFormProperties {
  open: boolean
  onClose: () => void
  setSchtick: (schtick: Schtick) => void
}

export default function SchtickForm({
  open,
  onClose,
  setSchtick,
}: SchtickFormProperties) {
  const { client } = useClient()
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultSchtick,
    errors: {},
  })
  const { disabled, error, data } = formState
  const { name, description, category, path, image, errors = {} } = data
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { createEntity } = useEntity<Schtick>(defaultSchtick, setSchtick)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  useEffect(() => {
    if (image) {
      const previewUrl = URL.createObjectURL(image)
      setImagePreview(previewUrl)
      return () => URL.revokeObjectURL(previewUrl)
    } else {
      setImagePreview(null)
    }
  }, [image])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!/^image\/(webp|jpeg|png|gif)$/.test(file.type)) {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Image must be WEBP, JPEG, PNG, or GIF",
        })
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        dispatchForm({
          type: FormActions.ERROR,
          payload: "Image must be less than 5MB",
        })
        return
      }
      dispatchForm({ type: FormActions.UPDATE, name: "image", value: file })
    }
  }

  const handleFormErrors = (error: unknown) => {
    const axiosError = error as AxiosError<ServerErrorResponse>
    if (axiosError.response?.status === 422) {
      const serverErrors = axiosError.response.data.errors
      const formattedErrors: FormStateData["errors"] = {}
      Object.entries(serverErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          formattedErrors[field as keyof FormStateData] = messages[0]
        }
      })
      dispatchForm({
        type: FormActions.UPDATE,
        name: "errors",
        value: formattedErrors,
      })
      dispatchForm({
        type: FormActions.ERROR,
        payload: "Please correct the errors in the form",
      })
    } else {
      dispatchForm({
        type: FormActions.ERROR,
        payload: "An unexpected error occurred",
      })
    }
    console.error("SchtickForm", error)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (disabled) return
    if (!name.trim()) {
      dispatchForm({ type: FormActions.ERROR, payload: "Name is required" })
      return
    }
    dispatchForm({ type: FormActions.SUBMIT })
    try {
      await createEntity(data, image)
      handleClose()
    } catch (error) {
      handleFormErrors(error)
    }
  }

  const handleClose = () => {
    dispatchForm({
      type: FormActions.RESET,
      payload: { ...initialFormState, errors: {} },
    })
    setImagePreview(null)
    onClose()
  }

  const handleCategoryChange = async (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "category", value })
    if (errors.category) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "errors",
        value: { ...errors, category: undefined },
      })
    }
  }

  const handlePathChange = async (value: string | null) => {
    dispatchForm({ type: FormActions.UPDATE, name: "path", value })
    if (errors.path) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "errors",
        value: { ...errors, path: undefined },
      })
    }
  }

  const fetchPaths = async (inputValue: string): Promise<Option[]> => {
    try {
      const response = await client.getSchtickPaths({
        search: inputValue,
        category: category,
      })
      return response.data.paths.map((path: SchtickPath) => ({
        label: path || "",
        value: path || "",
      }))
    } catch (error) {
      console.error("Error fetching options:", error)
      return []
    }
  }

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleClose}
    >
      <HeroImage entity={formState.data} />
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: isMobile ? "100%" : "30rem",
          height: isMobile ? "auto" : "100%",
          p: isMobile ? "1rem" : "2rem",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2, color: "#ffffff" }}>
          New Schtick
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <FormControl fullWidth margin="normal" error={!!errors.name}>
          <TextField
            label="Name"
            value={name}
            onChange={e => {
              dispatchForm({
                type: FormActions.UPDATE,
                name: "name",
                value: e.target.value,
              })
              if (errors.name) {
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "errors",
                  value: { ...errors, name: undefined },
                })
              }
            }}
            required
            autoFocus
          />
          {errors.name && <FormHelperText>{errors.name}</FormHelperText>}
        </FormControl>
        <FormControl fullWidth margin="normal" error={!!errors.description}>
          <Editor
            name="description"
            value={description}
            onChange={(e: EditorChangeEvent) => {
              dispatchForm({
                type: FormActions.UPDATE,
                name: "description",
                value: e.target.value,
              })
              if (errors.description) {
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "errors",
                  value: { ...errors, description: undefined },
                })
              }
            }}
          />
          {errors.description && (
            <FormHelperText>{errors.description}</FormHelperText>
          )}
        </FormControl>
        <Stack direction="column" spacing={2} sx={{ mt: 2 }}>
          <Typography sx={{ mb: 2 }}>
            A <InfoLink href="/schticks" info="Schtick" /> belongs to a certain{" "}
            <InfoLink info="Category" /> and <InfoLink info="Path" />.
          </Typography>
          <FormControl fullWidth error={!!errors.category}>
            <SchtickCategoryAutocomplete
              required
              value={category || ""}
              onChange={handleCategoryChange}
              allowNone={false}
            />
            {errors.category && (
              <FormHelperText>{errors.category}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth error={!!errors.path}>
            <SchtickPathAutocomplete
              required
              value={path || ""}
              onChange={handlePathChange}
              fetchOptions={fetchPaths}
              allowNone={false}
            />
            {errors.path && <FormHelperText>{errors.path}</FormHelperText>}
          </FormControl>
        </Stack>
        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: "1rem" }}>
          <IconButton component="label">
            <AddPhotoAlternateIcon sx={{ color: "#ffffff" }} />
            <input
              type="file"
              hidden
              accept="image/webp,image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
            />
          </IconButton>
          <Typography variant="body2" sx={{ color: "#ffffff" }}>
            Update Image
          </Typography>
        </Box>
        {imagePreview && <HeroImage entity={{ image_url: imagePreview }} />}
        <Box sx={{ display: "flex", gap: "1rem", mt: 3 }}>
          <SaveButton type="submit" disabled={disabled}>
            Save
          </SaveButton>
          <CancelButton onClick={handleClose}>Cancel</CancelButton>
        </Box>
      </Box>
    </Drawer>
  )
}
