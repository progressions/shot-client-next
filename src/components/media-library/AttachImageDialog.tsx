"use client"
import { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material"
import { Close as CloseIcon, Link as LinkIcon } from "@mui/icons-material"
import type { MediaImage, MediaImageEntityType } from "@/types"
import {
  CharacterAutocomplete,
  VehicleAutocomplete,
  WeaponAutocomplete,
  SchtickAutocomplete,
  SiteAutocomplete,
  FactionAutocomplete,
  PartyAutocomplete,
  FightAutocomplete,
  UserAutocomplete,
} from "@/components/autocomplete"

interface AttachImageDialogProps {
  image: MediaImage | null
  open: boolean
  onClose: () => void
  onAttach: (
    entityType: MediaImageEntityType,
    entityId: string
  ) => Promise<void>
}

const ENTITY_TYPES: MediaImageEntityType[] = [
  "Character",
  "Vehicle",
  "Weapon",
  "Schtick",
  "Site",
  "Faction",
  "Party",
  "Fight",
  "User",
]

export default function AttachImageDialog({
  image,
  open,
  onClose,
  onAttach,
}: AttachImageDialogProps) {
  const [entityType, setEntityType] = useState<MediaImageEntityType | "">("")
  const [entityId, setEntityId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleEntityTypeChange = (event: SelectChangeEvent) => {
    setEntityType(event.target.value as MediaImageEntityType | "")
    setEntityId(null) // Reset entity selection when type changes
  }

  const handleEntityChange = (value: string | null) => {
    setEntityId(value)
  }

  const handleAttach = async () => {
    if (!entityType || !entityId) return
    setLoading(true)
    try {
      await onAttach(entityType, entityId)
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setEntityType("")
    setEntityId(null)
    onClose()
  }

  if (!image) return null

  const renderEntityAutocomplete = () => {
    if (!entityType) return null

    const commonProps = {
      value: entityId || "",
      onChange: handleEntityChange,
      allowNone: false,
    }

    switch (entityType) {
      case "Character":
        return <CharacterAutocomplete {...commonProps} />
      case "Vehicle":
        return <VehicleAutocomplete {...commonProps} />
      case "Weapon":
        return <WeaponAutocomplete {...commonProps} />
      case "Schtick":
        return <SchtickAutocomplete {...commonProps} />
      case "Site":
        return <SiteAutocomplete {...commonProps} />
      case "Faction":
        return <FactionAutocomplete {...commonProps} />
      case "Party":
        return <PartyAutocomplete {...commonProps} />
      case "Fight":
        return <FightAutocomplete {...commonProps} />
      case "User":
        return <UserAutocomplete {...commonProps} />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 6 }}>
        Attach Image to Entity
        <IconButton
          onClick={handleClose}
          aria-label="Close dialog"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
          {/* Image Preview */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box
              component="img"
              src={image.imagekit_url}
              alt={image.filename || "Image"}
              sx={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 1,
                backgroundColor: "action.hover",
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                Select an entity type and then choose the specific entity to
                attach this image to.
              </Box>
            </Box>
          </Box>

          {/* Entity Type Selector */}
          <FormControl fullWidth>
            <InputLabel id="entity-type-label">Entity Type</InputLabel>
            <Select
              labelId="entity-type-label"
              id="entity-type"
              value={entityType}
              label="Entity Type"
              onChange={handleEntityTypeChange}
            >
              {ENTITY_TYPES.map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Dynamic Entity Autocomplete */}
          {entityType && <Box>{renderEntityAutocomplete()}</Box>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <LinkIcon />
            )
          }
          onClick={handleAttach}
          disabled={!entityType || !entityId || loading}
        >
          {loading ? "Attaching..." : "Attach"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
