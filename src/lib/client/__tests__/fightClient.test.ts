import { AxiosResponse } from "axios"
import { createFightClient } from "../fightClient"
import { createBaseClient } from "../baseClient"

// Mock the baseClient
jest.mock("../baseClient")
const mockCreateBaseClient = createBaseClient as jest.MockedFunction<
  typeof createBaseClient
>

describe("createFightClient", () => {
  // Mock API V2 object
  const mockApiV2 = {
    fights: jest.fn((fight?: { id: string } | string) =>
      fight
        ? `/api/v2/fights/${typeof fight === "string" ? fight : fight.id}`
        : "/api/v2/fights"
    ),
    encounters: jest.fn((fight?: { id: string } | string) =>
      fight
        ? `/api/v2/encounters/${typeof fight === "string" ? fight : fight.id}`
        : "/api/v2/encounters"
    ),
    fightEvents: jest.fn((fight: { id: string } | string) => {
      const fightId = typeof fight === "string" ? fight : fight.id
      return `/api/v2/fights/${fightId}/fight_events`
    }),
    playerTokens: jest.fn(
      (encounterId: string) => `/api/v2/encounters/${encounterId}/player_tokens`
    ),
  }

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
    apiV2: mockApiV2,
    queryParams: mockQueryParams,
  }

  let fightClient: ReturnType<typeof createFightClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateBaseClient.mockReturnValue(mockBaseClient)
    fightClient = createFightClient(deps)
  })

  describe("generatePlayerViewToken", () => {
    interface PlayerViewToken {
      id: string
      token: string
      url: string
      expires_at: string
      fight_id: string
      character_id: string
      user_id: string
    }

    const mockTokenResponse: AxiosResponse<PlayerViewToken> = {
      data: {
        id: "token-123",
        token: "magic-link-token-abc",
        url: "https://chiwar.net/magic-link/magic-link-token-abc",
        expires_at: "2024-01-15T12:10:00Z",
        fight_id: "fight-456",
        character_id: "character-789",
        user_id: "user-012",
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    }

    beforeEach(() => {
      mockPost.mockResolvedValue(mockTokenResponse)
    })

    it("generates a player view token via POST request", async () => {
      await fightClient.generatePlayerViewToken(
        "encounter-123",
        "character-456"
      )

      expect(mockApiV2.playerTokens).toHaveBeenCalledWith("encounter-123")
      expect(mockPost).toHaveBeenCalledWith(
        "/api/v2/encounters/encounter-123/player_tokens",
        { character_id: "character-456" }
      )
    })

    it("returns token data on successful generation", async () => {
      const result = await fightClient.generatePlayerViewToken(
        "encounter-123",
        "character-456"
      )

      expect(result.data.id).toBe("token-123")
      expect(result.data.token).toBe("magic-link-token-abc")
      expect(result.data.url).toBe(
        "https://chiwar.net/magic-link/magic-link-token-abc"
      )
    })

    it("returns expiration time in response", async () => {
      const result = await fightClient.generatePlayerViewToken(
        "encounter-123",
        "character-456"
      )

      expect(result.data.expires_at).toBe("2024-01-15T12:10:00Z")
    })

    it("returns fight and character IDs in response", async () => {
      const result = await fightClient.generatePlayerViewToken(
        "encounter-123",
        "character-456"
      )

      expect(result.data.fight_id).toBe("fight-456")
      expect(result.data.character_id).toBe("character-789")
      expect(result.data.user_id).toBe("user-012")
    })

    it("propagates error when character has no user assigned", async () => {
      const noUserError = new Error("Character has no user assigned")
      mockPost.mockRejectedValue(noUserError)

      await expect(
        fightClient.generatePlayerViewToken("encounter-123", "character-456")
      ).rejects.toThrow("Character has no user assigned")
    })

    it("propagates error when encounter not found", async () => {
      const notFoundError = new Error("Encounter not found")
      mockPost.mockRejectedValue(notFoundError)

      await expect(
        fightClient.generatePlayerViewToken(
          "invalid-encounter",
          "character-456"
        )
      ).rejects.toThrow("Encounter not found")
    })

    it("propagates error when character not in encounter", async () => {
      const notInEncounterError = new Error("Character not found in encounter")
      mockPost.mockRejectedValue(notInEncounterError)

      await expect(
        fightClient.generatePlayerViewToken("encounter-123", "wrong-character")
      ).rejects.toThrow("Character not found in encounter")
    })
  })

  describe("listPlayerViewTokens", () => {
    interface PlayerViewToken {
      id: string
      token: string
      url: string
      expires_at: string
      fight_id: string
      character_id: string
      user_id: string
    }

    const mockTokensListResponse: AxiosResponse<{
      tokens: PlayerViewToken[]
    }> = {
      data: {
        tokens: [
          {
            id: "token-1",
            token: "magic-token-1",
            url: "https://chiwar.net/magic-link/magic-token-1",
            expires_at: "2024-01-15T12:10:00Z",
            fight_id: "fight-456",
            character_id: "character-1",
            user_id: "user-1",
          },
          {
            id: "token-2",
            token: "magic-token-2",
            url: "https://chiwar.net/magic-link/magic-token-2",
            expires_at: "2024-01-15T12:15:00Z",
            fight_id: "fight-456",
            character_id: "character-2",
            user_id: "user-2",
          },
        ],
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    }

    beforeEach(() => {
      mockGet.mockResolvedValue(mockTokensListResponse)
    })

    it("lists player view tokens via GET request", async () => {
      await fightClient.listPlayerViewTokens("encounter-123")

      expect(mockApiV2.playerTokens).toHaveBeenCalledWith("encounter-123")
      expect(mockGet).toHaveBeenCalledWith(
        "/api/v2/encounters/encounter-123/player_tokens"
      )
    })

    it("returns array of tokens on success", async () => {
      const result = await fightClient.listPlayerViewTokens("encounter-123")

      expect(result.data.tokens).toHaveLength(2)
      expect(result.data.tokens[0].id).toBe("token-1")
      expect(result.data.tokens[1].id).toBe("token-2")
    })

    it("returns empty array when no tokens exist", async () => {
      mockGet.mockResolvedValue({
        ...mockTokensListResponse,
        data: { tokens: [] },
      })

      const result = await fightClient.listPlayerViewTokens("encounter-123")

      expect(result.data.tokens).toHaveLength(0)
    })

    it("returns tokens with all expected fields", async () => {
      const result = await fightClient.listPlayerViewTokens("encounter-123")

      const token = result.data.tokens[0]
      expect(token.id).toBeDefined()
      expect(token.token).toBeDefined()
      expect(token.url).toBeDefined()
      expect(token.expires_at).toBeDefined()
      expect(token.fight_id).toBeDefined()
      expect(token.character_id).toBeDefined()
      expect(token.user_id).toBeDefined()
    })

    it("propagates error when encounter not found", async () => {
      const notFoundError = new Error("Encounter not found")
      mockGet.mockRejectedValue(notFoundError)

      await expect(
        fightClient.listPlayerViewTokens("invalid-encounter")
      ).rejects.toThrow("Encounter not found")
    })

    it("propagates error when unauthorized", async () => {
      const unauthorizedError = new Error("Unauthorized")
      mockGet.mockRejectedValue(unauthorizedError)

      await expect(
        fightClient.listPlayerViewTokens("encounter-123")
      ).rejects.toThrow("Unauthorized")
    })
  })

  describe("client creation", () => {
    it("creates baseClient with correct dependencies", () => {
      createFightClient(deps)

      expect(mockCreateBaseClient).toHaveBeenCalledWith(deps)
    })

    it("returns all expected methods", () => {
      expect(fightClient.getEncounter).toBeDefined()
      expect(fightClient.getFights).toBeDefined()
      expect(fightClient.getFight).toBeDefined()
      expect(fightClient.createFight).toBeDefined()
      expect(fightClient.updateFight).toBeDefined()
      expect(fightClient.touchFight).toBeDefined()
      expect(fightClient.deleteFight).toBeDefined()
      expect(fightClient.getFightEvents).toBeDefined()
      expect(fightClient.createFightEvent).toBeDefined()
      expect(fightClient.spendShots).toBeDefined()
      expect(fightClient.applyBoostAction).toBeDefined()
      expect(fightClient.applyCombatAction).toBeDefined()
      expect(fightClient.applyUpCheck).toBeDefined()
      expect(fightClient.applyChaseAction).toBeDefined()
      expect(fightClient.updateInitiatives).toBeDefined()
      expect(fightClient.endFight).toBeDefined()
      expect(fightClient.generatePlayerViewToken).toBeDefined()
      expect(fightClient.listPlayerViewTokens).toBeDefined()
    })
  })
})
