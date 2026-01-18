import React from "react"
import { render, screen, fireEvent } from "@/test-utils"
import { SearchButton } from "../SearchButton"

// Mock the SearchModal component
jest.mock("@/components/search/SearchModal", () => ({
  SearchModal: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="search-modal">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}))

describe("SearchButton", () => {
  it("renders the search icon button", () => {
    render(<SearchButton />)
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument()
  })

  it("has correct aria-label", () => {
    render(<SearchButton />)
    const button = screen.getByRole("button", { name: "Search" })
    expect(button).toHaveAttribute("aria-label", "Search")
  })

  it("opens the modal when clicked", () => {
    render(<SearchButton />)

    // Modal should not be visible initially
    expect(screen.queryByTestId("search-modal")).not.toBeInTheDocument()

    // Click the search button
    fireEvent.click(screen.getByRole("button", { name: "Search" }))

    // Modal should now be visible
    expect(screen.getByTestId("search-modal")).toBeInTheDocument()
  })

  it("closes the modal when onClose is called", () => {
    render(<SearchButton />)

    // Open the modal
    fireEvent.click(screen.getByRole("button", { name: "Search" }))
    expect(screen.getByTestId("search-modal")).toBeInTheDocument()

    // Close the modal
    fireEvent.click(screen.getByText("Close"))

    // Modal should no longer be visible
    expect(screen.queryByTestId("search-modal")).not.toBeInTheDocument()
  })
})
