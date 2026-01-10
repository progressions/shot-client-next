"use client"

import { Divider, MenuItem } from "@mui/material"
import Link from "next/link"

const linkStyle = { color: "#ffffff", textDecoration: "none", width: "100%" }
const dividerStyle = { my: 0.5, bgcolor: "#2a2a2a" }

type GMMenuProps = {
  onClose: () => void
  isAdmin: boolean
}

export function GMMenu({ onClose, isAdmin }: GMMenuProps) {
  return (
    <>
      <MenuItem onClick={onClose}>
        <Link href="/fights" style={linkStyle}>
          Fights
        </Link>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Link href="/characters" style={linkStyle}>
          Characters
        </Link>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Link href="/vehicles" style={linkStyle}>
          Vehicles
        </Link>
      </MenuItem>
      <Divider sx={dividerStyle} />
      <MenuItem onClick={onClose}>
        <Link href="/schticks" style={linkStyle}>
          Schticks
        </Link>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Link href="/weapons" style={linkStyle}>
          Weapons
        </Link>
      </MenuItem>
      <Divider sx={dividerStyle} />
      <MenuItem onClick={onClose}>
        <Link href="/parties" style={linkStyle}>
          Parties
        </Link>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Link href="/factions" style={linkStyle}>
          Factions
        </Link>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Link href="/sites" style={linkStyle}>
          Sites
        </Link>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Link href="/junctures" style={linkStyle}>
          Junctures
        </Link>
      </MenuItem>
      <Divider sx={dividerStyle} />
      <MenuItem onClick={onClose}>
        <Link href="/campaigns" style={linkStyle}>
          Campaigns
        </Link>
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Link href="/media" style={linkStyle}>
          Media Library
        </Link>
      </MenuItem>
      {isAdmin && [
        <Divider key="admin-divider" sx={dividerStyle} />,
        <MenuItem key="users" onClick={onClose}>
          <Link href="/users" style={linkStyle}>
            Users
          </Link>
        </MenuItem>,
      ]}
    </>
  )
}
