import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { Campaign, CampaignsResponse, Invitation, User, CacheOptions, Parameters_ } from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createCampaignClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const { get, post, patch, delete: delete_, requestFormData } = createBaseClient(deps)

  async function addPlayer(user: User, campaign: Campaign): Promise<AxiosResponse<Campaign>> {
    return post(api.campaignMemberships(), {
      campaign_id: campaign.id,
      user_id: user.id,
    })
  }

  async function removePlayer(user: User, campaign: Campaign): Promise<AxiosResponse<void>> {
    const url = `${api.campaignMemberships()}?campaign_id=${campaign.id}&user_id=${user.id}`
    return delete_(url)
  }

  async function getInvitation(
    invitation: Invitation | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Invitation>> {
    return get(api.invitations(invitation as Invitation), {}, cacheOptions)
  }

  async function createInvitation(
    invitation: Invitation,
    campaign: Campaign
  ): Promise<AxiosResponse<Invitation>> {
    return post(api.invitations(), {
      invitation: { ...invitation, campaign_id: campaign.id },
    })
  }

  async function deleteInvitation(invitation: Invitation): Promise<AxiosResponse<void>> {
    return delete_(api.invitations(invitation))
  }

  async function redeemInvitation(
    invitation: Invitation,
    user: User | string
  ): Promise<AxiosResponse<User>> {
    return patch(`${api.invitations(invitation)}/redeem`, { user: user })
  }

  async function resendInvitation(invitation: Invitation): Promise<AxiosResponse<void>> {
    return post(`${api.invitations(invitation)}/resend`)
  }

  async function createCampaign(formData: FormData): Promise<AxiosResponse<Campaign>> {
    return requestFormData("POST", `${apiV2.campaigns()}`, formData)
  }

  async function updateCampaign(id: string, formData: FormData): Promise<AxiosResponse<Campaign>> {
    return requestFormData("PATCH", `${apiV2.campaigns({ id })}`, formData)
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
    return get(apiV2.campaigns(campaign), {}, cacheOptions)
  }

  async function deleteCampaign(campaign: Campaign): Promise<AxiosResponse<void>> {
    return delete_(apiV2.campaigns(campaign))
  }

  async function setCurrentCampaign(
    campaign: Campaign | null
  ): Promise<AxiosResponse<Campaign | null>> {
    return post(apiV2.currentCampaign(), { id: campaign?.id })
  }

  async function getCurrentCampaign(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Campaign | null>> {
    return get(apiV2.currentCampaign(), {}, cacheOptions)
  }

  return {
    addPlayer,
    removePlayer,
    getInvitation,
    createInvitation,
    deleteInvitation,
    redeemInvitation,
    resendInvitation,
    createCampaign,
    updateCampaign,
    getCampaigns,
    getCampaign,
    deleteCampaign,
    setCurrentCampaign,
    getCurrentCampaign
  }
}
