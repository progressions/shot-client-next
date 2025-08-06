"use client"

import { Box, Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { Popup } from "@/components/popups"
import { Icon } from "@/components/ui"

type InfoLinkProperties = {
  info: string
  keyword?: string
  data?: string | object
  href?: string
  disablePopup?: boolean
  disableIcon?: boolean
}

export default function InfoLink({
  info,
  data,
  keyword = info,
  href,
  disablePopup = false,
    disableIcon = false
}: InfoLinkProperties) {
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
        href={href}
        target="_blank"
        data-mention-id={info}
        data-mention-class-name="Info"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          cursor: "pointer",
          textDecoration: "underline",
          color: "#ffffff",
        }}
        onClick={!disablePopup ? handleClick : undefined}
      >
        { !disableIcon && <Icon keyword={keyword} size={16} sx={{mr: 0.5}} /> }
        {info}
      </Link>
      <Popup
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        keyword={keyword}
      />
    </>
  )
}
