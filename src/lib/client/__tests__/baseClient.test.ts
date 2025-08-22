import axios, { AxiosResponse, AxiosError } from "axios"
import { createBaseClient } from "../baseClient"

// Mock axios
jest.mock("axios")
const mockedAxios = axios as jest.MockedFunction<typeof axios>

describe("createBaseClient", () => {
  const mockJWT = "test-jwt-token"
  const mockURL = "https://api.example.com/test"
  const mockData = { id: 1, name: "Test" }
  const mockResponse: AxiosResponse = {
    data: mockData,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  }

  let baseClient: ReturnType<typeof createBaseClient>
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    baseClient = createBaseClient({ jwt: mockJWT })
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    mockedAxios.mockResolvedValue(mockResponse)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe("get method", () => {
    it("makes authenticated GET request with correct headers", async () => {
      await baseClient.get(mockURL)

      expect(mockedAxios).toHaveBeenCalledWith({
        url: mockURL,
        method: "GET",
        params: {},
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockJWT}`,
        },
        proxy: false,
      })
    })

    it("includes query parameters", async () => {
      const params = { page: 1, limit: 10 }
      await baseClient.get(mockURL, params)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: params,
        })
      )
    })

    it("handles no-store cache option", async () => {
      await baseClient.get(mockURL, {}, { cache: "no-store" })

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          }),
        })
      )
    })

    it("handles force-cache option with default revalidate", async () => {
      await baseClient.get(mockURL, {}, { cache: "force-cache" })

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Cache-Control": "max-age=3600",
          }),
        })
      )
    })

    it("handles force-cache option with custom revalidate", async () => {
      await baseClient.get(
        mockURL,
        {},
        { cache: "force-cache", revalidate: 1800 }
      )

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Cache-Control": "max-age=1800",
          }),
        })
      )
    })

    it("throws error when no JWT provided", async () => {
      const clientWithoutJWT = createBaseClient({})

      await expect(clientWithoutJWT.get(mockURL)).rejects.toThrow(
        "No JWT provided"
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "No JWT provided, cannot make GET request",
        mockURL
      )
    })

    it("returns axios response", async () => {
      const result = await baseClient.get(mockURL)
      expect(result).toBe(mockResponse)
    })

    it("propagates axios errors", async () => {
      const axiosError = new Error("Network error") as AxiosError
      mockedAxios.mockRejectedValue(axiosError)

      await expect(baseClient.get(mockURL)).rejects.toThrow("Network error")
    })
  })

  describe("getPublic method", () => {
    it("makes public GET request without authentication", async () => {
      await baseClient.getPublic(mockURL)

      expect(mockedAxios).toHaveBeenCalledWith({
        url: mockURL,
        method: "GET",
        params: {},
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          // No Authorization header
        },
        proxy: false,
      })
    })

    it("includes query parameters", async () => {
      const params = { search: "test" }
      await baseClient.getPublic(mockURL, params)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: params,
        })
      )
    })

    it("handles cache options", async () => {
      await baseClient.getPublic(mockURL, {}, { cache: "no-store" })

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
          }),
        })
      )
    })

    it("works even when client has no JWT", async () => {
      const clientWithoutJWT = createBaseClient({})
      await expect(clientWithoutJWT.getPublic(mockURL)).resolves.toBe(
        mockResponse
      )
    })
  })

  describe("post method", () => {
    it("makes authenticated POST request", async () => {
      const postData = { name: "New Item" }
      await baseClient.post(mockURL, postData)

      expect(mockedAxios).toHaveBeenCalledWith({
        url: mockURL,
        method: "POST",
        data: postData,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockJWT}`,
        },
        proxy: false,
      })
    })

    it("handles empty parameters", async () => {
      await baseClient.post(mockURL)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {},
        })
      )
    })

    it("handles cache options", async () => {
      await baseClient.post(mockURL, {}, { cache: "no-store" })

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

  describe("patch method", () => {
    it("makes authenticated PATCH request", async () => {
      const patchData = { name: "Updated Item" }
      await baseClient.patch(mockURL, patchData)

      expect(mockedAxios).toHaveBeenCalledWith({
        url: mockURL,
        method: "PATCH",
        data: patchData,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockJWT}`,
        },
        proxy: false,
      })
    })

    it("handles cache options", async () => {
      await baseClient.patch(
        mockURL,
        {},
        { cache: "force-cache", revalidate: 900 }
      )

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            "Cache-Control": "max-age=900",
          }),
        })
      )
    })
  })

  describe("delete method", () => {
    it("makes authenticated DELETE request", async () => {
      const deleteParams = { confirm: true }
      await baseClient.delete(mockURL, deleteParams)

      expect(mockedAxios).toHaveBeenCalledWith({
        url: mockURL,
        method: "DELETE",
        params: deleteParams,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockJWT}`,
        },
        proxy: false,
      })
    })

    it("handles empty parameters", async () => {
      await baseClient.delete(mockURL)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          params: {},
        })
      )
    })
  })

  describe("request method", () => {
    it("handles GET requests with parameters as query params", async () => {
      const params = { filter: "active" }
      await baseClient.request("GET", mockURL, params)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          params: params,
        })
      )
    })

    it("handles non-GET requests with parameters as data", async () => {
      const data = { name: "Test" }
      await baseClient.request("PUT", mockURL, data)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PUT",
          data: data,
        })
      )
    })

    it("includes authentication headers", async () => {
      await baseClient.request("POST", mockURL)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockJWT}`,
          }),
        })
      )
    })
  })

  describe("requestFormData method", () => {
    it("makes authenticated request with FormData", async () => {
      const formData = new FormData()
      formData.append("file", "test-file")
      formData.append("name", "Test File")

      await baseClient.requestFormData("POST", mockURL, formData)

      expect(mockedAxios).toHaveBeenCalledWith({
        url: mockURL,
        method: "POST",
        data: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${mockJWT}`,
        },
        proxy: false,
      })
    })

    it("handles different HTTP methods", async () => {
      const formData = new FormData()
      await baseClient.requestFormData("PATCH", mockURL, formData)

      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "PATCH",
        })
      )
    })

    it("catches and re-throws errors with logging", async () => {
      const formData = new FormData()
      const error = new Error("Upload failed")
      mockedAxios.mockRejectedValue(error)

      await expect(
        baseClient.requestFormData("POST", mockURL, formData)
      ).rejects.toThrow("Upload failed")
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error in requestFormData:",
        error
      )
    })
  })

  describe("client creation", () => {
    it("creates client without JWT", () => {
      const client = createBaseClient({})
      expect(client).toBeDefined()
      expect(client.getPublic).toBeDefined()
    })

    it("creates client with empty JWT string", () => {
      const client = createBaseClient({ jwt: "" })
      expect(client).toBeDefined()
    })

    it("returns all expected methods", () => {
      expect(baseClient.get).toBeDefined()
      expect(baseClient.getPublic).toBeDefined()
      expect(baseClient.post).toBeDefined()
      expect(baseClient.patch).toBeDefined()
      expect(baseClient.delete).toBeDefined()
      expect(baseClient.request).toBeDefined()
      expect(baseClient.requestFormData).toBeDefined()
    })
  })

  describe("error handling", () => {
    it("handles 401 authentication errors", async () => {
      const authError = {
        response: { status: 401, data: { error: "Unauthorized" } },
        message: "Request failed with status code 401",
      } as AxiosError
      mockedAxios.mockRejectedValue(authError)

      await expect(baseClient.get(mockURL)).rejects.toMatchObject({
        response: { status: 401 },
      })
    })

    it("handles 500 server errors", async () => {
      const serverError = {
        response: { status: 500, data: { error: "Internal Server Error" } },
        message: "Request failed with status code 500",
      } as AxiosError
      mockedAxios.mockRejectedValue(serverError)

      await expect(baseClient.post(mockURL)).rejects.toMatchObject({
        response: { status: 500 },
      })
    })

    it("handles network errors", async () => {
      const networkError = {
        message: "Network Error",
        code: "NETWORK_ERROR",
      } as AxiosError
      mockedAxios.mockRejectedValue(networkError)

      await expect(baseClient.patch(mockURL)).rejects.toMatchObject({
        message: "Network Error",
      })
    })
  })
})
