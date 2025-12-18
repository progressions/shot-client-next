import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type {
  Weapon,
  WeaponsResponse,
  Character,
  CacheOptions,
  Parameters_,
} from "@/types"

interface ClientDependencies {
  jwt?: string
  api: import("@/lib").Api
  apiV2: import("@/lib").ApiV2
  queryParams: typeof import("@/lib").queryParams
}

export function createWeaponClient(deps: ClientDependencies) {
  const { api, apiV2, queryParams } = deps
  const { get, post, delete: delete_, requestFormData } = createBaseClient(deps)

  async function getWeaponsBatch(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<WeaponsResponse>> {
    return post(`${apiV2.weapons()}/batch`, { ...parameters }, cacheOptions)
  }

  async function getWeapons(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<WeaponsResponse>> {
    const query = queryParams(parameters)
    return get(`${apiV2.weapons()}?${query}`, {}, cacheOptions)
  }

  async function getWeapon(
    weapon: Weapon | string,
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<Weapon>> {
    return get(apiV2.weapons(weapon), {}, cacheOptions)
  }

  async function getWeaponJunctures(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ junctures: string[] }>> {
    const query = queryParams(parameters)
    return get(`${apiV2.weaponJunctures()}?${query}`, {}, cacheOptions)
  }

  async function getWeaponCategories(
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<{ categories: string[] }>> {
    const query = queryParams(parameters)
    return get(`${apiV2.weaponCategories()}?${query}`, {}, cacheOptions)
  }

  async function createWeapon(
    formData: FormData
  ): Promise<AxiosResponse<Weapon>> {
    return requestFormData("POST", `${apiV2.weapons()}`, formData)
  }

  async function updateWeapon(
    id: string,
    formData: FormData
  ): Promise<AxiosResponse<Weapon>> {
    return requestFormData("PATCH", `${apiV2.weapons({ id })}`, formData)
  }

  async function deleteWeapon(
    weapon: Weapon,
    params = {}
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.weapons(weapon)}`, params)
  }

  async function deleteWeaponImage(
    weapon: Weapon
  ): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.weapons(weapon)}/image`)
  }

  async function addWeapon(
    character: Character | string,
    weapon: Weapon
  ): Promise<AxiosResponse<Character>> {
    return post(apiV2.characterWeapons(character), { weapon: weapon })
  }

  async function uploadWeapons(content: string): Promise<AxiosResponse<void>> {
    return post(api.importWeapons(), { weapon: { yaml: content } })
  }

  async function removeWeapon(
    character: Character | string,
    weapon: Weapon | string
  ): Promise<AxiosResponse<Weapon>> {
    return delete_(apiV2.characterWeapons(character, weapon))
  }

  async function getCharacterWeapons(
    character: Character | string,
    parameters: Parameters_ = {},
    cacheOptions: CacheOptions = {}
  ): Promise<AxiosResponse<WeaponsResponse>> {
    const query = queryParams(parameters)
    return get(
      `${apiV2.characterWeapons(character)}?${query}`,
      {},
      cacheOptions
    )
  }

  async function duplicateWeapon(
    weapon: Weapon
  ): Promise<AxiosResponse<Weapon>> {
    return post(`${apiV2.weapons(weapon)}/duplicate`)
  }

  return {
    getWeaponsBatch,
    getWeapons,
    getWeapon,
    getWeaponJunctures,
    getWeaponCategories,
    createWeapon,
    updateWeapon,
    deleteWeapon,
    deleteWeaponImage,
    duplicateWeapon,
    addWeapon,
    uploadWeapons,
    removeWeapon,
    getCharacterWeapons,
  }
}
