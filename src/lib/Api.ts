import type {
  Location,
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
  Character,
  User,
  Juncture,
  ID,
} from "@/types"

class Api {
  base(): string {
    return process.env.NEXT_PUBLIC_SERVER_URL as string
  }

  api(): string {
    return `${this.base()}/api/v1`
  }

  cable(jwt?: string): string {
    return `${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/cable?token=Bearer ${jwt || ""}`
  }

  ai(): string {
    return `${this.api()}/ai`
  }

  suggestions(): string {
    return `${this.api()}/suggestions`
  }

  locations(location?: Location | ID): string {
    return location?.id
      ? `${this.api()}/locations/${location.id}`
      : `${this.api()}/locations`
  }

  memberships(party: Party | ID, person?: Character | Vehicle | ID): string {
    return person?.id
      ? `${this.parties(party)}/memberships/${person.id}`
      : `${this.parties(party)}/memberships`
  }

  parties(party?: Party | ID): string {
    return party?.id
      ? `${this.api()}/parties/${party.id}`
      : `${this.api()}/parties`
  }

  addPartyToFight(party: Party | ID, fight: Fight | ID): string {
    return `${this.parties(party)}/fight/${fight.id}`
  }

  fights(fight?: Fight | ID): string {
    return fight?.id
      ? `${this.api()}/fights/${fight.id}`
      : `${this.api()}/fights`
  }

  fightEvents(fight: Fight | ID): string {
    return `${this.fights(fight)}/fight_events`
  }

  charactersAndVehicles(fight?: Fight | ID): string {
    return fight?.id
      ? `${this.api()}/characters_and_vehicles/${fight.id}`
      : `${this.api()}/characters_and_vehicles`
  }

  characters(fight?: Fight | null, character?: Character | ID): string {
    if (!fight?.id) {
      return this.allCharacters(character)
    }
    return character?.id
      ? `${this.fights(fight)}/actors/${character.id}`
      : `${this.fights(fight)}/actors`
  }

  characterPdf(character: Character | ID): string {
    return `${this.allCharacters(character)}/pdf`
  }

  vehicles(fight?: Fight | null, vehicle?: Vehicle | ID): string {
    if (!fight?.id) {
      return this.allVehicles(vehicle)
    }
    return vehicle?.id
      ? `${this.fights(fight)}/drivers/${vehicle.id}`
      : `${this.fights(fight)}/drivers`
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
    return vehicle?.id
      ? `${this.api()}/vehicles/${vehicle.id}`
      : `${this.api()}/vehicles`
  }

  allCharacters(character?: Character | ID): string {
    return character?.id
      ? `${this.api()}/characters/${character.id}`
      : `${this.api()}/characters`
  }

  advancements(character: Character, advancement?: Advancement | ID): string {
    return advancement?.id
      ? `${this.allCharacters(character)}/advancements/${advancement.id}`
      : `${this.allCharacters(character)}/advancements`
  }

  junctures(juncture?: Juncture | ID): string {
    return juncture?.id
      ? `${this.api()}/junctures/${juncture.id}`
      : `${this.api()}/junctures`
  }

  allSites(site?: Site | ID): string {
    return site?.id ? `${this.api()}/sites/${site.id}` : `${this.api()}/sites`
  }

  sites(character: Character, site?: Site | ID): string {
    return site?.id
      ? `${this.allCharacters(character)}/sites/${site.id}`
      : `${this.allCharacters(character)}/sites`
  }

  effects(fight: Fight, effect?: Effect | ID): string {
    return effect?.id
      ? `${this.fights(fight)}/effects/${effect.id}`
      : `${this.fights(fight)}/effects`
  }

  characterEffects(
    fight: Fight,
    characterEffect?: CharacterEffect | ID
  ): string {
    return characterEffect?.id
      ? `${this.fights(fight)}/character_effects/${characterEffect.id}`
      : `${this.fights(fight)}/character_effects`
  }

  invitations(invitation?: Invitation): string {
    return invitation?.id
      ? `${this.api()}/invitations/${invitation.id}`
      : `${this.api()}/invitations`
  }

  currentCampaign() {
    return `${this.campaigns()}/current`
  }

  campaigns(campaign?: Campaign | ID) {
    return campaign
      ? `${this.api()}/campaigns/${campaign.id}`
      : `${this.api()}/campaigns`
  }

  campaignMemberships() {
    return `${this.api()}/campaign_memberships`
  }

  adminUsers(user?: User | ID): string {
    return user ? `${this.api()}/users/${user.id}` : `${this.api()}/users`
  }

  currentUser(): string {
    return `${this.api()}/users/current`
  }

  users(user?: User | ID): string {
    return user?.id ? `${this.api()}/users/${user.id}` : `${this.api()}/users`
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
    return faction?.id
      ? `${this.api()}/factions/${faction.id}`
      : `${this.api()}/factions`
  }

  notionCharacters(): string {
    return `${this.api()}/notion/characters`
  }

  characterSchticks(character: Character | ID, schtick?: Schtick | ID): string {
    return schtick?.id
      ? `${this.allCharacters(character)}/schticks/${schtick.id}`
      : `${this.allCharacters(character)}/schticks`
  }

  characterWeapons(character: Character | ID, weapon?: Weapon | ID): string {
    return weapon?.id
      ? `${this.allCharacters(character)}/weapons/${weapon.id}`
      : `${this.allCharacters(character)}/weapons`
  }

  weapons(weapon?: Weapon | ID): string {
    return weapon?.id
      ? `${this.api()}/weapons/${weapon.id}`
      : `${this.api()}/weapons`
  }

  schticks(schtick?: Schtick | ID): string {
    return schtick?.id
      ? `${this.api()}/schticks/${schtick.id}`
      : `${this.api()}/schticks`
  }

  importSchticks() {
    return `${this.schticks()}/import`
  }

  importWeapons() {
    return `${this.weapons()}/import`
  }
}

export default Api
