import Link from "next/link"
import { VehicleName } from "@/components/vehicles"
import type { Vehicle } from "@/types"

type VehicleLinkProps = {
  vehicle: Vehicle
  data?: string | object
}

export default function VehicleLink({ vehicle, data }: VehicleLinkProps) {
  return (
    <Link
      href={`/vehicles/${vehicle.id}`}
      target="_blank"
      data-mention-id={vehicle.id}
      data-mention-class-name="Vehicle"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <VehicleName vehicle={vehicle} />
    </Link>
  )
}
