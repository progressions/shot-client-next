import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import type { User } from "@/types"

// Create mock functions
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()
const mockLinkDiscord = jest.fn()
const mockUnlinkDiscord = jest.fn()
const mockGetCurrentUser = jest.fn()

// Mock the contexts
jest.mock("@/contexts", () => ({
  useClient: () => ({
    client: {
      linkDiscord: mockLinkDiscord,
      unlinkDiscord: mockUnlinkDiscord,
      getCurrentUser: mockGetCurrentUser,
    },
  }),
  useToast: () => ({
    toastSuccess: mockToastSuccess,
    toastError: mockToastError,
  }),
}))

// Import after mocking
import DiscordLinkingSection from "../DiscordLinkingSection"

const theme = createTheme()

const mockUser: User = {
  id: "test-user-1",
  first_name: "Test",
  last_name: "User",
  email: "test@example.com",
  name: "Test User",
  gamemaster: false,
  admin: false,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
  image_url: "",
  entity_class: "User",
  active: true,
}

const mockLinkedUser: User = {
  ...mockUser,
  discord_id: "123456789012345678",
}

const renderComponent = (user: User = mockUser, onUserUpdate = jest.fn()) => {
  return render(
    <ThemeProvider theme={theme}>
      <DiscordLinkingSection user={user} onUserUpdate={onUserUpdate} />
    </ThemeProvider>
  )
}

describe("DiscordLinkingSection", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Unlinked state", () => {
    it("renders the Discord Integration section header", () => {
      renderComponent()

      expect(screen.getByText("Discord Integration")).toBeInTheDocument()
      expect(
        screen.getByText(
          "Link your Discord account to interact with Chi War from Discord."
        )
      ).toBeInTheDocument()
    })

    it("displays instructions for linking", () => {
      renderComponent()

      expect(
        screen.getByText("Open Discord and go to a server with the Chi War bot")
      ).toBeInTheDocument()
      expect(
        screen.getByText(/to get your unique link code/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText("Enter the code below (expires in 5 minutes)")
      ).toBeInTheDocument()
    })

    it("renders the link code input field", () => {
      renderComponent()

      const input = screen.getByLabelText("Link Code")
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("placeholder", "ABCDEF")
    })

    it("renders the Link Account button disabled initially", () => {
      renderComponent()

      const button = screen.getByRole("button", { name: /link account/i })
      expect(button).toBeDisabled()
    })

    it("converts input to uppercase", () => {
      renderComponent()

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "abcdef" } })

      expect(input).toHaveValue("ABCDEF")
    })

    it("enables button when valid 6-character alphanumeric code is entered", () => {
      renderComponent()

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC123" } })

      const button = screen.getByRole("button", { name: /link account/i })
      expect(button).not.toBeDisabled()
    })

    it("keeps button disabled for invalid characters", () => {
      renderComponent()

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC-12" } })

      const button = screen.getByRole("button", { name: /link account/i })
      expect(button).toBeDisabled()
    })

    it("keeps button disabled for incomplete code", () => {
      renderComponent()

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC" } })

      const button = screen.getByRole("button", { name: /link account/i })
      expect(button).toBeDisabled()
    })

    it("calls linkDiscord on button click with valid code", async () => {
      const onUserUpdate = jest.fn()
      const updatedUser = { ...mockUser, discord_id: "123456789" }

      mockLinkDiscord.mockResolvedValue({
        data: { success: true, message: "Discord account linked successfully" },
      })
      mockGetCurrentUser.mockResolvedValue({ data: updatedUser })

      renderComponent(mockUser, onUserUpdate)

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC123" } })

      const button = screen.getByRole("button", { name: /link account/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockLinkDiscord).toHaveBeenCalledWith("ABC123")
      })

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Discord account linked successfully"
        )
      })

      await waitFor(() => {
        expect(onUserUpdate).toHaveBeenCalledWith(updatedUser)
      })
    })

    it("submits on Enter key press with valid code", async () => {
      const onUserUpdate = jest.fn()
      const updatedUser = { ...mockUser, discord_id: "123456789" }

      mockLinkDiscord.mockResolvedValue({
        data: { success: true, message: "Discord account linked successfully" },
      })
      mockGetCurrentUser.mockResolvedValue({ data: updatedUser })

      renderComponent(mockUser, onUserUpdate)

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC123" } })
      fireEvent.keyDown(input, { key: "Enter" })

      await waitFor(() => {
        expect(mockLinkDiscord).toHaveBeenCalledWith("ABC123")
      })
    })

    it("shows error toast when linkDiscord fails", async () => {
      mockLinkDiscord.mockRejectedValue({
        response: { data: { error: "Invalid link code" } },
      })

      renderComponent()

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC123" } })

      const button = screen.getByRole("button", { name: /link account/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Invalid link code")
      })
    })

    it("shows error toast when success is false", async () => {
      mockLinkDiscord.mockResolvedValue({
        data: { success: false, message: "Code expired" },
      })

      renderComponent()

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC123" } })

      const button = screen.getByRole("button", { name: /link account/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Code expired")
      })
    })
  })

  describe("Linked state", () => {
    it("shows linked status when user has discord_id", () => {
      renderComponent(mockLinkedUser)

      expect(screen.getByText("Discord account linked")).toBeInTheDocument()
      expect(screen.getByText("Status")).toBeInTheDocument()
    })

    it("renders the Unlink Discord Account button", () => {
      renderComponent(mockLinkedUser)

      const button = screen.getByRole("button", {
        name: /unlink discord account/i,
      })
      expect(button).toBeInTheDocument()
      expect(button).not.toBeDisabled()
    })

    it("does not show link code input when linked", () => {
      renderComponent(mockLinkedUser)

      expect(screen.queryByLabelText("Link Code")).not.toBeInTheDocument()
    })

    it("calls unlinkDiscord on button click", async () => {
      const onUserUpdate = jest.fn()
      const unlinkedUser = { ...mockUser, discord_id: undefined }

      mockUnlinkDiscord.mockResolvedValue({
        data: { success: true, message: "Discord account unlinked" },
      })
      mockGetCurrentUser.mockResolvedValue({ data: unlinkedUser })

      renderComponent(mockLinkedUser, onUserUpdate)

      const button = screen.getByRole("button", {
        name: /unlink discord account/i,
      })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockUnlinkDiscord).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          "Discord account unlinked"
        )
      })

      await waitFor(() => {
        expect(onUserUpdate).toHaveBeenCalledWith(unlinkedUser)
      })
    })

    it("shows error toast when unlinkDiscord fails", async () => {
      mockUnlinkDiscord.mockRejectedValue({
        response: { data: { error: "Failed to unlink" } },
      })

      renderComponent(mockLinkedUser)

      const button = screen.getByRole("button", {
        name: /unlink discord account/i,
      })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith("Failed to unlink")
      })
    })

    it("shows error toast when unlink success is false", async () => {
      mockUnlinkDiscord.mockResolvedValue({
        data: { success: false, message: "Cannot unlink at this time" },
      })

      renderComponent(mockLinkedUser)

      const button = screen.getByRole("button", {
        name: /unlink discord account/i,
      })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          "Cannot unlink at this time"
        )
      })
    })
  })

  describe("Loading states", () => {
    it("shows loading state while linking", async () => {
      mockLinkDiscord.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      renderComponent()

      const input = screen.getByLabelText("Link Code")
      fireEvent.change(input, { target: { value: "ABC123" } })

      const button = screen.getByRole("button", { name: /link account/i })
      fireEvent.click(button)

      expect(
        await screen.findByRole("button", { name: /linking/i })
      ).toBeInTheDocument()
    })

    it("shows loading state while unlinking", async () => {
      mockUnlinkDiscord.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      renderComponent(mockLinkedUser)

      const button = screen.getByRole("button", {
        name: /unlink discord account/i,
      })
      fireEvent.click(button)

      expect(
        await screen.findByRole("button", { name: /unlinking/i })
      ).toBeInTheDocument()
    })
  })
})
