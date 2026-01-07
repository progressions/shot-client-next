"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material"
import { Add, AutoAwesome } from "@mui/icons-material"
import { useClient, useToast } from "@/contexts"
import PartySlotCard from "./PartySlotCard"
import RoleBadge from "./RoleBadge"
import CharacterFilter from "@/components/characters/CharacterFilter"
import type { Party, PartyTemplate, PartyRole, Character } from "@/types"

interface PartyCompositionBuilderProps {
  party: Party
  onUpdate: (party: Party) => void
  isEditing?: boolean
}

// Map party slot role to character type for filter pre-population
const roleToCharacterType: Record<PartyRole, string> = {
  boss: "Boss",
  featured_foe: "Featured Foe",
  mook: "Mook",
  ally: "Ally",
}

export default function PartyCompositionBuilder({
  party,
  onUpdate,
  isEditing = true,
}: PartyCompositionBuilderProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  const [templates, setTemplates] = useState<PartyTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

  // Character selection modal state
  const [selectingSlotId, setSelectingSlotId] = useState<string | null>(null)

  // Add slot modal state
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false)
  const [newSlotRole, setNewSlotRole] = useState<PartyRole>("featured_foe")
  const [newSlotMookCount, setNewSlotMookCount] = useState<number>(6)

  const slots = party.slots || []

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await client.getTemplates()
        setTemplates(response.data.templates || [])
      } catch (error) {
        console.error("Error fetching templates:", error)
      } finally {
        setIsLoadingTemplates(false)
      }
    }
    fetchTemplates()
  }, [client])

  // Apply template
  const handleApplyTemplate = useCallback(async () => {
    if (!selectedTemplate) return

    setIsLoading(true)
    try {
      const response = await client.applyTemplate(party.id, selectedTemplate)
      onUpdate(response.data)
      toastSuccess("Template applied successfully")
      setSelectedTemplate("")
    } catch (error) {
      console.error("Error applying template:", error)
      toastError("Failed to apply template")
    } finally {
      setIsLoading(false)
    }
  }, [client, party.id, selectedTemplate, onUpdate, toastSuccess, toastError])

  // Add slot
  const handleAddSlot = useCallback(async () => {
    setIsLoading(true)
    try {
      const slotData: {
        role: PartyRole
        default_mook_count?: number
      } = { role: newSlotRole }

      if (newSlotRole === "mook") {
        slotData.default_mook_count = newSlotMookCount
      }

      const response = await client.addSlot(party.id, slotData)
      onUpdate(response.data)
      toastSuccess("Slot added")
      setIsAddSlotOpen(false)
      setNewSlotRole("featured_foe")
      setNewSlotMookCount(6)
    } catch (error) {
      console.error("Error adding slot:", error)
      toastError("Failed to add slot")
    } finally {
      setIsLoading(false)
    }
  }, [
    client,
    party.id,
    newSlotRole,
    newSlotMookCount,
    onUpdate,
    toastSuccess,
    toastError,
  ])

  // Populate slot with character - called when character is selected from filter
  const handlePopulateSlot = useCallback(
    async (character: Character) => {
      if (!selectingSlotId) return

      setIsLoading(true)
      try {
        const response = await client.populateSlot(
          party.id,
          selectingSlotId,
          character.id
        )
        onUpdate(response.data)
        toastSuccess(`${character.name} assigned to slot`)
        setSelectingSlotId(null)
      } catch (error) {
        console.error("Error populating slot:", error)
        toastError("Failed to assign character")
      } finally {
        setIsLoading(false)
      }
    },
    [client, party.id, selectingSlotId, onUpdate, toastSuccess, toastError]
  )

  // Clear slot
  const handleClearSlot = useCallback(
    async (slotId: string) => {
      setIsLoading(true)
      try {
        const response = await client.clearSlot(party.id, slotId)
        onUpdate(response.data)
        toastSuccess("Slot cleared")
      } catch (error) {
        console.error("Error clearing slot:", error)
        toastError("Failed to clear slot")
      } finally {
        setIsLoading(false)
      }
    },
    [client, party.id, onUpdate, toastSuccess, toastError]
  )

  // Remove slot
  const handleRemoveSlot = useCallback(
    async (slotId: string) => {
      setIsLoading(true)
      try {
        await client.removeSlot(party.id, slotId)
        // Manually update the party to remove the slot
        const updatedParty = {
          ...party,
          slots: slots.filter(s => s.id !== slotId),
        }
        onUpdate(updatedParty)
        toastSuccess("Slot removed")
      } catch (error) {
        console.error("Error removing slot:", error)
        toastError("Failed to remove slot")
      } finally {
        setIsLoading(false)
      }
    },
    [client, party, onUpdate, toastSuccess, toastError]
  )

  // Update mook count
  const handleMookCountChange = useCallback(
    async (slotId: string, count: number) => {
      try {
        const response = await client.updateSlot(party.id, slotId, {
          default_mook_count: count,
        })
        onUpdate(response.data)
      } catch (error) {
        console.error("Error updating mook count:", error)
        toastError("Failed to update mook count")
      }
    },
    [client, party.id, onUpdate, toastError]
  )

  if (!isEditing && slots.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        This party has no composition defined. Edit the party to add roles and
        characters.
      </Alert>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      {isEditing && (
        <>
          {/* Template Selector */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Apply Template
            </Typography>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Template</InputLabel>
                <Select
                  value={selectedTemplate}
                  label="Select Template"
                  onChange={e => setSelectedTemplate(e.target.value)}
                  disabled={isLoading || isLoadingTemplates}
                >
                  {isLoadingTemplates ? (
                    <MenuItem disabled value="">
                      <em>Loading templates...</em>
                    </MenuItem>
                  ) : templates.length === 0 ? (
                    <MenuItem disabled value="">
                      <em>No templates available</em>
                    </MenuItem>
                  ) : (
                    templates.map(template => (
                      <MenuItem key={template.key} value={template.key}>
                        {template.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={
                  isLoading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AutoAwesome />
                  )
                }
                onClick={handleApplyTemplate}
                disabled={!selectedTemplate || isLoading}
                size="small"
              >
                Apply
              </Button>
            </Stack>
            {selectedTemplate && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                {templates.find(t => t.key === selectedTemplate)?.description}
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />
        </>
      )}

      {/* Slots List */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Composition Slots {slots.length > 0 && `(${slots.length})`}
        </Typography>

        {slots.length === 0 ? (
          <Alert severity="info">
            No slots defined. Use a template or add slots manually.
          </Alert>
        ) : (
          <Stack spacing={1}>
            {slots.map(slot => (
              <PartySlotCard
                key={slot.id}
                slot={slot}
                onPopulate={
                  isEditing ? slotId => setSelectingSlotId(slotId) : undefined
                }
                onClear={isEditing ? handleClearSlot : undefined}
                onRemove={isEditing ? handleRemoveSlot : undefined}
                onMookCountChange={
                  isEditing ? handleMookCountChange : undefined
                }
                isLoading={isLoading}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* Add Slot Button */}
      {isEditing && (
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => setIsAddSlotOpen(true)}
          disabled={isLoading}
          size="small"
        >
          Add Slot
        </Button>
      )}

      {/* Character Selection Dialog */}
      <Dialog
        open={selectingSlotId !== null}
        onClose={() => setSelectingSlotId(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Character for Slot</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {selectingSlotId && (
              <CharacterFilter
                addMember={handlePopulateSlot}
                omit={[]}
                defaultCharacterType={(() => {
                  const slot = slots.find(s => s.id === selectingSlotId)
                  return slot?.role ? roleToCharacterType[slot.role] : null
                })()}
              />
            )}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 2, display: "block" }}
            >
              Use the filters to find characters by faction, type, or name.
              Select a character and click Add to assign them to this slot.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectingSlotId(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Add Slot Dialog */}
      <Dialog
        open={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Composition Slot</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={newSlotRole}
                label="Role"
                onChange={e => setNewSlotRole(e.target.value as PartyRole)}
              >
                <MenuItem value="boss">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleBadge role="boss" size="small" />
                    <span>Boss</span>
                  </Box>
                </MenuItem>
                <MenuItem value="featured_foe">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleBadge role="featured_foe" size="small" />
                    <span>Featured Foe</span>
                  </Box>
                </MenuItem>
                <MenuItem value="mook">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleBadge role="mook" size="small" />
                    <span>Mook</span>
                  </Box>
                </MenuItem>
                <MenuItem value="ally">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <RoleBadge role="ally" size="small" />
                    <span>Ally</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {newSlotRole === "mook" && (
              <FormControl fullWidth>
                <InputLabel>Default Mook Count</InputLabel>
                <Select
                  value={newSlotMookCount}
                  label="Default Mook Count"
                  onChange={e => setNewSlotMookCount(e.target.value as number)}
                >
                  {[3, 6, 9, 12, 15, 18, 21, 24].map(count => (
                    <MenuItem key={count} value={count}>
                      {count} mooks
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddSlotOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddSlot}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : "Add Slot"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
