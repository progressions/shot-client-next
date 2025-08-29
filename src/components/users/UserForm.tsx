"use client"

import { useTheme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"
import {
  Stack,
  Drawer,
  Box,
  Typography,
  Alert,
  FormControl,
  FormHelperText,
} from "@mui/material"
import {
  InfoLink,
  HeroImage,
  TextField,
  SaveButton,
  CancelButton,
} from "@/components/ui"
import type { User } from "@/types"
import { defaultUser } from "@/types"
import { FormActions, useForm } from "@/reducers"
import { useEntity } from "@/hooks"

type FormStateData = User & {
  [key: string]: unknown
  image?: File | null
  _tempImageFile?: File
}

interface UserFormProperties {
  open: boolean
  onClose: () => void
  title: string
}

export default function UserForm({ open, onClose, title }: UserFormProperties) {
  const { formState, dispatchForm, initialFormState } = useForm<FormStateData>({
    ...defaultUser,
  })
  const { disabled, error, errors, data } = formState
  const { first_name, last_name, email, image } = data
  const { createEntity, handleFormErrors } = useEntity<User>(
    defaultUser,
    dispatchForm
  )

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const handleEntityUpdate = (updatedUser: User) => {
    // Update specific fields that might change from PositionableImage component
    if (updatedUser.image_url !== data.image_url) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "image_url",
        value: updatedUser.image_url,
      })
    }

    // Handle temporary image file for creation mode
    if (updatedUser._tempImageFile !== data._tempImageFile) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "_tempImageFile",
        value: updatedUser._tempImageFile,
      })
    }

    // Handle position changes
    if (updatedUser.x_position !== data.x_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "x_position",
        value: updatedUser.x_position,
      })
    }

    if (updatedUser.y_position !== data.y_position) {
      dispatchForm({
        type: FormActions.UPDATE,
        name: "y_position",
        value: updatedUser.y_position,
      })
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (disabled) return
    if (!first_name.trim() || !last_name.trim()) {
      dispatchForm({
        type: FormActions.ERROR,
        payload: "First and last name are required",
      })
      return
    }
    dispatchForm({ type: FormActions.SUBMIT })
    try {
      // Check if we have a temporary image file from PositionableImage upload
      const imageFile = image || data._tempImageFile
      await createEntity(data, imageFile)
      handleClose()
    } catch (error) {
      handleFormErrors(error)
    }
  }

  const handleClose = () => {
    dispatchForm({ type: FormActions.RESET, payload: initialFormState })
    onClose()
  }

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={open}
      onClose={handleClose}
    >
      <HeroImage
        entity={formState.data}
        setEntity={handleEntityUpdate}
        creationMode={true}
        pageContext="edit"
        height={400}
      />
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
          {title}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Typography sx={{ mb: 4 }}>
          A <InfoLink href="/users" info="User" /> is a player of the game. They
          could have multiple <InfoLink href="/characters" info="Characters" />{" "}
          and belong to multiple <InfoLink href="/campaigns" info="Campaigns" />
          .
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <FormControl fullWidth error={!!errors.first_name}>
            <TextField
              label="First Name"
              value={first_name}
              onChange={e =>
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "first_name",
                  value: e.target.value,
                })
              }
              margin="normal"
              required
              autoFocus
              error={!!errors.first_name}
            />
            {errors.first_name && (
              <FormHelperText>{errors.first_name}</FormHelperText>
            )}
          </FormControl>
          <FormControl fullWidth error={!!errors.last_name}>
            <TextField
              label="Last Name"
              value={last_name}
              onChange={e =>
                dispatchForm({
                  type: FormActions.UPDATE,
                  name: "last_name",
                  value: e.target.value,
                })
              }
              margin="normal"
              required
              error={!!errors.last_name}
            />
            {errors.last_name && (
              <FormHelperText>{errors.last_name}</FormHelperText>
            )}
          </FormControl>
        </Stack>
        <TextField
          label="Email"
          value={email}
          onChange={e =>
            dispatchForm({
              type: FormActions.UPDATE,
              name: "email",
              value: e.target.value,
            })
          }
          margin="normal"
          required
        />
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
