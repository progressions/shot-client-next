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
  private id(entity?: { id?: string } | ID | string): string | undefined {
    if (!entity) return undefined
    if (typeof entity === "string") return entity
    return (entity as { id?: string }).id
  }

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
    const id = this.id(location)
    return id ? `${this.api()}/locations/${id}` : `${this.api()}/locations`
  }

  memberships(party: Party | ID, person?: Character | Vehicle | ID): string {
    const memberId = this.id(person)
    return memberId
      ? `${this.parties(party)}/memberships/${memberId}`
      : `${this.parties(party)}/memberships`
  }

  parties(party?: Party | ID): string {
    const id = this.id(party)
    return id ? `${this.api()}/parties/${id}` : `${this.api()}/parties`
  }

  addPartyToFight(party: Party | ID, fight: Fight | ID): string {
    return `${this.parties(party)}/fight/${this.id(fight)}`
  }

  fights(fight?: Fight | ID): string {
    const id = this.id(fight)
    return id ? `${this.api()}/fights/${id}` : `${this.api()}/fights`
  }

  fightEvents(fight: Fight | ID): string {
    return `${this.fights(fight)}/fight_events`
  }

  charactersAndVehicles(fight?: Fight | ID): string {
    const id = this.id(fight)
    return id
      ? `${this.api()}/characters_and_vehicles/${id}`
      : `${this.api()}/characters_and_vehicles`
  }

  characters(fight?: Fight | null, character?: Character | ID): string {
    const fightId = this.id(fight || undefined)
    if (!fightId) {
      return this.allCharacters(character)
    }
    const characterId = this.id(character)
    return characterId
      ? `${this.fights(fightId)}/actors/${characterId}`
      : `${this.fights(fightId)}/actors`
  }

  characterPdf(character: Character | ID): string {
    return `${this.allCharacters(character)}/pdf`
  }

  vehicles(fight?: Fight | null, vehicle?: Vehicle | ID): string {
    const fightId = this.id(fight || undefined)
    if (!fightId) {
      return this.allVehicles(vehicle)
    }
    const vehicleId = this.id(vehicle)
    return vehicleId
      ? `${this.fights(fightId)}/drivers/${vehicleId}`
      : `${this.fights(fightId)}/drivers`
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
    const id = this.id(vehicle)
    return id ? `${this.api()}/vehicles/${id}` : `${this.api()}/vehicles`
  }

  allCharacters(character?: Character | ID): string {
    const id = this.id(character)
    return id ? `${this.api()}/characters/${id}` : `${this.api()}/characters`
  }

  advancements(character: Character, advancement?: Advancement | ID): string {
    const advId = this.id(advancement)
    return advId
      ? `${this.allCharacters(character)}/advancements/${advId}`
      : `${this.allCharacters(character)}/advancements`
  }

  junctures(juncture?: Juncture | ID): string {
    const id = this.id(juncture)
    return id ? `${this.api()}/junctures/${id}` : `${this.api()}/junctures`
  }

  allSites(site?: Site | ID): string {
    const id = this.id(site)
    return id ? `${this.api()}/sites/${id}` : `${this.api()}/sites`
  }

  sites(character: Character, site?: Site | ID): string {
    const siteId = this.id(site)
    return siteId
      ? `${this.allCharacters(character)}/sites/${siteId}`
      : `${this.allCharacters(character)}/sites`
  }

  effects(fight: Fight, effect?: Effect | ID): string {
    const effectId = this.id(effect)
    return effectId
      ? `${this.fights(fight)}/effects/${effectId}`
      : `${this.fights(fight)}/effects`
  }

  characterEffects(
    fight: Fight,
    characterEffect?: CharacterEffect | ID
  ): string {
    const effectId = this.id(characterEffect)
    return effectId
      ? `${this.fights(fight)}/character_effects/${effectId}`
      : `${this.fights(fight)}/character_effects`
  }

  invitations(invitation?: Invitation): string {
    const id = this.id(invitation)
    return id ? `${this.api()}/invitations/${id}` : `${this.api()}/invitations`
  }

  currentCampaign() {
    return `${this.campaigns()}/current`
  }

  campaigns(campaign?: Campaign | ID) {
    const id = this.id(campaign)
    return id ? `${this.api()}/campaigns/${id}` : `${this.api()}/campaigns`
  }

  campaignMemberships() {
    return `${this.api()}/campaign_memberships`
  }

  adminUsers(user?: User | ID): string {
    const id = this.id(user)
    return id ? `${this.api()}/users/${id}` : `${this.api()}/users`
  }

  currentUser(): string {
    return `${this.api()}/users/current`
  }

  users(user?: User | ID): string {
    const id = this.id(user)
    return id ? `${this.api()}/users/${id}` : `${this.api()}/users`
  }

  unlockUser(): string {
    return `${this.base()}/users/unlock`
  }

  confirmUser(): string {
    return `${this.base()}/users/confirmation`
  }

  resendConfirmation(): string {
    return `${this.base()}/users/confirmation/resend`
  }

  resetUserPassword(): string {
    return `${this.base()}/users/password`
  }

  // OTP Passwordless Login
  otpRequest(): string {
    return `${this.base()}/users/otp/request`
  }

  otpVerify(): string {
    return `${this.base()}/users/otp/verify`
  }

  otpMagicLink(token: string): string {
    return `${this.base()}/users/otp/magic/${token}`
  }

  signIn(): string {
    return `${this.base()}/users/sign_in`
  }

  registerUser(): string {
    return `${this.base()}/users`
  }

  factions(faction?: Faction | ID | string): string {
    const id = this.id(faction)
    return id ? `${this.api()}/factions/${id}` : `${this.api()}/factions`
  }

  notionCharacters(): string {
    return `${this.api()}/notion/characters`
  }

  characterSchticks(character: Character | ID, schtick?: Schtick | ID): string {
    const schtickId = this.id(schtick)
    return schtickId
      ? `${this.allCharacters(character)}/schticks/${schtickId}`
      : `${this.allCharacters(character)}/schticks`
  }

  characterWeapons(character: Character | ID, weapon?: Weapon | ID): string {
    const weaponId = this.id(weapon)
    return weaponId
      ? `${this.allCharacters(character)}/weapons/${weaponId}`
      : `${this.allCharacters(character)}/weapons`
  }

  weapons(weapon?: Weapon | ID): string {
    const id = this.id(weapon)
    return id ? `${this.api()}/weapons/${id}` : `${this.api()}/weapons`
  }

  schticks(schtick?: Schtick | ID): string {
    const id = this.id(schtick)
    return id ? `${this.api()}/schticks/${id}` : `${this.api()}/schticks`
  }

  importSchticks() {
    return `${this.schticks()}/import`
  }

  importWeapons() {
    return `${this.weapons()}/import`
  }
}

export default Api
