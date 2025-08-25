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
import { RichTextRenderer } from "@/components/editor"
import { CS } from "@/services"
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
  const isMook = actionValues["Type"] === "Mook"
  
  // Determine which attack value to show
  const mainAttack = actionValues["Martial Arts"] || actionValues["Guns"] || 
                     actionValues["Sorcery"] || actionValues["Creature Powers"] || 0
  const mainAttackLabel = actionValues["Martial Arts"] > 0 ? "Martial Arts" :
                          actionValues["Guns"] > 0 ? "Guns" :
                          actionValues["Sorcery"] > 0 ? "Sorcery" :
                          actionValues["Creature Powers"] > 0 ? "Creature Powers" : "Attack"

  const secondaryAttack = actionValues["Guns"] > 0 && actionValues["Martial Arts"] > 0 ? actionValues["Guns"] :
                          actionValues["Sorcery"] > 0 && actionValues["Martial Arts"] > 0 ? actionValues["Sorcery"] : 0
  const secondaryAttackLabel = secondaryAttack > 0 && actionValues["Guns"] === secondaryAttack ? "Guns" :
                               secondaryAttack > 0 && actionValues["Sorcery"] === secondaryAttack ? "Sorcery" : ""

  return (
    <Card 
      sx={{ 
        height: "100%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardActionArea onClick={() => onSelect(template)} sx={{ height: "100%", p: 0 }}>
        <CardContent sx={{ p: 2 }}>
          {/* Name Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {template.name}
            </Typography>
          </Box>

          {/* Action Values Section */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
              Action Values
            </Typography>
            
            <Grid container spacing={1}>
              {/* Main Attack */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "80px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    {mainAttackLabel}
                  </Typography>
                  <Typography variant="h5">
                    {mainAttack}
                  </Typography>
                </Box>
              </Grid>

              {/* Secondary Attack - not for Mooks */}
              {!isMook && (
                <Grid item xs={2}>
                  <Box sx={{ 
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    bgcolor: "background.default",
                    minHeight: "80px"
                  }}>
                    <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                      {secondaryAttackLabel || "—"}
                    </Typography>
                    <Typography variant="h5">
                      {secondaryAttack || "—"}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Defense */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "80px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Defense
                  </Typography>
                  <Typography variant="h5">
                    {actionValues["Defense"] || 0}
                  </Typography>
                </Box>
              </Grid>

              {/* Toughness - not for Mooks */}
              {!isMook && (
                <Grid item xs={2}>
                  <Box sx={{ 
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                    textAlign: "center",
                    bgcolor: "background.default",
                    minHeight: "80px"
                  }}>
                    <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                      Toughness
                    </Typography>
                    <Typography variant="h5">
                      {actionValues["Toughness"] || 0}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Speed */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "80px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Speed
                  </Typography>
                  <Typography variant="h5">
                    {actionValues["Speed"] || 0}
                  </Typography>
                </Box>
              </Grid>

              {/* Damage for NPCs */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "80px"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Damage
                  </Typography>
                  <Typography variant="h5">
                    {actionValues["Damage"] || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Description - if available */}
          {CS.appearance(template) && (
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: "1px solid", 
              borderColor: "divider",
              "& .tiptap": {
                fontSize: "1rem",
                lineHeight: 1.5,
                color: "text.secondary",
                "& p": {
                  margin: 0,
                }
              }
            }}>
              <RichTextRenderer html={CS.appearance(template) || ""} />
            </Box>
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

  // Set page title
  useEffect(() => {
    document.title = "Create GMC - Chi War"
  }, [])

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