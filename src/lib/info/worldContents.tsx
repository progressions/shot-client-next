import dynamic from "next/dynamic"
import type { InfoContents } from "./types"

const InfoLink = dynamic(() => import("@/components/ui/links/InfoLink"), {
  ssr: false,
})
const TypeLink = dynamic(() => import("@/components/ui/links/TypeLink"), {
  ssr: false,
})

export const worldContents: InfoContents = {
  netherworld: {
    title: "Netherworld",
    content: (
      <>
        The <InfoLink info="Netherworld" /> is a shadowy, mystical realm that
        exists between <InfoLink href="/junctures" info="Junctures" />, a
        liminal space ruled by the enigmatic Four Monarchs. This eerie dimension
        is a battleground of its own, where{" "}
        <InfoLink href="/characters" info="Characters" /> navigate treacherous
        alliances and supernatural forces to seize control of{" "}
        <InfoLink info="Chi" /> and time itself.
      </>
    ),
  },
  portal: {
    title: "Portal",
    content: (
      <>
        A <InfoLink info="Portal" /> is a shimmering gateway through time and
        space, connecting the <InfoLink href="/junctures" info="Junctures" /> of
        the Feng Shui universe. These mystical passages allow{" "}
        <InfoLink href="/characters" info="Characters" /> to leap from ancient
        battlefields to futuristic sprawls, chasing power, destiny, or escape in
        the ever-shifting <InfoLink info="Chi War" />.
      </>
    ),
  },
  user: {
    title: "User",
    content: (
      <>
        A <InfoLink href="/users" info="User" /> is the mastermind behind the
        action, a player or Game Master who breathes life into the Feng Shui
        universe. Whether crafting epic{" "}
        <InfoLink href="/campaigns" info="Campaigns" /> or embodying a single{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s journey, <InfoLink href="/users" info="Users" /> shape the
        chaos, intrigue, and heroism that define the <InfoLink info="Chi War" />
        .
      </>
    ),
  },
  "martial art": {
    title: "Martial Art",
    content: (
      <>
        A <InfoLink info="Martial Art" /> is a disciplined combat style, honed
        through years of training, that empowers{" "}
        <InfoLink href="/characters" info="Characters" /> to dominate{" "}
        <InfoLink href="/fights" info="Fights" />. From the fluid grace of kung
        fu to the brutal efficiency of krav maga, these techniques transform a
        warrior&apos;s body into a living{" "}
        <InfoLink href="/weapons" info="Weapon" />, striking fear into their
        foes.
      </>
    ),
  },
  magic: {
    title: "Magic",
    content: (
      <>
        <InfoLink info="Magic" /> is the arcane pulse of the Feng Shui universe,
        a primal force that <InfoLink href="/characters" info="Characters" />{" "}
        wield to bend reality itself. From summoning storms to weaving
        illusions, <InfoLink info="Magic" /> empowers{" "}
        <TypeLink characterType="Sorcerers" /> and mystics to unleash
        supernatural feats that can turn the tide of any battle or intrigue.
      </>
    ),
  },
}
