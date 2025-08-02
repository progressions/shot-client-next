// components/Breadcrumbs.tsx
import Link from "next/link"
import { headers } from "next/headers"
import { Breadcrumbs as MuiBreadcrumbs, Typography } from "@mui/material"
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import { getServerClient } from "@/lib"
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
  label: string | React.ReactNode
  path: string
}

async function fetchCrumbName(
  pathnames: string[],
  client: Client
): Promise<React.ReactNode | null> {
  if (!pathnames || pathnames.length === 0) {
    console.warn("fetchCrumbName: pathnames is empty or undefined", {
      pathnames,
    })
    return null
  }

  // Handle routes like /characters/[id]/edit
  let id = pathnames.at(-1)
  const isAction = ["edit", "create", "import", "generate"].includes(id ?? "")
  if (isAction && pathnames.length > 1) {
    id = pathnames.at(-2) // Use second-to-last segment as ID
  }

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
    if (id === "import") return "Import"
    if (id === "generate") return "Generate"
    if (id === "create") return "Create"
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
  return null
}

export default async function Breadcrumbs() {
  const labelMap: { [key: string]: string } = {
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
  }

  const client = await getServerClient()

  // Infer pathnames from custom header
  const headersState = await headers()
  const pathname = headersState.get("x-pathname") || ""
  const pathnames = pathname.split("/").filter(Boolean)

  // Debugging
  console.log("Breadcrumbs: processing path", { pathname, pathnames })

  if (!pathnames || pathnames.length === 0) {
    console.log("Breadcrumbs: empty pathnames, likely root route", { pathname })
    return null
  }

  // Handle routes like /characters/[id]/edit
  const isAction = ["edit", "create", "import", "generate"].includes(
    pathnames.at(-1) ?? ""
  )
  const displayPathnames =
    isAction && pathnames.length > 1 ? pathnames.slice(0, -1) : pathnames

  const crumbName = await fetchCrumbName(pathnames, client).catch(error => {
    console.error("Error fetching breadcrumb name:", error)
    return null
  })

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Home", path: "/" }]
    let currentPath = ""

    for (const [index, segment] of displayPathnames.entries()) {
      currentPath += `/${segment}`
      let label =
        labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      if (index === displayPathnames.length - 1 && crumbName) {
        label = crumbName
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
