"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { FactionPopup } from "@/components/popups"
import { FactionName } from "@/components/factions"

type FactionLinkProperties = {
  faction: Faction
  data?: string | object
  disablePopup?: boolean
}

export default function FactionLink({
  faction,
  data,
  disablePopup = false,
}: FactionLinkProperties) {
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
        href={`/factions/${faction.id}`}
        target="_blank"
        data-mention-id={faction.id}
        data-mention-class-name="Faction"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          textDecoration: "underline",
          color: "#fff",
        }}
        onClick={!disablePopup ? handleClick : undefined}
      >
        <FactionName faction={faction} />
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
          <FactionPopup id={faction.id} />
        </Box>
      </Popover>
    </>
  )
}
