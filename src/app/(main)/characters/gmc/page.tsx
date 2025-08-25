// app/characters/gmc-templates/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material"
import { useClient, useCampaign, useToast } from "@/contexts"
import { MainHeader, Icon } from "@/components/ui"
import { SpeedDial } from "@/components/characters"
import type { Character } from "@/types"

// GMC Types in Feng Shui 2
const GMC_TYPES = [
  { value: "Ally", label: "Ally", description: "Helpful NPCs" },
  { value: "Mook", label: "Mook", description: "Standard enemies" },
  { value: "Featured Foe", label: "Featured Foe", description: "Notable enemies" },
  { value: "Boss", label: "Boss", description: "Major villains" },
  { value: "Uber-Boss", label: "Uber-Boss", description: "Epic threats" },
]

interface TemplatePreviewCardProps {
  template: Character
  onSelect: (template: Character) => void
}

function TemplatePreviewCard({ template, onSelect }: TemplatePreviewCardProps) {
  const actionValues = template.action_values || {}

  // Extract key combat and defensive values
  const primaryStats = [
    { label: "Martial Arts", value: actionValues["Martial Arts"] },
    { label: "Guns", value: actionValues["Guns"] },
    { label: "Sorcery", value: actionValues["Sorcery"] },
    { label: "Creature Powers", value: actionValues["Creature Powers"] },
    { label: "Defense", value: actionValues["Defense"] },
    { label: "Toughness", value: actionValues["Toughness"] },
    { label: "Speed", value: actionValues["Speed"] },
    { label: "Fortune", value: actionValues["Fortune"] },
  ].filter(stat => stat.value && stat.value > 0)

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea onClick={() => onSelect(template)} sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {template.name}
          </Typography>
          <Chip
            label={actionValues["Type"] || "GMC"}
            color="primary"
            size="small"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mt: 1 }}>
            {primaryStats.map(stat => (
              <Box
                key={stat.label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {stat.label}:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {template.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, fontStyle: "italic" }}
              noWrap
            >
              {template.description}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default function GMCTemplatesPage() {
  const { client } = useClient()
  const { campaign } = useCampaign()
  const { toastSuccess, toastError } = useToast()
  const router = useRouter()
  const [selectedType, setSelectedType] = useState(0)
  const [templatesByType, setTemplatesByType] = useState<Record<string, Character[]>>({})
  const [loading, setLoading] = useState(true)
  const [creatingFrom, setCreatingFrom] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplates = async () => {
      if (!campaign) return

      setLoading(true)
      try {
        const templates: Record<string, Character[]> = {}

        // Fetch templates for each GMC type
        for (const gmcType of GMC_TYPES) {
          const response = await client.getCharacters({
            is_template: true,
            character_type: gmcType.value,
            per_page: 50,
          })
          templates[gmcType.value] = response.data.characters || []
        }

        setTemplatesByType(templates)
      } catch (error) {
        console.error("Error fetching templates:", error)
        toastError("Failed to load GMC templates")
      } finally {
        setLoading(false)
      }
    }

    loadTemplates()
  }, [campaign, client, toastError])


  const handleSelectTemplate = async (template: Character) => {
    if (creatingFrom) return // Prevent double-clicking

    setCreatingFrom(template.id)
    try {
      // Get full template data
      const fullTemplate = await client.getCharacter(template.id)

      // Create new character from template
      const newCharacterData = {
        ...fullTemplate.data,
        id: undefined, // Remove ID so a new one is generated
        is_template: false,
        name: `${template.name} (Copy)`, // Add (Copy) suffix to differentiate
      }

      const response = await client.createCharacter({
        character: newCharacterData,
      })

      toastSuccess(`Created new GMC from template: ${template.name}`)
      router.push(`/characters/${response.data.id}`)
    } catch (error) {
      console.error("Error creating character from template:", error)
      toastError("Failed to create GMC from template")
    } finally {
      setCreatingFrom(null)
    }
  }

  const currentType = GMC_TYPES[selectedType]
  const currentTemplates = templatesByType[currentType?.value] || []

  return (
    <Box
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        position: "relative",
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
          title="Create GMC from Template"
          icon={<Icon keyword="Characters" size="36" />}
          subtitle="Select a Game Master Character template to quickly create NPCs"
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs
              value={selectedType}
              onChange={(_, newValue) => setSelectedType(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {GMC_TYPES.map((type) => (
                <Tab
                  key={type.value}
                  label={
                    <Box>
                      <Typography variant="body1">{type.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {type.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          {currentTemplates.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No {currentType?.label} templates available in this campaign. Templates
              will be available after they are created in the Master Campaign.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {currentTemplates.map(template => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <TemplatePreviewCard
                    template={template}
                    onSelect={handleSelectTemplate}
                  />
                </Grid>
              ))}
            </Grid>
          )}

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