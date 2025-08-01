"use client"

import { Link } from "@mui/material"
import { useState, MouseEvent } from "react"
import { Popup } from "@/components/popups"

type ActionValueLinkProperties = {
  name: string
  data?: string | object
  disablePopup?: boolean
}

export default function ActionValueLink({
  name,
  data,
  disablePopup = false,
}: ActionValueLinkProperties) {
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
        data-mention-id={name}
        data-mention-class-name="ActionValue"
        data-mention-data={data ? JSON.stringify(data) : undefined}
        style={{
          fontWeight: "bold",
          cursor: "pointer",
          textDecoration: "underline",
          color: "#ffffff",
        }}
        onClick={!disablePopup ? handleClick : undefined}
      >
        {name}
      </Link>
      <Popup
        handleClose={handleClose}
        anchorEl={anchorEl}
        open={open}
        keyword={`AV ${name}`}
      />
    </>
  )
}
