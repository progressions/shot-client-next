"use client"

import FileDownloadIcon from "@mui/icons-material/FileDownload"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Menu, MenuItem } from "@mui/material"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import { SystemStyleObject, Theme } from "@mui/system"
import type { MouseEvent, Dispatch, SetStateAction } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Character } from "@/types"
import { CS } from "@/services"
import { useClient } from "@/contexts"

type Action = {
  [key: string]: unknown
  icon: React.ReactNode
  name: string
  onClick?: (event: MouseEvent<HTMLElement>) => void
  preventClose?: boolean
}

type CharacterSpeedDialProps = {
  character: Character
  setCharacter: Dispatch<SetStateAction<Character>>
  sx?: SystemStyleObject<Theme>
}

export default function CharacterSpeedDial({
  character,
  setCharacter,
  sx = {},
}: CharacterSpeedDialProps) {
  const { client } = useClient()
  const router = useRouter()
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const exportMenuOpen = Boolean(exportAnchorEl)
  const [speedDialOpen, setSpeedDialOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [persist, setPersist] = useState(false)

  // Reset persist when SpeedDial is closed externally
  useEffect(() => {
    if (!speedDialOpen) {
      setPersist(false)
    }
  }, [speedDialOpen])

  const handleDelete = async () => {
    if (!character?.id) return
    if (
      !confirm(
        `Are you sure you want to delete the character: ${character.name || "Unnamed"}?`
      )
    )
      return
    try {
      await client.deleteCharacter(character)
      router.push("/characters")
    } catch (error_) {
      console.error("Failed to delete character:", error_)
    }
  }

  const handleExportPDF = async () => {
    setExportingPdf(true)
    try {
      const filename = `${(character.name || "character").replace(/\s+/g, "_")}.pdf`
      const response = await client.getCharacterPdf(character)
      const data = response.data
      const pdfBlob = new Blob([data], { type: "application/pdf" })
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error_) {
      console.error("Error downloading PDF:", error_)
      alert("Error downloading PDF")
    } finally {
      setExportingPdf(false)
      setExportAnchorEl(null)
      setSpeedDialOpen(false)
    }
  }

  const handleExportTXT = async () => {
    try {
      const filename = `${(character.name || "character").replace(/\s+/g, "_")}.txt`
      const textContent = `
Character: ${character.name || "Unnamed"}
ID: ${character.id}
Owner: ${character.owner || "N/A"}
Description: ${character.description || "N/A"}
${!CS.isMook(character) ? `Schticks: ${character.schticks?.join(", ") || "None"}` : ""}
Action Values: ${JSON.stringify(character.actionValues, null, 2)}
      `.trim()
      const txtBlob = new Blob([textContent], { type: "text/plain" })
      const url = window.URL.createObjectURL(txtBlob)
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error_) {
      console.error("Error downloading TXT:", error_)
      alert("Error downloading TXT")
    } finally {
      setExportAnchorEl(null)
      setSpeedDialOpen(false)
    }
  }

  const handleDuplicate = async () => {
    if (!character?.id) return
    try {
      const response = await client.duplicateCharacter(character)
      const newCharacter = response.data
      router.push(`/characters/${newCharacter.id}`)
    } catch (error_) {
      console.error("Failed to duplicate character:", error_)
    } finally {
      setSpeedDialOpen(false)
    }
  }

  const handleExportClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    setExportAnchorEl(event.currentTarget)
  }

  const handleExportMenuClose = () => {
    setExportAnchorEl(null)
  }

  const actions = [
    { icon: <EditIcon />, name: "Edit", onClick: () => { setEditOpen(true); setSpeedDialOpen(false) } },
    { icon: <FileDownloadIcon />, name: "Export", onClick: handleExportClick, preventClose: true },
    { icon: <PeopleAltIcon />, name: "Copy", onClick: handleDuplicate },
    { icon: <DeleteIcon />, name: "Delete", onClick: handleDelete },
  ]

  const handleActionClick = (action: Action) => (event: MouseEvent<HTMLElement>) => {
    if (action.preventClose) {
      event.stopPropagation()
      setPersist(true)
    } else {
      setPersist(false)
      setSpeedDialOpen(false)
    }
    if (action.onClick) {
      action.onClick(event)
    }
  }

  return (
    <>
      <SpeedDial
        ariaLabel="Character actions"
        sx={{
          position: "absolute",
          right: 0,
          "& .MuiSpeedDial-fab": {
            width: 36,
            height: 36,
            minHeight: 36,
            boxShadow: "none",
          },
          ...sx,
        }}
        icon={<SpeedDialIcon openIcon={<MoreHorizIcon />} />}
        direction="down"
        open={speedDialOpen}
        onOpen={() => setSpeedDialOpen(true)}
        onClose={() => {
          if (!persist) {
            setSpeedDialOpen(false)
          }
        }}
      >
        {actions.map(action => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={handleActionClick(action)}
          />
        ))}
      </SpeedDial>
      <Menu
        anchorEl={exportAnchorEl}
        open={exportMenuOpen}
        onClose={handleExportMenuClose}
        MenuListProps={{
          "aria-labelledby": "export-button",
        }}
      >
        <MenuItem onClick={handleExportPDF}>
          {exportingPdf ? "Exporting..." : "Export as PDF"}
        </MenuItem>
        <MenuItem onClick={handleExportTXT}>Export as TXT</MenuItem>
      </Menu>
    </>
  )
}
