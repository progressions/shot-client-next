"use client"
import { TableBody, TableCell, TableRow } from "@mui/material"
import Link from "next/link"
import { VehicleName } from "@/components/vehicles"
import { VS } from "@/services"
import type { Vehicle } from "@/types"

interface VehiclesTableBodyProps {
  vehicles: Vehicle[]
  formatDate: (date: string) => string
}

export default function VehiclesTableBody({
  vehicles,
  formatDate,
}: VehiclesTableBodyProps) {
  return (
    <TableBody>
      {vehicles.length === 0 ? (
        <TableRow>
          <TableCell colSpan={4} sx={{ color: "#ffffff" }}>
            No vehicles available
          </TableCell>
        </TableRow>
      ) : (
        vehicles.map(vehicle => (
          <TableRow key={vehicle.id} sx={{ "&:hover": { bgcolor: "#616161" } }}>
            <TableCell
              sx={{
                color: "#ffffff",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <Link
                href={`/vehicles/${vehicle.id}`}
                style={{ color: "#ffffff", textDecoration: "underline" }}
              >
                <VehicleName vehicle={vehicle} />
              </Link>
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              {vS.type(vehicle)}
            </TableCell>
            <TableCell
              sx={{ color: "#ffffff", width: { xs: "65px", sm: "150px" } }}
            >
              {formatDate(vehicle.created_at || "")}
            </TableCell>
            <TableCell
              sx={{
                color: "#ffffff",
                width: { xs: "60px", sm: "100px" },
                textAlign: "center",
                padding: { xs: "8px 4px", sm: "16px 8px" },
              }}
            >
              {vehicle.active ? "Yes" : "No"}
            </TableCell>
          </TableRow>
        ))
      )}
    </TableBody>
  )
}
