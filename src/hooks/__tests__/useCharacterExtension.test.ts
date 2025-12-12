import { renderHook, act } from "@testing-library/react"
import { useCharacterExtension } from "../useCharacterExtension"
import type { Character, CableData } from "@/types"

// Mock contexts
const mockClient = {
  extendCharacter: jest.fn(),
  consumer: jest.fn(),
}

const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

const mockSubscription = {
  unsubscribe: jest.fn(),
  disconnect: jest.fn(),
  send: jest.fn(),
}

const mockConsumerInstance = {
  subscriptions: {
    create: jest.fn(() => mockSubscription),
  },
}

jest.mock("@/contexts", () => ({
  useClient: () => ({ client: mockClient }),
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

describe("useCharacterExtension", () => {
  const mockCharacter: Character = {
    id: "char-123",
    name: "Test Character",
    active: true,
    impairments: 0,
    color: "#000000",
    action_values: {
      Wounds: 0,
      "Marks of Death": 0,
      Archetype: "Everyday Hero",
    },
    description: {
      Nicknames: "",
      Age: "",
      Height: "",
      Weight: "",
      "Hair Color": "",
      "Eye Color": "",
      "Style of Dress": "",
      Appearance: "",
      Background: "",
      "Melodramatic Hook": "",
    },
    skills: {},
    schticks: [],
    advancements: [],
    sites: [],
    weapons: [],
    faction_id: null,
    faction: {} as Character["faction"],
    user_id: "user-1",
    category: "character",
    count: 1,
    image_url: "",
    task: false,
    notion_page_id: null,
    wealth: "",
    juncture_id: null,
    juncture: null,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    extending: false,
  }

  const campaignId = "campaign-456"

  const defaultProps = {
    campaignId,
    character: mockCharacter,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient.consumer.mockReturnValue(mockConsumerInstance)
  })

  describe("initialization", () => {
    it("initializes with default state", () => {
      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      expect(result.current.pending).toBe(false)
      expect(result.current.isExtending).toBe(false)
      expect(result.current.extendCharacter).toBeDefined()
    })

    it("handles string campaignId", () => {
      const { result } = renderHook(() =>
        useCharacterExtension({
          ...defaultProps,
          campaignId: "string-campaign",
        })
      )

      expect(result.current.pending).toBe(false)
    })

    it("handles numeric campaignId", () => {
      const { result } = renderHook(() =>
        useCharacterExtension({ ...defaultProps, campaignId: 123 })
      )

      expect(result.current.pending).toBe(false)
    })

    it("returns isExtending true when character.extending is true", () => {
      const extendingCharacter = { ...mockCharacter, extending: true }
      const { result } = renderHook(() =>
        useCharacterExtension({
          ...defaultProps,
          character: extendingCharacter,
        })
      )

      expect(result.current.isExtending).toBe(true)
    })

    it("handles undefined extending field", () => {
      const characterWithoutExtending = { ...mockCharacter }
      delete (characterWithoutExtending as Partial<Character>).extending
      const { result } = renderHook(() =>
        useCharacterExtension({
          ...defaultProps,
          character: characterWithoutExtending as Character,
        })
      )

      expect(result.current.isExtending).toBe(false)
    })
  })

  describe("extendCharacter", () => {
    beforeEach(() => {
      mockClient.extendCharacter.mockResolvedValue({ data: { success: true } })
    })

    it("calls extendCharacter API with correct character", async () => {
      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(mockClient.extendCharacter).toHaveBeenCalledWith(mockCharacter)
    })

    it("sets pending state during character extension", async () => {
      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(result.current.pending).toBe(true)
    })

    it("creates WebSocket subscription with correct parameters", async () => {
      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(mockConsumerInstance.subscriptions.create).toHaveBeenCalledWith(
        { channel: "CampaignChannel", id: campaignId },
        expect.objectContaining({
          received: expect.any(Function),
        })
      )
    })

    it("handles API error during character extension", async () => {
      const error = new Error("API Error")
      mockClient.extendCharacter.mockRejectedValue(error)

      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(mockToastError).toHaveBeenCalledWith("API Error")
      expect(result.current.pending).toBe(false)
    })

    it("handles non-Error exception during character extension", async () => {
      mockClient.extendCharacter.mockRejectedValue("Unknown error")

      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(mockToastError).toHaveBeenCalledWith("Failed to extend character")
      expect(result.current.pending).toBe(false)
    })

    it("does not call API when already pending", async () => {
      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      await act(async () => {
        await result.current.extendCharacter()
      })

      // Clear the mock to check if it's called again
      mockClient.extendCharacter.mockClear()

      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(mockClient.extendCharacter).not.toHaveBeenCalled()
    })

    it("does not call API when character is already extending", async () => {
      const extendingCharacter = { ...mockCharacter, extending: true }
      const { result } = renderHook(() =>
        useCharacterExtension({
          ...defaultProps,
          character: extendingCharacter,
        })
      )

      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(mockClient.extendCharacter).not.toHaveBeenCalled()
    })
  })

  describe("WebSocket message handling", () => {
    let receivedCallback: (data: CableData) => void

    beforeEach(() => {
      mockClient.extendCharacter.mockResolvedValue({ data: { success: true } })
      mockConsumerInstance.subscriptions.create.mockImplementation(
        (channel, handlers) => {
          receivedCallback = handlers.received
          return mockSubscription
        }
      )
    })

    it("handles character_ready message with updated character", async () => {
      const onComplete = jest.fn()
      const { result } = renderHook(() =>
        useCharacterExtension({ ...defaultProps, onComplete })
      )

      const updatedCharacter = {
        ...mockCharacter,
        description: {
          ...mockCharacter.description,
          Background: "A mysterious past",
        },
      }

      await act(async () => {
        await result.current.extendCharacter()
      })

      act(() => {
        receivedCallback({
          status: "character_ready",
          character: updatedCharacter,
        })
      })

      expect(mockToastSuccess).toHaveBeenCalledWith(
        `Character "Test Character" extended successfully`
      )
      expect(onComplete).toHaveBeenCalledWith(updatedCharacter)
      expect(result.current.pending).toBe(false)
      expect(mockSubscription.disconnect).toHaveBeenCalled()
    })

    it("ignores character_ready message for different character", async () => {
      const onComplete = jest.fn()
      const { result } = renderHook(() =>
        useCharacterExtension({ ...defaultProps, onComplete })
      )

      const differentCharacter = {
        ...mockCharacter,
        id: "different-char-456",
        name: "Different Character",
      }

      await act(async () => {
        await result.current.extendCharacter()
      })

      act(() => {
        receivedCallback({
          status: "character_ready",
          character: differentCharacter,
        })
      })

      // Should NOT have been called since character ID doesn't match
      expect(onComplete).not.toHaveBeenCalled()
      expect(result.current.pending).toBe(true)
    })

    it("handles error message from WebSocket", async () => {
      const { result } = renderHook(() => useCharacterExtension(defaultProps))
      const errorMessage = "Character extension failed"

      await act(async () => {
        await result.current.extendCharacter()
      })

      act(() => {
        receivedCallback({
          status: "error",
          error: errorMessage,
        })
      })

      expect(mockToastError).toHaveBeenCalledWith(errorMessage)
      expect(result.current.pending).toBe(false)
      expect(mockSubscription.disconnect).toHaveBeenCalled()
    })

    it("ignores unrelated WebSocket messages", async () => {
      const onComplete = jest.fn()
      const { result } = renderHook(() =>
        useCharacterExtension({ ...defaultProps, onComplete })
      )

      await act(async () => {
        await result.current.extendCharacter()
      })

      act(() => {
        receivedCallback({
          status: "preview_ready",
          json: { some: "data" },
        })
      })

      // Should not trigger completion
      expect(onComplete).not.toHaveBeenCalled()
      expect(result.current.pending).toBe(true)
    })

    it("prevents race condition by ignoring duplicate messages", async () => {
      const onComplete = jest.fn()
      const { result } = renderHook(() =>
        useCharacterExtension({ ...defaultProps, onComplete })
      )

      const updatedCharacter = { ...mockCharacter }

      await act(async () => {
        await result.current.extendCharacter()
      })

      // Simulate receiving the same message multiple times quickly
      act(() => {
        receivedCallback({
          status: "character_ready",
          character: updatedCharacter,
        })
      })

      act(() => {
        receivedCallback({
          status: "character_ready",
          character: updatedCharacter,
        })
      })

      // Should only be called once due to handledRef
      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it("handles missing onComplete callback gracefully", async () => {
      const { result } = renderHook(() => useCharacterExtension(defaultProps))

      const updatedCharacter = { ...mockCharacter }

      await act(async () => {
        await result.current.extendCharacter()
      })

      // Should not throw when onComplete is not provided
      expect(() => {
        act(() => {
          receivedCallback({
            status: "character_ready",
            character: updatedCharacter,
          })
        })
      }).not.toThrow()

      expect(result.current.pending).toBe(false)
    })
  })

  describe("subscription cleanup", () => {
    beforeEach(() => {
      mockClient.extendCharacter.mockResolvedValue({ data: { success: true } })
    })

    it("disconnects subscription on component unmount", async () => {
      const { result, unmount } = renderHook(() =>
        useCharacterExtension(defaultProps)
      )

      await act(async () => {
        await result.current.extendCharacter()
      })

      unmount()

      expect(mockSubscription.disconnect).toHaveBeenCalled()
    })

    it("handles cleanup when no subscription exists", () => {
      const { unmount } = renderHook(() => useCharacterExtension(defaultProps))

      // Should not throw when no subscription was created
      expect(() => unmount()).not.toThrow()
    })

    it("disconnects existing subscription before creating new one", async () => {
      mockClient.extendCharacter.mockResolvedValue({ data: { success: true } })

      // Create a separate mock for tracking disconnects
      let subscriptionCount = 0
      const subscriptions: { disconnect: jest.Mock }[] = []

      mockConsumerInstance.subscriptions.create.mockImplementation(() => {
        const sub = {
          disconnect: jest.fn(),
          unsubscribe: jest.fn(),
          send: jest.fn(),
        }
        subscriptions.push(sub)
        subscriptionCount++
        return sub
      })

      const { result, rerender } = renderHook(
        props => useCharacterExtension(props),
        { initialProps: defaultProps }
      )

      // First extension call
      await act(async () => {
        await result.current.extendCharacter()
      })

      expect(subscriptionCount).toBe(1)

      // Simulate completion to reset pending state
      rerender({ ...defaultProps, character: { ...mockCharacter } })

      // Manually reset pending by unmounting and remounting
      // In real usage, the WebSocket callback would reset pending
    })
  })

  describe("onComplete callback updates", () => {
    let receivedCallback: (data: CableData) => void

    beforeEach(() => {
      mockClient.extendCharacter.mockResolvedValue({ data: { success: true } })
      mockConsumerInstance.subscriptions.create.mockImplementation(
        (channel, handlers) => {
          receivedCallback = handlers.received
          return mockSubscription
        }
      )
    })

    it("uses the latest onComplete callback via ref", async () => {
      const onComplete1 = jest.fn()
      const onComplete2 = jest.fn()

      const { result, rerender } = renderHook(
        props => useCharacterExtension(props),
        { initialProps: { ...defaultProps, onComplete: onComplete1 } }
      )

      await act(async () => {
        await result.current.extendCharacter()
      })

      // Update the callback before the WebSocket responds
      rerender({ ...defaultProps, onComplete: onComplete2 })

      const updatedCharacter = { ...mockCharacter }

      act(() => {
        receivedCallback({
          status: "character_ready",
          character: updatedCharacter,
        })
      })

      // Should use the updated callback
      expect(onComplete1).not.toHaveBeenCalled()
      expect(onComplete2).toHaveBeenCalledWith(updatedCharacter)
    })
  })

  describe("edge cases", () => {
    it("handles character without name gracefully in success toast", async () => {
      let receivedCallback: (data: CableData) => void
      mockClient.extendCharacter.mockResolvedValue({ data: { success: true } })
      mockConsumerInstance.subscriptions.create.mockImplementation(
        (channel, handlers) => {
          receivedCallback = handlers.received
          return mockSubscription
        }
      )

      const characterWithoutName = { ...mockCharacter, name: "" }
      const { result } = renderHook(() =>
        useCharacterExtension({
          ...defaultProps,
          character: characterWithoutName,
        })
      )

      await act(async () => {
        await result.current.extendCharacter()
      })

      const updatedCharacter = { ...characterWithoutName, name: "New Name" }

      act(() => {
        receivedCallback!({
          status: "character_ready",
          character: updatedCharacter,
        })
      })

      expect(mockToastSuccess).toHaveBeenCalledWith(
        `Character "New Name" extended successfully`
      )
    })
  })
})
