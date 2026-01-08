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
import type {
  RegistrationData,
  RegistrationResponse,
  OtpRequestResponse,
  OtpVerifyResponse,
  SignInCredentials,
  ResendConfirmationResponse,
  WebAuthnRegistrationOptions,
  WebAuthnRegistrationResponse,
  WebAuthnAuthenticationOptions,
  WebAuthnAuthenticationResponse,
  WebAuthnCredentialsResponse,
  WebAuthnCredential,
  LinkDiscordResponse,
  UnlinkDiscordResponse,
} from "@/types/auth"

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
    postPublic,
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

  interface ChangePasswordResponse {
    success: boolean
    message: string
  }

  interface ChangePasswordError {
    errors?: {
      current_password?: string[]
      password?: string[]
      password_confirmation?: string[]
    }
    error?: string
  }

  async function changePassword(
    currentPassword: string,
    newPassword: string,
    passwordConfirmation: string
  ): Promise<AxiosResponse<ChangePasswordResponse>> {
    return post(apiV2.changePassword(), {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: passwordConfirmation,
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

  async function dismissCongratulations(): Promise<AxiosResponse<User>> {
    return patch(apiV2.dismissCongratulations())
  }

  async function updateOnboardingProgress(
    progressData: Record<string, string | null>
  ): Promise<AxiosResponse<User>> {
    return patch(apiV2.onboarding(), {
      onboarding_progress: progressData,
    })
  }

  async function logout(): Promise<AxiosResponse<void>> {
    return delete_(`${api.base()}/logout`)
  }

  // Sign In Method
  interface SignInResponse {
    token: string
  }

  interface SignInError {
    message?: string
    error_type?: "unconfirmed_account"
    email?: string
  }

  async function signIn(
    credentials: SignInCredentials
  ): Promise<
    { success: true; token: string } | { success: false; error: SignInError }
  > {
    try {
      const response = await postPublic<void>(api.signIn(), {
        user: credentials,
      })

      const authHeader = response.headers["authorization"]
      const token = authHeader?.split(" ")?.[1] || ""

      if (!token) {
        return {
          success: false,
          error: { message: "No authentication token received from server" },
        }
      }

      return { success: true, token }
    } catch (error) {
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: SignInError } }
        return {
          success: false,
          error: axiosError.response?.data || { message: "Login failed" },
        }
      }
      return { success: false, error: { message: "Login failed" } }
    }
  }

  // Resend Confirmation Email
  async function resendConfirmation(
    email: string
  ): Promise<AxiosResponse<ResendConfirmationResponse>> {
    return postPublic(api.resendConfirmation(), { email })
  }

  // OTP Passwordless Login Methods
  async function requestOtp(
    email: string
  ): Promise<AxiosResponse<OtpRequestResponse>> {
    return postPublic(api.otpRequest(), { email })
  }

  async function verifyOtp(
    email: string,
    code: string
  ): Promise<AxiosResponse<OtpVerifyResponse>> {
    return postPublic(api.otpVerify(), { email, code })
  }

  async function verifyMagicLink(
    token: string
  ): Promise<AxiosResponse<OtpVerifyResponse>> {
    return getPublic(api.otpMagicLink(token))
  }

  // Player View Magic Link Redemption
  interface PlayerViewTokenRedemptionResponse {
    jwt: string
    user: User
    encounter_id: string
    character_id: string
    redirect_url: string
  }

  /**
   * Redeem a player view magic link token.
   * This is a public endpoint that authenticates the user and returns the Player View URL.
   */
  async function redeemPlayerViewToken(
    token: string
  ): Promise<AxiosResponse<PlayerViewTokenRedemptionResponse>> {
    return postPublic(apiV2.playerTokenRedeem(token), {})
  }

  // WebAuthn/Passkey Methods

  /**
   * Get registration options for registering a new passkey (requires authentication)
   */
  async function getPasskeyRegistrationOptions(): Promise<
    AxiosResponse<WebAuthnRegistrationOptions>
  > {
    return post(apiV2.webauthnRegisterOptions())
  }

  /**
   * Verify passkey registration and store the credential (requires authentication)
   */
  async function verifyPasskeyRegistration(params: {
    attestationObject: string
    clientDataJSON: string
    challengeId: string
    name: string
  }): Promise<AxiosResponse<WebAuthnRegistrationResponse>> {
    return post(apiV2.webauthnRegisterVerify(), params)
  }

  /**
   * Get authentication options for signing in with a passkey (public)
   */
  async function getPasskeyAuthenticationOptions(
    email: string
  ): Promise<AxiosResponse<WebAuthnAuthenticationOptions>> {
    return postPublic(apiV2.webauthnAuthenticateOptions(), { email })
  }

  /**
   * Verify passkey authentication and get JWT token (public)
   */
  async function verifyPasskeyAuthentication(params: {
    credentialId: string
    authenticatorData: string
    signature: string
    clientDataJSON: string
    challengeId: string
  }): Promise<AxiosResponse<WebAuthnAuthenticationResponse>> {
    return postPublic(apiV2.webauthnAuthenticateVerify(), params)
  }

  /**
   * List all passkeys for the current user (requires authentication)
   */
  async function listPasskeys(): Promise<
    AxiosResponse<WebAuthnCredentialsResponse>
  > {
    return get(apiV2.webauthnCredentials())
  }

  /**
   * Delete a passkey (requires authentication)
   */
  async function deletePasskey(
    credentialId: string
  ): Promise<AxiosResponse<void>> {
    return delete_(apiV2.webauthnCredential(credentialId))
  }

  /**
   * Rename a passkey (requires authentication)
   */
  async function renamePasskey(
    credentialId: string,
    name: string
  ): Promise<AxiosResponse<WebAuthnCredential>> {
    return patch(apiV2.webauthnCredential(credentialId), { name })
  }

  // Discord Account Linking Methods

  /**
   * Link Discord account using a code generated from Discord /link command
   */
  async function linkDiscord(
    code: string
  ): Promise<AxiosResponse<LinkDiscordResponse>> {
    return post(apiV2.linkDiscord(), { code })
  }

  /**
   * Unlink Discord account from current user
   */
  async function unlinkDiscord(): Promise<
    AxiosResponse<UnlinkDiscordResponse>
  > {
    return delete_(apiV2.unlinkDiscord())
  }

  // CLI Authorization Methods

  interface CliAuthApproveResponse {
    success: boolean
  }

  /**
   * Approve a CLI authorization code (requires authentication)
   */
  async function approveCliAuth(
    code: string
  ): Promise<AxiosResponse<CliAuthApproveResponse>> {
    return post(apiV2.cliAuthApprove(), { code })
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
    dismissCongratulations,
    updateOnboardingProgress,
    logout,
    // Authentication
    signIn,
    resendConfirmation,
    // Password Management
    changePassword,
    // OTP Passwordless Login
    requestOtp,
    verifyOtp,
    verifyMagicLink,
    // Player View Magic Link
    redeemPlayerViewToken,
    // WebAuthn/Passkey
    getPasskeyRegistrationOptions,
    verifyPasskeyRegistration,
    getPasskeyAuthenticationOptions,
    verifyPasskeyAuthentication,
    listPasskeys,
    deletePasskey,
    renamePasskey,
    // Discord Account Linking
    linkDiscord,
    unlinkDiscord,
    // CLI Authorization
    approveCliAuth,
  }
}
