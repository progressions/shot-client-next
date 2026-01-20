"use client"

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { useHotkeys } from "@/contexts"
import { useMemo } from "react"

/**
 * Modal displaying all available keyboard shortcuts
 * Opens with ? key and closes with Escape or clicking outside
 */
export function HotkeyHelpModal() {
  const { helpModalOpen, closeHelpModal, getRegisteredHotkeys } = useHotkeys()

  // Group hotkeys by category - re-fetch when modal opens
  const groupedHotkeys = useMemo(() => {
    if (!helpModalOpen) return []

    const hotkeys = getRegisteredHotkeys()
    const groups: Record<
      string,
      Array<{ key: string; description: string }>
    > = {}

    for (const hotkey of hotkeys) {
      const category = hotkey.category || "General"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(hotkey)
    }

    // Sort categories with preferred order
    const categoryOrder = ["General", "Navigation", "Create New"]
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a)
      const bIndex = categoryOrder.indexOf(b)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })

    return sortedCategories.map(category => ({
      category,
      hotkeys: groups[category],
    }))
  }, [helpModalOpen, getRegisteredHotkeys])

  // Format key for display (e.g., "g+c" -> "G C")
  const formatKey = (key: string) => {
    return key
      .split("+")
      .map(k => k.toUpperCase())
      .join(" ")
  }

  return (
    <Dialog
      open={helpModalOpen}
      onClose={closeHelpModal}
      maxWidth="sm"
      fullWidth
      aria-labelledby="hotkey-help-title"
      PaperProps={{
        sx: {
          bgcolor: "#1d1d1d",
          color: "#ffffff",
          borderRadius: 2,
          maxHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        id="hotkey-help-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          Keyboard Shortcuts
        </Typography>
        <IconButton
          onClick={closeHelpModal}
          size="small"
          aria-label="Close"
          sx={{ color: "#888" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {groupedHotkeys.map(({ category, hotkeys }, groupIndex) => (
          <Box key={category} sx={{ mb: 3 }}>
            {groupIndex > 0 && <Divider sx={{ mb: 2, borderColor: "#333" }} />}
            <Typography
              variant="overline"
              sx={{
                color: "#888",
                display: "block",
                mb: 1.5,
                letterSpacing: 1,
              }}
            >
              {category}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {hotkeys.map(({ key, description }) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    py: 0.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#ccc" }}>
                    {description}
                  </Typography>
                  <Box
                    component="kbd"
                    sx={{
                      bgcolor: "#2a2a2a",
                      border: "1px solid #444",
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      color: "#fff",
                      minWidth: "2.5rem",
                      textAlign: "center",
                    }}
                  >
                    {formatKey(key)}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        <Divider sx={{ my: 2, borderColor: "#333" }} />
        <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
          Press <kbd style={{ fontFamily: "monospace" }}>?</kbd> to toggle this
          help • Press <kbd style={{ fontFamily: "monospace" }}>Esc</kbd> to
          close
        </Typography>
      </DialogContent>
    </Dialog>
  )
}
