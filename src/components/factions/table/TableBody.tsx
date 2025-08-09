"use client"
import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { FactionName } from "@/components/factions"
import { CS } from "@/services"
import type { Faction } from "@/types"

interface FactionsTableBodyProps {
  factions: Faction[]
  formatDate: (date: string) => string
}

export default function FactionsTableBody({
  factions,
  formatDate
}: FactionsTableBodyProps) {
  return (
    <TableBody>
      { factions.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No factions available
          </TableCell>
        </TableRow>
      ) : (
        factions.map(faction => (
          <TableRow
            key={ faction.id }
            sx={{ "&:hover": { bgcolor: "#616161" } }}
          >
            <TableCell
              sx={{ color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              <Link
                href={`/factions/${ faction.id}` }
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                <FactionName faction={ faction } />
              </Link>
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              { CS.type(faction) }
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              { formatDate(faction.created_at || "") }
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "60px", sm: "100px" }, textAlign: "center", padding: { xs: "8px 4px", sm: "16px 8px" } }}
            >
              { faction.active ? "Yes" : "No" }
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
