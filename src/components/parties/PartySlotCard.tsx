"use client"

import { useState } from "react"
import { Box, IconButton, Tooltip, Stack, Typography } from "@mui/material"
import {
  PersonAddOutlined,
  ClearOutlined,
  DeleteOutlined,
  DragIndicator,
} from "@mui/icons-material"
import { NumberField } from "@/components/ui"
import { CharacterBadge, Badge } from "@/components/badges"
import { getRoleConfig } from "./RoleBadge"
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

  const roleConfig = getRoleConfig(slot.role)

  return (
    <Stack
      spacing={0}
      sx={{
        opacity: isLoading ? 0.5 : 1,
        transition: "opacity 0.2s",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      {/* Top row: Role Header Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.5,
          backgroundColor: roleConfig.bgcolor,
          color: roleConfig.color,
        }}
      >
        {isDraggable && (
          <DragIndicator
            aria-hidden="true"
            sx={{
              color: "inherit",
              opacity: 0.7,
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
            }}
          />
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            textTransform: "uppercase",
            fontSize: "0.7rem",
            letterSpacing: "0.05em",
          }}
        >
          {roleConfig.label}
        </Typography>
      </Box>

      {/* Bottom row: Character Badge + Count + Actions */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          px: 1,
          py: 1,
          backgroundColor: "background.paper",
        }}
      >
        {/* Character Badge or Empty State */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isEmpty ? (
            <Badge
              entity={{ id: slot.id, name: "Empty slot" }}
              size="sm"
              disableAvatar
              onClick={onPopulate ? () => onPopulate(slot.id) : undefined}
              sx={{
                backgroundColor: "transparent",
                border: "1px dashed",
                borderColor: "divider",
                cursor: onPopulate ? "pointer" : "default",
                "&:hover": onPopulate
                  ? {
                      borderColor: "primary.main",
                      backgroundColor: "action.hover",
                    }
                  : {},
                "&:focus-visible": onPopulate
                  ? {
                      borderColor: "primary.main",
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: 2,
                    }
                  : {},
              }}
            >
              <Typography variant="caption" color="text.secondary">
                Click to assign character
              </Typography>
            </Badge>
          ) : character ? (
            <CharacterBadge character={character} size="sm" />
          ) : slot.vehicle ? (
            <Badge entity={slot.vehicle} size="sm" title={slot.vehicle.name}>
              Vehicle
            </Badge>
          ) : null}
        </Box>

        {/* Mook Count */}
        {isMook && (
          <Box sx={{ pt: 1 }}>
            <NumberField
              name="mook_count"
              label="Count"
              labelBackgroundColor="#131313"
              value={mookCount}
              size="small"
              width="70px"
              error={false}
              onChange={handleMookCountChange}
              onBlur={handleMookCountBlur}
            />
          </Box>
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
      </Stack>
    </Stack>
  )
}
