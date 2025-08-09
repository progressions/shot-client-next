"use client"
import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { PartyName } from "@/components/parties"
import type { Party } from "@/types"

interface PartiesTableBodyProps {
  parties: Party[]
  formatDate: (date: string) => string
}

export default function PartiesTableBody({
  parties,
  formatDate,
}: PartiesTableBodyProps) {
  return (
    <TableBody>
      {parties.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No parties available
          </TableCell>
        </TableRow>
      ) : (
        parties.map(party => (
          <TableRow key={party.id} sx={{ "&:hover": { bgcolor: "#616161" } }}>
            <TableCell
              sx={{
                color: "#ffffff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Link
                href={`/parties/${party.id}`}
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                <PartyName party={party} />
              </Link>
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              {formatDate(party.created_at || "")}
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "60px", sm: "100px" },
                textAlign: "center",
                padding: { xs: "8px 4px", sm: "16px 8px" },
              }}
            >
              {party.active ? "Yes" : "No"}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
