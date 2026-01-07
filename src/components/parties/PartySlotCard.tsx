"use client"

import { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar as MuiAvatar,
  Tooltip,
} from "@mui/material"
import {
  PersonAddOutlined,
  ClearOutlined,
  DeleteOutlined,
  DragIndicator,
} from "@mui/icons-material"
import { NumberField } from "@/components/ui"
import RoleBadge from "./RoleBadge"
import type { PartySlot } from "@/types"

interface PartySlotCardProps {
  slot: PartySlot
  onPopulate?: (slotId: string) => void
  onClear?: (slotId: string) => void
  onRemove?: (slotId: string) => void
  onMookCountChange?: (slotId: string, count: number) => void
  isDraggable?: boolean
  isLoading?: boolean
}

export default function PartySlotCard({
  slot,
  onPopulate,
  onClear,
  onRemove,
  onMookCountChange,
  isDraggable = false,
  isLoading = false,
}: PartySlotCardProps) {
  const character = slot.character
  const isMook = slot.role === "mook"
  const isEmpty = !character && !slot.vehicle

  // Local state for mook count to work with NumberField
  const [mookCount, setMookCount] = useState<number | string>(
    slot.default_mook_count || 1
  )

  const handleMookCountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMookCount(event.target.value)
  }

  const handleMookCountBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10)
    if (!isNaN(value) && value >= 1 && value <= 100 && onMookCountChange) {
      onMookCountChange(slot.id, value)
    } else {
      // Reset to current slot value if invalid
      setMookCount(slot.default_mook_count || 1)
    }
  }

  return (
    <Card
      sx={{
        opacity: isLoading ? 0.5 : 1,
        transition: "all 0.2s",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
        },
      }}
      elevation={0}
    >
      <CardContent
        sx={{
          py: 1.5,
          px: 2,
          "&:last-child": { pb: 1.5 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Top row on mobile: Role Badge + Character Name */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: { sm: 1 },
            minWidth: 0,
          }}
        >
          {/* Drag Handle */}
          {isDraggable && (
            <DragIndicator
              aria-hidden="true"
              sx={{
                color: "text.disabled",
                cursor: "grab",
                "&:active": { cursor: "grabbing" },
              }}
            />
          )}

          {/* Role Badge */}
          <Box sx={{ minWidth: { xs: 70, sm: 90 } }}>
            <RoleBadge role={slot.role} />
          </Box>

          {/* Character/Empty State - Name visible on both mobile and desktop */}
          {isEmpty ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: 1,
                minWidth: 0,
              }}
            >
              <MuiAvatar
                sx={{
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  bgcolor: "action.hover",
                  border: "2px dashed",
                  borderColor: "divider",
                  display: { xs: "none", sm: "flex" },
                }}
              >
                <PersonAddOutlined
                  sx={{ fontSize: 20, color: "text.disabled" }}
                />
              </MuiAvatar>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Empty slot
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flex: 1,
                minWidth: 0,
              }}
            >
              <MuiAvatar
                src={character?.image_url || undefined}
                alt={character?.name || "Character"}
                sx={{
                  width: { xs: 32, sm: 40 },
                  height: { xs: 32, sm: 40 },
                  display: { xs: "none", sm: "flex" },
                }}
              >
                {character?.name?.charAt(0)?.toUpperCase() || "?"}
              </MuiAvatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {character?.name || slot.vehicle?.name || "Unknown"}
                </Typography>
                {isMook && character && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: { xs: "none", sm: "block" } }}
                  >
                    Mook group
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Bottom row on mobile: Controls (Mook Count + Actions) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            justifyContent: { xs: "flex-end", sm: "flex-start" },
            pl: { xs: 0, sm: 0 },
          }}
        >
          {/* Mook Count */}
          {isMook && (
            <NumberField
              name="mook_count"
              value={mookCount}
              size="small"
              width="70px"
              error={false}
              onChange={handleMookCountChange}
              onBlur={handleMookCountBlur}
              label="Count"
            />
          )}

          {/* Actions */}
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {isEmpty && onPopulate && (
              <Tooltip title="Add character">
                <IconButton
                  size="small"
                  onClick={() => onPopulate(slot.id)}
                  color="primary"
                  aria-label="Add character to slot"
                >
                  <PersonAddOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {!isEmpty && onClear && (
              <Tooltip title="Remove character">
                <IconButton
                  size="small"
                  onClick={() => onClear(slot.id)}
                  color="default"
                  aria-label="Remove character from slot"
                >
                  <ClearOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onRemove && (
              <Tooltip title="Delete slot">
                <IconButton
                  size="small"
                  onClick={() => onRemove(slot.id)}
                  color="error"
                  aria-label="Delete slot"
                >
                  <DeleteOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}
