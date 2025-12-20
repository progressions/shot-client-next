import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Campaign,
  CampaignsResponse,
  Invitation,
  User,
  CacheOptions,
  Parameters_,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

type CampaignPayload =
  | Campaign
  | { campaign?: Campaign | null }
  | { campaign?: Campaign | null; user?: unknown }
  | null

function hasCampaignWrapper(payload: unknown): payload is {
  campaign?: Campaign | null
} {
  return (
    typeof payload === "object" &&
    payload !== null &&
    Object.prototype.toString.call(payload) === "[object Object]" &&
    "campaign" in payload
  )
}

function extractCampaign(payload: CampaignPayload): Campaign | null {
  if (!payload) {
    return null
  }

  if (hasCampaignWrapper(payload)) {
    return payload.campaign ?? null
  }

  return payload as Campaign
}

function normalizeCampaignResponse(
  response: AxiosResponse<CampaignPayload>
): AxiosResponse<Campaign | null> {
  const normalized = extractCampaign(response.data)
  ;(response as AxiosResponse<Campaign | null>).data = normalized
  return response as AxiosResponse<Campaign | null>
}

function normalizeRequiredCampaignResponse(
  response: AxiosResponse<CampaignPayload>
): AxiosResponse<Campaign> {
  const normalized = extractCampaign(response.data)

  if (!normalized) {
    throw new Error("Campaign data missing from response")
  }

  ;(response as AxiosResponse<Campaign>).data = normalized
  return response as AxiosResponse<Campaign>
}

export function createCampaignClient(deps: ClientDependencies) {
  const { apiV2, queryParams } = deps
  const {
    get,
    getPublic,
    post,
    patch,
    delete: delete_,
    requestFormData,
  } = createBaseClient(deps)

  async function addPlayer(
    user: User,
    campaign: Campaign
  ): Promise<AxiosResponse<Campaign>> {
    return post(apiV2.campaignMemberships(), {
      membership: {
        campaign_id: campaign.id,
        user_id: user.id,
      },
    })
  }

  async function removePlayer(
    user: User,
    campaign: Campaign
  ): Promise<AxiosResponse<void>> {
    const url = `${apiV2.campaignMemberships()}?campaign_id=${campaign.id}&user_id=${user.id}`
    return delete_(url)
  }

  async function getInvitation(
    invitation: Invitation | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Invitation>> {
    const id = typeof invitation === "string" ? invitation : invitation.id
    return getPublic(apiV2.invitations({ id } as Invitation), {}, cacheOptions)
  }

  async function getInvitations(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ invitations: Invitation[] }>> {
    return get(apiV2.invitations(), {}, cacheOptions)
  }

  async function createInvitation(
    email: string
  ): Promise<AxiosResponse<Invitation>> {
    return post(apiV2.invitations(), {
      invitation: { email },
    })
  }

  async function deleteInvitation(
    invitation: Invitation
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.invitations(invitation))
  }

  async function redeemInvitation(
    invitation: Invitation,
    user: User | string
  ): Promise<AxiosResponse<User>> {
    return patch(apiV2.invitationRedeem(invitation), { user: user })
  }

  async function registerInvitation(
    invitation: Invitation,
    userData: {
      first_name: string
      last_name: string
      password: string
      password_confirmation: string
    }
  ): Promise<AxiosResponse<{ message: string }>> {
    return post(apiV2.invitationRegister(invitation), userData)
  }

  async function resendInvitation(
    invitation: Invitation
  ): Promise<AxiosResponse<Invitation>> {
    return post(apiV2.invitationResend(invitation))
  }

  async function createCampaign(
    formData: FormData
  ): Promise<AxiosResponse<Campaign>> {
    const response = await requestFormData<CampaignPayload>(
      "POST",
      `${apiV2.campaigns()}`,
      formData
    )
    return normalizeRequiredCampaignResponse(response)
  }

  async function updateCampaign(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Campaign>> {
    const response = await requestFormData<CampaignPayload>(
      "PATCH",
      `${apiV2.campaigns({ id })}`,
      formData
    )
    return normalizeRequiredCampaignResponse(response)
  }

  async function getCampaigns(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<CampaignsResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.campaigns()}?${query}`, {}, cacheOptions)
  }

  async function getCampaign(
    campaign: Campaign | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Campaign>> {
    const response = await get<CampaignPayload>(
      apiV2.campaigns(campaign),
      {},
      cacheOptions
    )
    return normalizeRequiredCampaignResponse(response)
  }

  async function deleteCampaign(
    campaign: Campaign,
    params = {}
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.campaigns(campaign), params)
  }

  async function setCurrentCampaign(
    campaign: Campaign | null
  ): Promise<AxiosResponse<Campaign | null>> {
    if (campaign === null) {
      const response = await patch<CampaignPayload>(
        `${apiV2.campaigns()}/set`,
        { id: null }
      )
      return normalizeCampaignResponse(response)
    }
    const response = await patch<CampaignPayload>(
      `${apiV2.campaigns(campaign)}/set`,
      { id: campaign.id }
    )
    return normalizeCampaignResponse(response)
  }

  async function getCurrentCampaign(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Campaign | null>> {
    const response = await get<CampaignPayload>(
      apiV2.currentCampaign(),
      {},
      cacheOptions
    )
    return normalizeCampaignResponse(response)
  }

  async function getCurrentFight(
    campaignId: string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<import("@/types").Fight | null>> {
    return get(
      `${apiV2.campaigns({ id: campaignId })}/current_fight`,
      {},
      cacheOptions
    )
  }

  interface BatchImageGenerationResponse {
    message: string
    total_entities: number
    campaign_id: string
  }

  async function generateBatchImages(
    campaignId: string
  ): Promise<AxiosResponse<BatchImageGenerationResponse>> {
    return post(`${apiV2.campaigns({ id: campaignId })}/generate_batch_images`)
  }

  async function resetGrokCredits(
    campaignId: string
  ): Promise<AxiosResponse<Campaign>> {
    const response = await post<CampaignPayload>(
      apiV2.resetGrokCredits({ id: campaignId })
    )
    return normalizeRequiredCampaignResponse(response)
  }

  return {
    addPlayer,
    removePlayer,
    getInvitation,
    getInvitations,
    createInvitation,
    deleteInvitation,
    redeemInvitation,
    registerInvitation,
    resendInvitation,
    createCampaign,
    updateCampaign,
    getCampaigns,
    getCampaign,
    deleteCampaign,
    setCurrentCampaign,
    getCurrentCampaign,
    getCurrentFight,
    generateBatchImages,
    resetGrokCredits,
  }
}
