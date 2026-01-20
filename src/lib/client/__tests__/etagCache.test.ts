import { ETagCache } from "../etagCache"

describe("ETagCache", () => {
  let cache: ETagCache

  beforeEach(() => {
    jest.useFakeTimers()
    cache = new ETagCache({ maxEntries: 5, maxAgeMs: 1000 })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe("set and getEtag", () => {
    it("stores and retrieves ETag for a URL", () => {
      cache.set("/api/v2/characters/123", '"abc123"', {
        id: "123",
        name: "Test",
      })
      expect(cache.getEtag("/api/v2/characters/123")).toBe('"abc123"')
    })

    it("returns null for non-existent URL", () => {
      expect(cache.getEtag("/api/v2/characters/999")).toBeNull()
    })

    it("generates consistent cache keys for same URL and params", () => {
      cache.set("/api/v2/characters", '"etag1"', [{ id: "1" }], {
        filter: "active",
      })
      expect(cache.getEtag("/api/v2/characters", { filter: "active" })).toBe(
        '"etag1"'
      )
    })

    it("generates different cache keys for different params", () => {
      cache.set("/api/v2/characters", '"etag1"', [{ id: "1" }], {
        filter: "active",
      })
      cache.set("/api/v2/characters", '"etag2"', [{ id: "2" }], {
        filter: "inactive",
      })

      expect(cache.getEtag("/api/v2/characters", { filter: "active" })).toBe(
        '"etag1"'
      )
      expect(cache.getEtag("/api/v2/characters", { filter: "inactive" })).toBe(
        '"etag2"'
      )
    })

    it("sorts params for consistent key generation regardless of order", () => {
      cache.set("/api/v2/characters", '"etag1"', [{ id: "1" }], {
        a: "1",
        b: "2",
      })

      // Access with different param order should still work
      expect(cache.getEtag("/api/v2/characters", { b: "2", a: "1" })).toBe(
        '"etag1"'
      )
    })
  })

  describe("getData", () => {
    it("retrieves stored data for a URL", () => {
      const data = { id: "123", name: "Test Character" }
      cache.set("/api/v2/characters/123", '"abc123"', data)
      expect(cache.getData("/api/v2/characters/123")).toEqual(data)
    })

    it("returns null for non-existent URL", () => {
      expect(cache.getData("/api/v2/characters/999")).toBeNull()
    })

    it("returns typed data", () => {
      interface Character {
        id: string
        name: string
      }
      const data: Character = { id: "123", name: "Test" }
      cache.set("/api/v2/characters/123", '"etag"', data)

      const result = cache.getData<Character>("/api/v2/characters/123")
      expect(result?.id).toBe("123")
      expect(result?.name).toBe("Test")
    })
  })

  describe("expiration", () => {
    it("returns null for expired entries from getEtag", () => {
      cache.set("/api/v2/characters/123", '"abc123"', { id: "123" })

      // Advance time past expiration (maxAgeMs is 1000ms)
      jest.advanceTimersByTime(1100)

      expect(cache.getEtag("/api/v2/characters/123")).toBeNull()
    })

    it("returns null for expired entries from getData", () => {
      cache.set("/api/v2/characters/123", '"abc123"', { id: "123" })

      // Advance time past expiration
      jest.advanceTimersByTime(1100)

      expect(cache.getData("/api/v2/characters/123")).toBeNull()
    })

    it("deletes expired entries on access", () => {
      cache.set("/api/v2/characters/123", '"abc123"', { id: "123" })

      // Advance time past expiration
      jest.advanceTimersByTime(1100)

      // Access should delete the expired entry
      cache.getEtag("/api/v2/characters/123")
      expect(cache.getStats().size).toBe(0)
    })
  })

  describe("LRU eviction", () => {
    it("evicts oldest entry when max entries exceeded", () => {
      // Fill cache to max (5 entries)
      for (let i = 1; i <= 5; i++) {
        cache.set(`/api/v2/characters/${i}`, `"etag${i}"`, { id: String(i) })
      }

      expect(cache.getStats().size).toBe(5)

      // Add one more entry
      cache.set("/api/v2/characters/6", '"etag6"', { id: "6" })

      // Size should still be 5
      expect(cache.getStats().size).toBe(5)

      // New entry should exist
      expect(cache.getEtag("/api/v2/characters/6")).toBe('"etag6"')
    })

    it("evicts entry with oldest timestamp (true LRU)", () => {
      // Add entries with staggered timestamps
      cache.set("/api/v2/characters/1", '"etag1"', { id: "1" })
      jest.advanceTimersByTime(50)

      cache.set("/api/v2/characters/2", '"etag2"', { id: "2" })
      jest.advanceTimersByTime(50)

      // Access entry 1 to update its timestamp
      cache.getEtag("/api/v2/characters/1")
      jest.advanceTimersByTime(50)

      cache.set("/api/v2/characters/3", '"etag3"', { id: "3" })
      cache.set("/api/v2/characters/4", '"etag4"', { id: "4" })
      cache.set("/api/v2/characters/5", '"etag5"', { id: "5" })

      // Add one more - should evict entry 2 (oldest timestamp after entry 1 was accessed)
      cache.set("/api/v2/characters/6", '"etag6"', { id: "6" })

      // Entry 1 should still exist (was accessed, so timestamp was updated)
      expect(cache.getEtag("/api/v2/characters/1")).toBe('"etag1"')
      // Entry 2 should be evicted (oldest timestamp)
      expect(cache.getEtag("/api/v2/characters/2")).toBeNull()
    })

    it("updates timestamp on getEtag access", () => {
      cache.set("/api/v2/characters/1", '"etag1"', { id: "1" })
      jest.advanceTimersByTime(50)

      cache.set("/api/v2/characters/2", '"etag2"', { id: "2" })
      jest.advanceTimersByTime(50)

      // Access entry 1 via getEtag
      cache.getEtag("/api/v2/characters/1")

      cache.set("/api/v2/characters/3", '"etag3"', { id: "3" })
      cache.set("/api/v2/characters/4", '"etag4"', { id: "4" })
      cache.set("/api/v2/characters/5", '"etag5"', { id: "5" })

      // Add one more - entry 2 should be evicted, not entry 1
      cache.set("/api/v2/characters/6", '"etag6"', { id: "6" })

      expect(cache.getEtag("/api/v2/characters/1")).toBe('"etag1"')
      expect(cache.getEtag("/api/v2/characters/2")).toBeNull()
    })

    it("updates timestamp on getData access", () => {
      cache.set("/api/v2/characters/1", '"etag1"', { id: "1" })
      jest.advanceTimersByTime(50)

      cache.set("/api/v2/characters/2", '"etag2"', { id: "2" })
      jest.advanceTimersByTime(50)

      // Access entry 1 via getData
      cache.getData("/api/v2/characters/1")

      cache.set("/api/v2/characters/3", '"etag3"', { id: "3" })
      cache.set("/api/v2/characters/4", '"etag4"', { id: "4" })
      cache.set("/api/v2/characters/5", '"etag5"', { id: "5" })

      // Add one more - entry 2 should be evicted, not entry 1
      cache.set("/api/v2/characters/6", '"etag6"', { id: "6" })

      expect(cache.getData("/api/v2/characters/1")).toEqual({ id: "1" })
      expect(cache.getData("/api/v2/characters/2")).toBeNull()
    })
  })

  describe("has", () => {
    it("returns true for existing non-expired entry", () => {
      cache.set("/api/v2/characters/123", '"etag"', { id: "123" })
      expect(cache.has("/api/v2/characters/123")).toBe(true)
    })

    it("returns false for non-existent entry", () => {
      expect(cache.has("/api/v2/characters/999")).toBe(false)
    })

    it("returns false for expired entry", () => {
      cache.set("/api/v2/characters/123", '"etag"', { id: "123" })

      jest.advanceTimersByTime(1100)

      expect(cache.has("/api/v2/characters/123")).toBe(false)
    })
  })

  describe("invalidate", () => {
    it("removes specific entry", () => {
      cache.set("/api/v2/characters/123", '"etag1"', { id: "123" })
      cache.set("/api/v2/characters/456", '"etag2"', { id: "456" })

      cache.invalidate("/api/v2/characters/123")

      expect(cache.getEtag("/api/v2/characters/123")).toBeNull()
      expect(cache.getEtag("/api/v2/characters/456")).toBe('"etag2"')
    })

    it("removes entry with specific params", () => {
      cache.set("/api/v2/characters", '"etag1"', [{ id: "1" }], {
        filter: "active",
      })
      cache.set("/api/v2/characters", '"etag2"', [{ id: "2" }], {
        filter: "inactive",
      })

      cache.invalidate("/api/v2/characters", { filter: "active" })

      expect(
        cache.getEtag("/api/v2/characters", { filter: "active" })
      ).toBeNull()
      expect(cache.getEtag("/api/v2/characters", { filter: "inactive" })).toBe(
        '"etag2"'
      )
    })
  })

  describe("invalidatePattern", () => {
    it("removes all entries matching pattern", () => {
      cache.set("/api/v2/characters/123", '"etag1"', { id: "123" })
      cache.set("/api/v2/characters/456", '"etag2"', { id: "456" })
      cache.set("/api/v2/weapons/789", '"etag3"', { id: "789" })

      cache.invalidatePattern("/api/v2/characters")

      expect(cache.getEtag("/api/v2/characters/123")).toBeNull()
      expect(cache.getEtag("/api/v2/characters/456")).toBeNull()
      expect(cache.getEtag("/api/v2/weapons/789")).toBe('"etag3"')
    })

    it("removes entries with query params matching pattern", () => {
      cache.set("/api/v2/characters", '"etag1"', [], { filter: "active" })
      cache.set("/api/v2/characters", '"etag2"', [], { filter: "inactive" })
      cache.set("/api/v2/weapons", '"etag3"', [], { type: "sword" })

      cache.invalidatePattern("/api/v2/characters")

      expect(
        cache.getEtag("/api/v2/characters", { filter: "active" })
      ).toBeNull()
      expect(
        cache.getEtag("/api/v2/characters", { filter: "inactive" })
      ).toBeNull()
      expect(cache.getEtag("/api/v2/weapons", { type: "sword" })).toBe(
        '"etag3"'
      )
    })
  })

  describe("clear", () => {
    it("removes all entries", () => {
      cache.set("/api/v2/characters/1", '"etag1"', { id: "1" })
      cache.set("/api/v2/characters/2", '"etag2"', { id: "2" })
      cache.set("/api/v2/weapons/1", '"etag3"', { id: "w1" })

      cache.clear()

      expect(cache.getStats().size).toBe(0)
      expect(cache.getEtag("/api/v2/characters/1")).toBeNull()
    })
  })

  describe("getStats", () => {
    it("returns current cache statistics", () => {
      const customCache = new ETagCache({ maxEntries: 100, maxAgeMs: 30000 })
      customCache.set("/api/v2/characters/1", '"etag1"', { id: "1" })
      customCache.set("/api/v2/characters/2", '"etag2"', { id: "2" })

      const stats = customCache.getStats()

      expect(stats.size).toBe(2)
      expect(stats.maxEntries).toBe(100)
      expect(stats.maxAgeMs).toBe(30000)
    })
  })

  describe("default options", () => {
    it("uses default maxEntries of 500", () => {
      const defaultCache = new ETagCache()
      expect(defaultCache.getStats().maxEntries).toBe(500)
    })

    it("uses default maxAgeMs of 5 minutes", () => {
      const defaultCache = new ETagCache()
      expect(defaultCache.getStats().maxAgeMs).toBe(5 * 60 * 1000)
    })
  })
})
