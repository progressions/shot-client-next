import Link from "next/link"
import { CharacterName } from "@/components/characters"
import type { Character } from "@/types/types"

type CharacterLinkProps = {
  character: Character
}

export default function CharacterLink({ character }: CharacterLinkProps) {
  return (
    <Link
      href={`/characters/${character.id}`}
      data-mention-id={character.id}
      data-mention-class-name="Character"
      style={{textDecoration: "underline", color: "#fff"}}
    >
      <CharacterName character={character} />
    </Link>
  );
}
