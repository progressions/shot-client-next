import { createSearchClient } from "../searchClient"
import { createBaseClient } from "../baseClient"

// Mock the baseClient
jest.mock("../baseClient")
const mockCreateBaseClient = createBaseClient as jest.MockedFunction<
  typeof createBaseClient
>

describe("createSearchClient", () => {
  // Mock API V2 object
  const mockApiV2 = {
    search: jest.fn(() => "/api/v2/search"),
  }

  const mockQueryParams = jest.fn((params: Record<string, unknown>) => {
    return Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join("&")
  })

  // Mock base client methods
  const mockGet = jest.fn()

  const mockBaseClient = {
    get: mockGet,
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    requestFormData: jest.fn(),
    request: jest.fn(),
  }

  const mockJWT = "test-jwt-token"
  const deps = {
    jwt: mockJWT,
    apiV2: mockApiV2 as unknown as import("@/lib").ApiV2,
    queryParams: mockQueryParams,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateBaseClient.mockReturnValue(mockBaseClient)
  })

  describe("search", () => {
    it("calls get with correct URL and query parameter", async () => {
      const mockResponse = {
        data: {
          results: {
            characters: [{ id: "1", name: "Test Character" }],
          },
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      const client = createSearchClient(deps)
      const result = await client.search("test query")

      expect(mockApiV2.search).toHaveBeenCalled()
      expect(mockQueryParams).toHaveBeenCalledWith({ q: "test query" })
      expect(mockGet).toHaveBeenCalledWith("/api/v2/search?q=test%20query")
      expect(result).toEqual(mockResponse)
    })

    it("handles empty query string", async () => {
      const mockResponse = { data: { results: {} } }
      mockGet.mockResolvedValue(mockResponse)

      const client = createSearchClient(deps)
      await client.search("")

      expect(mockQueryParams).toHaveBeenCalledWith({ q: "" })
      expect(mockGet).toHaveBeenCalledWith("/api/v2/search?q=")
    })

    it("handles special characters in query", async () => {
      const mockResponse = { data: { results: {} } }
      mockGet.mockResolvedValue(mockResponse)

      const client = createSearchClient(deps)
      await client.search("test & query")

      expect(mockQueryParams).toHaveBeenCalledWith({ q: "test & query" })
      expect(mockGet).toHaveBeenCalledWith(
        "/api/v2/search?q=test%20%26%20query"
      )
    })

    it("returns search response data", async () => {
      const mockResponse = {
        data: {
          results: {
            characters: [
              {
                id: "1",
                name: "Johnny Tango",
                entity_class: "Character",
                image_url: null,
                description: "A kung fu expert",
              },
            ],
            sites: [
              {
                id: "2",
                name: "Dragon Palace",
                entity_class: "Site",
                image_url: null,
                description: "A feng shui site",
              },
            ],
          },
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      const client = createSearchClient(deps)
      const result = await client.search("test")

      expect(result.data.results.characters).toHaveLength(1)
      expect(result.data.results.characters?.[0].name).toBe("Johnny Tango")
      expect(result.data.results.sites).toHaveLength(1)
      expect(result.data.results.sites?.[0].name).toBe("Dragon Palace")
    })

    it("propagates errors from get", async () => {
      const error = new Error("Network error")
      mockGet.mockRejectedValue(error)

      const client = createSearchClient(deps)

      await expect(client.search("test")).rejects.toThrow("Network error")
    })
  })
})
