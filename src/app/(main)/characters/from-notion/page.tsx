"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Box, Typography, CircularProgress, Stack, Paper } from "@mui/material"
import { useClient, useToast } from "@/contexts"
import { MainHeader, Icon, Button } from "@/components/ui"
import { SpeedDial } from "@/components/characters"
import { NotionPageAutocomplete } from "@/components/autocomplete"

export default function ImportFromNotionPage() {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const router = useRouter()
  const [selectedPageId, setSelectedPageId] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)

  // Set page title
  useEffect(() => {
    document.title = "Import from Notion - Chi War"
  }, [])

  const handleImport = async () => {
    if (!selectedPageId || isCreating) return

    setIsCreating(true)
    try {
      const response = await client.createCharacterFromNotion(selectedPageId)
      const newCharacter = response.data

      toastSuccess(`Created character: ${newCharacter.name}`)
      router.push(`/characters/${newCharacter.id}`)
    } catch (error) {
      console.error("Error creating character from Notion:", error)
      toastError("Failed to create character from Notion")
    } finally {
      setIsCreating(false)
    }
  }

  const handlePageChange = (pageId: string | null) => {
    setSelectedPageId(pageId || "")
  }

  return (
    <Box
      sx={{
        mb: 2,
      }}
    >
      <SpeedDial />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <MainHeader
          title="Import from Notion"
          icon={<Icon keyword="Characters" size="36" />}
          subtitle="Search for a character in your Notion database and import it"
        />
      </Box>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Stack spacing={3}>
          <Typography>
            Type a character name to search your Notion database. Select a page
            to import it as a new character in this campaign.
          </Typography>

          <NotionPageAutocomplete
            value={selectedPageId}
            onChange={handlePageChange}
            characterName=""
            allowNone={false}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleImport}
              disabled={!selectedPageId || isCreating}
              startIcon={isCreating ? <CircularProgress size={16} /> : null}
            >
              {isCreating ? "Importing..." : "Import Character"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => router.push("/characters")}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}
