"use client"

import { Box, Popover, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { TypePopup } from "@/components/popups"

type TypeLinkProperties = {
  characterType: string
  data?: string | object
  disablePopup?: boolean
}

export default function TypeLink({
  characterType,
  data,
  disablePopup,
}: TypeLinkProperties) {
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
        data-mention-id={characterType}
        data-mention-class-name="Type"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          cursor: "pointer",
          textDecoration: "underline",
          color: "#ffffff",
          cursor: "pointer",
        }}
        onClick={!disablePopup ? handleClick : undefined}
      >
        {characterType}
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
          <TypePopup id={characterType} />
        </Box>
      </Popover>
    </>
  )
}
