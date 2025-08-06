import axios, { AxiosResponse, AxiosRequestConfig } from "axios"
import { Api, ApiV2, queryParams } from "@/lib"
import type {
  Encounter,
  ImagePosition,
  NotionPage,
  Location,
  CharacterJson,
  Faction,
  UsersResponse,
  CharactersResponse,
  VehiclesResponse,
  FactionsResponse,
  SuggestionsResponse,
  PartiesResponse,
  WeaponsResponse,
  SchticksResponse,
  CampaignsResponse,
  SitesResponse,
  JuncturesResponse,
  Juncture,
  Person,
  FightsResponse,
  CharactersAndVehiclesResponse,
  PasswordWithConfirmation,
  Weapon,
  Site,
  Advancement,
  Schtick,
  CharacterEffect,
  Invitation,
  Campaign,
  Effect,
  Vehicle,
  Character,
  ID,
  Fight,
  FightEvent,
  Party,
  User,
  VehicleArchetype,
} from "@/types"
import { createConsumer, Consumer } from "@rails/actioncable"

interface ClientParameters {
  jwt?: string
}

interface CacheOptions {
  cache?: "default" | "no-store" | "force-cache"
  revalidate?: number
}

type Parameters_ = Record<string, unknown>

class Client {
  jwt?: string
  api: Api
  apiV2: ApiV2
  consumerInstance?: Consumer

  constructor(parameters: ClientParameters = {}) {
    if (parameters.jwt) {
      this.jwt = parameters.jwt
    }
    this.api = new Api()
    this.apiV2 = new ApiV2()
  }

  consumer() {
    if (this.jwt && this.consumerInstance) {
      return this.consumerInstance
    }
    const websocketUrl = this.api.cable(this.jwt)
    this.consumerInstance = createConsumer(websocketUrl)
    return this.consumerInstance
  }

  async getEncounter(fight?: Fight | ID): Promise<AxiosResponse<Encounter>> {
    return this.get(this.apiV2.encounters(fight), {}, { cache: "no-store" })
  }

  async createImagePosition(
    entity: Entity,
    parameters: Parameters_ = {
      context: "desktop_index",
      x_position: 0,
      y_position: 0,
    }
  ): Promise<AxiosResponse<Entity>> {
    return this.post(this.apiV2.imagePositions(entity), {
      image_position: parameters,
    })
  }

  async updateImagePosition(
    entity: Entity,
    imagePosition: ImagePosition
  ): Promise<AxiosResponse<ImagePosition>> {
    return this.patch(
      `${this.apiV2.imagePositions()}/${entity.entity_class}/${entity.id}`,
      {
        image_position: imagePosition,
      }
    )
  }

  async generateAiCharacter(
    parameters: { description: string } = { description: "" }
  ): Promise<AxiosResponse<CharacterJson>> {
    return this.post(this.api.ai(), { ai: parameters })
  }

  async generateAiImages(parameters: {
    entity: Entity
  }): Promise<AxiosResponse<string[]>> {
    const { entity } = parameters
    return this.post(this.apiV2.aiImages(), {
      entity_class: entity.entity_class,
      entity_id: entity.id,
    })
  }

  async attachImage(parameters: {
    entity: Entity
    imageUrl: string
  }): Promise<AxiosResponse<Entity>> {
    const { entity, imageUrl } = parameters
    return this.post(`${this.apiV2.aiImages()}/attach`, {
      ai_image: {
        entity_class: entity.entity_class,
        entity_id: entity.id,
        image_url: imageUrl,
      },
    })
  }

  async getSuggestions(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SuggestionsResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.api.suggestions()}?${query}`, {}, cacheOptions)
  }

  async getNotionCharacters(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<NotionPage[]>> {
    const query = queryParams(parameters)
    return this.get(`${this.api.notionCharacters()}?${query}`, {}, cacheOptions)
  }

  async getLocationForCharacter(
    character: Character,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Location>> {
    return this.get(
      this.api.locations(),
      { shot_id: character.shot_id } as Parameters_,
      cacheOptions
    )
  }

  async getLocationForVehicle(
    vehicle: Vehicle,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Location>> {
    return this.get(
      this.api.locations(),
      { shot_id: vehicle.shot_id } as Parameters_,
      cacheOptions
    )
  }

  async setCharacterLocation(
    character: Character,
    location: Location | ID
  ): Promise<AxiosResponse<Location>> {
    return this.post(this.api.locations(), {
      shot_id: character.shot_id,
      location: location,
    })
  }

  async setVehicleLocation(
    vehicle: Vehicle,
    location: Location | ID
  ): Promise<AxiosResponse<Location>> {
    return this.post(this.api.locations(), {
      shot_id: vehicle.shot_id,
      location: location,
    })
  }

  async addCharacterToParty(
    party: Party | ID,
    character: Character | ID
  ): Promise<AxiosResponse<Party>> {
    return this.post(this.api.memberships(party), {
      character_id: character.id,
    })
  }

  async addVehicleToParty(
    party: Party | ID,
    vehicle: Vehicle | ID
  ): Promise<AxiosResponse<Party>> {
    return this.post(this.api.memberships(party), { vehicle_id: vehicle.id })
  }

  async removeCharacterFromParty(
    party: Party | ID,
    character: Character | ID
  ): Promise<AxiosResponse<Party>> {
    return this.delete(`${this.api.memberships(party, character)}/character`)
  }

  async removeVehicleFromParty(
    party: Party | ID,
    vehicle: Vehicle | ID
  ): Promise<AxiosResponse<Party>> {
    return this.delete(`${this.api.memberships(party, vehicle)}/vehicle`)
  }

  async getParties(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<PartiesResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.parties()}?${query}`, {}, cacheOptions)
  }

  async getParty(
    party: Party | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Party>> {
    return this.get(this.apiV2.parties(party), {}, cacheOptions)
  }

  async deleteParty(party: Party | ID): Promise<AxiosResponse<void>> {
    return this.delete(this.apiV2.parties(party))
  }

  async createParty(formData: FormData): Promise<AxiosResponse<Party>> {
    return this.requestFormData("POST", `${this.apiV2.parties()}`, formData)
  }

  async updateParty(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Party>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.parties({ id })}`,
      formData
    )
  }

  async deletePartyImage(party: Party): Promise<AxiosResponse<void>> {
    return this.delete(`${this.api.parties(party)}/image`)
  }

  async addPartyToFight(
    party: Party | ID,
    fight: Fight | ID
  ): Promise<AxiosResponse<Party>> {
    return this.post(this.api.addPartyToFight(party, fight))
  }

  async getFights(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<FightsResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.fights()}?${query}`, {}, cacheOptions)
  }

  async getFight(
    fight: Fight | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Fight>> {
    return this.get(this.apiV2.fights(fight), {}, cacheOptions)
  }

  async createFight(formData: FormData): Promise<AxiosResponse<Fight>> {
    return this.requestFormData("POST", `${this.apiV2.fights()}`, formData)
  }

  async updateFight(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Fight>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.fights({ id })}`,
      formData
    )
  }

  async touchFight(fight: Fight | ID): Promise<AxiosResponse<Fight>> {
    return this.patch(`${this.apiV2.fights(fight)}/touch`)
  }

  async deleteFight(fight: Fight): Promise<AxiosResponse<void>> {
    return this.delete(this.apiV2.fights(fight))
  }

  async getFightEvents(
    fight: Fight | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<FightEvent[]>> {
    return this.get(this.api.fightEvents(fight), {}, cacheOptions)
  }

  async createFightEvent(
    fight: Fight | ID,
    fightEvent: FightEvent
  ): Promise<AxiosResponse<FightEvent>> {
    return this.post(this.api.fightEvents(fight), { fight_event: fightEvent })
  }

  async getCharacters(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<CharactersResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.characters()}?${query}`, {}, cacheOptions)
  }

  async getCharacterNames(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<CharactersResponse>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.apiV2.characters()}/names?${query}`,
      {},
      cacheOptions
    )
  }

  async getCharactersInFight(
    fight: Fight | ID,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Person[]>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.api.charactersAndVehicles(fight)}/characters?${query}`,
      {},
      cacheOptions
    )
  }

  async getVehicles(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<VehiclesResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.vehicles()}?${query}`, {}, cacheOptions)
  }

  async getVehiclesInFight(
    fight: Fight | ID,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<VehiclesResponse>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.api.charactersAndVehicles(fight)}/vehicles?${query}`,
      {},
      cacheOptions
    )
  }

  async getCharactersAndVehicles(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<CharactersAndVehiclesResponse>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.api.charactersAndVehicles()}?${query}`,
      {},
      cacheOptions
    )
  }

  async getCharacter(
    character: Character | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Person>> {
    return this.get(this.api.characters(null, character), {}, cacheOptions)
  }

  async getCharacterPdf(
    character: Character | ID
  ): Promise<AxiosResponse<string>> {
    const url = `${this.apiV2.characterPdf(character)}`
    return await axios({
      url: url,
      method: "GET",
      params: {},
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwt}`,
      },
      proxy: false,
    })
  }

  async getVehicle(
    vehicle: Vehicle | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Vehicle>> {
    return this.get(this.api.vehicles(null, vehicle), {}, cacheOptions)
  }

  async getVehicleArchetypes(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<VehicleArchetype[]>> {
    return this.get(`${this.api.vehicles()}/archetypes`, {}, cacheOptions)
  }

  async updateCharacter(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Character>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.characters({ id })}`,
      formData
    )
  }

  async duplicateCharacter(
    character: Character
  ): Promise<AxiosResponse<Person>> {
    return this.post(`${this.apiV2.characters(character)}/duplicate`)
  }

  async createCharacter(
    character: Character,
    fight?: Fight | null
  ): Promise<AxiosResponse<Person>> {
    return this.post(this.api.characters(fight, character), {
      character: character,
    })
  }

  async uploadCharacterPdf(
    formData: FormData
  ): Promise<AxiosResponse<Character>> {
    return this.requestFormData(
      "POST",
      `${this.apiV2.characters()}/pdf`,
      formData
    )
  }

  async deleteCharacter(
    character: Character,
    fight?: Fight | null
  ): Promise<AxiosResponse<void>> {
    return fight?.id
      ? this.delete(
          this.api.characters(fight, { id: character.shot_id } as Character)
        )
      : this.delete(this.apiV2.characters(character))
  }

  async deleteCharacterImage(
    character: Character
  ): Promise<AxiosResponse<void>> {
    return this.delete(`${this.api.characters(null, character)}/image`)
  }

  async syncCharacter(character: Character): Promise<AxiosResponse<Person>> {
    return this.post(`${this.api.characters(null, character)}/sync`)
  }

  async actCharacter(
    character: Character,
    fight: Fight,
    shots: number
  ): Promise<AxiosResponse<Character>> {
    return this.patch(
      this.api.actCharacter(fight, { id: character.id } as Character),
      {
        character: {
          id: character.id,
          shot_id: character.shot_id,
        } as Character,
        shots: shots,
      }
    )
  }

  async hideCharacter(
    fight: Fight,
    character: Character
  ): Promise<AxiosResponse<Character>> {
    return this.patch(
      this.api.hideCharacter(fight, { id: character.id } as Character),
      {
        character: {
          id: character.id,
          shot_id: character.shot_id,
        } as Character,
      }
    )
  }

  async showCharacter(
    fight: Fight,
    character: Character
  ): Promise<AxiosResponse<Character>> {
    return this.patch(
      this.api.revealCharacter(fight, { id: character.id } as Character),
      {
        character: {
          id: character.id,
          shot_id: character.shot_id,
        } as Character,
      }
    )
  }

  async addCharacter(
    fight: Fight,
    character: Character | ID
  ): Promise<AxiosResponse<Character>> {
    return this.post(this.api.addCharacter(fight, character), {
      character: { current_shot: 0 },
    })
  }

  async createVehicle(
    vehicle: Vehicle,
    fight?: Fight | null
  ): Promise<AxiosResponse<Vehicle>> {
    return this.post(this.api.vehicles(fight, vehicle), { vehicle: vehicle })
  }

  async updateVehicle(
    vehicle: Vehicle,
    fight?: Fight | null
  ): Promise<AxiosResponse<Vehicle>> {
    return this.patch(this.api.vehicles(fight, vehicle), { vehicle: vehicle })
  }

  async deleteVehicle(
    vehicle: Vehicle,
    fight?: Fight | null
  ): Promise<AxiosResponse<void>> {
    return this.delete(
      this.api.vehicles(fight, { id: vehicle.shot_id } as Vehicle)
    )
  }

  async deleteVehicleImage(vehicle: Vehicle): Promise<AxiosResponse<void>> {
    return this.delete(`${this.api.allVehicles(vehicle)}/image`)
  }

  async actVehicle(
    vehicle: Vehicle,
    fight: Fight,
    shots: number
  ): Promise<AxiosResponse<Vehicle>> {
    return this.patch(this.api.actVehicle(fight, vehicle), {
      vehicle: { id: vehicle.id, shot_id: vehicle.shot_id } as Vehicle,
      shots: shots,
    })
  }

  async addVehicle(
    fight: Fight,
    vehicle: Vehicle | ID
  ): Promise<AxiosResponse<Vehicle>> {
    return this.post(this.api.addVehicle(fight, vehicle), {
      vehicle: { current_shot: 0 },
    })
  }

  async hideVehicle(
    fight: Fight,
    vehicle: Vehicle | ID
  ): Promise<AxiosResponse<Vehicle>> {
    return this.patch(this.api.hideVehicle(fight, vehicle as Vehicle), {
      vehicle: vehicle,
    })
  }

  async showVehicle(
    fight: Fight,
    vehicle: Vehicle | ID
  ): Promise<AxiosResponse<Vehicle>> {
    return this.patch(this.api.revealVehicle(fight, vehicle as Vehicle), {
      vehicle: vehicle,
    })
  }

  async getAllVehicles(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Vehicle[]>> {
    return this.get(this.api.allVehicles(), {}, cacheOptions)
  }

  async getAllCharacters(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Character[]>> {
    return this.get(this.api.allCharacters(), {}, cacheOptions)
  }

  async createAdvancement(
    character: Character,
    advancement: Advancement
  ): Promise<AxiosResponse<Advancement>> {
    return this.post(this.api.advancements(character), {
      advancement: advancement,
    })
  }

  async deleteAdvancement(
    character: Character,
    advancement: Advancement
  ): Promise<AxiosResponse<void>> {
    return this.delete(this.api.advancements(character, advancement))
  }

  async getJunctures(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<JuncturesResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.junctures()}?${query}`, {}, cacheOptions)
  }

  async createJuncture(formData: FormData): Promise<AxiosResponse<Juncture>> {
    return this.requestFormData("POST", `${this.apiV2.junctures()}`, formData)
  }

  async updateJuncture(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Juncture>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.junctures({ id })}`,
      formData
    )
  }

  async getJuncture(
    juncture: Juncture | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Juncture>> {
    return this.get(this.apiV2.junctures(juncture), {}, cacheOptions)
  }

  async deleteJuncture(juncture: Juncture): Promise<AxiosResponse<void>> {
    return this.delete(this.apiV2.junctures(juncture))
  }

  async deleteJunctureImage(juncture: Juncture): Promise<AxiosResponse<void>> {
    return this.delete(`${this.apiV2.junctures(juncture)}/image`)
  }

  async getSites(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SitesResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.sites()}?${query}`, {}, cacheOptions)
  }

  async createSite(formData: FormData): Promise<AxiosResponse<Site>> {
    return this.requestFormData("POST", `${this.apiV2.sites()}`, formData)
  }

  async updateSite(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Site>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.sites({ id })}`,
      formData
    )
  }

  async getSite(
    site: Site | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Site>> {
    return this.get(this.apiV2.sites(site), {}, cacheOptions)
  }

  async deleteSite(site: Site): Promise<AxiosResponse<void>> {
    return this.delete(this.apiV2.sites(site))
  }

  async deleteSiteImage(site: Site): Promise<AxiosResponse<void>> {
    return this.delete(`${this.apiV2.sites(site)}/image`)
  }

  async addCharacterToSite(
    site: Site,
    character: Character
  ): Promise<AxiosResponse<Site>> {
    return this.post(this.api.sites(character), { site: site })
  }

  async removeCharacterFromSite(
    site: Site,
    character: Character
  ): Promise<AxiosResponse<void>> {
    return this.delete(this.api.sites(character, site))
  }

  async createEffect(
    effect: Effect,
    fight: Fight
  ): Promise<AxiosResponse<Effect>> {
    return this.post(this.api.effects(fight, effect), { effect: effect })
  }

  async updateEffect(
    effect: Effect,
    fight: Fight
  ): Promise<AxiosResponse<Effect>> {
    return this.patch(this.api.effects(fight, effect), { effect: effect })
  }

  async deleteEffect(
    effect: Effect,
    fight: Fight
  ): Promise<AxiosResponse<void>> {
    return this.delete(this.api.effects(fight, effect))
  }

  async createCharacterEffect(
    characterEffect: CharacterEffect,
    fight: Fight
  ): Promise<AxiosResponse<CharacterEffect>> {
    return this.post(this.api.characterEffects(fight), {
      character_effect: characterEffect,
    })
  }

  async updateCharacterEffect(
    characterEffect: CharacterEffect,
    fight: Fight
  ): Promise<AxiosResponse<CharacterEffect>> {
    return this.patch(this.api.characterEffects(fight, characterEffect), {
      character_effect: characterEffect,
    })
  }

  async deleteCharacterEffect(
    characterEffect: CharacterEffect,
    fight: Fight
  ): Promise<AxiosResponse<void>> {
    return this.delete(this.api.characterEffects(fight, characterEffect))
  }

  async addPlayer(
    user: User,
    campaign: Campaign
  ): Promise<AxiosResponse<Campaign>> {
    return this.post(this.api.campaignMemberships(), {
      campaign_id: campaign.id,
      user_id: user.id,
    })
  }

  async removePlayer(
    user: User,
    campaign: Campaign
  ): Promise<AxiosResponse<void>> {
    const url = `${this.api.campaignMemberships()}?campaign_id=${campaign.id}&user_id=${user.id}`
    return this.delete(url)
  }

  async getInvitation(
    invitation: Invitation | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Invitation>> {
    return this.get(
      this.api.invitations(invitation as Invitation),
      {},
      cacheOptions
    )
  }

  async createInvitation(
    invitation: Invitation,
    campaign: Campaign
  ): Promise<AxiosResponse<Invitation>> {
    return this.post(this.api.invitations(), {
      invitation: { ...invitation, campaign_id: campaign.id },
    })
  }

  async deleteInvitation(invitation: Invitation): Promise<AxiosResponse<void>> {
    return this.delete(this.api.invitations(invitation))
  }

  async redeemInvitation(
    invitation: Invitation,
    user: User | ID
  ): Promise<AxiosResponse<User>> {
    return this.patch(`${this.api.invitations(invitation)}/redeem`, {
      user: user,
    })
  }

  async resendInvitation(invitation: Invitation): Promise<AxiosResponse<void>> {
    return this.post(`${this.api.invitations(invitation)}/resend`)
  }

  async createCampaign(formData: FormData): Promise<AxiosResponse<Campaign>> {
    return this.requestFormData("POST", `${this.apiV2.campaigns()}`, formData)
  }

  async updateCampaign(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Campaign>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.campaigns({ id })}`,
      formData
    )
  }

  async getCampaigns(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<CampaignsResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.campaigns()}?${query}`, {}, cacheOptions)
  }

  async getCampaign(
    campaign: Campaign | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Campaign>> {
    return this.get(this.apiV2.campaigns(campaign), {}, cacheOptions)
  }

  async deleteCampaign(campaign: Campaign): Promise<AxiosResponse<void>> {
    return this.delete(this.apiV2.campaigns(campaign))
  }

  async setCurrentCampaign(
    campaign: Campaign | null
  ): Promise<AxiosResponse<Campaign | null>> {
    return this.post(this.apiV2.currentCampaign(), { id: campaign?.id })
  }

  async getCurrentCampaign(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Campaign | null>> {
    return this.get(this.apiV2.currentCampaign(), {}, cacheOptions)
  }

  async createUser(user: User): Promise<AxiosResponse<User>> {
    return this.post(this.api.registerUser(), { user: user })
  }

  async updateUser(user: User): Promise<AxiosResponse<User>> {
    return this.patch(this.api.adminUsers(user), { user: user })
  }

  async deleteUser(user: User): Promise<AxiosResponse<void>> {
    return this.delete(this.api.adminUsers(user))
  }

  async deleteUserImage(user: User): Promise<AxiosResponse<void>> {
    return this.delete(`${this.api.users(user)}/image`)
  }

  async getUser(
    user: User | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<User>> {
    return this.get(this.api.adminUsers(user), {}, cacheOptions)
  }

  async getCurrentUser(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<User>> {
    return this.get(this.api.currentUser(), {}, cacheOptions)
  }

  async unlockUser(unlock_token: string): Promise<AxiosResponse<User>> {
    return this.get(`${this.api.unlockUser()}?unlock_token=${unlock_token}`)
  }

  async confirmUser(confirmation_token: string): Promise<AxiosResponse<User>> {
    return this.post(this.api.confirmUser(), {
      confirmation_token: confirmation_token,
    })
  }

  async sendResetPasswordLink(email: string): Promise<AxiosResponse<void>> {
    return this.post(this.api.resetUserPassword(), {
      user: { email: email },
    })
  }

  async resetUserPassword(
    reset_password_token: string,
    password: PasswordWithConfirmation
  ): Promise<AxiosResponse<User>> {
    return this.patch(this.api.resetUserPassword(), {
      user: { ...password, reset_password_token: reset_password_token },
    })
  }

  async getUsers(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<UsersResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.users()}?${query}`, {}, cacheOptions)
  }

  async getFaction(
    faction: Faction | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Faction>> {
    return this.get(this.apiV2.factions(faction), {}, cacheOptions)
  }

  async getFactions(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<FactionsResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.factions()}?${query}`, {}, cacheOptions)
  }

  async createFaction(formData: FormData): Promise<AxiosResponse<Faction>> {
    return this.requestFormData("POST", `${this.apiV2.factions()}`, formData)
  }

  async updateFaction(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Faction>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.factions({ id })}`,
      formData
    )
  }

  async deleteFactionImage(faction: Faction): Promise<AxiosResponse<void>> {
    return this.delete(`${this.apiV2.factions(faction)}/image`)
  }

  async deleteFaction(faction: Faction | ID): Promise<AxiosResponse<void>> {
    return this.delete(this.apiV2.factions(faction))
  }

  async getWeaponsBatch(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<WeaponsResponse>> {
    return this.post(
      `${this.apiV2.weapons()}/batch`,
      {
        ...parameters,
      },
      cacheOptions
    )
  }

  async getSchticksBatch(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SchticksResponse>> {
    return this.post(
      `${this.apiV2.schticks()}/batch`,
      {
        ...parameters,
      },
      cacheOptions
    )
  }

  async getSchtickPaths(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ paths: string[] }>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.schtickPaths()}?${query}`, {}, cacheOptions)
  }

  async getSchtickCategories(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ categories: string[] }>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.apiV2.schtickCategories()}?${query}`,
      {},
      cacheOptions
    )
  }

  async getSchticks(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SchticksResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.schticks()}?${query}`, {}, cacheOptions)
  }

  async getSchtick(
    schtick: Schtick | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Schtick>> {
    return this.get(this.apiV2.schticks(schtick), {}, cacheOptions)
  }

  async createSchtick(formData: FormData): Promise<AxiosResponse<Schtick>> {
    return this.requestFormData("POST", `${this.apiV2.schticks()}`, formData)
  }

  async updateSchtick(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Schtick>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.schticks({ id })}`,
      formData
    )
  }

  async deleteSchtick(schtick: Schtick): Promise<AxiosResponse<void>> {
    return this.delete(this.apiV2.schticks(schtick))
  }

  async getCharacterSchticks(
    character: Character | ID,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<SchticksResponse>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.api.characterSchticks(character)}?${query}`,
      {},
      cacheOptions
    )
  }

  async addSchtick(
    character: Character | ID,
    schtick: Schtick
  ): Promise<AxiosResponse<Character>> {
    return this.post(this.api.characterSchticks(character), {
      schtick: schtick,
    })
  }

  async uploadSchticks(content: string): Promise<AxiosResponse<void>> {
    return this.post(this.api.importSchticks(), { schtick: { yaml: content } })
  }

  async removeSchtick(
    character: Character | ID,
    schtick: Schtick | ID
  ): Promise<AxiosResponse<void>> {
    return this.delete(this.api.characterSchticks(character, schtick))
  }

  async getCharacterWeapons(
    character: Character | ID,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<WeaponsResponse>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.api.characterWeapons(character)}?${query}`,
      {},
      cacheOptions
    )
  }

  async getWeapons(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<WeaponsResponse>> {
    const query = queryParams(parameters)
    return this.get(`${this.apiV2.weapons()}?${query}`, {}, cacheOptions)
  }

  async getWeapon(
    weapon: Weapon | ID,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Weapon>> {
    return this.get(this.apiV2.weapons(weapon), {}, cacheOptions)
  }

  async getWeaponJunctures(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ junctures: string[] }>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.apiV2.weaponJunctures()}?${query}`,
      {},
      cacheOptions
    )
  }

  async getWeaponCategories(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ categories: string[] }>> {
    const query = queryParams(parameters)
    return this.get(
      `${this.apiV2.weaponCategories()}?${query}`,
      {},
      cacheOptions
    )
  }

  async createWeapon(formData: FormData): Promise<AxiosResponse<Weapon>> {
    return this.requestFormData("POST", `${this.apiV2.weapons()}`, formData)
  }

  async updateWeapon(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Weapon>> {
    return this.requestFormData(
      "PATCH",
      `${this.apiV2.weapons({ id })}`,
      formData
    )
  }

  async deleteWeapon(
    weapon: Weapon,
    params = {}
  ): Promise<AxiosResponse<void>> {
    return this.delete(`${this.apiV2.weapons(weapon)}`, params)
  }

  async deleteWeaponImage(weapon: Weapon): Promise<AxiosResponse<void>> {
    return this.delete(`${this.apiV2.weapons(weapon)}/image`)
  }

  async addWeapon(
    character: Character | ID,
    weapon: Weapon
  ): Promise<AxiosResponse<Character>> {
    return this.post(this.api.characterWeapons(character), { weapon: weapon })
  }

  async uploadWeapons(content: string): Promise<AxiosResponse<void>> {
    return this.post(this.api.importWeapons(), { weapon: { yaml: content } })
  }

  async removeWeapon(
    character: Character | ID,
    weapon: Weapon | ID
  ): Promise<AxiosResponse<Weapon>> {
    return this.delete(this.api.characterWeapons(character, weapon))
  }

  async patch<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    return await this.request("PATCH", url, parameters, cacheOptions)
  }

  async post<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    return await this.request("POST", url, parameters, cacheOptions)
  }

  async request<T>(
    method: string,
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    const headers: { [key: string]: string } = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.jwt}`,
    }

    if (cacheOptions.cache === "no-store") {
      headers["Cache-Control"] =
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    } else if (cacheOptions.cache === "force-cache") {
      headers["Cache-Control"] = `max-age=${cacheOptions.revalidate || 3600}`
    }

    const config: AxiosRequestConfig = {
      url: url,
      method: method,
      headers: headers,
      proxy: false,
    }

    if (method === "GET") {
      config.params = parameters
    } else {
      config.data = parameters
    }

    return await axios(config)
  }

  async get<T>(
    url: string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<T>> {
    if (!this.jwt) {
      console.error("No JWT provided, cannot make GET request", url)
      throw new Error("No JWT provided")
    }

    const headers: { [key: string]: string } = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.jwt}`,
    }

    if (cacheOptions.cache === "no-store") {
      headers["Cache-Control"] =
        "no-store, no-cache, must-revalidate, proxy-revalidate"
    } else if (cacheOptions.cache === "force-cache") {
      headers["Cache-Control"] = `max-age=${cacheOptions.revalidate || 3600}`
    }

    const config: AxiosRequestConfig = {
      url: url,
      method: "GET",
      params: parameters,
      headers: headers,
      proxy: false,
    }

    return await axios(config)
  }

  async delete<T>(
    url: string,
    parameters: Parameters_ = {}
  ): Promise<AxiosResponse<T>> {
    return await axios({
      url: url,
      method: "DELETE",
      params: parameters,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwt}`,
      },
      proxy: false,
    })
  }

  async requestFormData<T>(
    method: string,
    url: string,
    formData: FormData
  ): Promise<AxiosResponse<T>> {
    return await axios({
      url: url,
      method: method,
      data: formData,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${this.jwt}`,
      },
      proxy: false,
    }).catch(error => {
      console.error("Error in requestFormData:", error)
      throw error
    })
  }
}

export default Client
