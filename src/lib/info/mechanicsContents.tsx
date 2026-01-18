import dynamic from "next/dynamic"
import type { InfoContents } from "./types"

const InfoLink = dynamic(() => import("@/components/ui/links/InfoLink"), {
  ssr: false,
})

export const mechanicsContents: InfoContents = {
  damage: {
    title: "Damage",
    content: (
      <>
        <InfoLink info="Damage" /> is the raw destructive force of a{" "}
        <InfoLink href="/weapons" info="Weapon" /> or{" "}
        <InfoLink href="/characters" info="Character" />, the measure of pain
        inflicted when an attack lands true. Added to the Outcome of a
        successful Action Result, <InfoLink info="Damage" /> can turn the tide
        of a <InfoLink href="/fights" info="Fight" />, leaving foes broken and
        battlegrounds scarred in the relentless clash for{" "}
        <InfoLink info="Chi" />.
      </>
    ),
  },
  concealment: {
    title: "Concealment",
    content: (
      <>
        <InfoLink info="Concealment" /> measures a{" "}
        <InfoLink href="/weapons" info="Weapon" />
        &apos;s subtlety, the ease with which it can be hidden from prying eyes.
        A low <InfoLink info="Concealment" /> score means a blade or pistol can
        be tucked away unnoticed, perfect for assassins or spies slipping
        through the shadows of the <InfoLink info="Chi War" />
        &apos;s deadly intrigues.
      </>
    ),
  },
  reload: {
    title: "Reload",
    content: (
      <>
        <InfoLink info="Reload" /> reflects the risk that a firearm might run
        dry in the chaos of a <InfoLink href="/fights" info="Fight" />, forcing
        a <InfoLink href="/characters" info="Character" /> to pause and rearm
        starting from the second Sequence. A high <InfoLink info="Reload" />{" "}
        score can mean the difference between victory and vulnerability in the
        heat of battle.
      </>
    ),
  },
  "action value": {
    title: "Action Value",
    content: (
      <>
        An <InfoLink info="Action Value" /> represents a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s raw skill in a specific area, such as{" "}
        <InfoLink info="Martial Arts" />, <InfoLink info="Guns" />, or{" "}
        <InfoLink info="Sorcery" />. This numerical measure determines their
        effectiveness when rolling dice to perform actions in a{" "}
        <InfoLink href="/fights" info="Fight" /> or other challenges, shaping
        their ability to dominate the chaotic battlegrounds of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  wealth: {
    title: "Wealth",
    content: (
      <>
        <InfoLink info="Wealth" /> reflects a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s access to resources, from cold hard cash to valuable connections
        or rare artifacts. In the Feng Shui universe, <InfoLink info="Wealth" />{" "}
        fuels their ability to acquire{" "}
        <InfoLink href="/weapons" info="Weapons" />,{" "}
        <InfoLink href="/vehicles" info="Vehicles" />, or influence, giving them
        an edge in the relentless intrigues and power struggles of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
}
