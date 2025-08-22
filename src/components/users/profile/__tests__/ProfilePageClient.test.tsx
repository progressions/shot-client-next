import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProfilePageClient from "../ProfilePageClient"
import { AppProvider } from "@/contexts"
import { ToastProvider } from "@/contexts"
import type { User } from "@/types"

// Mock the contexts
jest.mock("@/contexts", () => ({
  useClient: () => ({
    client: {
      updateUser: jest.fn().mockResolvedValue({
        data: mockUser,
      }),
    },
  }),
  useToast: () => ({
    toastSuccess: jest.fn(),
    toastError: jest.fn(),
  }),
  AppProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Mock the CampaignsList component
jest.mock("../CampaignsList", () => ({
  CampaignsList: () => <div data-testid="campaigns-list">Campaigns List</div>,
}))

const mockUser: User = {
  id: "1",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  name: "John Doe",
  gamemaster: false,
  admin: false,
  created_at: "2023-01-01T00:00:00.000Z",
  updated_at: "2023-01-01T00:00:00.000Z",
  image_url: "",
  entity_class: "User",
  active: true,
}

const renderComponent = (user: User = mockUser) => {
  return render(
    <AppProvider>
      <ToastProvider>
        <ProfilePageClient user={user} />
      </ToastProvider>
    </AppProvider>
  )
}

describe("ProfilePageClient Email Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the profile form with user data", () => {
    renderComponent()

    expect(screen.getByDisplayValue("John")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument()
    expect(screen.getByDisplayValue("john.doe@example.com")).toBeInTheDocument()
  })

  it("allows editing non-email fields without confirmation", async () => {
    const user = userEvent.setup()
    renderComponent()

    const firstNameField = screen.getByDisplayValue("John")
    await user.clear(firstNameField)
    await user.type(firstNameField, "Jane")

    // Should not show email confirmation dialog
    expect(
      screen.queryByText("Confirm Email Address Change")
    ).not.toBeInTheDocument()
  })

  it("shows confirmation dialog when email is changed", async () => {
    const user = userEvent.setup()
    renderComponent()

    const emailField = screen.getByDisplayValue("john.doe@example.com")
    await user.clear(emailField)
    await user.type(emailField, "jane.doe@example.com")

    // Should show email confirmation dialog
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Email Address Change")
      ).toBeInTheDocument()
    })

    expect(screen.getByText(/Current email:/)).toBeInTheDocument()
    expect(screen.getByText(/john.doe@example.com/)).toBeInTheDocument()
    expect(screen.getByText(/New email:/)).toBeInTheDocument()
    expect(screen.getByText(/jane.doe@example.com/)).toBeInTheDocument()
  })

  it("does not show confirmation for case-only changes", async () => {
    const user = userEvent.setup()
    renderComponent()

    const emailField = screen.getByDisplayValue("john.doe@example.com")
    await user.clear(emailField)
    await user.type(emailField, "JOHN.DOE@EXAMPLE.COM")

    // Should not show email confirmation dialog for case-only changes
    expect(
      screen.queryByText("Confirm Email Address Change")
    ).not.toBeInTheDocument()
  })

  it("does not show confirmation for whitespace-only changes", async () => {
    const user = userEvent.setup()
    renderComponent()

    const emailField = screen.getByDisplayValue("john.doe@example.com")
    await user.clear(emailField)
    await user.type(emailField, " john.doe@example.com ")

    // Should not show email confirmation dialog for whitespace-only changes
    expect(
      screen.queryByText("Confirm Email Address Change")
    ).not.toBeInTheDocument()
  })

  it("proceeds with email change when confirmed", async () => {
    const user = userEvent.setup()
    const { useClient } = jest.requireMock("@/contexts")
    const mockUpdateUser = jest.fn().mockResolvedValue({
      data: { ...mockUser, email: "jane.doe@example.com" },
    })
    useClient.mockReturnValue({
      client: { updateUser: mockUpdateUser },
    })

    renderComponent()

    const emailField = screen.getByDisplayValue("john.doe@example.com")
    await user.clear(emailField)
    await user.type(emailField, "jane.doe@example.com")

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Email Address Change")
      ).toBeInTheDocument()
    })

    // Click confirm
    const confirmButton = screen.getByRole("button", {
      name: /confirm change/i,
    })
    await user.click(confirmButton)

    // Should call updateUser
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith(
        mockUser.id,
        expect.any(FormData)
      )
    })
  })

  it("cancels email change and reverts field", async () => {
    const user = userEvent.setup()
    renderComponent()

    const emailField = screen.getByDisplayValue("john.doe@example.com")
    await user.clear(emailField)
    await user.type(emailField, "jane.doe@example.com")

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Email Address Change")
      ).toBeInTheDocument()
    })

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: /cancel/i })
    await user.click(cancelButton)

    // Dialog should be closed
    await waitFor(() => {
      expect(
        screen.queryByText("Confirm Email Address Change")
      ).not.toBeInTheDocument()
    })
  })

  it("closes dialog on Escape key", async () => {
    const user = userEvent.setup()
    renderComponent()

    const emailField = screen.getByDisplayValue("john.doe@example.com")
    await user.clear(emailField)
    await user.type(emailField, "jane.doe@example.com")

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Email Address Change")
      ).toBeInTheDocument()
    })

    // Press Escape
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" })

    // Dialog should be closed
    await waitFor(() => {
      expect(
        screen.queryByText("Confirm Email Address Change")
      ).not.toBeInTheDocument()
    })
  })

  it("handles API errors during email change", async () => {
    const user = userEvent.setup()
    const { useClient, useToast } = jest.requireMock("@/contexts")
    const mockUpdateUser = jest.fn().mockRejectedValue(new Error("API Error"))
    const mockToastError = jest.fn()

    useClient.mockReturnValue({
      client: { updateUser: mockUpdateUser },
    })
    useToast.mockReturnValue({
      toastSuccess: jest.fn(),
      toastError: mockToastError,
    })

    renderComponent()

    const emailField = screen.getByDisplayValue("john.doe@example.com")
    await user.clear(emailField)
    await user.type(emailField, "jane.doe@example.com")

    // Wait for confirmation dialog
    await waitFor(() => {
      expect(
        screen.getByText("Confirm Email Address Change")
      ).toBeInTheDocument()
    })

    // Click confirm
    const confirmButton = screen.getByRole("button", {
      name: /confirm change/i,
    })
    await user.click(confirmButton)

    // Should show error toast
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to update profile")
    })
  })
})
