import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  User,
  PasswordWithConfirmation,
  UsersResponse,
  CacheOptions,
  Parameters_,
  ConfirmationResponse,
} from "@/types"
import type { RegistrationData, RegistrationResponse } from "@/types/auth"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createAuthClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const {
    get,
    getPublic,
    post,
    patch,
    delete: delete_,
    requestFormData,
  } = createBaseClient(deps)

  async function createUser(user: User): Promise<AxiosResponse<User>> {
    return post(api.registerUser(), { user: user })
  }

  async function registerUser(
    data: RegistrationData
  ): Promise<AxiosResponse<RegistrationResponse>> {
    return post(apiV2.usersRegister(), { user: data })
  }

  async function updateUser(user: User): Promise<AxiosResponse<User>>
  async function updateUser(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<User>>
  async function updateUser(
    userOrId: User | string,
    formData?: FormData
  ): Promise<AxiosResponse<User>> {
    if (typeof userOrId === "string" && formData) {
      // V2 API with FormData - follows same pattern as updateSite, updateFight, etc.
      return requestFormData(
        "PATCH",
        `${apiV2.users({ id: userOrId })}`,
        formData
      )
    } else {
      // V1 API with User object
      const user = userOrId as User
      return patch(api.adminUsers(user), { user: user })
    }
  }

  async function deleteUser(user: User): Promise<AxiosResponse<void>> {
    return delete_(apiV2.users(user))
  }

  async function deleteUserImage(user: User): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.users(user)}/image`)
  }

  async function getUser(
    user: User | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<User>> {
    return get(api.adminUsers(user), {}, cacheOptions)
  }

  async function getCurrentUser(
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<User>> {
    return get(apiV2.currentUser(), {}, cacheOptions)
  }

  async function unlockUser(
    unlock_token: string
  ): Promise<AxiosResponse<User>> {
    return get(`${api.unlockUser()}?unlock_token=${unlock_token}`)
  }

  async function confirmUser(
    confirmation_token: string
  ): Promise<AxiosResponse<User>> {
    return post(api.confirmUser(), { confirmation_token: confirmation_token })
  }

  async function confirmUserPublic(
    confirmation_token: string
  ): Promise<AxiosResponse<ConfirmationResponse>> {
    return getPublic(
      `${api.confirmUser()}?confirmation_token=${confirmation_token}`
    )
  }

  async function sendResetPasswordLink(
    email: string
  ): Promise<AxiosResponse<void>> {
    return post(api.resetUserPassword(), { user: { email: email } })
  }

  async function resetUserPassword(
    reset_password_token: string,
    password: PasswordWithConfirmation
  ): Promise<AxiosResponse<User>> {
    return patch(api.resetUserPassword(), {
      user: { ...password, reset_password_token: reset_password_token },
    })
  }

  async function getPlayers(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<UsersResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.users()}?${query}`, {}, cacheOptions)
  }

  async function getCurrentUsers(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<UsersResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.users()}?${query}`, {}, cacheOptions)
  }

  async function getUsers(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<UsersResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.users()}?${query}`, {}, cacheOptions)
  }

  return {
    createUser,
    registerUser,
    updateUser,
    deleteUser,
    deleteUserImage,
    getUser,
    getCurrentUser,
    unlockUser,
    confirmUser,
    confirmUserPublic,
    sendResetPasswordLink,
    resetUserPassword,
    getPlayers,
    getCurrentUsers,
    getUsers,
  }
}
