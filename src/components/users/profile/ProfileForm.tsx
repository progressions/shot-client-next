"use client"

import { useEffect } from "react"
import {
  Box,
  TextField,
  Button,
  Alert,
  Grid,
  Typography,
  Avatar,
  IconButton,
  FormControl,
  FormHelperText
} from "@mui/material"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import { useClient, useToast } from "@/contexts"
import { FormActions, useForm } from "@/reducers"
import type { User } from "@/types"

type FormStateData = User & {
  image?: File | null
}

interface ProfileFormProps {
  user: User
  onSave?: (updatedUser: User) => void
}

export default function ProfileForm({ user, onSave }: ProfileFormProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { formState, dispatchForm } = useForm<FormStateData>({
    ...user,
    image: null
  })
  const { disabled, error, errors, data } = formState
  const { first_name, last_name, email, image } = data

  useEffect(() => {
    if (image) {
      const previewUrl = URL.createObjectURL(image)
      dispatchForm({ type: FormActions.UPDATE, name: "imagePreview", value: previewUrl })
      return () => URL.revokeObjectURL(previewUrl)
    } else {
      dispatchForm({ type: FormActions.UPDATE, name: "imagePreview", value: null })
    }
  }, [image, dispatchForm])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
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

  const handleSave = async () => {
    if (disabled) return
    
    dispatchForm({ type: FormActions.SUBMIT })
    
    try {
      const formData = new FormData()
      const userData = {
        first_name: data.first_name,
        last_name: data.last_name, 
        email: data.email
      }
      formData.set("user", JSON.stringify(userData))
      
      if (image) {
        formData.set("image", image)
      }
      
      const response = await client.updateUser(user.id, formData)
      
      dispatchForm({ type: FormActions.SUCCESS })
      dispatchForm({ type: FormActions.UPDATE, name: "image", value: null })
      toastSuccess("Profile updated successfully")
      
      if (onSave) {
        onSave(response.data)
      }
    } catch (error: unknown) {
      console.error("Failed to update profile:", error)
      const errorResponse = error as { response?: { data?: { errors?: Record<string, string[]> } } }
      dispatchForm({
        type: FormActions.ERROR,
        payload: errorResponse.response?.data?.errors ? 
          Object.values(errorResponse.response.data.errors).flat().join(", ") :
          "Failed to update profile"
      })
      toastError("Failed to update profile")
    }
  }

  const hasChanges = 
    data.first_name !== (user.first_name || "") ||
    data.last_name !== (user.last_name || "") ||
    data.email !== (user.email || "") ||
    image !== null

  const handleReset = () => {
    dispatchForm({ type: FormActions.UPDATE, name: "first_name", value: user.first_name || "" })
    dispatchForm({ type: FormActions.UPDATE, name: "last_name", value: user.last_name || "" })
    dispatchForm({ type: FormActions.UPDATE, name: "email", value: user.email || "" })
    dispatchForm({ type: FormActions.UPDATE, name: "image", value: null })
    dispatchForm({ type: FormActions.CLEAR_ERROR })
  }

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Edit Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar
              src={data.imagePreview || user.image_url}
              sx={{ width: 80, height: 80, mb: 2 }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Avatar>
            <IconButton
              component="label"
              sx={{ mb: 1 }}
              disabled={disabled}
            >
              <AddPhotoAlternateIcon />
              <input
                type="file"
                hidden
                accept="image/webp,image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
              />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {image ? "New image selected" : "Update Profile Image"}
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={9}>
          <Box component="form" noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.first_name}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={first_name || ""}
                    onChange={e =>
                      dispatchForm({
                        type: FormActions.UPDATE,
                        name: "first_name",
                        value: e.target.value,
                      })
                    }
                    disabled={disabled}
                    variant="outlined"
                    error={!!errors.first_name}
                  />
                  {errors.first_name && (
                    <FormHelperText>{errors.first_name}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.last_name}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={last_name || ""}
                    onChange={e =>
                      dispatchForm({
                        type: FormActions.UPDATE,
                        name: "last_name",
                        value: e.target.value,
                      })
                    }
                    disabled={disabled}
                    variant="outlined"
                    error={!!errors.last_name}
                  />
                  {errors.last_name && (
                    <FormHelperText>{errors.last_name}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.email}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email || ""}
                    onChange={e =>
                      dispatchForm({
                        type: FormActions.UPDATE,
                        name: "email",
                        value: e.target.value,
                      })
                    }
                    disabled={disabled}
                    variant="outlined"
                    error={!!errors.email}
                  />
                  {errors.email && (
                    <FormHelperText>{errors.email}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={disabled || !hasChanges}
              >
                {disabled ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={disabled}
              >
                Reset
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}