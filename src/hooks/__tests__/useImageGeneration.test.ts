import { renderHook, act } from "@testing-library/react"
import { useImageGeneration } from "../useImageGeneration"
import { FormActions } from "@/reducers"
import type { Entity, CableData } from "@/types"

// Mock contexts
const mockClient = {
  generateAiImages: jest.fn(),
  consumer: jest.fn(),
}

const mockDispatchForm = jest.fn()

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
}))

// Mock handleError
jest.mock("@/lib", () => ({
  handleError: jest.fn(),
}))

const { handleError } = require("@/lib")

describe("useImageGeneration", () => {
  const mockEntity: Entity = {
    id: "char-123",
    entity_class: "Character",
    name: "Test Character",
    active: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  }

  const campaignId = "campaign-456"

  const defaultProps = {
    campaignId,
    entity: mockEntity,
    dispatchForm: mockDispatchForm,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient.consumer.mockReturnValue(mockConsumerInstance)
  })

  describe("initialization", () => {
    it("initializes with default state", () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))

      expect(result.current.pending).toBe(false)
      expect(result.current.generateImages).toBeDefined()
    })

    it("handles string campaignId", () => {
      const { result } = renderHook(() =>
        useImageGeneration({ ...defaultProps, campaignId: "string-campaign" })
      )

      expect(result.current.pending).toBe(false)
    })

    it("handles numeric campaignId", () => {
      const { result } = renderHook(() =>
        useImageGeneration({ ...defaultProps, campaignId: 123 })
      )

      expect(result.current.pending).toBe(false)
    })
  })

  describe("generateImages", () => {
    beforeEach(() => {
      mockClient.generateAiImages.mockResolvedValue({ data: { success: true } })
    })

    it("calls generateAiImages with correct entity", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))

      await act(async () => {
        await result.current.generateImages()
      })

      expect(mockClient.generateAiImages).toHaveBeenCalledWith({
        entity: mockEntity,
      })
    })

    it("dispatches form actions for image generation start", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))

      await act(async () => {
        await result.current.generateImages()
      })

      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.UPDATE,
        name: "image_urls",
        value: [],
      })

      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.SUBMIT,
      })
    })

    it("sets pending state during image generation", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))

      await act(async () => {
        await result.current.generateImages()
      })

      expect(result.current.pending).toBe(true) // Should be true while waiting for WebSocket response
    })

    it("creates WebSocket subscription with correct parameters", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))

      await act(async () => {
        await result.current.generateImages()
      })

      expect(mockConsumerInstance.subscriptions.create).toHaveBeenCalledWith(
        { channel: "CampaignChannel", id: campaignId },
        expect.objectContaining({
          received: expect.any(Function),
        })
      )
    })

    it("handles API error during image generation", async () => {
      const error = new Error("API Error")
      mockClient.generateAiImages.mockRejectedValue(error)

      const { result } = renderHook(() => useImageGeneration(defaultProps))

      await act(async () => {
        await result.current.generateImages()
      })

      expect(handleError).toHaveBeenCalledWith(error, mockDispatchForm)
      expect(result.current.pending).toBe(false)
    })
  })

  describe("WebSocket message handling", () => {
    let receivedCallback: (data: CableData) => void

    beforeEach(() => {
      mockClient.generateAiImages.mockResolvedValue({ data: { success: true } })
      mockConsumerInstance.subscriptions.create.mockImplementation(
        (channel, handlers) => {
          receivedCallback = handlers.received
          return mockSubscription
        }
      )
    })

    it("handles preview_ready message with image URLs", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))
      const testImageUrls = [
        "http://example.com/image1.jpg",
        "http://example.com/image2.jpg",
      ]

      await act(async () => {
        await result.current.generateImages()
      })

      act(() => {
        receivedCallback({
          status: "preview_ready",
          json: JSON.stringify(testImageUrls),
        })
      })

      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.UPDATE,
        name: "image_urls",
        value: testImageUrls,
      })

      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.SUCCESS,
        payload: "Images generated successfully",
      })

      expect(mockSubscription.disconnect).toHaveBeenCalled()
    })

    it("handles empty image URLs array", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))

      await act(async () => {
        await result.current.generateImages()
      })

      act(() => {
        receivedCallback({
          status: "preview_ready",
          json: JSON.stringify([]),
        })
      })

      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.UPDATE,
        name: "image_urls",
        value: [],
      })
    })

    it("handles error message from WebSocket", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))
      const errorMessage = "Image generation failed"

      await act(async () => {
        await result.current.generateImages()
      })

      act(() => {
        receivedCallback({
          status: "error",
          error: errorMessage,
        })
      })

      expect(handleError).toHaveBeenCalledWith(
        new Error(errorMessage),
        mockDispatchForm
      )
      expect(result.current.pending).toBe(false)
      expect(mockSubscription.disconnect).toHaveBeenCalled()
    })

    it("handles malformed JSON in preview_ready message", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))
      const consoleSpy = jest.spyOn(console, "error").mockImplementation()

      await act(async () => {
        await result.current.generateImages()
      })

      act(() => {
        receivedCallback({
          status: "preview_ready",
          json: "invalid-json",
        })
      })

      // Should handle JSON parsing error gracefully
      consoleSpy.mockRestore()
    })

    it("ignores unrelated WebSocket messages", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))
      const initialDispatchCount = mockDispatchForm.mock.calls.length

      await act(async () => {
        await result.current.generateImages()
      })

      const dispatchCountAfterGenerate = mockDispatchForm.mock.calls.length

      act(() => {
        receivedCallback({
          status: "other_status",
          data: "some data",
        })
      })

      // Should not trigger additional form dispatches
      expect(mockDispatchForm).toHaveBeenCalledTimes(dispatchCountAfterGenerate)
      expect(result.current.pending).toBe(true) // Should still be pending since no completion message was sent
    })
  })

  describe("subscription cleanup", () => {
    it("unsubscribes on component unmount", async () => {
      const { result, unmount } = renderHook(() =>
        useImageGeneration(defaultProps)
      )

      await act(async () => {
        await result.current.generateImages()
      })

      unmount()

      expect(mockSubscription.disconnect).toHaveBeenCalled()
    })

    it("handles multiple subscription cleanup calls safely", async () => {
      const { result, unmount } = renderHook(() =>
        useImageGeneration(defaultProps)
      )

      await act(async () => {
        await result.current.generateImages()
      })

      // Multiple unmount calls shouldn't cause errors
      unmount()
      expect(() => unmount()).not.toThrow()
    })

    it("handles cleanup when no subscription exists", () => {
      const { unmount } = renderHook(() => useImageGeneration(defaultProps))

      // Should not throw when no subscription was created
      expect(() => unmount()).not.toThrow()
    })
  })

  describe("edge cases", () => {
    it("handles rapid successive generateImages calls", async () => {
      const { result } = renderHook(() => useImageGeneration(defaultProps))

      await act(async () => {
        // Fire multiple calls quickly
        result.current.generateImages()
        result.current.generateImages()
        result.current.generateImages()
      })

      // Should handle gracefully without errors
      expect(mockClient.generateAiImages).toHaveBeenCalled()
    })

    it("handles entity with different entity_class types", async () => {
      const vehicleEntity = {
        ...mockEntity,
        entity_class: "Vehicle" as const,
      }

      const { result } = renderHook(() =>
        useImageGeneration({ ...defaultProps, entity: vehicleEntity })
      )

      await act(async () => {
        await result.current.generateImages()
      })

      expect(mockClient.generateAiImages).toHaveBeenCalledWith({
        entity: vehicleEntity,
      })
    })

    it("handles missing entity properties gracefully", async () => {
      const minimalEntity = {
        id: "minimal-123",
        entity_class: "Character" as const,
        active: true,
        created_at: "2023-01-01T00:00:00.000Z",
        updated_at: "2023-01-01T00:00:00.000Z",
      }

      const { result } = renderHook(() =>
        useImageGeneration({ ...defaultProps, entity: minimalEntity })
      )

      await act(async () => {
        await result.current.generateImages()
      })

      expect(mockClient.generateAiImages).toHaveBeenCalledWith({
        entity: minimalEntity,
      })
    })

    it("maintains pending state correctly through error scenarios", async () => {
      const error = new Error("Network error")
      mockClient.generateAiImages.mockRejectedValue(error)

      const { result } = renderHook(() => useImageGeneration(defaultProps))

      expect(result.current.pending).toBe(false)

      await act(async () => {
        await result.current.generateImages()
      })

      expect(result.current.pending).toBe(false)
    })
  })
})
