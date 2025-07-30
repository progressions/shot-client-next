import { PaginationMeta } from "@/types"

interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

function paginateArray<T>(
  items: T[],
  page: number,
  per_page: number
): PaginatedResult<T> {
  // Ensure page and per_page are positive numbers
  const currentPage = Math.max(1, page)
  const itemsPerPage = Math.max(1, per_page)

  // Calculate pagination values
  const totalCount = items.length
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  // Get the paginated items
  const paginatedItems = items.slice(startIndex, endIndex)

  // Calculate next and previous pages
  const nextPage = currentPage < totalPages ? currentPage + 1 : null
  const previousPage = currentPage > 1 ? currentPage - 1 : null

  return {
    items: paginatedItems,
    meta: {
      current_page: currentPage,
      next_page: nextPage,
      prev_page: previousPage,
      total_pages: totalPages,
      total_count: totalCount,
    },
  }
}

export { paginateArray, type PaginatedResult }
