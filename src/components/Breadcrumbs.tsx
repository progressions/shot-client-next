"use client"

import { usePathname } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import { useClient } from "@/contexts"

interface BreadcrumbItem {
  label: string
  path: string
}

export default function Breadcrumbs() {
  const { client } = useClient()
  const pathname = usePathname()
  const pathnames = useMemo(() => (pathname ? pathname.split("/").filter((x) => x) : []), [pathname])
  const [crumbName, setCrumbName] = useState<string | null>(null)

  const labelMap: { [key: string]: string } = useMemo(() => ({
    characters: "Characters",
    vehicles: "Vehicles",
    fights: "Fights",
    campaigns: "Campaigns",
    users: "Users",
    home: "Home"
  }), [])

  useEffect(() => {
    const fetchCharacterName = async () => {
      const id = pathnames[pathnames.length - 1]
      if (labelMap[id]) return

      if (pathnames[0] === "vehicles" && id) {
        if (id == "vehicles") return
        try {
          const response = await client.getVehicle({ id })
          const { data } = response
          setCrumbName(data.name || id)
        } catch (error) {
          console.error("Error fetching vehicle name:", error)
          setCrumbName(id)
        }
      }

      if (pathnames[0] === "characters" && id) {
        if (id == "characters") return
        try {
          const response = await client.getCharacter({ id })
          const { data } = response
          setCrumbName(data.name || id)
        } catch (error) {
          console.error("Error fetching character name:", error)
          setCrumbName(id)
        }
      }

      if (pathnames[0] === "fights" && id) {
        if (id == "fights") return
        try {
          const response = await client.getFight({ id })
          const { data } = response
          setCrumbName(data.name || id)
        } catch (error) {
          console.error("Error fetching name:", error)
          setCrumbName(id)
        }
      }
    }
    fetchCharacterName()
  }, [pathnames, client, labelMap])

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Home", path: "/" }]

    let currentPath = ""
    pathnames.forEach((segment, index) => {
      currentPath += `/${segment}`
      let label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      if (index === pathnames.length - 1 && crumbName) {
        label = crumbName
      }
      items.push({ label, path: currentPath })
    })

    return items
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: "#fff" }} />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        return isLast ? (
          <Typography key={item.path} color="#fff">
            {item.label}
          </Typography>
        ) : (
          <Link key={item.path} href={item.path} passHref style={{ textDecoration: "none" }}>
            <Typography
              component="span"
              color="#fff"
              sx={{
                textDecoration: "none",
                "&:hover": { textDecoration: "underline", textDecorationColor: "#fff" }
              }}
            >
              {item.label}
            </Typography>
          </Link>
        )
      })}
    </MuiBreadcrumbs>
  )
}
