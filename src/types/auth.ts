export interface RegistrationData {
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
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
