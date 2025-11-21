"use client"

import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import { Stack, Box, IconButton, Typography, Button } from "@mui/material"
import { useState, useEffect } from "react"
import {
  SaveButton,
  TextField,
  SectionHeader,
  ManageButton,
  Icon,
} from "@/components/ui"
import type { Character, Advancement } from "@/types"
import { useClient, useToast } from "@/contexts"
import { formatDistanceToNow } from "date-fns"

type AdvancementsManagerProps = {
  character: Character
}

export default function AdvancementsManager({
  character,
}: AdvancementsManagerProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const [open, setOpen] = useState(false)
  const [advancements, setAdvancements] = useState<Advancement[]>([])
  const [showAll, setShowAll] = useState(false)
  const [newDescription, setNewDescription] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingDescription, setEditingDescription] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch advancements when component mounts or character changes
  useEffect(() => {
    const fetchAdvancements = async () => {
      try {
        const response = await client.getAdvancements(character.id)
        setAdvancements(response.data)
      } catch (error) {
        console.error("Error fetching advancements:", error)
      }
    }

    fetchAdvancements()
  }, [character.id, client])

  // Determine which advancements to display
  const displayedAdvancements = showAll
    ? advancements
    : advancements.slice(0, 10)
  const hasMore = advancements.length > 10

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!newDescription.trim()) return

    setLoading(true)
    try {
      const response = await client.createAdvancement(character.id, {
        description: newDescription.trim(),
      })
      setAdvancements([response.data, ...advancements])
      setNewDescription("")
      toastSuccess("Advancement added successfully")
    } catch (error) {
      console.error("Error creating advancement:", error)
      toastError("Failed to add advancement")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (advancement: Advancement) => {
    setEditingId(advancement.id)
    setEditingDescription(advancement.description || "")
  }

  const handleUpdate = async (advancementId: string) => {
    if (!editingDescription.trim()) {
      setEditingId(null)
      return
    }

    setLoading(true)
    try {
      const response = await client.updateAdvancement(
        character.id,
        advancementId,
        { description: editingDescription.trim() }
      )
      setAdvancements(
        advancements.map(a => (a.id === advancementId ? response.data : a))
      )
      setEditingId(null)
      toastSuccess("Advancement updated successfully")
    } catch (error) {
      console.error("Error updating advancement:", error)
      toastError("Failed to update advancement")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingDescription("")
  }

  const handleDelete = async (advancementId: string) => {
    setLoading(true)
    try {
      await client.deleteAdvancement(character.id, advancementId)
      setAdvancements(advancements.filter(a => a.id !== advancementId))
      toastSuccess("Advancement deleted successfully")
    } catch (error) {
      console.error("Error deleting advancement:", error)
      toastError("Failed to delete advancement")
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return ""
    }
  }

  const actionButton = (
    <ManageButton open={open} onClick={() => setOpen(!open)} />
  )

  return (
    <>
      <SectionHeader
        title="Advancements"
        icon={<Icon keyword="Advancements" size="24" />}
        actions={actionButton}
      >
        Track your character&apos;s progression and experience gains throughout
        the campaign.
      </SectionHeader>

      {open && (
        <Box sx={{ mb: 2 }}>
          <Stack
            direction="row"
            spacing={2}
            component="form"
            onSubmit={handleAdd}
          >
            <TextField
              label="Add Advancement"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              sx={{ flex: 1 }}
              inputProps={{ maxLength: 255 }}
              placeholder="Describe character progression..."
              disabled={loading}
            />
            <SaveButton disabled={!newDescription.trim() || loading} />
          </Stack>
        </Box>
      )}

      {advancements.length === 0 ? (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No advancements yet. Track your character&apos;s growth and
            progression here.
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={1} sx={{ mb: hasMore && !showAll ? 2 : 0 }}>
            {displayedAdvancements.map(advancement => (
              <Box
                key={advancement.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1,
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {editingId === advancement.id ? (
                  <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                    <TextField
                      value={editingDescription}
                      onChange={e => setEditingDescription(e.target.value)}
                      sx={{ flex: 1 }}
                      inputProps={{ maxLength: 255 }}
                      autoFocus
                      disabled={loading}
                    />
                    <SaveButton
                      disabled={!editingDescription.trim() || loading}
                      onClick={() => handleUpdate(advancement.id)}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">
                        {advancement.description || "(No description)"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.5 }}
                      >
                        {formatTimestamp(advancement.created_at)}
                      </Typography>
                    </Box>
                    {open && (
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          aria-label="edit advancement"
                          onClick={() => handleEdit(advancement)}
                          size="small"
                          disabled={loading}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          aria-label="delete advancement"
                          onClick={() => handleDelete(advancement.id)}
                          size="small"
                          disabled={loading}
                        >
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Stack>

          {hasMore && !showAll && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Button variant="text" onClick={() => setShowAll(true)}>
                Show All ({advancements.length} total)
              </Button>
            </Box>
          )}

          {showAll && hasMore && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Button variant="text" onClick={() => setShowAll(false)}>
                Show Recent 10
              </Button>
            </Box>
          )}
        </>
      )}
    </>
  )
}
