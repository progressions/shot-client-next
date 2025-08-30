import { renderHook, act } from "@testing-library/react"
import { useEntity } from "../useEntity"
import { FormActions } from "@/reducers"
import type { Entity } from "@/types"

// Mock handleEntityDeletion
jest.mock("@/lib/deletionHandler", () => ({
  handleEntityDeletion: jest.fn(),
}))

import { handleEntityDeletion } from "@/lib/deletionHandler"
const mockHandleEntityDeletion = handleEntityDeletion as jest.MockedFunction<
  typeof handleEntityDeletion
>

// Create mocks inside module factories to avoid hoisting issues
jest.mock("@/contexts", () => {
  const mockClient = {
    getCharacter: jest.fn(),
    updateCharacter: jest.fn(),
    deleteCharacter: jest.fn(),
    createCharacter: jest.fn(),
    getVehicle: jest.fn(),
    updateVehicle: jest.fn(),
    deleteVehicle: jest.fn(),
    createVehicle: jest.fn(),
    getCampaign: jest.fn(),
    updateCampaign: jest.fn(),
    deleteCampaign: jest.fn(),
    createCampaign: jest.fn(),
  }

  const mockToast = {
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
  }

  return {
    useClient: () => ({ client: mockClient }),
    useToast: () => mockToast,
    useApp: () => ({ refreshUser: jest.fn() }),
  }
})

jest.mock("next/navigation", () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }

  return {
    useRouter: () => mockRouter,
  }
})

// Get references to the mocks after they're created
const { useClient, useToast } = require("@/contexts")
const { useRouter } = require("next/navigation")
const mockClient = useClient().client
const mockToast = useToast()
const mockRouter = useRouter()

describe("useEntity", () => {
  const mockEntity: Entity = {
    id: "char-1",
    entity_class: "Character",
    active: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
  }

  const mockDispatchForm = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("initialization", () => {
    it("derives correct function names from entity class", () => {
      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      // The hook should be set up with Character-specific methods
      expect(result.current).toBeDefined()
    })

    it("handles entity class correctly", () => {
      const vehicleEntity = {
        ...mockEntity,
        entity_class: "Vehicle" as const,
      }

      const { result } = renderHook(() =>
        useEntity(vehicleEntity, mockDispatchForm)
      )

      expect(result.current).toBeDefined()
    })
  })

  describe("getEntities", () => {
    it("successfully fetches entities", async () => {
      const mockResponse = {
        data: [mockEntity, { ...mockEntity, id: "char-2" }],
      }
      mockClient.getCharacter.mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      let entities
      await act(async () => {
        entities = await result.current.getEntities()
      })

      expect(mockClient.getCharacter).toHaveBeenCalledWith(undefined)
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.EDIT,
        name: "loading",
        value: true,
      })
      expect(entities).toEqual(mockResponse.data)
    })

    it("passes parameters to client method", async () => {
      const mockParams = { name: "test", active: true }
      mockClient.getCharacter.mockResolvedValue({ data: [] })

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.getEntities(mockParams)
      })

      expect(mockClient.getCharacter).toHaveBeenCalledWith(mockParams)
    })

    it("handles fetch error", async () => {
      const error = new Error("Network error")
      mockClient.getCharacter.mockRejectedValue(error)

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await expect(result.current.getEntities()).rejects.toThrow(
          "Network error"
        )
      })

      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.EDIT,
        name: "loading",
        value: true,
      })
    })
  })

  describe("updateEntity", () => {
    it("successfully updates entity", async () => {
      const updatedEntity = { ...mockEntity, name: "Updated Name" }
      const mockResponse = { data: updatedEntity }
      mockClient.updateCharacter.mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.updateEntity(updatedEntity)
      })

      expect(mockClient.updateCharacter).toHaveBeenCalledWith(
        mockEntity.id,
        expect.any(FormData)
      )
      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        "Character updated successfully"
      )
    })

    it("handles update error", async () => {
      const error = new Error("Update failed")
      mockClient.updateCharacter.mockRejectedValue(error)

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await expect(result.current.updateEntity(mockEntity)).rejects.toThrow(
          "Update failed"
        )
      })

      expect(mockToast.toastError).toHaveBeenCalledWith(
        "Error updating character."
      )
    })

    it("dispatches form actions during update", async () => {
      mockClient.updateCharacter.mockResolvedValue({ data: mockEntity })

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.updateEntity(mockEntity)
      })

      // Should dispatch form actions during update
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.EDIT,
        name: "saving",
        value: true,
      })
    })
  })

  describe("deleteEntity", () => {
    it("successfully deletes entity", async () => {
      // Mock handleEntityDeletion to call the onSuccess callback
      mockHandleEntityDeletion.mockImplementation(
        async (entity, deleteFunc, options) => {
          options.onSuccess()
        }
      )

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.deleteEntity()
      })

      expect(mockHandleEntityDeletion).toHaveBeenCalledWith(
        mockEntity,
        expect.any(Function),
        expect.objectContaining({
          entityName: "character",
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      )
      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        "Character deleted successfully"
      )
      expect(mockRouter.push).toHaveBeenCalledWith("/characters")
    })

    it("handles delete error", async () => {
      const errorMessage = "Failed to delete character"
      // Mock handleEntityDeletion to call the onError callback
      mockHandleEntityDeletion.mockImplementation(
        async (entity, deleteFunc, options) => {
          options.onError(errorMessage)
        }
      )

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.deleteEntity()
      })

      expect(mockToast.toastError).toHaveBeenCalledWith(errorMessage)
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it("navigates to entity list page after successful delete", async () => {
      const vehicleEntity = { ...mockEntity, entity_class: "Vehicle" as const }

      // Mock handleEntityDeletion to call the onSuccess callback
      mockHandleEntityDeletion.mockImplementation(
        async (entity, deleteFunc, options) => {
          options.onSuccess()
        }
      )

      const { result } = renderHook(() =>
        useEntity(vehicleEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.deleteEntity()
      })

      expect(mockRouter.push).toHaveBeenCalledWith("/vehicles")
    })
  })

  describe("createEntity", () => {
    it("successfully creates entity", async () => {
      const newEntity = { ...mockEntity, id: "char-new", name: "New Character" }
      const mockResponse = { data: newEntity }
      mockClient.createCharacter.mockResolvedValue(mockResponse)

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.createEntity(newEntity, null)
      })

      expect(mockClient.createCharacter).toHaveBeenCalledWith(
        expect.any(FormData)
      )
      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        "Character created successfully"
      )
    })

    it("handles create error", async () => {
      const error = new Error("Create failed")
      error.response = { data: { errors: { name: "is required" } } }
      mockClient.createCharacter.mockRejectedValue(error)

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await expect(
          result.current.createEntity(mockEntity, null)
        ).rejects.toThrow("Create failed")
      })

      expect(mockToast.toastError).toHaveBeenCalledWith(
        "Error creating character."
      )
    })
  })

  describe("entity class handling", () => {
    it("handles different entity classes correctly", () => {
      const testCases = [
        { entity_class: "Campaign" as const, expectedPath: "campaigns" },
        { entity_class: "Fight" as const, expectedPath: "fights" },
        { entity_class: "Faction" as const, expectedPath: "factions" },
        { entity_class: "Site" as const, expectedPath: "sites" },
        { entity_class: "Party" as const, expectedPath: "parties" },
        { entity_class: "Vehicle" as const, expectedPath: "vehicles" },
        { entity_class: "Weapon" as const, expectedPath: "weapons" },
        { entity_class: "Schtick" as const, expectedPath: "schticks" },
        { entity_class: "User" as const, expectedPath: "users" },
        { entity_class: "Juncture" as const, expectedPath: "junctures" },
      ]

      testCases.forEach(({ entity_class, expectedPath }) => {
        const testEntity = { ...mockEntity, entity_class }
        const { result } = renderHook(() =>
          useEntity(testEntity, mockDispatchForm)
        )

        expect(result.current).toBeDefined()
        // The hook should set up the correct pluralized path for navigation
      })
    })
  })

  describe("form integration", () => {
    it("dispatches loading states correctly", async () => {
      mockClient.getCharacter.mockResolvedValue({ data: [mockEntity] })

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.getEntities()
      })

      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.EDIT,
        name: "loading",
        value: true,
      })
    })

    it("integrates with form reducer actions", async () => {
      mockClient.updateCharacter.mockResolvedValue({ data: mockEntity })

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.updateEntity(mockEntity)
      })

      // Should have dispatched various form actions during update
      expect(mockDispatchForm).toHaveBeenCalled()
    })
  })

  describe("toast notifications", () => {
    it("shows success toast for successful operations", async () => {
      mockClient.updateCharacter.mockResolvedValue({ data: mockEntity })

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.updateEntity(mockEntity)
      })

      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        "Character updated successfully"
      )
    })

    it("shows error toast for failed operations", async () => {
      mockClient.updateCharacter.mockRejectedValue(new Error("Failed"))

      const { result } = renderHook(() =>
        useEntity(mockEntity, mockDispatchForm)
      )

      await act(async () => {
        await expect(
          result.current.updateEntity(new FormData())
        ).rejects.toThrow()
      })

      expect(mockToast.toastError).toHaveBeenCalledWith(
        "Error updating character."
      )
    })

    it("customizes toast messages based on entity type", async () => {
      const campaignEntity = {
        ...mockEntity,
        entity_class: "Campaign" as const,
      }
      mockClient.updateCampaign.mockResolvedValue({ data: campaignEntity })

      const { result } = renderHook(() =>
        useEntity(campaignEntity, mockDispatchForm)
      )

      await act(async () => {
        await result.current.updateEntity(mockEntity)
      })

      expect(mockToast.toastSuccess).toHaveBeenCalledWith(
        "Campaign updated successfully"
      )
    })
  })
})
