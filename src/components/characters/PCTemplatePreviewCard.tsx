"use client"

import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
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
        display: "flex",
        flexDirection: "column",
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? "none" : "auto",
        transition: "all 0.2s",
        overflow: "hidden",
        "&:hover": {
          boxShadow: 4
        }
      }}
      elevation={2}
    >
      <CardActionArea 
        onClick={() => onSelect(template)} 
        sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}
        disabled={isLoading}
      >
        {/* Character Image using CardMedia - always render to maintain consistent card layout */}
        <CardMedia
          component={template.image_url ? "img" : "div"}
          image={template.image_url}
          alt={template.image_url ? template.name : undefined}
          sx={{
            height: 240,
            bgcolor: template.image_url ? undefined : "background.default",
            display: template.image_url ? undefined : "flex",
            alignItems: template.image_url ? undefined : "center",
            justifyContent: template.image_url ? undefined : "center",
            objectFit: template.image_url ? "cover" : undefined,
          }}
        >
          {/* Avatar fallback when no image */}
          {!template.image_url && (
            <Avatar
              sx={{ 
                width: 100, 
                height: 100,
                fontSize: "2.5rem",
                bgcolor: "primary.main",
                color: "primary.contrastText"
              }}
            >
              {template.name?.charAt(0)?.toUpperCase() || "?"}
            </Avatar>
          )}
        </CardMedia>
        
        {/* Card Header with Name */}
        <Box sx={{ 
          bgcolor: "background.paper",
          color: "text.primary",
          px: 3,
          py: 2,
        }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {template.name}
          </Typography>
          {archetype && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {archetype}
            </Typography>
          )}
        </Box>
        
        <CardContent sx={{ p: 3, flex: 1, overflow: "auto" }}>

          {/* Action Values Section - Compact Display */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ display: "block", mb: 1, color: "text.secondary" }}>
              Action Values
            </Typography>
            
            <Grid container spacing={1}>
              {/* Main Attack */}
              <Grid size={4}>
                <Box sx={{
                  bgcolor: "grey.900",
                  color: "common.white",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
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
              <Grid size={4}>
                <Box sx={{
                  bgcolor: "grey.900",
                  color: "common.white",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
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
              <Grid size={4}>
                <Box sx={{
                  bgcolor: "grey.900",
                  color: "common.white",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
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
              <Grid size={4}>
                <Box sx={{
                  bgcolor: "grey.900",
                  color: "common.white",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
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
              <Grid size={4}>
                <Box sx={{
                  bgcolor: "grey.900",
                  color: "common.white",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
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

              {/* Chi */}
              <Grid size={4}>
                <Box sx={{
                  bgcolor: "grey.900",
                  color: "common.white",
                  borderRadius: 1,
                  p: 1,
                  textAlign: "center",
                  minHeight: "60px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}>
                  <Typography variant="caption" sx={{ display: "block", mb: 0.5 }}>
                    Chi
                  </Typography>
                  <Typography variant="h6">
                    {actionValues["Chi"] || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Skills Section */}
          {template.skills && Object.keys(template.skills).length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="overline" sx={{ display: "block", mb: 1, color: "text.secondary" }}>
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
                      variant="outlined"
                      sx={{ 
                        fontSize: "0.75rem",
                        bgcolor: (theme) => theme.palette.action.hover,
                        borderColor: "divider",
                        color: "text.primary"
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

          {/* Description - Full content */}
          {background && (
            <Box sx={{ 
              mt: 2, 
              pt: 2, 
              borderTop: "1px solid", 
              borderColor: "divider",
              "& .tiptap": {
                fontSize: "0.875rem",
                lineHeight: 1.5,
                color: "text.secondary",
                "& p": { 
                  margin: 0,
                  marginBottom: "0.5rem",
                  "&:last-child": {
                    marginBottom: 0
                  }
                }
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