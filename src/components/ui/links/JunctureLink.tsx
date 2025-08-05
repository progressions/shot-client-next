"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { JuncturePopup } from "@/components/popups"
import { JunctureName } from "@/components/junctures"

type JunctureLinkProperties = {
  juncture: Juncture
  data?: string | object
  disablePopup?: boolean
}

export default function JunctureLink({
  juncture,
  data,
  disablePopup = false,
}: JunctureLinkProperties) {
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
        href={`/junctures/${juncture.id}`}
        target="_blank"
        data-mention-id={juncture.id}
        data-mention-class-name="Juncture"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#fff",
        }}
        onClick={!disablePopup ? handleClick : undefined}
      >
        <JunctureName juncture={juncture} />
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
          <JuncturePopup id={juncture.id} />
        </Box>
      </Popover>
    </>
  )
}
