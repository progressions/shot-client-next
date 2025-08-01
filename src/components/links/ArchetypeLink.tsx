"use client"

import { Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { Popup } from "@/components/popups"

type ArchetypeLinkProperties = {
  archetype: string
  data?: string | object
  disablePopup?: boolean
}

export default function ArchetypeLink({
  archetype,
  data,
  disablePopup = false,
}: ArchetypeLinkProperties) {
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
        data-mention-id={archetype}
        data-mention-class-name="Archetype"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          cursor: "pointer",
          textDecoration: "underline",
          color: "#ffffff",
        }}
        onClick={!disablePopup ? handleClick : undefined}
      >
        {archetype}
      </Link>
      <Popup
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        keyword={`Archetype: ${archetype}`}
      />
    </>
  )
}
