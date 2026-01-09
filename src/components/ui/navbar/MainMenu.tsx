"use client"

import { useState } from "react"
import { Divider, IconButton, Menu, MenuItem } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import Link from "next/link"
import { useClient } from "@/contexts"

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

  const linkStyle = { color: "#ffffff", textDecoration: "none", width: "100%" }

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
        {/* Player items - visible to everyone */}
        <MenuItem onClick={handleMenuClose}>
          <Link href="/characters" style={linkStyle}>
            Characters
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/schticks" style={linkStyle}>
            Schticks
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link href="/weapons" style={linkStyle}>
            Weapons
          </Link>
        </MenuItem>
        <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />
        <MenuItem onClick={handleMenuClose}>
          <Link href="/campaigns" style={linkStyle}>
            Campaigns
          </Link>
        </MenuItem>

        {/* GM items - only visible to gamemasters and admins */}
        {isGM && <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />}
        {isGM && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/fights" style={linkStyle}>
              Fights
            </Link>
          </MenuItem>
        )}
        {isGM && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/vehicles" style={linkStyle}>
              Vehicles
            </Link>
          </MenuItem>
        )}
        {isGM && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/parties" style={linkStyle}>
              Parties
            </Link>
          </MenuItem>
        )}
        {isGM && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/factions" style={linkStyle}>
              Factions
            </Link>
          </MenuItem>
        )}
        {isGM && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/sites" style={linkStyle}>
              Sites
            </Link>
          </MenuItem>
        )}
        {isGM && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/junctures" style={linkStyle}>
              Junctures
            </Link>
          </MenuItem>
        )}
        {isGM && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/media" style={linkStyle}>
              Media Library
            </Link>
          </MenuItem>
        )}

        {/* Admin items */}
        {user.admin && <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />}
        {user.admin && (
          <MenuItem onClick={handleMenuClose}>
            <Link href="/users" style={linkStyle}>
              Users
            </Link>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
