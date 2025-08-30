type Parameters_ = Record<string, unknown>

export const queryParams = (parameters: Parameters_ = {}) => {
  return Object.entries(parameters)
    .map(([key, value]) => {
      // Handle arrays for Rails API (e.g., ids[] for array parameters)
      if (Array.isArray(value)) {
        // For empty arrays, explicitly send an empty parameter
        if (value.length === 0) {
          return `${key}[]=`
        }
        return value.map(item => `${key}[]=${encodeURIComponent(String(item))}`).join("&")
      }
      return `${key}=${encodeURIComponent(String(value ?? ""))}`
    })
    .join("&")
}
