"use client"
import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { SchtickName } from "@/components/schticks"
import { CS } from "@/services"
import type { Schtick } from "@/types"

interface SchticksTableBodyProps {
  schticks: Schtick[]
  formatDate: (date: string) => string
}

export default function SchticksTableBody({
  schticks,
  formatDate
}: SchticksTableBodyProps) {
  return (
    <TableBody>
      { schticks.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No schticks available
          </TableCell>
        </TableRow>
      ) : (
        schticks.map(schtick => (
          <TableRow
            key={ schtick.id }
            sx={{ "&:hover": { bgcolor: "#616161" } }}
          >
            <TableCell
              sx={{ color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              <Link
                href={`/schticks/${ schtick.id}` }
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                <SchtickName schtick={ schtick } />
              </Link>
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              { CS.type(schtick) }
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              { formatDate(schtick.created_at || "") }
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "60px", sm: "100px" }, textAlign: "center", padding: { xs: "8px 4px", sm: "16px 8px" } }}
            >
              { schtick.active ? "Yes" : "No" }
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
