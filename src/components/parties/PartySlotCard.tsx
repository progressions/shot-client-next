"use client"

import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Avatar as MuiAvatar,
  TextField,
  Tooltip,
} from "@mui/material"
import {
  PersonAddOutlined,
  ClearOutlined,
  DeleteOutlined,
  DragIndicator,
} from "@mui/icons-material"
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

  const handleMookCountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(event.target.value, 10)
    if (!isNaN(value) && value >= 1 && value <= 100 && onMookCountChange) {
      onMookCountChange(slot.id, value)
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
          alignItems: "center",
          gap: 2,
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
        <Box sx={{ minWidth: 90 }}>
          <RoleBadge role={slot.role} />
        </Box>

        {/* Character/Empty State */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          {isEmpty ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 1,
              }}
            >
              <MuiAvatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "action.hover",
                  border: "2px dashed",
                  borderColor: "divider",
                }}
              >
                <PersonAddOutlined
                  sx={{ fontSize: 20, color: "text.disabled" }}
                />
              </MuiAvatar>
              <Typography variant="body2" color="text.secondary">
                Empty slot
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
              }}
            >
              <MuiAvatar
                src={character?.image_url || undefined}
                alt={character?.name || "Character"}
                sx={{ width: 40, height: 40 }}
              >
                {character?.name?.charAt(0)?.toUpperCase() || "?"}
              </MuiAvatar>
              <Box sx={{ minWidth: 0 }}>
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
                  <Typography variant="caption" color="text.secondary">
                    Mook group
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Mook Count */}
        {isMook && (
          <Box sx={{ width: 80 }}>
            <TextField
              type="number"
              label="Count"
              size="small"
              value={slot.default_mook_count || 1}
              onChange={handleMookCountChange}
              slotProps={{
                htmlInput: {
                  min: 1,
                  max: 100,
                },
              }}
              sx={{
                "& .MuiInputBase-root": {
                  height: 32,
                },
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  py: 0.5,
                },
              }}
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
      </CardContent>
    </Card>
  )
}
