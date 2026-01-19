"use client"

import { useCallback, useState } from "react"
import { IconButton, Typography } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { SearchModal } from "@/components/search/SearchModal"
import { useHotkey } from "@/contexts"

export function SearchButton() {
  const [open, setOpen] = useState(false)

  const handleOpen = useCallback(() => setOpen(true), [])
  const handleClose = useCallback(() => setOpen(false), [])

  // Register K hotkey to open search
  useHotkey("k", handleOpen, { description: "Open search" })

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="Search (K)"
        sx={{
          color: "#ffffff",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <SearchIcon />
        <Typography
          component="span"
          sx={{
            ml: 0.5,
            fontSize: "0.7rem",
            opacity: 0.7,
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: "3px",
            px: 0.5,
            py: 0.1,
          }}
        >
          K
        </Typography>
      </IconButton>
      <SearchModal open={open} onClose={handleClose} />
    </>
  )
}
