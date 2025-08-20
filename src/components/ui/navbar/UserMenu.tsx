"use client"

import { useState } from "react"
import { Avatar, Menu, MenuItem } from "@mui/material"
import Link from "next/link"
import { logoutAction } from "@/lib/actions"

interface UserMenuProps {
  user: {
    id: string
    name: string
    image_url?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
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
      <Avatar
        src={user.image_url ?? undefined}
        alt={user.name}
        onClick={handleMenuOpen}
        sx={{ 
          width: 32, 
          height: 32, 
          cursor: "pointer",
          "&:hover": {
            opacity: 0.8
          }
        }}
      />
      <Menu
        anchorEl={anchorElement}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            bgcolor: "#1d1d1d",
            color: "#ffffff",
            border: "1px solid #2a2a2a",
            mt: 1,
            minWidth: 150,
            "& .MuiMenuItem-root": {
              "&:hover": { bgcolor: "#333333" },
            },
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Link
            href="/profile"
            style={{ color: "#ffffff", textDecoration: "none", width: "100%" }}
          >
            Profile
          </Link>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ p: 0 }}>
          <form action={logoutAction} style={{ width: "100%" }}>
            <button 
              type="submit" 
              style={{ 
                background: "none",
                border: "none",
                color: "#ffffff",
                textDecoration: "none",
                width: "100%",
                padding: "6px 16px",
                textAlign: "left",
                cursor: "pointer",
                fontSize: "inherit",
                fontFamily: "inherit"
              }}
            >
              Logout
            </button>
          </form>
        </MenuItem>
      </Menu>
    </>
  )
}