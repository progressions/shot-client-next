"use client"

import {
  Card,
  CardActionArea,
  CardContent,
  Box,
  Typography,
  Grid,
  Chip,
  Avatar
} from "@mui/material"
import { RichTextRenderer } from "@/components/editor"
import { CS } from "@/services"
import type { Character } from "@/types"

interface PCTemplatePreviewCardProps {
  template: Character
  onSelect: (template: Character) => void
  isLoading?: boolean
}

export default function PCTemplatePreviewCard({ 
  template, 
  onSelect,
  isLoading = false 
}: PCTemplatePreviewCardProps) {
  const actionValues = template.action_values || {}
  
  // Get main attack info using CS service helpers
  const mainAttackName = CS.mainAttack(template)
  const mainAttackValue = CS.mainAttackValue(template)
  const fortuneValue = CS.fortune(template)
  const fortuneType = CS.fortuneType(template)
  const archetype = CS.archetype(template)
  const background = CS.background(template)

  return (
    <Card 
      sx={{ 
        height: "100%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? "none" : "auto",
        transition: "opacity 0.2s",
        overflow: "hidden", // Ensure nothing spills out
      }}
    >
      <CardActionArea 
        onClick={() => onSelect(template)} 
        sx={{ 
          height: "100%", 
          p: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start"
        }}
        disabled={isLoading}
      >
        {/* Character Image */}
        <Box
          sx={{
            position: "relative",
            paddingTop: "56.25%", // 16:9 aspect ratio
            bgcolor: "grey.100",
            overflow: "hidden",
            margin: 0,
            flexShrink: 0, // Prevent shrinking
            width: "100%"
          }}
        >
          {template.image_url ? (
            <Box
              component="img"
              src={template.image_url}
              alt={template.name}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center" // Center the image focus
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80,
                  fontSize: "2rem",
                  bgcolor: "primary.main"
                }}
              >
                {template.name?.split(" ").map(word => word[0]).join("").substring(0, 2)}
              </Avatar>
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ p: 2 }}>
          {/* Name and Archetype Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              {template.name}
            </Typography>
            {archetype && (
              <Typography variant="subtitle2" color="text.secondary">
                {archetype}
              </Typography>
            )}
          </Box>

          {/* Action Values Section - Compact Display */}
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
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    {mainAttackName}
                  </Typography>
                  <Typography variant="h6">
                    {mainAttackValue}
                  </Typography>
                </Box>
              </Grid>
              
              {/* Defense */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Defense
                  </Typography>
                  <Typography variant="h6">
                    {actionValues["Defense"] || 0}
                  </Typography>
                </Box>
              </Grid>
              
              {/* Toughness */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Toughness
                  </Typography>
                  <Typography variant="h6">
                    {actionValues["Toughness"] || 0}
                  </Typography>
                </Box>
              </Grid>

              {/* Speed */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Speed
                  </Typography>
                  <Typography variant="h6">
                    {actionValues["Speed"] || 0}
                  </Typography>
                </Box>
              </Grid>

              {/* Fortune */}
              <Grid item xs={2}>
                <Box sx={{ 
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  bgcolor: "background.default",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    {fortuneType}
                  </Typography>
                  <Typography variant="h6">
                    {fortuneValue}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Skills Section */}
          {template.skills && Object.keys(template.skills).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Skills
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {Object.entries(template.skills)
                  .filter(([_, value]) => value > 0)
                  .map(([skill, value]) => (
                    <Chip 
                      key={skill}
                      label={`${skill}: ${value}`}
                      size="small"
                      variant="filled"
                      sx={{ 
                        fontSize: "0.75rem",
                        bgcolor: "action.selected",
                      }}
                    />
                  ))}
              </Box>
            </Box>
          )}

          {/* Schticks Section - Critical for PC decision making */}
          {template.schticks && template.schticks.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Schticks (Powers & Abilities)
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {template.schticks.map(schtick => (
                  <Chip 
                    key={schtick.id}
                    label={schtick.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: "0.75rem" }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Weapons Section */}
          {template.weapons && template.weapons.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
                Weapons
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {template.weapons.slice(0, 3).map(weapon => (
                  <Typography key={weapon.id} variant="caption" sx={{ 
                    bgcolor: "background.default",
                    p: 0.5,
                    borderRadius: 1,
                  }}>
                    {weapon.name} ({weapon.damage || 0}/{weapon.concealment || 0}/{weapon.reload || 0})
                  </Typography>
                ))}
                {template.weapons.length > 3 && (
                  <Typography variant="caption" color="text.secondary">
                    +{template.weapons.length - 3} more weapons
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Description - Brief excerpt */}
          {background && (
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: "1px solid", 
              borderColor: "divider",
              "& .tiptap": {
                fontSize: "0.875rem",
                lineHeight: 1.4,
                color: "text.secondary",
                "& p": { margin: 0 },
                /* Truncate long descriptions */
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
            }}>
              <RichTextRenderer html={background} />
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}