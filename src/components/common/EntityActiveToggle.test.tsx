import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { EntityActiveToggle } from "./EntityActiveToggle"

const mockHandleChangeAndSave = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

// Mock the contexts
jest.mock("@/contexts", () => ({
  useClient: () => ({
    user: mockUser,
    client: {},
  }),
  useCampaign: () => ({
    campaign: mockCampaign,
  }),
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

let mockUser = { id: "1", admin: false, gamemaster: false }
let mockCampaign = { id: "campaign1", gamemaster_id: "2" }

describe("EntityActiveToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { id: "1", admin: false, gamemaster: false }
    mockCampaign = { id: "campaign1", gamemaster_id: "2" }
  })

  describe("Permission visibility", () => {
    it("should not render for regular users", () => {
      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      expect(
        screen.queryByRole("checkbox", {
          name: /Toggle Character active status/i,
        })
      ).not.toBeInTheDocument()
    })

    it("should render for admin users", () => {
      mockUser = { id: "1", admin: true, gamemaster: false }

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const checkbox = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      expect(checkbox).toBeInTheDocument()
      expect(screen.getByText("Active")).toBeInTheDocument()
    })

    it("should render for gamemaster of current campaign", () => {
      mockUser = { id: "2", admin: false, gamemaster: true }
      mockCampaign = { id: "campaign1", gamemaster_id: "2" }

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const checkbox = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      expect(checkbox).toBeInTheDocument()
      expect(screen.getByText("Active")).toBeInTheDocument()
    })

    it("should not render for gamemaster of different campaign", () => {
      mockUser = { id: "3", admin: false, gamemaster: true }
      mockCampaign = { id: "campaign1", gamemaster_id: "2" }

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      expect(
        screen.queryByRole("checkbox", {
          name: /Toggle Character active status/i,
        })
      ).not.toBeInTheDocument()
    })
  })

  describe("Toggle functionality", () => {
    beforeEach(() => {
      mockUser = { id: "1", admin: true, gamemaster: false }
    })

    it("should display correct initial state when active", () => {
      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      expect(toggle).toBeChecked()
    })

    it("should display correct initial state when inactive", () => {
      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      expect(toggle).not.toBeChecked()
    })

    it("should call handleChangeAndSave when toggled", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockHandleChangeAndSave).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              name: "active",
              value: false,
            }),
          })
        )
      })
    })

    it("should show success toast on successful toggle", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Character updated successfully"
        )
      })
    })

    it("should show error toast on failed toggle", async () => {
      mockHandleChangeAndSave.mockRejectedValueOnce(new Error("API Error"))

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      
      // Initially should be checked
      expect(toggle).toBeChecked()
      
      fireEvent.click(toggle)

      // Wait for the error to be handled
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to update Character"
        )
      })
    })

    it("should disable toggle during update", async () => {
      let resolvePromise
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      
      // Initially should be enabled
      expect(toggle).not.toBeDisabled()
      
      fireEvent.click(toggle)

      // Should be disabled during update
      expect(toggle).toBeDisabled()
      
      // Resolve the promise to complete the update
      resolvePromise()
      
      // Wait for loading to finish
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled()
      })
    })
  })

  describe("Optimistic updates", () => {
    beforeEach(() => {
      mockUser = { id: "1", admin: true, gamemaster: false }
    })

    it("should optimistically update UI before API call completes", async () => {
      let resolvePromise
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <EntityActiveToggle
          entity={{ id: "123", entity_class: "Character", active: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle Character active status/i,
      })
      fireEvent.click(toggle)

      // Should immediately show unchecked state (optimistic)
      expect(toggle).not.toBeChecked()

      // Resolve the promise
      resolvePromise()

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled()
      })

      // Should remain unchecked after success
      expect(toggle).not.toBeChecked()
    })
  })
})
