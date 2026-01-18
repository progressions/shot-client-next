import type { InfoContents } from "./types"
import { coreConceptContents } from "./coreConceptContents"
import { mechanicsContents } from "./mechanicsContents"
import { worldContents } from "./worldContents"
import { actionValueContents } from "./actionValueContents"
import { archetypeContents } from "./archetypeContents"

export type { InfoContent, InfoContents } from "./types"

export const contents: InfoContents = {
  ...coreConceptContents,
  ...mechanicsContents,
  ...worldContents,
  ...actionValueContents,
  ...archetypeContents,
}
