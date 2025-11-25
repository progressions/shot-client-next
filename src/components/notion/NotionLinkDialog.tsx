"use client"

import { Button, DialogBox } from "@/components/ui"
import { NotionPageAutocomplete } from "@/components/autocomplete"
import { Stack, Typography } from "@mui/material"
import type { Character } from "@/types"
import { useState, useEffect } from "react"

type NotionLinkDialogProps = {
  character: Character
  open: boolean
  onClose: () => void
  onSave: (notionPageId: string | null) => void
}

export default function NotionLinkDialog({
  character,
  open,
  onClose,
  onSave,
}: NotionLinkDialogProps) {
  const [pageId, setPageId] = useState<string>(character?.notion_page_id || "")

  // Sync local state when character prop changes
  useEffect(() => {
    setPageId(character?.notion_page_id || "")
  }, [character?.notion_page_id])

  const handleSave = () => {
    onSave(pageId || null)
    onClose()
  }

  const handleChange = (newPageId: string | null) => {
    setPageId(newPageId || "")
  }

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
      </Stack>
    </DialogBox>
  )
}
