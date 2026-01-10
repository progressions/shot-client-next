"use client"

import { Button, DialogBox } from "@/components/ui"
import { NotionPageAutocomplete } from "@/components/autocomplete"
import { Stack, Typography, Divider, CircularProgress } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import type { Character } from "@/types"
import { useState, useEffect } from "react"
import { useClient, useToast } from "@/contexts"

type NotionLinkDialogProps = {
  character: Character
  open: boolean
  onClose: () => void
  onSave: (notionPageId: string | null, updatedCharacter?: Character) => void
}

export default function NotionLinkDialog({
  character,
  open,
  onClose,
  onSave,
}: NotionLinkDialogProps) {
  const [pageId, setPageId] = useState<string | null>(
    character?.notion_page_id ?? null
  )
  const [isCreating, setIsCreating] = useState(false)
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  // Sync local state when character prop changes
  useEffect(() => {
    setPageId(character?.notion_page_id ?? null)
  }, [character?.notion_page_id])

  const handleSave = () => {
    onSave(pageId)
    onClose()
  }

  const handleChange = (newPageId: string | null) => {
    setPageId(newPageId)
  }

  const handleCreateNewPage = async () => {
    setIsCreating(true)
    try {
      const response = await client.createNotionPage(character)
      const updatedCharacter = response.data
      toastSuccess("Notion page created successfully")
      onSave(updatedCharacter.notion_page_id || null, updatedCharacter)
      onClose()
    } catch (error) {
      console.error("Error creating Notion page:", error)
      toastError("Failed to create Notion page")
    } finally {
      setIsCreating(false)
    }
  }

  const hasExistingLink = !!character?.notion_page_id

  return (
    <DialogBox
      open={open}
      onClose={onClose}
      title="Link Notion Page"
      actions={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Typography>
          Select a Notion page to link to this character. This allows you to
          sync character data with Notion.
        </Typography>
        <NotionPageAutocomplete
          value={pageId}
          onChange={handleChange}
          characterName={character?.name || ""}
          allowNone={true}
        />

        {!hasExistingLink && (
          <>
            <Divider>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={
                isCreating ? <CircularProgress size={16} /> : <AddIcon />
              }
              onClick={handleCreateNewPage}
              disabled={isCreating}
              fullWidth
            >
              {isCreating ? "Creating..." : "Create New Page in Notion"}
            </Button>
            <Typography variant="body2" color="text.secondary">
              This will create a new page in the Notion database with this
              character&apos;s information.
            </Typography>
          </>
        )}
      </Stack>
    </DialogBox>
  )
}
