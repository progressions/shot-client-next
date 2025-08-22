import { handleError } from "@/lib/errorHandler"
import { FormActions } from "@/reducers"
import type { BackendErrorResponse } from "@/types"

// Mock axios and AxiosError
jest.mock("axios", () => ({
  AxiosError: class MockAxiosError extends Error {
    public response?: any
    public request?: any
    public config?: any
    public code?: string

    constructor(
      message?: string,
      code?: string,
      config?: any,
      request?: any,
      response?: any
    ) {
      super(message)
      this.name = "AxiosError"
      this.code = code
      this.config = config
      this.request = request
      this.response = response
    }

    static create(
      message?: string,
      code?: string,
      config?: any,
      request?: any,
      response?: any
    ) {
      return new MockAxiosError(message, code, config, request, response)
    }
  },
}))

const { AxiosError } = require("axios")

describe("errorHandler", () => {
  let mockDispatchForm: jest.Mock
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    mockDispatchForm = jest.fn()
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    consoleSpy.mockRestore()
  })

  describe("AxiosError handling", () => {
    it("handles AxiosError with simple error field", () => {
      const backendError: BackendErrorResponse = {
        error: "Invalid credentials",
      }

      const axiosError = new AxiosError(
        "Request failed",
        "400",
        {},
        {},
        {
          data: backendError,
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: {} as any,
        }
      )

      handleError(axiosError, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "Invalid credentials",
        axiosError
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "Invalid credentials",
      })
    })

    it("handles AxiosError with errors object (multiple field errors)", () => {
      const backendError: BackendErrorResponse = {
        errors: {
          name: ["is required", "is too short"],
          email: ["is invalid"],
          password: ["must be at least 8 characters"],
        },
      }

      const axiosError = new AxiosError(
        "Validation failed",
        "422",
        {},
        {},
        {
          data: backendError,
          status: 422,
          statusText: "Unprocessable Entity",
          headers: {},
          config: {} as any,
        }
      )

      handleError(axiosError, mockDispatchForm)

      const expectedMessage =
        "is required, is too short, is invalid, must be at least 8 characters"

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        expectedMessage,
        axiosError
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: expectedMessage,
      })
    })

    it("handles AxiosError with name array", () => {
      const backendError: BackendErrorResponse = {
        name: ["Name is required", "Name must be unique"],
      }

      const axiosError = new AxiosError(
        "Name validation failed",
        "422",
        {},
        {},
        {
          data: backendError,
          status: 422,
          statusText: "Unprocessable Entity",
          headers: {},
          config: {} as any,
        }
      )

      handleError(axiosError, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "Name is required, Name must be unique",
        axiosError
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "Name is required, Name must be unique",
      })
    })

    it("handles AxiosError with priority: error > errors > name", () => {
      const backendError: BackendErrorResponse = {
        error: "Server error",
        errors: {
          field: ["Field error"],
        },
        name: ["Name error"],
      }

      const axiosError = new AxiosError(
        "Multiple error types",
        "500",
        {},
        {},
        {
          data: backendError,
          status: 500,
          statusText: "Internal Server Error",
          headers: {},
          config: {} as any,
        }
      )

      handleError(axiosError, mockDispatchForm)

      // Should prioritize 'error' field
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "Server error",
      })
    })

    it("handles AxiosError with empty response data", () => {
      const axiosError = new AxiosError(
        "Network error",
        "NETWORK_ERROR",
        {},
        {},
        {
          data: {},
          status: 0,
          statusText: "",
          headers: {},
          config: {} as any,
        }
      )

      handleError(axiosError, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "An unexpected error occurred",
        axiosError
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "An unexpected error occurred",
      })
    })

    it("handles AxiosError without response", () => {
      const axiosError = new AxiosError("Network timeout", "ECONNABORTED")
      // No response property

      handleError(axiosError, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "An unexpected error occurred",
        axiosError
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "An unexpected error occurred",
      })
    })

    it("handles malformed errors object", () => {
      const backendError = {
        errors: {
          field1: "not an array", // Should be array but isn't
          field2: ["valid array"],
          field3: null,
        },
      } as any

      const axiosError = new AxiosError(
        "Malformed response",
        "422",
        {},
        {},
        {
          data: backendError,
          status: 422,
          statusText: "Unprocessable Entity",
          headers: {},
          config: {} as any,
        }
      )

      handleError(axiosError, mockDispatchForm)

      // Should handle gracefully, potentially flattening non-arrays
      expect(mockDispatchForm).toHaveBeenCalled()
      const dispatchCall = mockDispatchForm.mock.calls[0][0]
      expect(dispatchCall.type).toBe(FormActions.ERROR)
      expect(typeof dispatchCall.payload).toBe("string")
    })
  })

  describe("Generic Error handling", () => {
    it("handles standard Error object", () => {
      const error = new Error("Something went wrong")

      handleError(error, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "Something went wrong",
        error
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "Something went wrong",
      })
    })

    it("handles Error with empty message", () => {
      const error = new Error("")

      handleError(error, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith("Error:", "", error)
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "",
      })
    })

    it("handles TypeError", () => {
      const error = new TypeError("Cannot read property of undefined")

      handleError(error, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "Cannot read property of undefined",
        error
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "Cannot read property of undefined",
      })
    })
  })

  describe("Unknown error types", () => {
    it("handles string as error", () => {
      const error = "String error message"

      handleError(error, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "An unexpected error occurred",
        error
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "An unexpected error occurred",
      })
    })

    it("handles null error", () => {
      handleError(null, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "An unexpected error occurred",
        null
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "An unexpected error occurred",
      })
    })

    it("handles undefined error", () => {
      handleError(undefined, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "An unexpected error occurred",
        undefined
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "An unexpected error occurred",
      })
    })

    it("handles object with no recognizable error properties", () => {
      const weirdError = { someProperty: "some value", code: 123 }

      handleError(weirdError, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "An unexpected error occurred",
        weirdError
      )
      expect(mockDispatchForm).toHaveBeenCalledWith({
        type: FormActions.ERROR,
        payload: "An unexpected error occurred",
      })
    })
  })

  describe("Console logging", () => {
    it("always logs error details to console", () => {
      const error = new Error("Test error")

      handleError(error, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledTimes(1)
      expect(consoleSpy).toHaveBeenCalledWith("Error:", "Test error", error)
    })

    it("logs with extracted error message and original error object", () => {
      const backendError: BackendErrorResponse = {
        error: "Backend validation failed",
      }

      const axiosError = new AxiosError(
        "Request failed",
        "400",
        {},
        {},
        {
          data: backendError,
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config: {} as any,
        }
      )

      handleError(axiosError, mockDispatchForm)

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error:",
        "Backend validation failed", // Extracted message
        axiosError // Original error object for debugging
      )
    })
  })

  describe("Form dispatch integration", () => {
    it("always dispatches FormActions.ERROR", () => {
      const error = new Error("Any error")

      handleError(error, mockDispatchForm)

      expect(mockDispatchForm).toHaveBeenCalledTimes(1)
      const dispatchedAction = mockDispatchForm.mock.calls[0][0]
      expect(dispatchedAction.type).toBe(FormActions.ERROR)
    })

    it("dispatch function is called with correct action structure", () => {
      const error = new Error("Test error")

      handleError(error, mockDispatchForm)

      const dispatchedAction = mockDispatchForm.mock.calls[0][0]
      expect(dispatchedAction).toEqual({
        type: FormActions.ERROR,
        payload: "Test error",
      })
    })

    it("propagates dispatch function errors (does not handle them gracefully)", () => {
      const mockThrowingDispatch = jest.fn().mockImplementation(() => {
        throw new Error("Dispatch failed")
      })

      const error = new Error("Original error")

      // Should throw - dispatch errors should bubble up to caller
      expect(() => {
        handleError(error, mockThrowingDispatch)
      }).toThrow("Dispatch failed")

      // Should still log the original error before dispatch fails
      expect(consoleSpy).toHaveBeenCalledWith("Error:", "Original error", error)
    })
  })
})
