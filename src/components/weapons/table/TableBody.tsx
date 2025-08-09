"use client"
import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { WeaponName } from "@/components/weapons"
import { CS } from "@/services"
import type { Weapon } from "@/types"

interface WeaponsTableBodyProps {
  weapons: Weapon[]
  formatDate: (date: string) => string
}

export default function WeaponsTableBody({
  weapons,
  formatDate
}: WeaponsTableBodyProps) {
  return (
    <TableBody>
      { weapons.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No weapons available
          </TableCell>
        </TableRow>
      ) : (
        weapons.map(weapon => (
          <TableRow
            key={ weapon.id }
            sx={{ "&:hover": { bgcolor: "#616161" } }}
          >
            <TableCell
              sx={{ color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              <Link
                href={`/weapons/${ weapon.id}` }
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                <WeaponName weapon={ weapon } />
              </Link>
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              { CS.type(weapon) }
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              { formatDate(weapon.created_at || "") }
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "60px", sm: "100px" }, textAlign: "center", padding: { xs: "8px 4px", sm: "16px 8px" } }}
            >
              { weapon.active ? "Yes" : "No" }
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
