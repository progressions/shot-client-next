"use client"

import { useState } from "react"
import { Divider, IconButton, Menu, MenuItem } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import Link from "next/link"
import { useClient } from "@/contexts"

export function CampaignRequiredMenu() {
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
        {[
          <MenuItem key="campaigns" onClick={handleMenuClose}>
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
          </MenuItem>,
          ...(user.admin
            ? [
                <Divider key="divider" sx={{ my: 0.5, bgcolor: "#2a2a2a" }} />,
                <MenuItem key="users" onClick={handleMenuClose}>
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
                </MenuItem>,
              ]
            : []),
        ]}
      </Menu>
    </>
  )
}
