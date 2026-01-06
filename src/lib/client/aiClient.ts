import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Entity,
  Character,
  CharacterJson,
  AiCredential,
  AiProvider,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  apiV2: import("@/lib").ApiV2
}

interface AiCredentialsResponse {
  ai_credentials: AiCredential[]
}

interface AiCredentialResponse {
  ai_credential: AiCredential
}

export function createAiClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get, post, patch, delete: delete_ } = createBaseClient(deps)

  async function extendCharacter(
    character: Character
  ): Promise<AxiosResponse<Character>> {
    return post(`${apiV2.ai()}/${character.id}/extend`, {
      character: character,
    })
  }

  async function generateAiCharacter(
    parameters: { description: string } = { description: "" }
  ): Promise<AxiosResponse<CharacterJson>> {
    return post(apiV2.ai(), { ai: parameters })
  }

  async function generateAiImages(parameters: {
    entity: Entity
  }): Promise<AxiosResponse<string[]>> {
    const { entity } = parameters
    return post(apiV2.aiImages(), {
      entity_class: entity.entity_class,
      entity_id: entity.id,
    })
  }

  async function attachImage(parameters: {
    entity: Entity
    imageUrl: string
  }): Promise<AxiosResponse<Entity>> {
    const { entity, imageUrl } = parameters
    return post(`${apiV2.aiImages()}/attach`, {
      ai_image: {
        entity_class: entity.entity_class,
        entity_id: entity.id,
        image_url: imageUrl,
      },
    })
  }

  // AI Credentials management

  async function getAiCredentials(): Promise<
    AxiosResponse<AiCredentialsResponse>
  > {
    return get(apiV2.aiCredentials())
  }

  async function getAiCredential(
    id: string
  ): Promise<AxiosResponse<AiCredentialResponse>> {
    return get(apiV2.aiCredentials({ id }))
  }

  async function createAiCredential(payload: {
    provider: AiProvider
    api_key?: string
    access_token?: string
    refresh_token?: string
    token_expires_at?: string
  }): Promise<AxiosResponse<AiCredentialResponse>> {
    return post(apiV2.aiCredentials(), { ai_credential: payload })
  }

  async function updateAiCredential(
    id: string,
    payload: {
      api_key?: string
      access_token?: string
      refresh_token?: string
      token_expires_at?: string
    }
  ): Promise<AxiosResponse<AiCredentialResponse>> {
    return patch(apiV2.aiCredentials({ id }), { ai_credential: payload })
  }

  async function deleteAiCredential(id: string): Promise<AxiosResponse<void>> {
    return delete_(apiV2.aiCredentials({ id }))
  }

  return {
    extendCharacter,
    generateAiCharacter,
    generateAiImages,
    attachImage,
    // AI Credentials
    getAiCredentials,
    getAiCredential,
    createAiCredential,
    updateAiCredential,
    deleteAiCredential,
  }
}
