import dynamic from "next/dynamic"
import type { InfoContents } from "./types"

const InfoLink = dynamic(() => import("@/components/ui/links/InfoLink"), {
  ssr: false,
})
const TypeLink = dynamic(() => import("@/components/ui/links/TypeLink"), {
  ssr: false,
})

export const actionValueContents: InfoContents = {
  "av gun": {
    title: "Guns",
    content: (
      <>
        <InfoLink info="Guns" /> represent a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s mastery of firearms, from sleek pistols to thunderous shotguns.
        This skill turns a mere <InfoLink href="/weapons" info="Weapon" /> into
        an extension of their will, delivering precise, devastating strikes that
        echo across the battlegrounds of the <InfoLink info="Chi War" />.
      </>
    ),
  },
  "av defense": {
    title: "Defense",
    content: (
      <>
        <InfoLink info="Defense" /> is a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s ability to evade or withstand attacks, a critical shield in the
        chaos of a <InfoLink href="/fights" info="Fight" />. An attacker must
        roll an Action Result equal to or greater than a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s <InfoLink info="Defense" /> to land a blow, making this stat the
        difference between survival and defeat.
      </>
    ),
  },
  "av toughness": {
    title: "Toughness",
    content: (
      <>
        <InfoLink info="Toughness" /> is a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s raw resilience, their ability to shrug off pain and keep
        fighting. By reducing the Smackdown taken from a hit,{" "}
        <InfoLink info="Toughness" /> allows warriors to endure the fiercest
        assaults and stand tall in the relentless storm of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "av speed": {
    title: "Speed",
    content: (
      <>
        <InfoLink info="Speed" /> is the lightning in a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s veins, their quickness and agility in the heat of battle. For
        Initiative, a <InfoLink href="/characters" info="Character" /> rolls a
        single non-exploding die and adds their <InfoLink info="Speed" />,
        determining who strikes first in the frenetic clashes that define a{" "}
        <InfoLink href="/fights" info="Fight" />.
      </>
    ),
  },
  "av fortune": {
    title: "Fortune",
    content: (
      <>
        <InfoLink info="Fortune" /> is a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s luck, a subtle force that tips fate in their favor. By spending
        a <InfoLink info="Fortune" /> point, they can add a single non-exploding
        die to a Swerve roll, turning a desperate moment into a triumphant
        victory in the unpredictable <InfoLink info="Chi War" />.
      </>
    ),
  },
  "av sorcery": {
    title: "Sorcery",
    content: (
      <>
        <InfoLink info="Sorcery" /> is a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s mastery of the arcane, their ability to weave spells and unleash
        mystical power. From conjuring elemental forces to manipulating minds,{" "}
        <InfoLink info="Sorcery" /> transforms a{" "}
        <InfoLink href="/characters" info="Character" /> into a force of nature,
        feared and revered across the{" "}
        <InfoLink href="/junctures" info="Junctures" />.
      </>
    ),
  },
  "av chi": {
    title: "Chi",
    content: (
      <>
        <InfoLink info="Chi" /> is a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s command of the mystical energy that flows through all things,
        enabling feats that defy mortal limits. By spending a{" "}
        <InfoLink info="Chi" /> point, they can add a single non-exploding die
        to a Swerve roll, channeling this primal force to shape the outcome of
        critical moments.
      </>
    ),
  },
  "av martial art": {
    title: "Martial Arts",
    content: (
      <>
        <InfoLink info="Martial Arts" /> is the art of combat perfected, a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s skill in hand-to-hand fighting and unarmed techniques. This
        discipline transforms them into a whirlwind of precision and power,
        capable of felling foes with nothing but their fists and unbreakable
        will.
      </>
    ),
  },
  "av genome": {
    title: "Genome",
    content: (
      <>
        <InfoLink info="Genome" /> reflects a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s genetic mutations, the unique traits that grant them
        extraordinary abilities. From superhuman strength to unnatural senses,
        these gifts set them apart in the <InfoLink info="Chi War" />, making
        them both feared and coveted by their enemies.
      </>
    ),
  },
  "av scroungetech": {
    title: "Scroungetech",
    content: (
      <>
        <InfoLink info="Scroungetech" /> is a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s mastery of cobbled-together gadgets and cybernetic enhancements,
        blending ingenuity with raw power. From jury-rigged{" "}
        <InfoLink href="/weapons" info="Weapons" /> to biomechanical implants,{" "}
        <InfoLink info="Scroungetech" /> turns a{" "}
        <InfoLink href="/characters" info="Character" /> into a walking arsenal,
        ready to dominate any battlefield.
      </>
    ),
  },
  "av creature": {
    title: "Creature",
    content: (
      <>
        <InfoLink info="Creature" /> represents a{" "}
        <TypeLink characterType="Supernatural Creature" />
        &apos;s innate ferocity, their ability to wield claws, fangs, or other
        natural <InfoLink href="/weapons" info="Weapons" /> in combat. These
        primal attacks deliver devastating <InfoLink info="Damage" />, making
        such beings terrifying forces in the chaotic clashes of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "av damage": {
    title: "Damage",
    content: (
      <>
        For <InfoLink href="/characters" info="Characters" /> without
        specialized <InfoLink href="/weapons" info="Weapons" />,{" "}
        <InfoLink info="Damage" /> is their baseline ability to inflict harm,
        added to the Outcome of a successful Action Result. With a base{" "}
        <InfoLink info="Damage" /> of 7, these warriors rely on raw strength or
        skill to leave their mark in the heat of battle.
      </>
    ),
  },
}
