type Parameters_ = Record<string, unknown>

export const queryParams = (parameters: Parameters_ = {}) => {
  return Object.entries(parameters)
    .map(([key, value]) => `${key}=${value ?? ""}`)
    .join("&")
}
