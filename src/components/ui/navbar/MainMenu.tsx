"use client"

import { useState } from "react"
import { IconButton, Menu } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { useClient } from "@/contexts"
import { GMMenu } from "./GMMenu"
import { PlayerMenu } from "./PlayerMenu"

export function MainMenu() {
  const { user } = useClient()
  const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorElement)
  const isGM = user.gamemaster || user.admin

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorElement(null)
  }

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="menu"
        onClick={handleMenuOpen}
        sx={{ mr: { xs: 1, sm: 2 } }}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorElement}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "#1d1d1d",
            color: "#ffffff",
            border: "1px solid #2a2a2a",
            mt: 1,
            "& .MuiMenuItem-root": {
              "&:hover": { bgcolor: "#333333" },
            },
          },
        }}
      >
        {isGM ? (
          <GMMenu onClose={handleMenuClose} isAdmin={user.admin} />
        ) : (
          <PlayerMenu onClose={handleMenuClose} />
        )}
      </Menu>
    </>
  )
}
