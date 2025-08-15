interface PageParameters {
  page: number
  sort: string
  order: "asc" | "desc"
}

interface GetPageParametersOptions {
  validSorts: readonly string[]
  defaultSort: string
  defaultOrder?: "asc" | "desc"
}

export async function getPageParameters(
  searchParams: Promise<{ page?: string; sort?: string; order?: string }>,
  options: GetPageParametersOptions
): Promise<PageParameters> {
  const { validSorts, defaultSort, defaultOrder = "desc" } = options
  const parameters = await searchParams

  // Validate page parameter
  const pageParameter = parameters.page
  const page = pageParameter ? Number.parseInt(pageParameter, 10) : 1
  if (isNaN(page) || page <= 0) {
    return { page: 1, sort: defaultSort, order: defaultOrder }
  }

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

  return { page, sort, order, search }
}
