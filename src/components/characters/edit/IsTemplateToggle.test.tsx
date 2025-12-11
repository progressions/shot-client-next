import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import IsTemplateToggle from "./IsTemplateToggle"
import type { Character } from "@/types"

const mockHandleChangeAndSave = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

// Mock the contexts
jest.mock("@/contexts", () => ({
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

const createMockCharacter = (overrides: Partial<Character> = {}): Character =>
  ({
    id: "123",
    name: "Test Character",
    entity_class: "Character",
    is_template: false,
    active: true,
    campaign_id: "campaign-1",
    action_values: {},
    description: {},
    skills: {},
    image_url: "",
    task: false,
    notion_page_id: null,
    wealth: "",
    juncture_id: null,
    juncture: null,
    user_id: null,
    faction_id: null,
    impairments: 0,
    ...overrides,
  }) as Character

describe("IsTemplateToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Toggle functionality", () => {
    it("should display correct initial state when is_template is true", () => {
      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: true })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })
      expect(toggle).toBeChecked()
    })

    it("should display correct initial state when is_template is false", () => {
      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: false })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })
      expect(toggle).not.toBeChecked()
    })

    it("should display correct initial state when is_template is undefined", () => {
      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: undefined })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })
      expect(toggle).not.toBeChecked()
    })

    it("should call handleChangeAndSave when toggled", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: false })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockHandleChangeAndSave).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              name: "is_template",
              value: true,
            }),
          })
        )
      })
    })

    it("should show success toast on successful toggle", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: false })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Character template status updated"
        )
      })
    })

    it("should show error toast on failed toggle", async () => {
      mockHandleChangeAndSave.mockRejectedValueOnce(new Error("API Error"))

      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: false })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })

      // Initially should be unchecked
      expect(toggle).not.toBeChecked()

      fireEvent.click(toggle)

      // Wait for the error to be handled
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to update character template status"
        )
      })
    })

    it("should disable toggle during update", async () => {
      let resolvePromise: () => void
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise<void>(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: false })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })

      // Initially should be enabled
      expect(toggle).not.toBeDisabled()

      fireEvent.click(toggle)

      // Should be disabled during update
      expect(toggle).toBeDisabled()

      // Resolve the promise to complete the update
      resolvePromise!()

      // Wait for loading to finish
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled()
      })
    })
  })

  describe("Optimistic updates", () => {
    it("should optimistically update UI before API call completes", async () => {
      let resolvePromise: () => void
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise<void>(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: false })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })
      fireEvent.click(toggle)

      // Should immediately show checked state (optimistic)
      expect(toggle).toBeChecked()

      // Resolve the promise
      resolvePromise!()

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalled()
      })

      // Should remain checked after success
      expect(toggle).toBeChecked()
    })

    it("should revert UI on error", async () => {
      let rejectPromise: (error: Error) => void
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise<void>((_, reject) => {
            rejectPromise = reject
          })
      )

      render(
        <IsTemplateToggle
          character={createMockCharacter({ is_template: false })}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("checkbox", {
        name: /Toggle character template status/i,
      })

      // Initially unchecked
      expect(toggle).not.toBeChecked()

      fireEvent.click(toggle)

      // Optimistic update shows checked
      expect(toggle).toBeChecked()

      // Now reject the promise to trigger error handling
      await act(async () => {
        rejectPromise!(new Error("API Error"))
      })

      // After error handling, UI should revert to unchecked
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(toggle).not.toBeChecked()
      })
    })
  })

  describe("Label display", () => {
    it("should display 'Template' label", () => {
      render(
        <IsTemplateToggle
          character={createMockCharacter()}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      expect(screen.getByText("Template")).toBeInTheDocument()
    })
  })
})
