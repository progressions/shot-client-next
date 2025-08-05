"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { SchtickPopup } from "@/components/popups"
import { SchtickName } from "@/components/schticks"

type SchtickLinkProperties = {
  schtick: Schtick
  data?: string | object
  disablePopup?: boolean
}

export default function SchtickLink({
  schtick,
  data,
  disablePopup = false,
}: SchtickLinkProperties) {
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
        href={`/schticks/${schtick.id}`}
        target="_blank"
        data-mention-id={schtick.id}
        data-mention-class-name="Schtick"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#fff",
        }}
        onClick={!disablePopup ? handleClick : null}
      >
        <SchtickName schtick={schtick} />
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
          <SchtickPopup id={schtick.id} />
        </Box>
      </Popover>
    </>
  )
}
