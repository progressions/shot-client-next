import { paginateArray, type PaginatedResult } from "@/lib/paginateArray"

describe("paginateArray", () => {
  const sampleData = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
    { id: 5, name: "Item 5" },
    { id: 6, name: "Item 6" },
    { id: 7, name: "Item 7" },
    { id: 8, name: "Item 8" },
    { id: 9, name: "Item 9" },
    { id: 10, name: "Item 10" },
  ]

  describe("basic pagination", () => {
    it("returns first page correctly", () => {
      const result: PaginatedResult<{ id: number; name: string }> =
        paginateArray(sampleData, 1, 3)

      expect(result.items).toEqual([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ])

      expect(result.meta).toEqual({
        current_page: 1,
        next_page: 2,
        prev_page: null,
        total_pages: 4,
        total_count: 10,
      })
    })

    it("returns middle page correctly", () => {
      const result = paginateArray(sampleData, 2, 3)

      expect(result.items).toEqual([
        { id: 4, name: "Item 4" },
        { id: 5, name: "Item 5" },
        { id: 6, name: "Item 6" },
      ])

      expect(result.meta).toEqual({
        current_page: 2,
        next_page: 3,
        prev_page: 1,
        total_pages: 4,
        total_count: 10,
      })
    })

    it("returns last page correctly", () => {
      const result = paginateArray(sampleData, 4, 3)

      expect(result.items).toEqual([{ id: 10, name: "Item 10" }])

      expect(result.meta).toEqual({
        current_page: 4,
        next_page: null,
        prev_page: 3,
        total_pages: 4,
        total_count: 10,
      })
    })

    it("handles exact division of items", () => {
      const exactData = sampleData.slice(0, 6) // 6 items
      const result = paginateArray(exactData, 2, 3)

      expect(result.items).toEqual([
        { id: 4, name: "Item 4" },
        { id: 5, name: "Item 5" },
        { id: 6, name: "Item 6" },
      ])

      expect(result.meta.total_pages).toBe(2)
      expect(result.meta.next_page).toBe(null)
    })
  })

  describe("edge cases", () => {
    it("handles empty array", () => {
      const result = paginateArray([], 1, 5)

      expect(result.items).toEqual([])
      expect(result.meta).toEqual({
        current_page: 1,
        next_page: null,
        prev_page: null,
        total_pages: 0,
        total_count: 0,
      })
    })

    it("handles single item", () => {
      const singleItem = [{ id: 1, name: "Only Item" }]
      const result = paginateArray(singleItem, 1, 5)

      expect(result.items).toEqual([{ id: 1, name: "Only Item" }])
      expect(result.meta).toEqual({
        current_page: 1,
        next_page: null,
        prev_page: null,
        total_pages: 1,
        total_count: 1,
      })
    })

    it("handles per_page larger than total items", () => {
      const result = paginateArray(sampleData, 1, 20)

      expect(result.items).toEqual(sampleData)
      expect(result.meta).toEqual({
        current_page: 1,
        next_page: null,
        prev_page: null,
        total_pages: 1,
        total_count: 10,
      })
    })

    it("handles page number beyond available pages - resets to page 1", () => {
      const result = paginateArray(sampleData, 100, 3)

      expect(result.items).toEqual([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ])

      expect(result.meta).toEqual({
        current_page: 1,
        next_page: 2,
        prev_page: null,
        total_pages: 4,
        total_count: 10,
      })
    })

    it("handles zero or negative page numbers", () => {
      const result = paginateArray(sampleData, 0, 3)

      expect(result.meta.current_page).toBe(1)
      expect(result.items).toEqual([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ])
    })

    it("handles negative page numbers", () => {
      const result = paginateArray(sampleData, -5, 3)

      expect(result.meta.current_page).toBe(1)
      expect(result.items).toEqual([
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ])
    })

    it("handles zero or negative per_page values", () => {
      const result = paginateArray(sampleData, 1, 0)

      expect(result.items).toEqual([{ id: 1, name: "Item 1" }])
      expect(result.meta.total_pages).toBe(10) // 1 item per page
    })

    it("handles negative per_page values", () => {
      const result = paginateArray(sampleData, 1, -3)

      expect(result.items).toEqual([{ id: 1, name: "Item 1" }])
      expect(result.meta.total_pages).toBe(10) // Falls back to 1 per page
    })
  })

  describe("different data types", () => {
    it("works with strings", () => {
      const strings = ["apple", "banana", "cherry", "date", "elderberry"]
      const result = paginateArray(strings, 2, 2)

      expect(result.items).toEqual(["cherry", "date"])
      expect(result.meta.total_count).toBe(5)
    })

    it("works with numbers", () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const result = paginateArray(numbers, 3, 3)

      expect(result.items).toEqual([7, 8, 9])
      expect(result.meta.current_page).toBe(3)
    })

    it("works with complex objects", () => {
      const complexObjects = [
        { id: "a", data: { nested: true, count: 1 }, tags: ["tag1", "tag2"] },
        { id: "b", data: { nested: false, count: 2 }, tags: ["tag3"] },
        { id: "c", data: { nested: true, count: 3 }, tags: [] },
      ]

      const result = paginateArray(complexObjects, 1, 2)

      expect(result.items).toEqual([
        { id: "a", data: { nested: true, count: 1 }, tags: ["tag1", "tag2"] },
        { id: "b", data: { nested: false, count: 2 }, tags: ["tag3"] },
      ])
      expect(result.meta.total_pages).toBe(2)
    })
  })

  describe("pagination calculations", () => {
    it("calculates total pages correctly for various combinations", () => {
      const testCases = [
        { itemCount: 10, perPage: 3, expectedPages: 4 },
        { itemCount: 9, perPage: 3, expectedPages: 3 },
        { itemCount: 12, perPage: 4, expectedPages: 3 },
        { itemCount: 13, perPage: 4, expectedPages: 4 },
        { itemCount: 1, perPage: 1, expectedPages: 1 },
        { itemCount: 100, perPage: 10, expectedPages: 10 },
      ]

      testCases.forEach(({ itemCount, perPage, expectedPages }) => {
        const testData = Array.from({ length: itemCount }, (_, i) => ({
          id: i + 1,
        }))
        const result = paginateArray(testData, 1, perPage)

        expect(result.meta.total_pages).toBe(expectedPages)
      })
    })

    it("correctly identifies first and last pages", () => {
      // First page
      const firstPage = paginateArray(sampleData, 1, 3)
      expect(firstPage.meta.prev_page).toBe(null)
      expect(firstPage.meta.next_page).toBe(2)

      // Last page
      const lastPage = paginateArray(sampleData, 4, 3)
      expect(lastPage.meta.prev_page).toBe(3)
      expect(lastPage.meta.next_page).toBe(null)

      // Single page scenario
      const singlePage = paginateArray([1, 2], 1, 5)
      expect(singlePage.meta.prev_page).toBe(null)
      expect(singlePage.meta.next_page).toBe(null)
    })
  })

  describe("type safety", () => {
    interface TestItem {
      id: string
      name: string
      active: boolean
    }

    it("maintains type safety with TypeScript generics", () => {
      const typedData: TestItem[] = [
        { id: "1", name: "Test 1", active: true },
        { id: "2", name: "Test 2", active: false },
        { id: "3", name: "Test 3", active: true },
      ]

      const result: PaginatedResult<TestItem> = paginateArray(typedData, 1, 2)

      // TypeScript should ensure these properties exist and have correct types
      expect(result.items[0].id).toBe("1")
      expect(result.items[0].name).toBe("Test 1")
      expect(result.items[0].active).toBe(true)
      expect(typeof result.items[0].active).toBe("boolean")
    })
  })

  describe("consistency tests", () => {
    it("maintains consistent behavior across multiple calls", () => {
      const page1 = paginateArray(sampleData, 1, 3)
      const page2 = paginateArray(sampleData, 2, 3)

      // Ensure no overlap
      const page1Ids = page1.items.map(item => item.id)
      const page2Ids = page2.items.map(item => item.id)
      const intersection = page1Ids.filter(id => page2Ids.includes(id))

      expect(intersection).toEqual([])

      // Ensure total counts match
      expect(page1.meta.total_count).toBe(page2.meta.total_count)
      expect(page1.meta.total_pages).toBe(page2.meta.total_pages)
    })

    it("returns all items when iterating through all pages", () => {
      const perPage = 3
      const totalPages = Math.ceil(sampleData.length / perPage)
      const allPaginatedItems = []

      for (let page = 1; page <= totalPages; page++) {
        const result = paginateArray(sampleData, page, perPage)
        allPaginatedItems.push(...result.items)
      }

      expect(allPaginatedItems).toEqual(sampleData)
      expect(allPaginatedItems.length).toBe(sampleData.length)
    })
  })

  describe("performance and memory", () => {
    it("handles large arrays efficiently", () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
      }))

      const startTime = performance.now()
      const result = paginateArray(largeArray, 500, 20)
      const endTime = performance.now()

      // Should complete quickly (< 10ms for this size)
      expect(endTime - startTime).toBeLessThan(10)

      // Should return correct page
      expect(result.items.length).toBe(20)
      expect(result.items[0].id).toBe(9981) // (500 - 1) * 20 + 1
      expect(result.meta.total_count).toBe(10000)
    })

    it("does not mutate original array", () => {
      const originalData = [...sampleData]
      const result = paginateArray(sampleData, 2, 3)

      // Original array should be unchanged
      expect(sampleData).toEqual(originalData)

      // Returned items should not be references to original (though objects inside may be)
      expect(result.items).not.toBe(sampleData)
    })
  })
})
