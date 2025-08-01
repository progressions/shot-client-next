"use client"

import { usePathname } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import { useClient } from "@/contexts"
import Client from "@/lib/Client"
import {
  SiteName,
  WeaponName,
  CharacterName,
  VehicleName,
  FightName,
  CampaignName,
  UserName,
  FactionName,
  SchtickName,
  PartyName,
  JunctureName,
} from "@/components/names"

interface BreadcrumbItem {
  label: string
  path: string
}

export default function Breadcrumbs() {
  const { client } = useClient()
  const pathname = usePathname()
  const pathnames = useMemo(
    () => (pathname ? pathname.split("/").filter(Boolean) : []),
    [pathname]
  )
  const [crumbName, setCrumbName] = useState<string | React.ReactNode | null>(
    null
  )

  const labelMap: { [key: string]: string } = useMemo(
    () => ({
      characters: "Characters",
      vehicles: "Vehicles",
      fights: "Fights",
      campaigns: "Campaigns",
      users: "Users",
      home: "Home",
      factions: "Factions",
      weapons: "Weapons",
      schticks: "Schticks",
      parties: "Parties",
      sites: "Sites",
    }),
    []
  )

  useEffect(() => {
    const fetchName = async () => {
      setCrumbName(null)

      const crumb = await fetchCrumbName(pathnames, client)
      setCrumbName(crumb)
    }
    fetchName().catch(error => {
      console.error("Error fetching breadcrumb name:", error)
      setCrumbName(null)
    })
  }, [pathnames, client, labelMap])

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Home", path: "/" }]

    let currentPath = ""
    for (const [index, segment] of pathnames.entries()) {
      currentPath += `/${segment}`
      let label =
        labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      if (index === pathnames.length - 1 && crumbName) {
        label = crumbName as string
      }

      items.push({ label, path: currentPath })
    }

    return items
  }

  const breadcrumbs = getBreadcrumbs()
  if (breadcrumbs.length === 1) return null

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
          <Link
            key={item.path}
            href={item.path}
            passHref
            style={{ textDecoration: "none" }}
          >
            <Typography
              component="span"
              color="#fff"
              sx={{
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                  textDecorationColor: "#fff",
                },
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

async function fetchCrumbName(
  pathnames: string[],
  client: Client
): Promise<React.ReactNode | null> {
  const id = pathnames.at(-1)
  if (!id || id === pathnames[0]) return null

  if (pathnames[0] === "weapons") {
    const response = await client.getWeapon({ id })
    return <WeaponName weapon={response.data} />
  }
  if (pathnames[0] === "parties") {
    const response = await client.getParty({ id })
    return <PartyName party={response.data} />
  }
  if (pathnames[0] === "junctures") {
    const response = await client.getJuncture({ id })
    return <JunctureName juncture={response.data} />
  }
  if (pathnames[0] === "schticks") {
    const response = await client.getSchtick({ id })
    return <SchtickName schtick={response.data} />
  }
  if (pathnames[0] === "factions") {
    const response = await client.getFaction({ id })
    return <FactionName faction={response.data} />
  }
  if (pathnames[0] === "vehicles") {
    const response = await client.getVehicle({ id })
    return <VehicleName vehicle={response.data} />
  }
  if (pathnames[0] === "characters") {
    if (id === "import") {
      return "Import"
    }
    if (id === "generate") {
      return "Generate"
    }
    if (id === "create") {
      return "Create"
    }
    const response = await client.getCharacter({ id })
    return <CharacterName character={response.data} />
  }
  if (pathnames[0] === "fights") {
    const response = await client.getFight({ id })
    return <FightName fight={response.data} />
  }
  if (pathnames[0] === "sites") {
    const response = await client.getSite({ id })
    return <SiteName site={response.data} />
  }
  if (pathnames[0] === "campaigns") {
    const response = await client.getCampaign({ id })
    return <CampaignName campaign={response.data} />
  }
  if (pathnames[0] === "users") {
    const response = await client.getUser({ id })
    return <UserName user={response.data} />
  }
  // Add more cases as needed
  return null
}
