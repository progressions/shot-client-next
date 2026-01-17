"use client"

import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  CircularProgress,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { MainHeader, Icon } from "@/components/ui"
import { SpeedDial, PCTemplatePreviewCard } from "@/components/characters"
import { useClient, useApp, useToast } from "@/contexts"
import type { Character } from "@/types"
import { sluggedPath } from "@/lib/slug"

type CreatePageProps = {
  templates?: Character[]
}

export default function CreatePage({ templates = [] }: CreatePageProps) {
  const router = useRouter()
  const { client } = useClient()
  const { refreshUser } = useApp()
  const { toastSuccess, toastError } = useToast()

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  // Loading state
  const [creatingFrom, setCreatingFrom] = useState<string | null>(null)

  // Filter templates based on search
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      // Search filter
      if (
        searchTerm &&
        !template.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false
      }

      return true
    })
  }, [templates, searchTerm])

  const handleSelectTemplate = async (template: Character) => {
    if (creatingFrom) return // Prevent double-clicking

    setCreatingFrom(template.id)
    try {
      const response = await client.duplicateCharacter(template)
      const newCharacter = response.data

      // Refresh user data to update onboarding progress
      await refreshUser()

      toastSuccess(`Created new character: ${newCharacter.name}`)
      router.push(sluggedPath("characters", newCharacter.name, newCharacter.id))
    } catch (error) {
      console.error("Error creating character from template:", error)
      toastError("Failed to create character from template")
    } finally {
      setCreatingFrom(null)
    }
  }

  return (
    <Box sx={{ position: "relative" }}>
      <SpeedDial />
      <MainHeader
        title="Create Player Character"
        icon={<Icon keyword="Characters" size="36" />}
        subtitle="Choose an archetype to create your character"
      />

      {!templates?.length ? (
        <Box sx={{ mt: 4, p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No character templates available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Character templates need to be created in the database with
            is_template: true
          </Typography>
        </Box>
      ) : (
        <>
          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Results Count */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredTemplates.length} of {templates.length} templates
          </Typography>

          {/* Template Layout - flexible design, not necessarily a grid */}
          {filteredTemplates.length === 0 ? (
            <Box sx={{ mt: 4, p: 3, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                No templates match your filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your search or archetype selection
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
              {filteredTemplates.map(template => (
                <Box
                  key={template.id}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "calc(50% - 12px)",
                      md: "calc(50% - 16px)",
                      lg: "calc(50% - 18px)",
                    },
                    minWidth: { xs: "100%", sm: 300 },
                    maxWidth: { xs: "100%", sm: 500, md: 600 },
                  }}
                >
                  <PCTemplatePreviewCard
                    template={template}
                    onSelect={handleSelectTemplate}
                    isLoading={creatingFrom === template.id}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Loading Overlay */}
          {creatingFrom && (
            <Box
              sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
