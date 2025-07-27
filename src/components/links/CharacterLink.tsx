import Link from "next/link"
import { CharacterName } from "@/components/characters"
import type { Character } from "@/types/types"

type CharacterLinkProps = {
  character: Character
  data?: string | object
}

export default function CharacterLink({ character, data }: CharacterLinkProps) {
  return (
    <Link
      href={`/characters/${character.id}`}
      data-mention-id={character.id}
      data-mention-class-name="Character"
      data-mention-data={data ? JSON.stringify(data) : undefined}
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <CharacterName character={character} />
    </Link>
  );
}
