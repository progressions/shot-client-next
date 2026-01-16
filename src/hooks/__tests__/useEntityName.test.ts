import { renderHook, waitFor } from "@testing-library/react"
import { useEntityName } from "../useEntityName"

// Mock implementation state
const mockState = {
  user: { id: "user-123", email: "test@example.com" } as {
    id: string
    email: string
  } | null,
  subscribeToEntity: jest.fn().mockReturnValue(() => {}),
  clientMethods: {} as Record<string, jest.Mock>,
}

// Mock the contexts module
jest.mock("@/contexts", () => ({
  useClient: () => ({
    client: mockState.clientMethods,
    user: mockState.user,
  }),
  useCampaign: () => ({
    subscribeToEntity: mockState.subscribeToEntity,
  }),
}))

describe("useEntityName", () => {
  const characterId = "char-123"
  const characterName = "General Li Jingye"

  beforeEach(() => {
    jest.clearAllMocks()

    // Reset state
    mockState.user = { id: "user-123", email: "test@example.com" }
    mockState.subscribeToEntity = jest.fn().mockReturnValue(() => {})
    mockState.clientMethods = {
      getCharacter: jest.fn().mockResolvedValue({
        data: { id: characterId, name: characterName },
      }),
      getSite: jest.fn().mockResolvedValue({
        data: { id: "site-123", name: "Test Site" },
      }),
      getParty: jest.fn().mockResolvedValue({
        data: { id: "party-123", name: "Test Party" },
      }),
      getFaction: jest.fn().mockResolvedValue({
        data: { id: "faction-123", name: "Test Faction" },
      }),
      getJuncture: jest.fn().mockResolvedValue({
        data: { id: "juncture-123", name: "Test Juncture" },
      }),
      getVehicle: jest.fn().mockResolvedValue({
        data: { id: "vehicle-123", name: "Test Vehicle" },
      }),
      getWeapon: jest.fn().mockResolvedValue({
        data: { id: "weapon-123", name: "Test Weapon" },
      }),
      getSchtick: jest.fn().mockResolvedValue({
        data: { id: "schtick-123", name: "Test Schtick" },
      }),
    }
  })

  describe("initialization", () => {
    it("initializes with loading state and null name", () => {
      const { result } = renderHook(() =>
        useEntityName(characterId, "Character")
      )

      expect(result.current.loading).toBe(true)
      expect(result.current.name).toBe(null)
    })

    it("sets loading to false when no user is present", async () => {
      mockState.user = null

      const { result } = renderHook(() =>
        useEntityName(characterId, "Character")
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      expect(result.current.name).toBe(null)
    })

    it("sets loading to false when id is empty", async () => {
      const { result } = renderHook(() => useEntityName("", "Character"))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      expect(result.current.name).toBe(null)
    })

    it("sets loading to false when entityType is empty", async () => {
      const { result } = renderHook(() => useEntityName(characterId, ""))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      expect(result.current.name).toBe(null)
    })
  })

  describe("WebSocket subscription setup", () => {
    it("subscribes to entity updates with lowercase entity type", () => {
      renderHook(() => useEntityName(characterId, "Character"))

      expect(mockState.subscribeToEntity).toHaveBeenCalledWith(
        "character",
        expect.any(Function)
      )
    })

    it("subscribes to Site updates with lowercase type", () => {
      renderHook(() => useEntityName("site-123", "Site"))

      expect(mockState.subscribeToEntity).toHaveBeenCalledWith(
        "site",
        expect.any(Function)
      )
    })

    it("subscribes to Party updates with lowercase type", () => {
      renderHook(() => useEntityName("party-123", "Party"))

      expect(mockState.subscribeToEntity).toHaveBeenCalledWith(
        "party",
        expect.any(Function)
      )
    })

    it("subscribes to Faction updates with lowercase type", () => {
      renderHook(() => useEntityName("faction-123", "Faction"))

      expect(mockState.subscribeToEntity).toHaveBeenCalledWith(
        "faction",
        expect.any(Function)
      )
    })

    it("does not subscribe when id is empty", () => {
      renderHook(() => useEntityName("", "Character"))

      expect(mockState.subscribeToEntity).not.toHaveBeenCalled()
    })

    it("does not subscribe when entityType is empty", () => {
      renderHook(() => useEntityName(characterId, ""))

      expect(mockState.subscribeToEntity).not.toHaveBeenCalled()
    })

    it("does not subscribe when subscribeToEntity is null", () => {
      mockState.subscribeToEntity = null as unknown as jest.Mock

      // Should not throw
      expect(() => {
        renderHook(() => useEntityName(characterId, "Character"))
      }).not.toThrow()
    })
  })

  describe("subscription cleanup", () => {
    it("calls unsubscribe function on unmount", () => {
      const mockUnsubscribe = jest.fn()
      mockState.subscribeToEntity = jest.fn().mockReturnValue(mockUnsubscribe)

      const { unmount } = renderHook(() =>
        useEntityName(characterId, "Character")
      )

      expect(mockState.subscribeToEntity).toHaveBeenCalled()

      unmount()

      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe("return value structure", () => {
    it("returns object with name and loading properties", () => {
      const { result } = renderHook(() =>
        useEntityName(characterId, "Character")
      )

      expect(result.current).toHaveProperty("name")
      expect(result.current).toHaveProperty("loading")
      expect(typeof result.current.loading).toBe("boolean")
    })
  })
})
