import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { EntityTaskToggle } from "./EntityTaskToggle"

const mockHandleChangeAndSave = jest.fn()
const mockOnChange = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

// Mock the contexts
jest.mock("@/contexts", () => ({
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

describe("EntityTaskToggle", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Rendering", () => {
    it("should render the toggle with Task label", () => {
      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      expect(screen.getByRole("switch")).toBeInTheDocument()
      expect(screen.getByText("Task")).toBeInTheDocument()
    })

    it("should display correct initial state when task is true", () => {
      render(
        <EntityTaskToggle
          entity={{ id: "123", task: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).toBeChecked()
    })

    it("should display correct initial state when task is false", () => {
      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).not.toBeChecked()
    })

    it("should default to false when task is undefined", () => {
      render(
        <EntityTaskToggle
          entity={{ id: "123" }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).not.toBeChecked()
    })
  })

  describe("Toggle functionality with handleChangeAndSave", () => {
    it("should call handleChangeAndSave when toggled", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockHandleChangeAndSave).toHaveBeenCalledWith(
          expect.objectContaining({
            target: expect.objectContaining({
              name: "task",
              checked: true,
            }),
          })
        )
      })
    })

    it("should show success toast on successful toggle", async () => {
      mockHandleChangeAndSave.mockResolvedValueOnce(undefined)

      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith("Task status updated")
      })
    })

    it("should show error toast on failed toggle", async () => {
      mockHandleChangeAndSave.mockRejectedValueOnce(new Error("API Error"))

      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      fireEvent.click(toggle)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Failed to update task status"
        )
      })
    })

    it("should disable toggle during update", async () => {
      let resolvePromise: () => void
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")

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

  describe("Toggle functionality with onChange callback", () => {
    it("should call onChange instead of handleChangeAndSave when provided", () => {
      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          onChange={mockOnChange}
        />
      )

      const toggle = screen.getByRole("switch")
      fireEvent.click(toggle)

      expect(mockOnChange).toHaveBeenCalledWith(true)
      expect(mockHandleChangeAndSave).not.toHaveBeenCalled()
    })

    it("should update local state when using onChange", () => {
      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          onChange={mockOnChange}
        />
      )

      const toggle = screen.getByRole("switch")

      // Initially unchecked
      expect(toggle).not.toBeChecked()

      fireEvent.click(toggle)

      // Should be checked after click
      expect(toggle).toBeChecked()
      expect(mockOnChange).toHaveBeenCalledWith(true)
    })
  })

  describe("Optimistic updates", () => {
    it("should optimistically update UI before API call completes", async () => {
      let resolvePromise: () => void
      mockHandleChangeAndSave.mockImplementation(
        () =>
          new Promise(resolve => {
            resolvePromise = resolve
          })
      )

      render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
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
  })

  describe("Entity prop changes", () => {
    it("should sync local state when entity prop changes", () => {
      const { rerender } = render(
        <EntityTaskToggle
          entity={{ id: "123", task: false }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      const toggle = screen.getByRole("switch")
      expect(toggle).not.toBeChecked()

      // Simulate entity prop changing (e.g., from subscription update)
      rerender(
        <EntityTaskToggle
          entity={{ id: "123", task: true }}
          handleChangeAndSave={mockHandleChangeAndSave}
        />
      )

      expect(toggle).toBeChecked()
    })
  })
})
