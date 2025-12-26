import React from "react"
import { render, screen, waitFor, act } from "@testing-library/react"
import Cookies from "js-cookie"
import MagicLinkPage from "../page"
import { UserActions } from "@/reducers"

// Mock next/navigation
const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams()

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: "/login/otp",
  }),
  useSearchParams: () => mockSearchParams,
}))

// js-cookie is already mocked in jest.setup.js

// Mock the client context
const mockDispatchCurrentUser = jest.fn()

jest.mock("@/contexts", () => ({
  useClient: () => ({
    dispatchCurrentUser: mockDispatchCurrentUser,
  }),
}))

// Mock createClient
const mockVerifyMagicLink = jest.fn()
const mockGetCurrentUser = jest.fn()

jest.mock("@/lib/client", () => ({
  createClient: jest.fn(() => ({
    verifyMagicLink: mockVerifyMagicLink,
    getCurrentUser: mockGetCurrentUser,
  })),
}))

describe("MagicLinkPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.delete("token")
  })

  describe("Loading State", () => {
    it("shows loading state while verifying", () => {
      mockSearchParams.set("token", "valid-magic-token")
      mockVerifyMagicLink.mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      )

      render(<MagicLinkPage />)

      expect(screen.getByText(/verifying your magic link/i)).toBeInTheDocument()
      expect(
        screen.getByText(/please wait while we log you in/i)
      ).toBeInTheDocument()
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })
  })

  describe("Successful Verification", () => {
    it("verifies magic link and logs in user", async () => {
      mockSearchParams.set("token", "valid-magic-token")

      mockVerifyMagicLink.mockResolvedValue({
        data: { token: "jwt-token-from-magic-link" },
      })

      mockGetCurrentUser.mockResolvedValue({
        data: {
          id: "user-1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      })

      await act(async () => {
        render(<MagicLinkPage />)
      })

      await waitFor(() => {
        expect(mockVerifyMagicLink).toHaveBeenCalledWith("valid-magic-token")
      })

      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument()
      })

      expect(
        screen.getByText(/redirecting you to the app/i)
      ).toBeInTheDocument()
    })

    it("sets JWT cookie on successful verification", async () => {
      mockSearchParams.set("token", "valid-magic-token")

      mockVerifyMagicLink.mockResolvedValue({
        data: { token: "jwt-token-from-magic-link" },
      })

      mockGetCurrentUser.mockResolvedValue({
        data: {
          id: "user-1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      })

      render(<MagicLinkPage />)

      await waitFor(() => {
        expect(Cookies.set).toHaveBeenCalledWith(
          "jwtToken",
          "jwt-token-from-magic-link",
          expect.objectContaining({
            expires: 7,
            sameSite: "Lax",
            path: "/",
          })
        )
      })
    })

    it("sets user ID cookie on successful verification", async () => {
      mockSearchParams.set("token", "valid-magic-token")

      mockVerifyMagicLink.mockResolvedValue({
        data: { token: "jwt-token-from-magic-link" },
      })

      mockGetCurrentUser.mockResolvedValue({
        data: {
          id: "user-123",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      })

      render(<MagicLinkPage />)

      await waitFor(() => {
        expect(Cookies.set).toHaveBeenCalledWith(
          "userId",
          "user-123",
          expect.objectContaining({
            expires: 7,
            sameSite: "Lax",
            path: "/",
          })
        )
      })
    })

    it("dispatches current user to context", async () => {
      mockSearchParams.set("token", "valid-magic-token")

      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
      }

      mockVerifyMagicLink.mockResolvedValue({
        data: { token: "jwt-token-from-magic-link" },
      })

      mockGetCurrentUser.mockResolvedValue({
        data: mockUser,
      })

      render(<MagicLinkPage />)

      await waitFor(() => {
        expect(mockDispatchCurrentUser).toHaveBeenCalledWith({
          type: UserActions.USER,
          payload: mockUser,
        })
      })
    })

    it("redirects to home after successful login", async () => {
      jest.useFakeTimers()

      mockSearchParams.set("token", "valid-magic-token")

      mockVerifyMagicLink.mockResolvedValue({
        data: { token: "jwt-token-from-magic-link" },
      })

      mockGetCurrentUser.mockResolvedValue({
        data: {
          id: "user-1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      })

      render(<MagicLinkPage />)

      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument()
      })

      // Fast-forward the redirect timer
      jest.advanceTimersByTime(1500)

      expect(mockPush).toHaveBeenCalledWith("/")

      jest.useRealTimers()
    })
  })

  describe("Error Handling", () => {
    it("shows error when no token is provided", async () => {
      // No token set in searchParams

      render(<MagicLinkPage />)

      await waitFor(() => {
        expect(
          screen.getByText(/invalid magic link - no token provided/i)
        ).toBeInTheDocument()
      })
    })

    it("shows error for invalid token", async () => {
      mockSearchParams.set("token", "invalid-token")

      mockVerifyMagicLink.mockResolvedValue({
        data: {}, // No token in response means invalid
      })

      await act(async () => {
        render(<MagicLinkPage />)
      })

      await waitFor(() => {
        expect(screen.getByText(/invalid or expired link/i)).toBeInTheDocument()
      })
    })

    it("shows error for expired token", async () => {
      mockSearchParams.set("token", "expired-token")

      mockVerifyMagicLink.mockRejectedValue(new Error("Token has expired"))

      await act(async () => {
        render(<MagicLinkPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/failed to verify magic link/i)
        ).toBeInTheDocument()
      })
    })

    it("shows error when API call fails", async () => {
      mockSearchParams.set("token", "some-token")

      mockVerifyMagicLink.mockRejectedValue(new Error("Network error"))

      await act(async () => {
        render(<MagicLinkPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(/failed to verify magic link/i)
        ).toBeInTheDocument()
      })
    })

    it("displays helpful message for expired links", async () => {
      mockSearchParams.set("token", "expired-token")

      mockVerifyMagicLink.mockRejectedValue(new Error("Token expired"))

      await act(async () => {
        render(<MagicLinkPage />)
      })

      await waitFor(() => {
        expect(
          screen.getByText(
            /your magic link may have expired or already been used/i
          )
        ).toBeInTheDocument()
      })
    })

    it("provides link back to login page on error", async () => {
      mockSearchParams.set("token", "invalid-token")

      mockVerifyMagicLink.mockResolvedValue({
        data: {},
      })

      await act(async () => {
        render(<MagicLinkPage />)
      })

      await waitFor(() => {
        const backButton = screen.getByRole("link", { name: /back to login/i })
        expect(backButton).toBeInTheDocument()
        expect(backButton).toHaveAttribute("href", "/login")
      })
    })
  })

  describe("Suspense Fallback", () => {
    it("renders suspense fallback with loading spinner", () => {
      // This tests that the component is properly wrapped in Suspense
      mockSearchParams.set("token", "valid-token")
      mockVerifyMagicLink.mockImplementation(() => new Promise(() => {}))

      render(<MagicLinkPage />)

      // Should show loading state from Suspense or component
      expect(screen.getByRole("progressbar")).toBeInTheDocument()
    })
  })
})
