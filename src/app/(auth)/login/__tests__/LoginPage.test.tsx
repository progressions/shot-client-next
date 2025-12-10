import React from "react"
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginPage from "../page"

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
    pathname: "/login",
  }),
  useSearchParams: () => mockSearchParams,
}))

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))

// Mock the client context
const mockDispatchCurrentUser = jest.fn()

jest.mock("@/contexts", () => ({
  useClient: () => ({
    dispatchCurrentUser: mockDispatchCurrentUser,
  }),
}))

// Mock createClient
const mockSignIn = jest.fn()
const mockRequestOtp = jest.fn()
const mockVerifyOtp = jest.fn()
const mockGetCurrentUser = jest.fn()
const mockResendConfirmation = jest.fn()

jest.mock("@/lib/client", () => ({
  createClient: jest.fn(() => ({
    signIn: mockSignIn,
    requestOtp: mockRequestOtp,
    verifyOtp: mockVerifyOtp,
    getCurrentUser: mockGetCurrentUser,
    resendConfirmation: mockResendConfirmation,
  })),
}))

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSearchParams.delete("redirect")
    mockSearchParams.delete("error")
  })

  describe("Tab Navigation", () => {
    it("renders with Password tab selected by default", () => {
      render(<LoginPage />)

      expect(screen.getByRole("tab", { name: /password/i })).toHaveAttribute(
        "aria-selected",
        "true"
      )
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it("switches to OTP tab when clicked", async () => {
      render(<LoginPage />)

      const otpTab = screen.getByRole("tab", { name: /email code/i })
      fireEvent.click(otpTab)

      expect(otpTab).toHaveAttribute("aria-selected", "true")
      expect(
        screen.getByText(
          /enter your email address and we'll send you a login code/i
        )
      ).toBeInTheDocument()
    })

    it("clears error and success states when switching tabs", async () => {
      render(<LoginPage />)

      // Trigger an error on password tab
      mockSignIn.mockResolvedValue({
        success: false,
        error: { message: "Invalid credentials" },
      })

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "wrongpassword")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument()
      })

      // Switch to OTP tab
      const otpTab = screen.getByRole("tab", { name: /email code/i })
      await act(async () => {
        fireEvent.click(otpTab)
      })

      // Error should be cleared
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("resets OTP state when switching tabs", async () => {
      // Set up mock before rendering
      mockRequestOtp.mockResolvedValue({
        data: { message: "Code sent" },
      })

      render(<LoginPage />)

      // Switch to OTP tab
      const otpTab = screen.getByRole("tab", { name: /email code/i })
      await act(async () => {
        fireEvent.click(otpTab)
      })

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, "test@example.com")

      const sendButton = screen.getByRole("button", {
        name: /send login code/i,
      })
      await act(async () => {
        fireEvent.click(sendButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument()
      })

      // Switch to password tab and back
      const passwordTab = screen.getByRole("tab", { name: /password/i })
      await act(async () => {
        fireEvent.click(passwordTab)
      })
      await act(async () => {
        fireEvent.click(otpTab)
      })

      // Should be back to email entry state
      expect(
        screen.getByText(
          /enter your email address and we'll send you a login code/i
        )
      ).toBeInTheDocument()
    })
  })

  describe("Password Login", () => {
    it("successfully logs in with valid credentials", async () => {
      mockSignIn.mockResolvedValue({
        success: true,
        token: "valid-jwt-token",
      })

      mockGetCurrentUser.mockResolvedValue({
        data: {
          id: "user-1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "correctpassword")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "correctpassword",
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/")
      })
    })

    it("displays error message on failed login", async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: { message: "Invalid email or password" },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "wrongpassword")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(
          "Invalid email or password"
        )
      })
    })

    it("shows unconfirmed account message for unverified users", async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: {
          error_type: "unconfirmed_account",
          email: "unconfirmed@example.com",
          message: "Account not confirmed",
        },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(emailInput, "unconfirmed@example.com")
      await userEvent.type(passwordInput, "password123")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(
          screen.getByText(
            /please confirm your email address before logging in/i
          )
        ).toBeInTheDocument()
      })

      expect(
        screen.getByRole("button", { name: /resend confirmation email/i })
      ).toBeInTheDocument()
    })

    it("resends confirmation email when requested", async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: {
          error_type: "unconfirmed_account",
          email: "unconfirmed@example.com",
        },
      })

      mockResendConfirmation.mockResolvedValue({
        data: { message: "Confirmation email sent!" },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(emailInput, "unconfirmed@example.com")
      await userEvent.type(passwordInput, "password123")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /resend confirmation email/i })
        ).toBeInTheDocument()
      })

      const resendButton = screen.getByRole("button", {
        name: /resend confirmation email/i,
      })
      await act(async () => {
        fireEvent.click(resendButton)
      })

      await waitFor(() => {
        expect(mockResendConfirmation).toHaveBeenCalledWith(
          "unconfirmed@example.com"
        )
      })

      await waitFor(() => {
        expect(screen.getByText("Confirmation email sent!")).toBeInTheDocument()
      })
    })

    it("shows loading state during submission", async () => {
      mockSignIn.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "password123")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      fireEvent.click(submitButton)

      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled()
    })
  })

  describe("OTP Authentication", () => {
    const setupOtpTab = async () => {
      render(<LoginPage />)
      const otpTab = screen.getByRole("tab", { name: /email code/i })
      await act(async () => {
        fireEvent.click(otpTab)
      })
    }

    it("successfully requests OTP code", async () => {
      mockRequestOtp.mockResolvedValue({
        data: { message: "Check your email for a login code" },
      })

      await setupOtpTab()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, "test@example.com")

      const sendButton = screen.getByRole("button", {
        name: /send login code/i,
      })
      await act(async () => {
        fireEvent.click(sendButton)
      })

      await waitFor(() => {
        expect(mockRequestOtp).toHaveBeenCalledWith("test@example.com")
      })

      await waitFor(() => {
        expect(screen.getByText(/enter the 6-digit code/i)).toBeInTheDocument()
      })
    })

    it("shows success message after OTP request", async () => {
      mockRequestOtp.mockResolvedValue({
        data: { message: "We've sent you a login code!" },
      })

      await setupOtpTab()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, "test@example.com")

      const sendButton = screen.getByRole("button", {
        name: /send login code/i,
      })
      await act(async () => {
        fireEvent.click(sendButton)
      })

      await waitFor(() => {
        expect(
          screen.getByText("We've sent you a login code!")
        ).toBeInTheDocument()
      })
    })

    it("handles OTP request errors", async () => {
      mockRequestOtp.mockRejectedValue(new Error("Network error"))

      await setupOtpTab()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, "test@example.com")

      const sendButton = screen.getByRole("button", {
        name: /send login code/i,
      })
      await act(async () => {
        fireEvent.click(sendButton)
      })

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Network error")
      })
    })

    it("shows loading state during OTP request", async () => {
      mockRequestOtp.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      await setupOtpTab()

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, "test@example.com")

      const sendButton = screen.getByRole("button", {
        name: /send login code/i,
      })
      fireEvent.click(sendButton)

      expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled()
    })
  })

  describe("OTP Code Verification", () => {
    const setupOtpCodeEntry = async () => {
      // Set up mock before rendering
      mockRequestOtp.mockResolvedValue({
        data: { message: "Code sent" },
      })

      render(<LoginPage />)

      // Navigate to OTP tab and request code
      const otpTab = screen.getByRole("tab", { name: /email code/i })
      await act(async () => {
        fireEvent.click(otpTab)
      })

      const emailInput = screen.getByLabelText(/email address/i)
      await userEvent.type(emailInput, "test@example.com")

      const sendButton = screen.getByRole("button", {
        name: /send login code/i,
      })
      await act(async () => {
        fireEvent.click(sendButton)
      })

      // Wait for the OTP request to complete and UI to transition
      await waitFor(
        () => {
          expect(
            screen.getByText(/enter the 6-digit code/i)
          ).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    }

    // Helper function to fill OTP inputs by pasting the code
    const fillOtpInputs = async (code: string) => {
      const user = userEvent.setup()
      const digit1 = screen.getByLabelText("Digit 1 of 6")
      await user.click(digit1)
      await user.paste(code)
    }

    it("successfully verifies OTP and logs in", async () => {
      await setupOtpCodeEntry()

      mockVerifyOtp.mockResolvedValue({
        data: { token: "valid-jwt-token" },
      })

      mockGetCurrentUser.mockResolvedValue({
        data: {
          id: "user-1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      })

      // Fill OTP inputs sequentially - auto-submits on completion
      await fillOtpInputs("123456")

      await waitFor(() => {
        expect(mockVerifyOtp).toHaveBeenCalledWith("test@example.com", "123456")
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/")
      })
    })

    it("handles invalid OTP code", async () => {
      await setupOtpCodeEntry()

      mockVerifyOtp.mockResolvedValue({
        data: {},
      })

      // Fill OTP inputs sequentially - auto-submits on completion
      await act(async () => {
        await fillOtpInputs("000000")
      })

      // Allow async error handling to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Invalid code")
      })
    })

    it("handles OTP verification errors", async () => {
      await setupOtpCodeEntry()

      mockVerifyOtp.mockRejectedValue(new Error("Invalid or expired code"))

      // Fill OTP inputs sequentially - auto-submits on completion
      await act(async () => {
        await fillOtpInputs("123456")
      })

      // Allow async error handling to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(
        () => {
          expect(screen.getByRole("alert")).toHaveTextContent(
            "Invalid or expired code"
          )
        },
        { timeout: 3000 }
      )
    })

    it("only allows numeric input in OTP field", async () => {
      await setupOtpCodeEntry()

      // OtpInput component filters non-numeric input
      const digit1 = screen.getByLabelText("Digit 1 of 6")

      // Try to enter non-numeric value - should be filtered out
      fireEvent.change(digit1, { target: { value: "a" } })
      expect(digit1).toHaveValue("")

      // Enter numeric value - should be accepted
      fireEvent.change(digit1, { target: { value: "1" } })
      expect(digit1).toHaveValue("1")
    })

    it("allows going back to email entry", async () => {
      await setupOtpCodeEntry()

      const backButton = screen.getByRole("button", {
        name: /use a different email/i,
      })
      fireEvent.click(backButton)

      expect(
        screen.getByText(
          /enter your email address and we'll send you a login code/i
        )
      ).toBeInTheDocument()
    })

    it("shows loading state during verification", async () => {
      await setupOtpCodeEntry()

      // Make verification take some time so we can observe loading state
      let resolveVerify: (value: { data: { token: string } }) => void
      mockVerifyOtp.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveVerify = resolve
          })
      )

      // Fill OTP inputs sequentially - auto-submits on completion
      await fillOtpInputs("123456")

      // Loading state shows "Verifying..." text
      await waitFor(() => {
        expect(screen.getByText(/verifying/i)).toBeInTheDocument()
      })

      // Clean up by resolving the promise
      await act(async () => {
        resolveVerify!({ data: { token: "test-token" } })
      })
    })
  })

  describe("Error Handling from URL Parameters", () => {
    it("displays error for invalid_token", () => {
      mockSearchParams.set("error", "invalid_token")

      render(<LoginPage />)

      expect(screen.getByText(/your session has expired/i)).toBeInTheDocument()
    })

    it("displays error for unauthorized", () => {
      mockSearchParams.set("error", "unauthorized")

      render(<LoginPage />)

      expect(screen.getByText(/authentication failed/i)).toBeInTheDocument()
    })
  })

  describe("Redirect Handling", () => {
    it("redirects to specified path after successful login", async () => {
      mockSearchParams.set("redirect", "/campaigns")

      mockSignIn.mockResolvedValue({
        success: true,
        token: "valid-jwt-token",
      })

      mockGetCurrentUser.mockResolvedValue({
        data: {
          id: "user-1",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
        },
      })

      render(<LoginPage />)

      const emailInput = screen.getByLabelText(/email address/i)
      const passwordInput = screen.getByLabelText(/password/i)

      await userEvent.type(emailInput, "test@example.com")
      await userEvent.type(passwordInput, "correctpassword")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/campaigns")
      })
    })
  })
})
