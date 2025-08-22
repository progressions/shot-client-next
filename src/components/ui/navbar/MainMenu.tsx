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
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/fights"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Fights
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/characters"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Characters
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/vehicles"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Vehicles
          </Link>
        </MenuItem>
        <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/schticks"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Schticks
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/weapons"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Weapons
          </Link>
        </MenuItem>
        <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/parties"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Parties
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/factions"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Factions
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/sites"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Sites
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/junctures"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Junctures
          </Link>
        </MenuItem>
        <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/about"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            About
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/documentation"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Documentation
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/support"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Support
          </Link>
        </MenuItem>
        <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/campaigns"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              width: "100%",
            }}
          >
            Campaigns
          </Link>
        </MenuItem>
        {user.admin && <Divider sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />}
        {user.admin && (
          <MenuItem onClick={handleMenuClose}>
            <Link
              href="/users"
              style={{
                color: "#ffffff",
                textDecoration: "none",
                width: "100%",
              }}
            >
              Users
            </Link>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
