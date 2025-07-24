import type {
  Location,
  Shot,
  Party,
  Weapon,
  Site,
  Advancement,
  Schtick,
  CharacterEffect,
  Invitation,
  Campaign,
  Vehicle,
  Effect,
  Faction,
  Fight,
  FightEvent,
  Character,
  User,
  Person,
  Juncture,
  ID
} from "@/types/types"

class Api {
  base():string { return process.env.NEXT_PUBLIC_SERVER_URL as string }

  api():string { return `${this.base()}/api/v1` }

  cable(jwt?: string):string {
    return `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/cable?token=${jwt || ""}`
  }

  ai(): string {
    return `${this.api()}/ai`
  }

  suggestions(): string {
    return `${this.api()}/suggestions`
  }

  locations(location?: Location | ID): string {
    if (location?.id) {
      return `${this.api()}/locations/${location.id}`
    } else {
      return `${this.api()}/locations`
    }
  }

  memberships(party: Party | ID, person?: Character | Vehicle | ID): string {
    if (person?.id) {
      return `${this.parties(party)}/memberships/${person.id}`
    } else {
      return `${this.parties(party)}/memberships`
    }
  }

  parties(party?: Party | ID): string {
    if (party?.id) {
      return `${this.api()}/parties/${party.id}`
    } else {
      return `${this.api()}/parties`
    }
  }

  addPartyToFight(party: Party | ID, fight: Fight | ID): string {
    return `${this.parties(party)}/fight/${fight.id}`
  }

  fights(fight?: Fight | ID | undefined): string {
    if (fight?.id) {
      return `${this.api()}/fights/${fight.id}`
    } else {
      return `${this.api()}/fights`
    }
  }

  fightEvents(fight: Fight | ID): string {
    return `${this.fights(fight)}/fight_events`
  }

  charactersAndVehicles(fight?: Fight | ID | undefined): string {
    if (fight?.id) {
      return `${this.api()}/characters_and_vehicles/${fight.id}`
    } else {
      return `${this.api()}/characters_and_vehicles`
    }
  }

  characters(fight?: Fight | null, character?: Character | ID): string {
    if (!fight?.id) {
      return this.allCharacters(character)
    }
    if (character?.id) {
      return `${this.fights(fight)}/actors/${character.id}`
    } else {
      return `${this.fights(fight)}/actors`
    }
  }

  characterPdf(character: Character | ID): string {
    return `${this.allCharacters(character)}/pdf`
  }

  vehicles(fight?: Fight | null, vehicle?: Vehicle | ID): string {
    if (!fight?.id) {
      return this.allVehicles(vehicle)
    }
    if (vehicle?.id) {
      return `${this.fights(fight)}/drivers/${vehicle.id}`
    } else {
      return `${this.fights(fight)}/drivers`
    }
  }

  actVehicle(fight: Fight, vehicle: Vehicle): string {
    return `${this.vehicles(fight, vehicle)}/act`
  }

  addVehicle(fight: Fight, vehicle: Vehicle | ID): string {
    return `${this.vehicles(fight, vehicle)}/add`
  }

  addCharacter(fight: Fight, character: Character | ID): string {
    return `${this.characters(fight, character)}/add`
  }

  actCharacter(fight: Fight, character: Character): string {
    return `${this.characters(fight, character)}/act`
  }

  hideCharacter(fight: Fight, character: Character): string {
    return `${this.characters(fight, character)}/hide`
  }

  revealCharacter(fight: Fight, character: Character): string {
    return `${this.characters(fight, character)}/reveal`
  }

  hideVehicle(fight: Fight, vehicle: Vehicle): string {
    return `${this.vehicles(fight, vehicle)}/hide`
  }

  revealVehicle(fight: Fight, vehicle: Vehicle): string {
    return `${this.vehicles(fight, vehicle)}/reveal`
  }

  allVehicles(vehicle?: Vehicle | ID): string {
    if (vehicle?.id) {
      return `${this.api()}/vehicles/${vehicle.id}`
    } else {
      return `${this.api()}/vehicles`
    }
  }

  allCharacters(character?: Character | ID): string {
    if (character?.id) {
      return `${this.api()}/characters/${character.id}`
    } else {
      return `${this.api()}/characters`
    }
  }

  advancements(character: Character, advancement?: Advancement | ID): string {
    if (advancement?.id) {
      return `${this.allCharacters(character)}/advancements/${advancement.id}`
    } else {
      return `${this.allCharacters(character)}/advancements`
    }
  }

  junctures(juncture?: Juncture | ID): string {
    if (juncture?.id) {
      return `${this.api()}/junctures/${juncture.id}`
    } else {
      return `${this.api()}/junctures`
    }
  }

  allSites(site?: Site | ID): string {
    if (site?.id) {
      return `${this.api()}/sites/${site.id}`
    } else {
      return `${this.api()}/sites`
    }
  }

  sites(character: Character, site?: Site | ID): string {
    if (site?.id) {
      return `${this.allCharacters(character)}/sites/${site.id}`
    } else {
      return `${this.allCharacters(character)}/sites`
    }
  }

  effects(fight: Fight, effect?: Effect | ID): string {
    if (effect?.id) {
      return `${this.fights(fight)}/effects/${effect.id}`
    } else {
      return `${this.fights(fight)}/effects`
    }
  }

  characterEffects(fight: Fight, characterEffect?: CharacterEffect | ID): string {
    if (characterEffect?.id) {
      return `${this.fights(fight)}/character_effects/${characterEffect.id}`
    } else {
      return `${this.fights(fight)}/character_effects`
    }
  }

  invitations(invitation?: Invitation):string {
    if (invitation?.id) {
      return `${this.api()}/invitations/${invitation.id}`
    } else {
      return `${this.api()}/invitations`
    }
  }

  currentCampaign() {
    return `${this.campaigns()}/current`
  }

  campaigns(campaign?: Campaign | ID) {
    if (campaign) {
      return `${this.api()}/campaigns/${campaign.id}`
    } else {
      return `${this.api()}/campaigns`
    }
  }

  campaignMemberships() {
    return `${this.api()}/campaign_memberships`
  }

  adminUsers(user?: User | ID): string {
    if (user) {
      return `${this.api()}/users/${user.id}`
    } else {
      return `${this.api()}/users`
    }
  }

  currentUser(): string {
    return `${this.api()}/users/current`
  }

  users(user?: User | ID): string {
    if (user?.id) {
      return `${this.api()}/users/${user.id}`
    } else {
      return `${this.api()}/users`
    }
  }

  unlockUser(): string {
    return `${this.base()}/users/unlock`
  }

  confirmUser(): string {
    return `${this.base()}/users/confirmation`
  }

  resetUserPassword(): string {
    return `${this.base()}/users/password`
  }

  signIn(): string {
    return `${this.base()}/users/sign_in`
  }

  registerUser(): string {
    return `${this.base()}/users`
  }

  factions(faction?: Faction | ID): string {
    if (faction?.id) {
      return `${this.api()}/factions/${faction.id}`
    } else {
      return `${this.api()}/factions`
    }
  }

  notionCharacters(): string {
    return `${this.api()}/notion/characters`
  }

  characterSchticks(character: Character | ID, schtick?: Schtick | ID): string {
    if (schtick?.id) {
      return `${this.allCharacters(character)}/schticks/${schtick.id}`
    } else {
      return `${this.allCharacters(character)}/schticks`
    }
  }

  characterWeapons(character: Character | ID, weapon?: Weapon | ID): string {
    if (weapon?.id) {
      return `${this.allCharacters(character)}/weapons/${weapon.id}`
    } else {
      return `${this.allCharacters(character)}/weapons`
    }
  }

  weapons(weapon?: Weapon | ID): string {
    if (weapon?.id) {
      return `${this.api()}/weapons/${weapon.id}`
    } else {
      return `${this.api()}/weapons`
    }
  }

  schticks(schtick?: Schtick | ID): string {
    if (schtick?.id) {
      return `${this.api()}/schticks/${schtick.id}`
    } else {
      return `${this.api()}/schticks`
    }
  }

  importSchticks() {
    return `${this.schticks()}/import`
  }

  importWeapons() {
    return `${this.weapons()}/import`
  }

}

export default Api
