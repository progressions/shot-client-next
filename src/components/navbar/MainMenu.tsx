"use client"

import { useState } from "react"
import { IconButton, Menu, MenuItem } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import Link from "next/link"

export default function HamburgerMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
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
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: "#1d1d1d",
            color: "#ffffff",
            border: "1px solid #2a2a2a",
            mt: 1,
            "& .MuiMenuItem-root": {
              "&:hover": { bgcolor: "#333333" }
            }
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Link href="/fights" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Fights
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/characters" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Characters
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/vehicles" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Vehicles
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/junctures" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Junctures
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/sites" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Sites
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/parties" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Parties
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/schticks" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Schticks
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/factions" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Factions
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/weapons" style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}>
            Weapons
          </Link>
        </MenuItem>
      </Menu>
    </>
  )
}
