"use client"

import { Button, DialogBox } from "@/components/ui"
import { EntityNotionPageAutocomplete } from "@/components/autocomplete"
import type { EntityType } from "@/components/autocomplete/EntityNotionPageAutocomplete"
import { Stack, Typography, Divider, CircularProgress } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import type { Site, Party, Faction, Juncture, Adventure } from "@/types"
import { useState, useEffect } from "react"
import { useClient, useToast } from "@/contexts"

type NotionLinkableEntity = Site | Party | Faction | Juncture | Adventure

type EntityNotionLinkDialogProps<T extends NotionLinkableEntity> = {
  entity: T
  entityType: EntityType
  open: boolean
  onClose: () => void
  onSave: (notionPageId: string | null, updatedEntity?: T) => void
}

export default function EntityNotionLinkDialog<T extends NotionLinkableEntity>({
  entity,
  entityType,
  open,
  onClose,
  onSave,
}: EntityNotionLinkDialogProps<T>) {
  const [pageId, setPageId] = useState<string | null>(
    entity?.notion_page_id ?? null
  )
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1)

  // Sync local state when entity prop changes
  useEffect(() => {
    setPageId(entity?.notion_page_id ?? null)
  }, [entity?.notion_page_id])

  const handleSave = async () => {
    // If the pageId hasn't changed, just close the dialog
    if (pageId === entity?.notion_page_id) {
      onClose()
      return
    }

    setIsSaving(true)
    try {
      let response
      // Build FormData with entity-type-prefixed JSON data
      // Backend expects: { "faction": "{\"notion_page_id\": \"...\"}" }
      const formData = new FormData()
      formData.append(entityType, JSON.stringify({ notion_page_id: pageId }))

      switch (entityType) {
        case "site":
          response = await client.updateSite(entity.id, formData)
          break
        case "party":
          response = await client.updateParty(entity.id, formData)
          break
        case "faction":
          response = await client.updateFaction(entity.id, formData)
          break
        case "juncture":
          response = await client.updateJuncture(entity.id, formData)
          break
        case "adventure":
          response = await client.updateAdventure(entity.id, formData)
          break
      }

      const updatedEntity = response?.data as T
      toastSuccess(
        pageId
          ? `${entityLabel} linked to Notion`
          : `${entityLabel} unlinked from Notion`
      )
      onSave(pageId, updatedEntity)
      onClose()
    } catch (error) {
      console.error(`Error updating ${entityType} Notion link:`, error)
      toastError(`Failed to update ${entityLabel.toLowerCase()} Notion link`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (newPageId: string | null) => {
    setPageId(newPageId)
  }

  const handleCreateNewPage = async () => {
    setIsCreating(true)
    try {
      let response
      switch (entityType) {
        case "site":
          response = await client.syncSiteToNotion(entity as Site)
          break
        case "party":
          response = await client.syncPartyToNotion(entity as Party)
          break
        case "faction":
          response = await client.syncFactionToNotion(entity as Faction)
          break
        case "juncture":
          response = await client.syncJunctureToNotion(entity as Juncture)
          break
        case "adventure":
          response = await client.syncAdventureToNotion(entity as Adventure)
          break
      }

      const updatedEntity = response?.data as T
      toastSuccess(`Notion page created for ${entityLabel.toLowerCase()}`)
      onSave(updatedEntity?.notion_page_id || null, updatedEntity)
      onClose()
    } catch (error) {
      console.error(`Error creating Notion page for ${entityType}:`, error)
      toastError(
        `Failed to create Notion page for ${entityLabel.toLowerCase()}`
      )
    } finally {
      setIsCreating(false)
    }
  }

  const hasExistingLink = !!entity?.notion_page_id

  return (
    <DialogBox
      open={open}
      onClose={onClose}
      title={`Link ${entityLabel} to Notion`}
      actions={
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <Typography>
          Select a Notion page to link to this {entityLabel.toLowerCase()}. This
          allows you to sync data with Notion.
        </Typography>
        <EntityNotionPageAutocomplete
          value={pageId}
          onChange={handleChange}
          entityType={entityType}
          entityName={entity?.name || ""}
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
              {isCreating
                ? "Creating..."
                : `Create New ${entityLabel} Page in Notion`}
            </Button>
            <Typography variant="body2" color="text.secondary">
              This will create a new page in the Notion {entityLabel}s database
              with this {entityLabel.toLowerCase()}&apos;s information.
            </Typography>
          </>
        )}
      </Stack>
    </DialogBox>
  )
}
