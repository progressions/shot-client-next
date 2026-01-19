/**
 * Tests for ETag caching functionality in baseClient
 *
 * These tests verify:
 * - GET requests send If-None-Match headers when cached ETags exist
 * - 304 responses return cached data
 * - Cache invalidation on POST/PATCH/DELETE operations
 * - The skipEtag option disables ETag caching
 * - Edge cases like 304 responses with missing cached data
 */
import axios from "axios"
import { createBaseClient, etagCache } from "../baseClient"

// Get the mocked axios
const mockedAxios = axios as jest.MockedFunction<typeof axios>

describe("baseClient ETag caching", () => {
  const jwt = "test-jwt-token"

  beforeEach(() => {
    // Clear the ETag cache before each test
    etagCache.clear()
    jest.clearAllMocks()
  })

  describe("GET requests with cached ETags", () => {
    it("sends If-None-Match header when cached ETag exists", async () => {
      const client = createBaseClient({ jwt })

      // Pre-populate cache with an ETag
      etagCache.set("/api/v2/characters/123", '"abc123"', {
        id: "123",
        name: "Test",
      })

      // Mock the axios call
      mockedAxios.mockResolvedValueOnce({
        data: { id: "123", name: "Test" },
        status: 200,
        statusText: "OK",
        headers: { etag: '"abc123"' },
        config: {},
        request: {},
      })

      await client.get("/api/v2/characters/123")

      // Verify If-None-Match header was sent
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "If-None-Match": '"abc123"',
          }),
        })
      )
    })

    it("does not send If-None-Match when no cached ETag exists", async () => {
      const client = createBaseClient({ jwt })

      mockedAxios.mockResolvedValueOnce({
        data: { id: "123", name: "Test" },
        status: 200,
        statusText: "OK",
        headers: { etag: '"new-etag"' },
        config: {},
        request: {},
      })

      await client.get("/api/v2/characters/456")

      // Verify If-None-Match header was not sent
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            "If-None-Match": expect.anything(),
          }),
        })
      )
    })
  })

  describe("304 response handling", () => {
    it("returns cached data when 304 is received", async () => {
      const client = createBaseClient({ jwt })
      const cachedData = { id: "123", name: "Cached Character" }

      // Pre-populate cache
      etagCache.set("/api/v2/characters/123", '"abc123"', cachedData)

      // Mock 304 response
      mockedAxios.mockResolvedValueOnce({
        data: "",
        status: 304,
        statusText: "Not Modified",
        headers: {},
        config: {},
        request: {},
      })

      const response = await client.get("/api/v2/characters/123")

      // Should return cached data with status 200
      expect(response.status).toBe(200)
      expect(response.data).toEqual(cachedData)
    })

    it("makes fresh request when 304 received but cache is empty", async () => {
      const client = createBaseClient({ jwt })

      // Simulate cache eviction between sending If-None-Match and receiving 304
      // by mocking axios to clear cache and return 304
      let firstCall = true
      mockedAxios.mockImplementation(async config => {
        if (firstCall) {
          firstCall = false
          // Clear cache after request is made but before getData is called
          // This simulates cache eviction during the request
          etagCache.clear()
          return {
            data: "",
            status: 304,
            statusText: "Not Modified",
            headers: {},
            config,
            request: {},
          }
        }
        // Second call (fresh request without If-None-Match)
        return {
          data: { id: "123", name: "Fresh Data" },
          status: 200,
          statusText: "OK",
          headers: { etag: '"fresh-etag"' },
          config,
          request: {},
        }
      })

      // Pre-populate cache so first request sends If-None-Match
      etagCache.set("/api/v2/characters/123", '"abc123"', { id: "temp" })

      const response = await client.get("/api/v2/characters/123")

      // Should have made two requests
      expect(mockedAxios).toHaveBeenCalledTimes(2)
      // Should return fresh data
      expect(response.status).toBe(200)
      expect(response.data).toEqual({ id: "123", name: "Fresh Data" })
    })
  })

  describe("ETag storage on 200 responses", () => {
    it("stores ETag and data in cache after successful response", async () => {
      const client = createBaseClient({ jwt })

      // Reset mock to clear any previous implementation
      mockedAxios.mockReset()
      mockedAxios.mockResolvedValueOnce({
        data: { id: "123", name: "New Character" },
        status: 200,
        statusText: "OK",
        headers: { etag: '"new-etag-123"' },
        config: {},
        request: {},
      })

      await client.get("/api/v2/characters/123")

      // Verify cache was populated
      expect(etagCache.getEtag("/api/v2/characters/123")).toBe('"new-etag-123"')
      expect(etagCache.getData("/api/v2/characters/123")).toEqual({
        id: "123",
        name: "New Character",
      })
    })

    it("does not store ETag when response has no etag header", async () => {
      const client = createBaseClient({ jwt })

      // Reset mock to clear any previous implementation
      mockedAxios.mockReset()
      mockedAxios.mockResolvedValueOnce({
        data: { id: "456", name: "No ETag Character" },
        status: 200,
        statusText: "OK",
        headers: {}, // No etag header
        config: {},
        request: {},
      })

      // Use a different URL to avoid cache collision
      await client.get("/api/v2/characters/456")

      // Cache should not be populated for this URL
      expect(etagCache.getEtag("/api/v2/characters/456")).toBeNull()
    })
  })

  describe("cache invalidation", () => {
    it("invalidates cache on POST", async () => {
      const client = createBaseClient({ jwt })

      // Pre-populate cache
      etagCache.set("/api/v2/characters", '"list-etag"', [{ id: "1" }])
      etagCache.set("/api/v2/characters/1", '"item-etag"', { id: "1" })

      mockedAxios.mockResolvedValueOnce({
        data: { id: "2", name: "New" },
        status: 201,
        statusText: "Created",
        headers: {},
        config: {},
        request: {},
      })

      await client.post("/api/v2/characters", { name: "New Character" })

      // List cache should be invalidated (pattern match)
      expect(etagCache.getEtag("/api/v2/characters")).toBeNull()
    })

    it("invalidates specific URL and pattern on PATCH", async () => {
      const client = createBaseClient({ jwt })

      // Pre-populate cache
      etagCache.set("/api/v2/characters", '"list-etag"', [{ id: "1" }])
      etagCache.set("/api/v2/characters/1", '"item-etag"', { id: "1" })

      mockedAxios.mockResolvedValueOnce({
        data: { id: "1", name: "Updated" },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {},
        request: {},
      })

      await client.patch("/api/v2/characters/1", { name: "Updated Character" })

      // Both specific URL and list should be invalidated
      expect(etagCache.getEtag("/api/v2/characters/1")).toBeNull()
      expect(etagCache.getEtag("/api/v2/characters")).toBeNull()
    })

    it("invalidates cache on DELETE", async () => {
      const client = createBaseClient({ jwt })

      // Pre-populate cache
      etagCache.set("/api/v2/characters", '"list-etag"', [{ id: "1" }])
      etagCache.set("/api/v2/characters/1", '"item-etag"', { id: "1" })

      mockedAxios.mockResolvedValueOnce({
        data: null,
        status: 204,
        statusText: "No Content",
        headers: {},
        config: {},
        request: {},
      })

      await client.delete("/api/v2/characters/1")

      // Both should be invalidated
      expect(etagCache.getEtag("/api/v2/characters/1")).toBeNull()
      expect(etagCache.getEtag("/api/v2/characters")).toBeNull()
    })
  })

  describe("skipEtag option", () => {
    it("does not send If-None-Match when skipEtag is true", async () => {
      const client = createBaseClient({ jwt })

      // Pre-populate cache
      etagCache.set("/api/v2/characters/123", '"abc123"', { id: "123" })

      mockedAxios.mockResolvedValueOnce({
        data: { id: "123", name: "Fresh" },
        status: 200,
        statusText: "OK",
        headers: { etag: '"new-etag"' },
        config: {},
        request: {},
      })

      await client.get("/api/v2/characters/123", {}, { skipEtag: true })

      // Verify If-None-Match was not sent
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.not.objectContaining({
            "If-None-Match": expect.anything(),
          }),
        })
      )
    })

    it("does not store ETag when skipEtag is true", async () => {
      const client = createBaseClient({ jwt })

      mockedAxios.mockResolvedValueOnce({
        data: { id: "123", name: "Fresh" },
        status: 200,
        statusText: "OK",
        headers: { etag: '"new-etag"' },
        config: {},
        request: {},
      })

      await client.get("/api/v2/characters/123", {}, { skipEtag: true })

      // Cache should not be populated
      expect(etagCache.getEtag("/api/v2/characters/123")).toBeNull()
    })
  })

  describe("no-store cache option", () => {
    it("does not use ETag caching when cache is no-store", async () => {
      const client = createBaseClient({ jwt })

      // Pre-populate cache
      etagCache.set("/api/v2/characters/123", '"abc123"', { id: "123" })

      mockedAxios.mockResolvedValueOnce({
        data: { id: "123", name: "Fresh" },
        status: 200,
        statusText: "OK",
        headers: { etag: '"new-etag"' },
        config: {},
        request: {},
      })

      await client.get("/api/v2/characters/123", {}, { cache: "no-store" })

      // Should not send If-None-Match
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          }),
        })
      )
    })
  })

  describe("validateStatus configuration", () => {
    it("accepts 304 responses without throwing", async () => {
      const client = createBaseClient({ jwt })

      // Pre-populate cache for 304 handling
      etagCache.set("/api/v2/characters/123", '"abc123"', { id: "123" })

      mockedAxios.mockResolvedValueOnce({
        data: "",
        status: 304,
        statusText: "Not Modified",
        headers: {},
        config: {},
        request: {},
      })

      // Should not throw
      await expect(client.get("/api/v2/characters/123")).resolves.toBeDefined()
    })
  })

  describe("cache exposed on client", () => {
    it("exposes cache property for manual invalidation", () => {
      const client = createBaseClient({ jwt })
      expect(client.cache).toBe(etagCache)
    })
  })
})
