import { AxiosResponse } from "axios"
import { createAuthClient } from "../authClient"
import { createBaseClient } from "../baseClient"
import type { User, PasswordWithConfirmation, UsersResponse, ConfirmationResponse } from "@/types"

// Mock the baseClient
jest.mock("../baseClient")
const mockCreateBaseClient = createBaseClient as jest.MockedFunction<typeof createBaseClient>

describe("createAuthClient", () => {
  // Mock API objects
  const mockApi = {
    registerUser: jest.fn(() => "/api/v1/users"),
    adminUsers: jest.fn((user: User | string) => 
      typeof user === 'string' ? `/api/v1/admin/users/${user}` : `/api/v1/admin/users/${user.id}`
    ),
    unlockUser: jest.fn(() => "/api/v1/users/unlock"),
    confirmUser: jest.fn(() => "/api/v1/users/confirm"),
    resetUserPassword: jest.fn(() => "/api/v1/users/password"),
  }

  const mockApiV2 = {
    users: jest.fn((user?: User | { id: string }) => 
      user ? `/api/v2/users/${user.id}` : "/api/v2/users"
    ),
    currentUser: jest.fn(() => "/api/v2/users/current"),
  }

  const mockQueryParams = jest.fn((params: Record<string, unknown>) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  })

  // Mock base client methods
  const mockGet = jest.fn()
  const mockGetPublic = jest.fn()
  const mockPost = jest.fn()
  const mockPatch = jest.fn()
  const mockDelete = jest.fn()
  const mockRequestFormData = jest.fn()

  const mockBaseClient = {
    get: mockGet,
    getPublic: mockGetPublic,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
    requestFormData: mockRequestFormData,
    request: jest.fn(),
  }

  const mockJWT = "test-jwt-token"
  const deps = {
    jwt: mockJWT,
    api: mockApi,
    apiV2: mockApiV2,
    queryParams: mockQueryParams,
  }

  let authClient: ReturnType<typeof createAuthClient>

  const mockUser: User = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    gamemaster: false,
    admin: false,
    first_name: "Test",
    last_name: "User",
    entity_class: "User",
    active: true,
    created_at: "2023-01-01T00:00:00.000Z",
    updated_at: "2023-01-01T00:00:00.000Z",
    image_url: "",
  }

  const mockResponse: AxiosResponse<User> = {
    data: mockUser,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateBaseClient.mockReturnValue(mockBaseClient)
    authClient = createAuthClient(deps)
    
    // Default successful responses
    mockGet.mockResolvedValue(mockResponse)
    mockGetPublic.mockResolvedValue(mockResponse)
    mockPost.mockResolvedValue(mockResponse)
    mockPatch.mockResolvedValue(mockResponse)
    mockDelete.mockResolvedValue({ ...mockResponse, data: undefined })
    mockRequestFormData.mockResolvedValue(mockResponse)
  })

  describe("createUser", () => {
    it("creates user via POST request", async () => {
      await authClient.createUser(mockUser)

      expect(mockApi.registerUser).toHaveBeenCalled()
      expect(mockPost).toHaveBeenCalledWith("/api/v1/users", { user: mockUser })
    })

    it("returns the response from POST request", async () => {
      const result = await authClient.createUser(mockUser)
      expect(result).toBe(mockResponse)
    })
  })

  describe("updateUser", () => {
    it("updates user via V1 API with User object", async () => {
      await authClient.updateUser(mockUser)

      expect(mockApi.adminUsers).toHaveBeenCalledWith(mockUser)
      expect(mockPatch).toHaveBeenCalledWith(`/api/v1/admin/users/${mockUser.id}`, { user: mockUser })
    })

    it("updates user via V2 API with FormData", async () => {
      const formData = new FormData()
      formData.append("first_name", "Updated")
      
      await authClient.updateUser(mockUser.id, formData)

      expect(mockApiV2.users).toHaveBeenCalledWith({ id: mockUser.id })
      expect(mockRequestFormData).toHaveBeenCalledWith("PATCH", `/api/v2/users/${mockUser.id}`, formData)
    })

    it("handles string ID parameter correctly", async () => {
      const userId = "user-456"
      const formData = new FormData()
      
      await authClient.updateUser(userId, formData)

      expect(mockApiV2.users).toHaveBeenCalledWith({ id: userId })
      expect(mockRequestFormData).toHaveBeenCalledWith("PATCH", `/api/v2/users/${userId}`, formData)
    })
  })

  describe("deleteUser", () => {
    it("deletes user via DELETE request", async () => {
      await authClient.deleteUser(mockUser)

      expect(mockApiV2.users).toHaveBeenCalledWith(mockUser)
      expect(mockDelete).toHaveBeenCalledWith(`/api/v2/users/${mockUser.id}`)
    })
  })

  describe("deleteUserImage", () => {
    it("deletes user image via DELETE request", async () => {
      await authClient.deleteUserImage(mockUser)

      expect(mockApiV2.users).toHaveBeenCalledWith(mockUser)
      expect(mockDelete).toHaveBeenCalledWith(`/api/v2/users/${mockUser.id}/image`)
    })
  })

  describe("getUser", () => {
    it("gets user via V1 API", async () => {
      await authClient.getUser(mockUser)

      expect(mockApi.adminUsers).toHaveBeenCalledWith(mockUser)
      expect(mockGet).toHaveBeenCalledWith(`/api/v1/admin/users/${mockUser.id}`, {}, {})
    })

    it("handles string user parameter", async () => {
      const userId = "user-789"
      await authClient.getUser(userId)

      expect(mockApi.adminUsers).toHaveBeenCalledWith(userId)
      expect(mockGet).toHaveBeenCalledWith(`/api/v1/admin/users/${userId}`, {}, {})
    })

    it("passes cache options", async () => {
      const cacheOptions = { cache: "force-cache" as const, revalidate: 3600 }
      await authClient.getUser(mockUser, cacheOptions)

      expect(mockGet).toHaveBeenCalledWith(
        `/api/v1/admin/users/${mockUser.id}`, 
        {}, 
        cacheOptions
      )
    })
  })

  describe("getCurrentUser", () => {
    it("gets current user via V2 API", async () => {
      await authClient.getCurrentUser()

      expect(mockApiV2.currentUser).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith("/api/v2/users/current", {}, {})
    })

    it("passes cache options", async () => {
      const cacheOptions = { cache: "no-store" as const }
      await authClient.getCurrentUser(cacheOptions)

      expect(mockGet).toHaveBeenCalledWith("/api/v2/users/current", {}, cacheOptions)
    })
  })

  describe("unlockUser", () => {
    it("unlocks user with token via GET request", async () => {
      const unlockToken = "unlock-123"
      await authClient.unlockUser(unlockToken)

      expect(mockApi.unlockUser).toHaveBeenCalled()
      expect(mockGet).toHaveBeenCalledWith("/api/v1/users/unlock?unlock_token=unlock-123")
    })
  })

  describe("confirmUser", () => {
    it("confirms user with token via POST request", async () => {
      const confirmationToken = "confirm-123"
      await authClient.confirmUser(confirmationToken)

      expect(mockApi.confirmUser).toHaveBeenCalled()
      expect(mockPost).toHaveBeenCalledWith("/api/v1/users/confirm", { 
        confirmation_token: confirmationToken 
      })
    })
  })

  describe("confirmUserPublic", () => {
    it("confirms user publicly with token via GET request", async () => {
      const confirmationToken = "confirm-public-123"
      const mockConfirmationResponse: AxiosResponse<ConfirmationResponse> = {
        data: { message: "User confirmed", success: true },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
      }
      mockGetPublic.mockResolvedValue(mockConfirmationResponse)

      await authClient.confirmUserPublic(confirmationToken)

      expect(mockApi.confirmUser).toHaveBeenCalled()
      expect(mockGetPublic).toHaveBeenCalledWith(
        "/api/v1/users/confirm?confirmation_token=confirm-public-123"
      )
    })
  })

  describe("sendResetPasswordLink", () => {
    it("sends reset password link via POST request", async () => {
      const email = "test@example.com"
      await authClient.sendResetPasswordLink(email)

      expect(mockApi.resetUserPassword).toHaveBeenCalled()
      expect(mockPost).toHaveBeenCalledWith("/api/v1/users/password", { 
        user: { email: email } 
      })
    })
  })

  describe("resetUserPassword", () => {
    it("resets user password via PATCH request", async () => {
      const resetToken = "reset-123"
      const password: PasswordWithConfirmation = {
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }

      await authClient.resetUserPassword(resetToken, password)

      expect(mockApi.resetUserPassword).toHaveBeenCalled()
      expect(mockPatch).toHaveBeenCalledWith("/api/v1/users/password", {
        user: { 
          ...password, 
          reset_password_token: resetToken 
        }
      })
    })
  })

  describe("getPlayers", () => {
    const mockUsersResponse: AxiosResponse<UsersResponse> = {
      data: { users: [mockUser], total: 1, page: 1, pages: 1 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    }

    beforeEach(() => {
      mockGet.mockResolvedValue(mockUsersResponse)
    })

    it("gets players with default parameters", async () => {
      await authClient.getPlayers()

      expect(mockApiV2.users).toHaveBeenCalled()
      expect(mockQueryParams).toHaveBeenCalledWith({})
      expect(mockGet).toHaveBeenCalledWith("/api/v2/users?", {}, {})
    })

    it("gets players with parameters", async () => {
      const parameters = { page: 2, limit: 10, gamemaster: false }
      await authClient.getPlayers(parameters)

      expect(mockQueryParams).toHaveBeenCalledWith(parameters)
      expect(mockGet).toHaveBeenCalledWith("/api/v2/users?page=2&limit=10&gamemaster=false", {}, {})
    })

    it("passes cache options", async () => {
      const cacheOptions = { cache: "force-cache" as const }
      await authClient.getPlayers({}, cacheOptions)

      expect(mockGet).toHaveBeenCalledWith("/api/v2/users?", {}, cacheOptions)
    })
  })

  describe("getCurrentUsers", () => {
    const mockUsersResponse: AxiosResponse<UsersResponse> = {
      data: { users: [mockUser], total: 1, page: 1, pages: 1 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    }

    beforeEach(() => {
      mockGet.mockResolvedValue(mockUsersResponse)
    })

    it("gets current users with parameters and cache options", async () => {
      const parameters = { active: true }
      const cacheOptions = { cache: "no-store" as const }
      
      await authClient.getCurrentUsers(parameters, cacheOptions)

      expect(mockQueryParams).toHaveBeenCalledWith(parameters)
      expect(mockGet).toHaveBeenCalledWith("/api/v2/users?active=true", {}, cacheOptions)
    })
  })

  describe("getUsers", () => {
    const mockUsersResponse: AxiosResponse<UsersResponse> = {
      data: { users: [mockUser], total: 1, page: 1, pages: 1 },
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    }

    beforeEach(() => {
      mockGet.mockResolvedValue(mockUsersResponse)
    })

    it("gets all users with query parameters", async () => {
      const parameters = { search: "test", sort: "name" }
      
      await authClient.getUsers(parameters)

      expect(mockQueryParams).toHaveBeenCalledWith(parameters)
      expect(mockGet).toHaveBeenCalledWith("/api/v2/users?search=test&sort=name", {}, {})
    })
  })

  describe("client creation", () => {
    it("creates baseClient with correct dependencies", () => {
      createAuthClient(deps)

      expect(mockCreateBaseClient).toHaveBeenCalledWith(deps)
    })

    it("returns all expected methods", () => {
      expect(authClient.createUser).toBeDefined()
      expect(authClient.updateUser).toBeDefined()
      expect(authClient.deleteUser).toBeDefined()
      expect(authClient.deleteUserImage).toBeDefined()
      expect(authClient.getUser).toBeDefined()
      expect(authClient.getCurrentUser).toBeDefined()
      expect(authClient.unlockUser).toBeDefined()
      expect(authClient.confirmUser).toBeDefined()
      expect(authClient.confirmUserPublic).toBeDefined()
      expect(authClient.sendResetPasswordLink).toBeDefined()
      expect(authClient.resetUserPassword).toBeDefined()
      expect(authClient.getPlayers).toBeDefined()
      expect(authClient.getCurrentUsers).toBeDefined()
      expect(authClient.getUsers).toBeDefined()
    })
  })

  describe("error handling", () => {
    it("propagates authentication errors from createUser", async () => {
      const authError = new Error("Unauthorized")
      mockPost.mockRejectedValue(authError)

      await expect(authClient.createUser(mockUser)).rejects.toThrow("Unauthorized")
    })

    it("propagates network errors from getCurrentUser", async () => {
      const networkError = new Error("Network Error")
      mockGet.mockRejectedValue(networkError)

      await expect(authClient.getCurrentUser()).rejects.toThrow("Network Error")
    })

    it("propagates validation errors from resetUserPassword", async () => {
      const validationError = new Error("Password confirmation doesn't match")
      mockPatch.mockRejectedValue(validationError)

      const resetToken = "reset-123"
      const password: PasswordWithConfirmation = {
        password: "new123",
        password_confirmation: "different123"
      }

      await expect(authClient.resetUserPassword(resetToken, password))
        .rejects.toThrow("Password confirmation doesn't match")
    })

    it("propagates form data upload errors from updateUser", async () => {
      const uploadError = new Error("File too large")
      mockRequestFormData.mockRejectedValue(uploadError)

      const formData = new FormData()
      
      await expect(authClient.updateUser(mockUser.id, formData))
        .rejects.toThrow("File too large")
    })
  })
})