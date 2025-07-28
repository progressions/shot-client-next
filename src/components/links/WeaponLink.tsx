import Link from "next/link"
import type { Weapon } from "@/types/types"
import { WeaponName } from "@/components/weapons"

type WeaponLinkProps = {
  weapon: Weapon
  data?: string | object
}

export default function WeaponLink({ weapon, data }: WeaponLinkProps) {
  return (<>
    <Link
      href={`/weapons/${weapon.id}`}
      data-mention-id={weapon.id}
      data-mention-class-name="Weapon"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{fontWeight: "bold", textDecoration: "underline", color: "#fff"}}
    >
      <WeaponName weapon={weapon} />
    </Link>
    {' '}
    ({weapon.damage}/{weapon.concealment || "-"}/{weapon.reload_value || "-"})
  </>)
}
