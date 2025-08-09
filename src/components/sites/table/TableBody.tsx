"use client"
import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { SiteName } from "@/components/sites"
import { CS } from "@/services"
import type { Site } from "@/types"

interface SitesTableBodyProps {
  sites: Site[]
  formatDate: (date: string) => string
}

export default function SitesTableBody({
  sites,
  formatDate,
}: SitesTableBodyProps) {
  return (
    <TableBody>
      {sites.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No sites available
          </TableCell>
        </TableRow>
      ) : (
        sites.map(site => (
          <TableRow key={site.id} sx={{ "&:hover": { bgcolor: "#616161" } }}>
            <TableCell
              sx={{
                color: "#ffffff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Link
                href={`/sites/${site.id}`}
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                <SiteName site={site} />
              </Link>
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              {CS.type(site)}
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              {formatDate(site.created_at || "")}
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "60px", sm: "100px" },
                textAlign: "center",
                padding: { xs: "8px 4px", sm: "16px 8px" },
              }}
            >
              {site.active ? "Yes" : "No"}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
