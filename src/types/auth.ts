export interface RegistrationData {
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
  gamemaster?: boolean
}

export interface RegistrationResponse {
  code: number
  message: string
  data: {
    id: string
    email: string
    first_name: string
    last_name: string
    name: string
    entity_class: string
    confirmed: boolean
  }
  payload: {
    jti: string
    sub: string
    exp: number
    iat: number
    scp: string
  }
}

export interface RegistrationError {
  errors: {
    [field: string]: string[]
  }
}

// OTP Passwordless Login Types
export interface OtpRequestResponse {
  message: string
}

export interface OtpVerifyResponse {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    name: string
    admin: boolean
    gamemaster: boolean
    current_campaign_id: string | null
    active: boolean
  }
  token: string
}

export interface OtpErrorResponse {
  error: string
}

// Sign In Types
export interface SignInCredentials {
  email: string
  password: string
}

export interface SignInErrorResponse {
  message?: string
  error_type?: "unconfirmed_account"
  email?: string
}

// Resend Confirmation Types
export interface ResendConfirmationResponse {
  message: string
}

export interface ResendConfirmationErrorResponse {
  error: string
}

// WebAuthn/Passkey Types

export interface WebAuthnCredentialDescriptor {
  id: string
  type: "public-key"
  transports?: ("usb" | "ble" | "nfc" | "internal" | "hybrid")[]
}

export interface WebAuthnRegistrationOptions {
  challenge: string
  rp: {
    name: string
    id: string
  }
  user: {
    id: string
    name: string
    displayName: string
  }
  pubKeyCredParams: {
    alg: number
    type: "public-key"
  }[]
  timeout: number
  attestation: "none" | "direct" | "indirect"
  excludeCredentials: WebAuthnCredentialDescriptor[]
  authenticatorSelection: {
    authenticatorAttachment?: "platform" | "cross-platform"
    requireResidentKey?: boolean
    residentKey?: "discouraged" | "preferred" | "required"
    userVerification?: "discouraged" | "preferred" | "required"
  }
  challenge_id: string
}

export interface WebAuthnRegistrationResponse {
  id: string
  name: string
  created_at: string
}

export interface WebAuthnAuthenticationOptions {
  challenge: string
  timeout: number
  rpId: string
  allowCredentials: WebAuthnCredentialDescriptor[]
  userVerification: "discouraged" | "preferred" | "required"
  challenge_id: string | null
}

export interface WebAuthnAuthenticationResponse {
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    name: string
    admin: boolean
    gamemaster: boolean
    current_campaign_id: string | null
    active: boolean
  }
  token: string
}

export interface WebAuthnCredential {
  id: string
  name: string
  created_at: string
  last_used_at: string | null
  backed_up: boolean
}

export interface WebAuthnCredentialsResponse {
  credentials: WebAuthnCredential[]
}

export interface WebAuthnErrorResponse {
  error: string
}

// Discord Account Linking Types
export interface LinkDiscordResponse {
  success: boolean
  message: string
  discord_username?: string
}

export interface UnlinkDiscordResponse {
  success: boolean
  message: string
}
