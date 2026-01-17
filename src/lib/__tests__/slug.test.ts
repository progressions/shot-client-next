import { extractId, slugifyName, buildSluggedId, sluggedPath } from "../slug"

describe("slug helpers", () => {
  it("extracts uuid from slugged id", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000"
    expect(extractId(`cool-character-${id}`)).toEqual(id)
    expect(extractId(id)).toEqual(id)
  })

  it("slugifies names", () => {
    expect(slugifyName("Cool Character")).toEqual("cool-character")
    expect(slugifyName(" Hello---World  !")).toEqual("hello-world")
  })

  it("builds slugged id and path", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000"
    expect(buildSluggedId("Cool Character", id)).toEqual(`cool-character-${id}`)
    expect(sluggedPath("characters", "Cool Character", id)).toEqual(
      `/characters/cool-character-${id}`
    )
  })
})
