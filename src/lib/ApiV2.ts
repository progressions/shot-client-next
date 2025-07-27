import {
  Character,
  ID
} from "@/types"

class ApiV2 {
  base():string { return process.env.NEXT_PUBLIC_SERVER_URL as string }

  api():string { return `${this.base()}/api/v2` }

  characters(character?: Character | ID): string {
    if (character?.id) {
      return `${this.api()}/characters/${character.id}`
    } else {
      return `${this.api()}/characters`
    }
  }
}

export default ApiV2
