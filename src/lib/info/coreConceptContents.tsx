import dynamic from "next/dynamic"
import type { InfoContents } from "./types"

const InfoLink = dynamic(() => import("@/components/ui/links/InfoLink"), {
  ssr: false,
})
const TypeLink = dynamic(() => import("@/components/ui/links/TypeLink"), {
  ssr: false,
})
const ArchetypeLink = dynamic(
  () => import("@/components/ui/links/ArchetypeLink"),
  { ssr: false }
)

export const coreConceptContents: InfoContents = {
  character: {
    title: "Character",
    content: (
      <>
        A <InfoLink href="/characters" info="Character" /> in the Feng Shui
        universe is a vibrant, larger-than-life figure—either a Player{" "}
        <InfoLink href="/characters" info="Character" /> (<>PC</>), driven by
        the ambitions and cunning of the player, or a Game Master-controlled{" "}
        <InfoLink href="/characters" info="Character" /> (GMC), woven into the
        narrative by the GM&apos;s deft hand. These are the heroes, villains,
        and enigmatic figures whose actions shape the chaotic tapestry of the{" "}
        <InfoLink info="Chi War" />, wielding{" "}
        <InfoLink href="/schticks" info="Schticks" />,{" "}
        <InfoLink href="/weapons" info="Weapons" />, and raw determination to
        leave their mark on the <InfoLink href="/junctures" info="Junctures" />.
      </>
    ),
  },
  party: {
    title: "Party",
    content: (
      <>
        A <InfoLink href="/parties" info="Party" /> is a motley crew of Player{" "}
        <InfoLink href="/characters" info="Characters" /> (<>PCs</>) or Game
        Master-controlled <InfoLink href="/characters" info="Characters" />{" "}
        (GMCs), bound by shared goals, uneasy alliances, or sheer necessity.
        Whether a ragtag band of heroes or a cabal of scheming rogues, they
        navigate the treacherous currents of the Feng Shui universe together,
        their fates intertwined as they battle for control of mystical{" "}
        <InfoLink href="/feng-shui-sites" info="Feng Shui Sites" /> or unravel
        ancient secrets across the{" "}
        <InfoLink href="/junctures" info="Junctures" />.
      </>
    ),
  },
  "chi war": {
    title: "Chi War",
    content: (
      <>
        The <InfoLink info="Chi War" /> is a clandestine, world-shattering
        conflict that rages across time and space, where{" "}
        <InfoLink href="/factions" info="Factions" /> vie for dominion over the
        potent <InfoLink href="/feng-shui-sites" info="Feng Shui Sites" />{" "}
        scattered throughout the <InfoLink href="/junctures" info="Junctures" />
        . It&apos;s a high-stakes struggle of martial prowess, mystical power,
        and cunning strategy, where every victory shifts the balance of{" "}
        <InfoLink info="Chi" /> and reshapes the destiny of entire eras.
      </>
    ),
  },
  chi: {
    title: "Chi",
    content: (
      <>
        <InfoLink info="Chi" /> is the lifeblood of the Feng Shui universe, a
        mystical energy that pulses through the world, fueling extraordinary
        feats and supernatural abilities.{" "}
        <InfoLink href="/characters" info="Characters" /> who master{" "}
        <InfoLink info="Chi" /> can bend reality to their will, unleashing
        devastating <InfoLink info="Martial Arts" />, casting arcane{" "}
        <InfoLink info="Magic" /> spells, or defying the laws of physics in
        their quest for power and glory.
      </>
    ),
  },
  "feng shui site": {
    title: "Feng Shui Site",
    content: (
      <>
        A <InfoLink href="/feng-shui-sites" info="Feng Shui Site" /> is a nexus
        of mystical power, a sacred or cursed location where the flow of{" "}
        <InfoLink info="Chi" /> converges to shape fate itself. From ancient
        temples hidden in mist-shrouded mountains to neon-lit urban shrines,
        these sites are coveted prizes in the <InfoLink info="Chi War" />,
        fiercely contested by <InfoLink href="/characters" info="Characters" />{" "}
        who seek to harness their energy to alter the course of history.
      </>
    ),
  },
  faction: {
    title: "Faction",
    content: (
      <>
        A <InfoLink href="/factions" info="Faction" /> is a powerful alliance of{" "}
        <InfoLink href="/characters" info="Characters" /> united by a shared
        vision, whether it&apos;s noble, nefarious, or something in between.
        From shadowy cabals to heroic brotherhoods,{" "}
        <InfoLink href="/factions" info="Factions" /> drive the conflicts of the{" "}
        <InfoLink info="Chi War" />, wielding influence, martial might, and
        arcane secrets to dominate the{" "}
        <InfoLink href="/junctures" info="Junctures" /> and secure their place
        in the annals of time.
      </>
    ),
  },
  schtick: {
    title: "Schtick",
    content: (
      <>
        A <InfoLink href="/schticks" info="Schtick" /> is a signature ability or
        flair that defines a <InfoLink href="/characters" info="Character" />
        &apos;s style and prowess. Whether it&apos;s a gravity-defying{" "}
        <InfoLink info="Martial Art" /> technique, a cunning sleight of hand, or
        a devastating <InfoLink info="Magic" />
        al incantation, <InfoLink href="/schticks" info="Schticks" /> are the
        tools that make <InfoLink href="/characters" info="Characters" /> stand
        out in the whirlwind of combat and intrigue that defines the Feng Shui
        universe.
      </>
    ),
  },
  weapon: {
    title: "Weapon",
    content: (
      <>
        A <InfoLink href="/weapons" info="Weapon" /> is more than steel or
        gunpowder—it&apos;s an extension of a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s will, a deadly instrument crafted for chaos or justice. From
        razor-sharp katanas to futuristic plasma rifles,{" "}
        <InfoLink href="/weapons" info="Weapons" /> amplify a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s ability to dominate <InfoLink href="/fights" info="Fights" />,
        deliver devastating blows, or execute precise, game-changing actions in
        the heat of battle.
      </>
    ),
  },
  type: {
    title: "Type",
    content: (
      <>
        A <TypeLink characterType="Type" /> is the essence of a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s role in the Feng Shui saga, a classification that shapes their
        strengths and destiny. Whether a battle-hardened{" "}
        <TypeLink characterType="Martial Artist" />, a cunning{" "}
        <TypeLink characterType="Spy" />, or a mystical{" "}
        <TypeLink characterType="Sorcerer" />, a{" "}
        <InfoLink href="/characters" info="Character" />
        &apos;s <TypeLink characterType="Type" /> defines their approach to the{" "}
        <InfoLink info="Chi War" /> and their place in the ever-shifting balance
        of power.
      </>
    ),
  },
  archetype: {
    title: "Archetype",
    content: (
      <>
        An <InfoLink info="Archetype" /> is a legendary blueprint for a{" "}
        <InfoLink href="/characters" info="Character" />, a template brimming
        with unique abilities, traits, and flair. From the shadowy{" "}
        <ArchetypeLink archetype="Ninja" /> to the indomitable{" "}
        <ArchetypeLink archetype="Big Bruiser" />,{" "}
        <InfoLink info="Archetypes" /> provide the foundation for heroes and
        villains alike, guiding their path through the chaotic battles and
        intricate plots of the Feng Shui universe.
      </>
    ),
  },
  juncture: {
    title: "Juncture",
    content: (
      <>
        A <InfoLink href="/junctures" info="Juncture" /> is a vibrant slice of
        time in the Feng Shui universe, a distinct era where past, present, and
        future collide. From ancient dynasties to dystopian futures,{" "}
        <InfoLink href="/characters" info="Characters" /> traverse these
        temporal battlegrounds via <InfoLink info="Portals" />, influencing
        events and battling for control of <InfoLink info="Chi" /> to reshape
        history itself.
      </>
    ),
  },
  fight: {
    title: "Fight",
    content: (
      <>
        A <InfoLink href="/fights" info="Fight" /> is the heart-pounding clash
        of steel, <InfoLink info="Chi" />, and willpower, where{" "}
        <InfoLink href="/characters" info="Characters" /> unleash their{" "}
        <InfoLink href="/schticks" info="Schticks" /> and{" "}
        <InfoLink href="/weapons" info="Weapons" /> in explosive combat. These
        encounters are the crucible of the <InfoLink info="Chi War" />, where
        fortunes are won, rivalries are settled, and the fate of{" "}
        <InfoLink href="/junctures" info="Junctures" /> hangs in the balance
        with every strike.
      </>
    ),
  },
  campaign: {
    title: "Campaign",
    content: (
      <>
        A <InfoLink href="/campaigns" info="Campaign" /> is an epic saga, a
        series of interconnected adventures that weave a grand tale across the
        Feng Shui universe. From daring heists in neon-soaked futures to
        desperate battles in ancient temples,{" "}
        <InfoLink href="/campaigns" info="Campaigns" /> draw{" "}
        <InfoLink href="/characters" info="Characters" /> into a web of
        intrigue, betrayal, and heroism that spans time and space.
      </>
    ),
  },
  adventure: {
    title: "Adventure",
    content: (
      <>
        An <InfoLink href="/adventures" info="Adventure" /> is a focused
        scenario within a <InfoLink href="/campaigns" info="Campaign" />: a
        clear hook, vivid stakes, and a handful of pivotal scenes that propel a
        <InfoLink href="/parties" info="Party" /> toward a goal. Each{" "}
        <InfoLink info="Adventure" /> ties together evocative locations across
        the <InfoLink href="/junctures" info="Junctures" />, key
        <InfoLink href="/fights" info="Fights" />, and colorful
        <InfoLink href="/characters" info="Characters" /> to deliver a complete
        chapter of the <InfoLink info="Chi War" /> story.
      </>
    ),
  },
  category: {
    title: "Category",
    content: (
      <>
        A <InfoLink info="Category" /> is a way to classify the myriad{" "}
        <InfoLink href="/schticks" info="Schticks" />,{" "}
        <InfoLink href="/weapons" info="Weapons" />, and items of the Feng Shui
        world, grouping them by their function or nature. Whether it&apos;s a
        blazing array of firearms or a suite of mystical spells,{" "}
        <InfoLink info="Categorys" /> help{" "}
        <InfoLink href="/characters" info="Characters" /> navigate the tools of
        their trade in the relentless <InfoLink info="Chi War" />.
      </>
    ),
  },
  path: {
    title: "Path",
    content: (
      <>
        A <InfoLink info="Path" /> is a specialized branch of{" "}
        <InfoLink href="/schticks" info="Schticks" />, a focused discipline
        within a <InfoLink href="/characters" info="Character" />
        &apos;s arsenal. Whether mastering a specific{" "}
        <InfoLink info="Martial Art" /> or honing a unique{" "}
        <InfoLink info="Magic" />
        al technique, <InfoLink info="Paths" /> allow{" "}
        <InfoLink href="/characters" info="Characters" /> to refine their craft,
        unlocking new depths of power to wield in their battles across the{" "}
        <InfoLink href="/junctures" info="Junctures" />.
      </>
    ),
  },
}
