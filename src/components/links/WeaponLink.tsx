"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { WeaponPopup } from "@/components/popups"
import { WeaponName } from "@/components/weapons"

type WeaponLinkProperties = {
  weapon: Weapon
  data?: string | object
  disablePopup?: boolean
}

export default function WeaponLink({
  weapon,
  data,
  disablePopup = false,
}: WeaponLinkProperties) {
  const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)

  return (
    <>
      <Link
        href={`/weapons/${weapon.id}`}
        target="_blank"
        data-mention-id={weapon.id}
        data-mention-class-name="Weapon"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#fff",
        }}
        onClick={!disablePopup ? handleClick : null}
      >
        <WeaponName weapon={weapon} />
      </Link>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 }}>
          <WeaponPopup id={weapon.id} />
        </Box>
      </Popover>
    </>
  )
}
