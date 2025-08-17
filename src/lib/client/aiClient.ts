import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { Entity, Character, CharacterJson } from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
}

export function createAiClient(deps: ClientDependencies) {
  const { api, apiV2 } = deps
  const { post } = createBaseClient(deps)

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
    return post(api.ai(), { ai: parameters })
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

  return {
    extendCharacter,
    generateAiCharacter,
    generateAiImages,
    attachImage,
  }
}
