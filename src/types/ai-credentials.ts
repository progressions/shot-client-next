/**
 * AI Credentials Types
 *
 * Types for managing user AI provider credentials (API keys and OAuth tokens).
 */

/**
 * Supported AI providers.
 * - grok: xAI Grok API (API key authentication)
 * - openai: OpenAI API (API key authentication)
 * - gemini: Google Gemini API (OAuth authentication)
 */
export type AiProvider = "grok" | "openai" | "gemini"

/**
 * AI provider metadata for display purposes.
 */
export interface AiProviderInfo {
  id: AiProvider
  name: string
  description: string
  authType: "api_key" | "oauth"
  placeholder?: string
  helpUrl?: string
}

/**
 * Metadata for all supported AI providers.
 */
export const AI_PROVIDERS: Record<AiProvider, AiProviderInfo> = {
  grok: {
    id: "grok",
    name: "Grok (xAI)",
    description: "xAI's Grok model for chat and image generation",
    authType: "api_key",
    placeholder: "xai-...",
    helpUrl: "https://console.x.ai/",
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    description: "GPT-4 for chat, DALL-E 3 for images",
    authType: "api_key",
    placeholder: "sk-...",
    helpUrl: "https://platform.openai.com/api-keys",
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's Gemini for chat and Imagen for images",
    authType: "oauth",
    helpUrl: "https://cloud.google.com/gemini-api",
  },
}

/**
 * AI credential as stored in the database.
 * API key is returned masked for security.
 */
export interface AiCredential {
  id: string
  user_id: string
  provider: AiProvider
  /** Masked API key (e.g., "...abcd1234") - only last 8 chars visible */
  api_key_masked: string | null
  /** Whether OAuth token is present (for Gemini) */
  has_access_token: boolean
  /** OAuth token expiration (for Gemini) */
  token_expires_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Payload for creating a new API key credential.
 */
export interface CreateApiKeyCredentialPayload {
  provider: "grok" | "openai"
  api_key: string
}

/**
 * Payload for updating an API key credential.
 */
export interface UpdateApiKeyCredentialPayload {
  api_key: string
}

/**
 * Response from credential list endpoint.
 */
export interface AiCredentialsResponse {
  data: AiCredential[]
}

/**
 * Response from single credential endpoint.
 */
export interface AiCredentialResponse {
  data: AiCredential
}

/**
 * Check if a provider uses API key authentication.
 */
export function isApiKeyProvider(provider: AiProvider): boolean {
  return provider === "grok" || provider === "openai"
}

/**
 * Check if a provider uses OAuth authentication.
 */
export function isOAuthProvider(provider: AiProvider): boolean {
  return provider === "gemini"
}

/**
 * Get display name for a provider.
 */
export function getProviderName(provider: AiProvider): string {
  return AI_PROVIDERS[provider]?.name ?? provider
}
