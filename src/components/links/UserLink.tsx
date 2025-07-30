import Link from "next/link"
import { UserName } from "@/components/users"
import type { User } from "@/types"

type UserLinkProperties = {
  user: User
  data?: string | object
}

export default function UserLink({ user, data }: UserLinkProperties) {
  return (
    <Link
      href={`/users/${user.id}`}
      target="_blank"
      data-mention-id={user.id}
      data-mention-class-name="User"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{ fontWeight: "bold", textDecoration: "underline", color: "#fff" }}
    >
      <UserName user={user} />
    </Link>
  )
}
