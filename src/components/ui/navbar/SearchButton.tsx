"use client"

import { useState } from "react"
import { IconButton } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import { SearchModal } from "@/components/search/SearchModal"

export function SearchButton() {
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="Search"
        sx={{
          color: "#ffffff",
          "&:hover": {
            bgcolor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <SearchIcon />
      </IconButton>
      <SearchModal open={open} onClose={handleClose} />
    </>
  )
}
