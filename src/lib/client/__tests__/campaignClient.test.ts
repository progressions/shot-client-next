import { AxiosResponse } from "axios"
import { createCampaignClient } from "../campaignClient"
import { createBaseClient } from "../baseClient"
import type { Campaign, Invitation } from "@/types"

// Mock the baseClient
jest.mock("../baseClient")
const mockCreateBaseClient = createBaseClient as jest.MockedFunction<
  typeof createBaseClient
>

describe("createCampaignClient", () => {
  // Mock API V2 object
  const mockApiV2 = {
    campaigns: jest.fn((campaign?: { id: string } | string) =>
      campaign
        ? `/api/v2/campaigns/${typeof campaign === "string" ? campaign : campaign.id}`
        : "/api/v2/campaigns"
    ),
    resetGrokCredits: jest.fn(
      (campaign: { id: string }) =>
        `/api/v2/campaigns/${campaign.id}/reset_grok_credits`
    ),
    invitations: jest.fn((invitation?: { id: string }) =>
      invitation
        ? `/api/v2/invitations/${invitation.id}`
        : "/api/v2/invitations"
    ),
    invitationResend: jest.fn(
      (invitation: { id: string }) =>
        `/api/v2/invitations/${invitation.id}/resend`
    ),
  }

  const mockApi = {}

  const mockQueryParams = jest.fn((params: Record<string, unknown>) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join("&")
  })

  // Mock base client methods
  const mockGet = jest.fn()
  const mockPost = jest.fn()
  const mockPatch = jest.fn()
  const mockDelete = jest.fn()
  const mockRequestFormData = jest.fn()

  const mockBaseClient = {
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
    requestFormData: mockRequestFormData,
    request: jest.fn(),
  }

  const mockJWT = "test-jwt-token"
  const deps = {
    jwt: mockJWT,
    api: mockApi,
    apiV2: mockApiV2,
    queryParams: mockQueryParams,
  }

  let campaignClient: ReturnType<typeof createCampaignClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateBaseClient.mockReturnValue(mockBaseClient)
    campaignClient = createCampaignClient(deps)
  })

  describe("resetGrokCredits", () => {
    const mockCampaign: Campaign = {
      id: "campaign-123",
      name: "Test Campaign",
      description: null,
      active: true,
      user_id: "user-456",
      gamemaster_id: "user-456",
      gamemaster: {
        id: "user-456",
        name: "Test User",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        active: true,
        admin: false,
        gamemaster: true,
        current_campaign_id: "campaign-123",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        entity_class: "User",
      },
      members: [],
      users: [],
      user_ids: [],
      fights: [],
      characters: [],
      image_positions: [],
      image_url: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      grok_credits_exhausted_at: null,
      is_grok_credits_exhausted: false,
      batch_image_status: null,
      batch_images_completed: 0,
      batch_images_total: 0,
      is_batch_images_in_progress: false,
      seeding_status: null,
      seeding_images_completed: 0,
      seeding_images_total: 0,
      is_seeding: false,
      seeded_at: null,
      is_seeded: false,
      entity_class: "Campaign",
    }

    const mockCampaignResponse: AxiosResponse<Campaign> = {
      data: mockCampaign,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse["config"],
    }

    beforeEach(() => {
      mockPost.mockResolvedValue(mockCampaignResponse)
    })

    it("calls the correct API endpoint with campaign ID", async () => {
      await campaignClient.resetGrokCredits("campaign-123")

      expect(mockApiV2.resetGrokCredits).toHaveBeenCalledWith({
        id: "campaign-123",
      })
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v2/campaigns/campaign-123/reset_grok_credits"
      )
    })

    it("returns normalized campaign data on successful reset", async () => {
      const result = await campaignClient.resetGrokCredits("campaign-123")

      expect(result.data.id).toBe("campaign-123")
      expect(result.data.name).toBe("Test Campaign")
      expect(result.data.grok_credits_exhausted_at).toBeNull()
      expect(result.data.is_grok_credits_exhausted).toBe(false)
    })

    it("returns campaign with cleared batch image status", async () => {
      const result = await campaignClient.resetGrokCredits("campaign-123")

      expect(result.data.batch_image_status).toBeNull()
      expect(result.data.batch_images_completed).toBe(0)
      expect(result.data.batch_images_total).toBe(0)
      expect(result.data.is_batch_images_in_progress).toBe(false)
    })

    it("propagates error when campaign not found", async () => {
      const notFoundError = new Error("Campaign not found")
      mockPost.mockRejectedValue(notFoundError)

      await expect(
        campaignClient.resetGrokCredits("invalid-campaign")
      ).rejects.toThrow("Campaign not found")
    })

    it("propagates error when user is not authorized", async () => {
      const forbiddenError = new Error("Forbidden")
      mockPost.mockRejectedValue(forbiddenError)

      await expect(
        campaignClient.resetGrokCredits("campaign-123")
      ).rejects.toThrow("Forbidden")
    })

    it("propagates error on network failure", async () => {
      const networkError = new Error("Network Error")
      mockPost.mockRejectedValue(networkError)

      await expect(
        campaignClient.resetGrokCredits("campaign-123")
      ).rejects.toThrow("Network Error")
    })
  })

  describe("getInvitations", () => {
    const mockInvitation: Invitation = {
      id: "invitation-123",
      email: "test@example.com",
      campaign_id: "campaign-123",
      user_id: "user-456",
      redeemed: false,
      redeemed_at: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    }

    const mockInvitationsResponse: AxiosResponse<{
      invitations: Invitation[]
    }> = {
      data: { invitations: [mockInvitation] },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse["config"],
    }

    beforeEach(() => {
      mockGet.mockResolvedValue(mockInvitationsResponse)
    })

    it("calls the correct API endpoint", async () => {
      await campaignClient.getInvitations()

      expect(mockApiV2.invitations).toHaveBeenCalledWith()
      expect(mockGet).toHaveBeenCalledWith("/api/v2/invitations", {}, {})
    })

    it("returns list of invitations", async () => {
      const result = await campaignClient.getInvitations()

      expect(result.data.invitations).toHaveLength(1)
      expect(result.data.invitations[0].id).toBe("invitation-123")
      expect(result.data.invitations[0].email).toBe("test@example.com")
    })

    it("propagates error on failure", async () => {
      const error = new Error("Unauthorized")
      mockGet.mockRejectedValue(error)

      await expect(campaignClient.getInvitations()).rejects.toThrow(
        "Unauthorized"
      )
    })
  })

  describe("createInvitation", () => {
    const mockInvitation: Invitation = {
      id: "invitation-456",
      email: "newplayer@example.com",
      campaign_id: "campaign-123",
      user_id: "user-456",
      redeemed: false,
      redeemed_at: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    }

    const mockCreateResponse: AxiosResponse<Invitation> = {
      data: mockInvitation,
      status: 201,
      statusText: "Created",
      headers: {},
      config: {} as AxiosResponse["config"],
    }

    beforeEach(() => {
      mockPost.mockResolvedValue(mockCreateResponse)
    })

    it("calls the correct API endpoint with email payload", async () => {
      await campaignClient.createInvitation("newplayer@example.com")

      expect(mockApiV2.invitations).toHaveBeenCalledWith()
      expect(mockPost).toHaveBeenCalledWith("/api/v2/invitations", {
        invitation: { email: "newplayer@example.com" },
      })
    })

    it("returns created invitation", async () => {
      const result = await campaignClient.createInvitation(
        "newplayer@example.com"
      )

      expect(result.data.id).toBe("invitation-456")
      expect(result.data.email).toBe("newplayer@example.com")
      expect(result.data.redeemed).toBe(false)
    })

    it("propagates error on failure", async () => {
      const error = new Error("Invalid email")
      mockPost.mockRejectedValue(error)

      await expect(
        campaignClient.createInvitation("invalid-email")
      ).rejects.toThrow("Invalid email")
    })
  })

  describe("resendInvitation", () => {
    const mockInvitation: Invitation = {
      id: "invitation-789",
      email: "pending@example.com",
      campaign_id: "campaign-123",
      user_id: "user-456",
      redeemed: false,
      redeemed_at: null,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    }

    const mockResendResponse: AxiosResponse<Invitation> = {
      data: mockInvitation,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {} as AxiosResponse["config"],
    }

    beforeEach(() => {
      mockPost.mockResolvedValue(mockResendResponse)
    })

    it("calls the correct API endpoint with invitation", async () => {
      await campaignClient.resendInvitation(mockInvitation)

      expect(mockApiV2.invitationResend).toHaveBeenCalledWith(mockInvitation)
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v2/invitations/invitation-789/resend"
      )
    })

    it("returns invitation after resend", async () => {
      const result = await campaignClient.resendInvitation(mockInvitation)

      expect(result.data.id).toBe("invitation-789")
      expect(result.data.email).toBe("pending@example.com")
    })

    it("propagates error when invitation not found", async () => {
      const error = new Error("Invitation not found")
      mockPost.mockRejectedValue(error)

      await expect(
        campaignClient.resendInvitation(mockInvitation)
      ).rejects.toThrow("Invitation not found")
    })
  })
})
