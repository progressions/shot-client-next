"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { PartyPopup } from "@/components/popups"
import { PartyName } from "@/components/parties"

type PartyLinkProperties = {
  party: Party
  data?: string | object
  disablePopup?: boolean
}

export default function PartyLink({
  party,
  data,
  disablePopup = false,
}: PartyLinkProperties) {
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
        href={`/parties/${party.id}`}
        target="_blank"
        data-mention-id={party.id}
        data-mention-class-name="Party"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#fff",
        }}
        onClick={!disablePopup ? handleClick : null}
      >
        <PartyName party={party} />
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
          <PartyPopup id={party.id} />
        </Box>
      </Popover>
    </>
  )
}
