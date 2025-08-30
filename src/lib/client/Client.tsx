import Cookies from "js-cookie"
import Api from "@/lib/Api"
import ApiV2 from "@/lib/ApiV2"
import { queryParams } from "@/lib/queryParams"
import { createConsumer } from "@rails/actioncable"
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
import * as ai from "@/lib/client/aiClient"
import * as editor from "@/lib/client/editorClient"

interface ClientParameters {
  jwt?: string
}

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
  const websocketUrl = api.cable(jwt)
  const consumerInstance = createConsumer(websocketUrl)

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
    ...ai.createAiClient({ jwt, api, apiV2 }),
    ...editor.createEditorClient({ jwt, api, apiV2, queryParams }),
  }
}
