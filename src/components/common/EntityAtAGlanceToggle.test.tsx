import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { EntityAtAGlanceToggle } from "./EntityAtAGlanceToggle"

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

let mockUser = { id: "1", admin: true, gamemaster: false }
let mockCampaign = { id: "campaign1", gamemaster_id: "1" }

describe("EntityAtAGlanceToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUser = { id: "1", admin: true, gamemaster: false }
    mockCampaign = { id: "campaign1", gamemaster_id: "1" }
  })

  describe("Permission visibility", () => {
    it("should not render for regular users", () => {
      mockUser = { id: "1", admin: false, gamemaster: false }

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      expect(screen.queryByRole("switch")).not.toBeInTheDocument()
    })

    it("should render for admin users", () => {
      mockUser = { id: "1", admin: true, gamemaster: false }

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).toBeInTheDocument()
      expect(screen.getByText("At a Glance")).toBeInTheDocument()
    })

    it("should render for gamemaster of current campaign", () => {
      mockUser = { id: "2", admin: false, gamemaster: true }
      mockCampaign = { id: "campaign1", gamemaster_id: "2" }

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).toBeInTheDocument()
      expect(screen.getByText("At a Glance")).toBeInTheDocument()
    })

    it("should not render for gamemaster of different campaign", () => {
      mockUser = { id: "3", admin: false, gamemaster: true }
      mockCampaign = { id: "campaign1", gamemaster_id: "2" }

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      expect(screen.queryByRole("switch")).not.toBeInTheDocument()
    })
  })

  describe("Toggle functionality", () => {
    beforeEach(() => {
      mockUser = { id: "1", admin: true, gamemaster: false }
    })

    it("should display correct initial state when enabled", () => {
      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).toBeChecked()
    })

    it("should display correct initial state when disabled", () => {
      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).not.toBeChecked()
    })

    it("should default to unchecked when at_a_glance is missing", () => {
      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character" }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).not.toBeChecked()
    })

    it("should call handleChangeAndSave when toggled", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockHandleChangeAndSave).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              name: "at_a_glance",
              checked: false,
            }),
          })
        )
      })
    })

    it("should show success toast on successful toggle", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
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
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).toBeChecked()

      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to update Character"
        )
      })

      expect(toggle).toBeChecked()
    })

    it("should disable toggle during update", async () => {
      let resolvePromise: (() => void) | undefined
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).not.toBeDisabled()

      fireEvent.click(toggle)
      expect(toggle).toBeDisabled()
      expect(screen.getByRole("progressbar")).toBeInTheDocument()

      resolvePromise?.()

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
      let resolvePromise: (() => void) | undefined
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <EntityAtAGlanceToggle
          entity={{ id: "123", entity_class: "Character", at_a_glance: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      fireEvent.click(toggle)

      expect(toggle).toBeChecked()

      resolvePromise?.()

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled()
      })

      expect(toggle).toBeChecked()
    })
  })

  it("syncs when at_a_glance changes on the entity", () => {
    const { rerender } = render(
      <EntityAtAGlanceToggle
        entity={{ id: "123", entity_class: "Character", at_a_glance: false }}
        handleChangeAndSave={mockHandleChangeAndSave}
      />
    )

    const toggle = screen.getByRole("switch")
    expect(toggle).not.toBeChecked()

    rerender(
      <EntityAtAGlanceToggle
        entity={{ id: "123", entity_class: "Character", at_a_glance: true }}
        handleChangeAndSave={mockHandleChangeAndSave}
      />
    )

    const updatedToggle = screen.getByRole("switch")
    expect(updatedToggle).toBeChecked()
  })
})
