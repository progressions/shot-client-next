import Cookies from "js-cookie"
import Api from "@/lib/Api"
import ApiV2 from "@/lib/ApiV2"
import { queryParams } from "@/lib/queryParams"
import { consumer as createUnifiedConsumer } from "@/lib/client/websocketClient"
import * as auth from "@/lib/client/authClient"
import * as character from "@/lib/client/characterClient"
import * as vehicle from "@/lib/client/vehicleClient"
import * as fight from "@/lib/client/fightClient"
import * as party from "@/lib/client/partyClient"
import * as campaign from "@/lib/client/campaignClient"
import * as site from "@/lib/client/siteClient"
import * as faction from "@/lib/client/factionClient"
import * as weapon from "@/lib/client/weaponClient"
import * as schtick from "@/lib/client/schtickClient"
import * as adventure from "@/lib/client/adventureClient"
import * as ai from "@/lib/client/aiClient"
import * as editor from "@/lib/client/editorClient"
import * as characterEffect from "@/lib/client/characterEffectClient"
import * as effect from "@/lib/client/effectClient"
import * as chaseRelationship from "@/lib/client/chaseRelationshipClient"
import * as mediaLibrary from "@/lib/client/mediaLibraryClient"
import * as notification from "@/lib/client/notificationClient"
import * as notion from "@/lib/client/notionClient"
import * as search from "@/lib/client/searchClient"
import * as backlink from "@/lib/client/backlinkClient"
import * as location from "@/lib/client/locationClient"
import * as locationConnection from "@/lib/client/locationConnectionClient"

interface ClientParameters {
  jwt?: string
}

/**
 * Factory function to create the main API client with all entity operations.
 * Aggregates all domain-specific clients (characters, campaigns, fights, etc.)
 * into a single unified client interface.
 *
 * @param parameters - Optional configuration with JWT token
 * @param parameters.jwt - JWT token for authentication (falls back to localStorage/cookies)
 *
 * @returns Unified client object with methods for all API operations:
 * - Authentication: signIn, signOut, register
 * - Characters: getCharacters, getCharacter, createCharacter, updateCharacter, deleteCharacter
 * - Campaigns: getCampaigns, getCampaign, activateCampaign, etc.
 * - Fights, Parties, Sites, Factions, Weapons, Schticks, Vehicles, etc.
 * - AI: generateAiCharacter, generateAiImages
 * - WebSocket: consumer() for real-time subscriptions
 *
 * @example
 * ```tsx
 * // Client-side with auto-detected JWT
 * const client = createClient()
 * const characters = await client.getCharacters()
 *
 * // Server-side with explicit JWT
 * const client = createClient({ jwt: token })
 * const campaign = await client.getCampaign(id)
 * ```
 */
export default function createClient(parameters: ClientParameters = {}) {
  // Check for JWT token: parameters > localStorage > cookies
  let jwt = parameters.jwt
  if (!jwt && typeof window !== "undefined") {
    jwt = localStorage.getItem("jwtToken") || Cookies.get("jwtToken")
  }
  if (!jwt) {
    console.warn("No JWT provided or found in localStorage/cookies")
  }
  const api = new Api()
  const apiV2 = new ApiV2()
  const consumerInstance = createUnifiedConsumer({ jwt, api })

  return {
    jwt,
    api,
    apiV2,
    consumer: () => consumerInstance,
    ...auth.createAuthClient({ jwt, api, apiV2, queryParams }),
    ...character.createCharacterClient({ jwt, api, apiV2, queryParams }),
    ...vehicle.createVehicleClient({ jwt, api, apiV2, queryParams }),
    ...fight.createFightClient({ jwt, api, apiV2, queryParams }),
    ...party.createPartyClient({ jwt, api, apiV2, queryParams }),
    ...campaign.createCampaignClient({ jwt, api, apiV2, queryParams }),
    ...site.createSiteClient({ jwt, api, apiV2, queryParams }),
    ...faction.createFactionClient({ jwt, api, apiV2, queryParams }),
    ...weapon.createWeaponClient({ jwt, api, apiV2, queryParams }),
    ...schtick.createSchtickClient({ jwt, api, apiV2, queryParams }),
    ...adventure.createAdventureClient({ jwt, api, apiV2, queryParams }),
    ...ai.createAiClient({ jwt, api, apiV2 }),
    ...editor.createEditorClient({ jwt, api, apiV2, queryParams }),
    ...characterEffect.createCharacterEffectClient({
      jwt,
      api,
      apiV2,
      queryParams,
    }),
    ...effect.createEffectClient({
      jwt,
      api,
      apiV2,
      queryParams,
    }),
    ...chaseRelationship.createChaseRelationshipClient({
      jwt,
      api,
      apiV2,
      queryParams,
    }),
    ...mediaLibrary.createMediaLibraryClient({ jwt, apiV2 }),
    ...notification.createNotificationClient({ jwt, apiV2, queryParams }),
    ...notion.createNotionClient({ jwt, api, apiV2, queryParams }),
    ...search.createSearchClient({ jwt, apiV2, queryParams }),
    ...backlink.createBacklinkClient({ jwt, apiV2 }),
    ...location.createLocationClient({ jwt, api, apiV2, queryParams }),
    ...locationConnection.createLocationConnectionClient({
      jwt,
      api,
      apiV2,
      queryParams,
    }),
  }
}
