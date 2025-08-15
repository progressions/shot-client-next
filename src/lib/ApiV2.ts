import {
  ID,
  User,
  Campaign,
  Fight,
  Character,
  Vehicle,
  Site,
  Juncture,
  Party,
  Weapon,
  Schtick,
  Faction,
} from "@/types"

class ApiV2 {
  base(): string {
    return process.env.NEXT_PUBLIC_SERVER_URL as string
  }

  api(): string {
    return `${this.base()}/api/v2`
  }

  encounters(fight?: Fight | ID): string {
    return fight?.id
      ? `${this.api()}/encounters/${fight.id}`
      : `${this.api()}/encounters`
  }

  characters(character?: Character | ID): string {
    return character?.id
      ? `${this.api()}/characters/${character.id}`
      : `${this.api()}/characters`
  }

  characterPdf(character: Character | ID): string {
    return `${this.characters(character)}/pdf`
  }

  vehicles(vehicle?: Vehicle | ID): string {
    return vehicle?.id
      ? `${this.api()}/vehicles/${vehicle.id}`
      : `${this.api()}/vehicles`
  }

  ai(): string {
    return `${this.api()}/ai`
  }

  aiImages(): string {
    return `${this.api()}/ai_images`
  }

  imagePositions(): string {
    return `${this.api()}/image_positions`
  }

  sites(site?: Site | ID): string {
    return site?.id ? `${this.api()}/sites/${site.id}` : `${this.api()}/sites`
  }

  junctures(juncture?: Juncture | ID): string {
    return juncture?.id
      ? `${this.api()}/junctures/${juncture.id}`
      : `${this.api()}/junctures`
  }

  parties(party?: Party | ID): string {
    return party?.id
      ? `${this.api()}/parties/${party.id}`
      : `${this.api()}/parties`
  }

  weapons(weapon?: Weapon | ID): string {
    return weapon?.id
      ? `${this.api()}/weapons/${weapon.id}`
      : `${this.api()}/weapons`
  }

  weaponJunctures(): string {
    return `${this.api()}/weapons/junctures`
  }

  weaponCategories(): string {
    return `${this.api()}/weapons/categories`
  }

  schticks(schtick?: Schtick | ID): string {
    return schtick?.id
      ? `${this.api()}/schticks/${schtick.id}`
      : `${this.api()}/schticks`
  }

  schtickCategories(): string {
    return `${this.api()}/schticks/categories`
  }

  schtickPaths(): string {
    return `${this.api()}/schticks/paths`
  }

  factions(faction?: Faction | ID): string {
    return faction?.id
      ? `${this.api()}/factions/${faction.id}`
      : `${this.api()}/factions`
  }

  fights(fight?: Fight | ID): string {
    return fight?.id
      ? `${this.api()}/fights/${fight.id}`
      : `${this.api()}/fights`
  }

  currentCampaign() {
    return `${this.campaigns()}/current`
  }

  campaigns(campaign?: Campaign | ID) {
    return campaign
      ? `${this.api()}/campaigns/${campaign.id}`
      : `${this.api()}/campaigns`
  }

  users(user?: User | ID): string {
    return user ? `${this.api()}/users/${user.id}` : `${this.api()}/users`
  }
}

export default ApiV2
