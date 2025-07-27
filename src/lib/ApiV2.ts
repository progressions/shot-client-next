import {
  ID,
  Character,
  Vehicle,
  Site,
  Juncture,
  Party,
  Weapon
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

  vehicles(vehicle?: Vehicle | ID): string {
    if (vehicle?.id) {
      return `${this.api()}/vehicles/${vehicle.id}`
    } else {
      return `${this.api()}/vehicles`
    }
  }

  sites(site?: Site | ID): string {
    if (site?.id) {
      return `${this.api()}/sites/${site.id}`
    } else {
      return `${this.api()}/sites`
    }
  }

  junctures(juncture?: Juncture | ID): string {
    if (juncture?.id) {
      return `${this.api()}/junctures/${juncture.id}`
    } else {
      return `${this.api()}/junctures`
    }
  }

  parties(party?: Party | ID): string {
    if (party?.id) {
      return `${this.api()}/parties/${party.id}`
    } else {
      return `${this.api()}/parties`
    }
  }

  weapons(weapon?: Weapon | ID): string {
    if (weapon?.id) {
      return `${this.api()}/weapons/${weapon.id}`
    } else {
      return `${this.api()}/weapons`
    }
  }

}

export default ApiV2
