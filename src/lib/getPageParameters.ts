interface PageParameters {
  page: number
  sort: string
  order: "asc" | "desc"
  search: string
  [key: string]: string | number | boolean // Allow additional parameters
}

interface GetPageParametersOptions {
  validSorts: readonly string[]
  defaultSort: string
  defaultOrder?: "asc" | "desc"
}

export async function getPageParameters(
  searchParams: Promise<Record<string, string | undefined>>,
  options: GetPageParametersOptions
): Promise<PageParameters> {
  const { validSorts, defaultSort, defaultOrder = "desc" } = options
  const parameters = await searchParams

  // Validate page parameter
  const pageParameter = parameters.page
  const page = pageParameter ? Number.parseInt(pageParameter, 10) : 1
  const validPage = isNaN(page) || page <= 0 ? 1 : page

  // Validate sort parameter
  const sort =
    parameters.sort && validSorts.includes(parameters.sort)
      ? parameters.sort
      : defaultSort

  // Validate order parameter
  const validOrders: readonly string[] = ["asc", "desc"]
  const order =
    parameters.order && validOrders.includes(parameters.order)
      ? (parameters.order as "asc" | "desc")
      : defaultOrder

  const search = parameters.search || ""

  // Pass through any additional parameters (like show_hidden)
  const additionalParams: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(parameters)) {
    if (
      !["page", "sort", "order", "search"].includes(key) &&
      value !== undefined
    ) {
      // Convert "true"/"false" strings to booleans
      if (value === "true") {
        additionalParams[key] = true
      } else if (value === "false") {
        additionalParams[key] = false
      } else {
        additionalParams[key] = value
      }
    }
  }

  return { page: validPage, sort, order, search, ...additionalParams }
}
