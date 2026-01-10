"use client"

import { Divider, MenuItem } from "@mui/material"
import Link from "next/link"

const linkStyle = { color: "#ffffff", textDecoration: "none", width: "100%" }
const dividerStyle = { my: 0.5, bgcolor: "#2a2a2a" }

type PlayerMenuProps = {
  onClose: () => void
}

export function PlayerMenu({ onClose }: PlayerMenuProps) {
  return (
    <>
      <MenuItem onClick={onClose}>
        <Link href="/characters" style={linkStyle}>
          Characters
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
        <Link href="/campaigns" style={linkStyle}>
          Campaigns
        </Link>
      </MenuItem>
    </>
  )
}
