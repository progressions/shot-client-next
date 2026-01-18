import dynamic from "next/dynamic"
import type { InfoContents } from "./types"

const InfoLink = dynamic(() => import("@/components/ui/links/InfoLink"), {
  ssr: false,
})
const ArchetypeLink = dynamic(
  () => import("@/components/ui/links/ArchetypeLink"),
  { ssr: false }
)

export const archetypeContents: InfoContents = {
  "archetype: sorcerer": {
    title: "Sorcerer",
    content: (
      <>
        An <ArchetypeLink archetype="Sorcerer" /> is a master of the arcane,
        weaving spells that bend reality to their will. Drawing on ancient
        knowledge and the raw power of <InfoLink info="Chi" />, they unleash
        devastating <InfoLink info="Magic" />, from fiery blasts to subtle
        enchantments, making them feared architects of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "archetype: everyday hero": {
    title: "Everyday Hero",
    content: (
      <>
        An <ArchetypeLink archetype="Everyday Hero" /> is the underdog who rises
        above, relying on grit, wits, and sheer determination rather than
        supernatural gifts. From street-smart hustlers to unassuming scholars,
        they prove that heart and ingenuity can triumph in the chaotic crucible
        of the Feng Shui universe.
      </>
    ),
  },
  "archetype: archer": {
    title: "Archer",
    content: (
      <>
        An <ArchetypeLink archetype="Archer" /> is a master of precision,
        wielding bows and arrows with deadly accuracy. From ancient longbows to
        high-tech compound bows, they strike from afar, threading arrows through
        the chaos of battle to hit their mark and turn the tide of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "archetype: bandit": {
    title: "Bandit",
    content: (
      <>
        An <ArchetypeLink archetype="Bandit" /> thrives in the shadows, using
        stealth, cunning, and a quick blade to outwit their foes. Whether
        robbing from the rich or sabotaging tyrannical{" "}
        <InfoLink href="/factions" info="Factions" />, their guile and daring
        make them unpredictable wildcards in the intricate dance of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "archetype: big bruiser": {
    title: "Big Bruiser",
    content: (
      <>
        An <ArchetypeLink archetype="Big Bruiser" /> is a towering force of raw
        power, smashing through obstacles with brute strength and unshakable
        resolve. Their fists are their{" "}
        <InfoLink href="/weapons" info="Weapons" />, and their presence alone
        can shift the momentum of a <InfoLink href="/fights" info="Fight" />,
        making them legends in the <InfoLink info="Chi War" />
        &apos;s brutal arenas.
      </>
    ),
  },
  "archetype: bodyguard": {
    title: "Bodyguard",
    content: (
      <>
        An <ArchetypeLink archetype="Bodyguard" /> is a stalwart protector,
        trained to shield their charge from harm with a blend of combat prowess
        and tactical cunning. Whether deflecting bullets or facing down mystical
        threats, their loyalty and skill make them indispensable in the{" "}
        <InfoLink info="Chi War" />
        &apos;s deadly conflicts.
      </>
    ),
  },
  "archetype: cyborg": {
    title: "Cyborg",
    content: (
      <>
        An <ArchetypeLink archetype="Cyborg" /> is a fusion of flesh and
        machine, their body enhanced with cutting-edge cybernetics that grant
        superhuman abilities. From bionic limbs to neural implants, they wield{" "}
        <InfoLink info="Scroungetech" /> with deadly precision, carving their
        legacy in the futuristic battlegrounds of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "archetype: bounty hunter": {
    title: "Bounty Hunter",
    content: (
      <>
        An <ArchetypeLink archetype="Bounty Hunter" /> is a relentless tracker,
        driven by profit or justice to hunt down their quarry across the{" "}
        <InfoLink href="/junctures" info="Junctures" />. With a keen eye and a
        loaded <InfoLink href="/weapons" info="Weapon" />, they pursue their
        targets through time and space, never resting until the job is done in
        the <InfoLink info="Chi War" />
        &apos;s unforgiving landscape.
      </>
    ),
  },
  "archetype: drifter": {
    title: "Drifter",
    content: (
      <>
        An <ArchetypeLink archetype="Drifter" /> is a wanderer of the{" "}
        <InfoLink href="/junctures" info="Junctures" />, a lone soul seeking
        adventure, redemption, or escape from a haunted past. With a quick wit
        and survival instincts honed by a life on the road, they navigate the{" "}
        <InfoLink info="Chi War" />
        &apos;s dangers with a restless spirit and a ready blade.
      </>
    ),
  },
  "archetype: driver": {
    title: "Driver",
    content: (
      <>
        An <ArchetypeLink archetype="Driver" /> is a master of machines, their
        hands steady on the wheel of roaring{" "}
        <InfoLink href="/vehicles" info="Vehicles" /> that tear through the{" "}
        <InfoLink href="/junctures" info="Junctures" />. Whether outrunning
        pursuers or charging into combat, their skill behind the controls makes
        them a vital asset in the high-speed chaos of the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "archetype: ex-special forces": {
    title: "Ex-Special Forces",
    content: (
      <>
        An <ArchetypeLink archetype="Ex-Special Forces" />{" "}
        <InfoLink href="/characters" info="Character" /> is a battle-hardened
        veteran, trained in elite tactics and combat skills that make them a
        force to be reckoned with. Their disciplined precision and adaptability
        shine in the <InfoLink info="Chi War" />, where their past missions fuel
        their drive for victory.
      </>
    ),
  },
  "archetype: exorcist monk": {
    title: "Exorcist Monk",
    content: (
      <>
        An <ArchetypeLink archetype="Exorcist Monk" /> is a spiritual warrior,
        wielding ancient rituals and martial prowess to banish supernatural
        threats. Trained in the sacred arts, they face demons and ghosts with
        unshakable resolve, protecting the{" "}
        <InfoLink href="/junctures" info="Junctures" /> from the horrors of the{" "}
        <InfoLink info="Netherworld" />.
      </>
    ),
  },
  "archetype: full-metal nutball": {
    title: "Full-Metal Nutball",
    content: (
      <>
        An <ArchetypeLink archetype="Full-Metal Nutball" /> is chaos incarnate,
        reveling in destruction with an arsenal of heavy{" "}
        <InfoLink href="/weapons" info="Weapons" /> and explosives. Their
        reckless abandon and love for mayhem make them a walking catastrophe,
        leaving devastation in their wake as they charge through the{" "}
        <InfoLink info="Chi War" />.
      </>
    ),
  },
  "archetype: gambler": {
    title: "Gambler",
    content: (
      <>
        An <ArchetypeLink archetype="Gambler" /> thrives on risk, their charm
        and luck turning the odds in their favor. Whether bluffing through
        high-stakes negotiations or rolling the dice in a{" "}
        <InfoLink href="/fights" info="Fight" />, they dance through the{" "}
        <InfoLink info="Chi War" /> with a sly grin, always betting on their own
        cunning to win the day.
      </>
    ),
  },
  "archetype: gene freak": {
    title: "Gene Freak",
    content: (
      <>
        An <ArchetypeLink archetype="Gene Freak" /> is a living anomaly, their
        body warped by <InfoLink info="Genome" /> mutations that grant
        extraordinary powers. From unnatural strength to bizarre abilities, they
        wield their <InfoLink info="Genome" /> like a{" "}
        <InfoLink href="/weapons" info="Weapon" />, carving a unique path
        through the treacherous battles of the <InfoLink info="Chi War" />.
      </>
    ),
  },
  "archetype: ghost": {
    title: "Ghost",
    content: (
      <>
        An <ArchetypeLink archetype="Ghost" /> is a spectral entity, tethered to
        the physical world by unfinished business or supernatural will. With
        eerie powers like phasing through walls or haunting their foes, they
        drift through the <InfoLink info="Chi War" />, their presence a chilling
        reminder of the <InfoLink info="Netherworld" />
        &apos;s reach.
      </>
    ),
  },
  "archetype: highway ronin": {
    title: "Highway Ronin",
    content: (
      <>
        An <ArchetypeLink archetype="Highway Ronin" /> is a lone warrior of the
        open road, a master of survival and combat who roams the{" "}
        <InfoLink href="/junctures" info="Junctures" />. With a blade or gun
        always at hand, they protect the weak or hunt their enemies, their
        solitary path etched in the dust of the <InfoLink info="Chi War" />
        &apos;s battlegrounds.
      </>
    ),
  },
  "archetype: karate cop": {
    title: "Karate Cop",
    content: (
      <>
        An <ArchetypeLink archetype="Karate Cop" /> blends law enforcement grit
        with <InfoLink info="Martial Arts" /> mastery, delivering justice with a
        swift kick or a well-placed strike. Their disciplined training and
        unyielding moral code make them a beacon of order in the chaotic swirl
        of the <InfoLink info="Chi War" />
        &apos;s conflicts.
      </>
    ),
  },
  "archetype: killer": {
    title: "Killer",
    content: (
      <>
        An <ArchetypeLink archetype="Killer" /> is a shadow in the night, a
        master of assassination whose precision and stealth make them a deadly
        predator. Striking from the darkness with lethal efficiency, they
        eliminate targets in the <InfoLink info="Chi War" />, leaving no trace
        but whispers of their deadly reputation.
      </>
    ),
  },
  "archetype: magic cop": {
    title: "Magic Cop",
    content: (
      <>
        An <ArchetypeLink archetype="Magic Cop" /> wields{" "}
        <InfoLink info="Magic" /> in the name of justice, using spells to combat
        supernatural threats and enforce order. From banishing demons to
        unraveling mystical crimes, they stand as guardians of the{" "}
        <InfoLink href="/junctures" info="Junctures" />, their{" "}
        <InfoLink info="Magic" /> a shield against the{" "}
        <InfoLink info="Chi War" />
        &apos;s chaos.
      </>
    ),
  },
  "archetype: martial artist": {
    title: "Martial Artist",
    content: (
      <>
        An <ArchetypeLink archetype="Martial Artist" /> is a living{" "}
        <InfoLink href="/weapons" info="Weapon" />, their body honed through
        years of grueling training to master the art of combat. With fluid
        strikes and unshakable focus, they dance through{" "}
        <InfoLink href="/fights" info="Fights" />, their skill a testament to
        their dominance in the <InfoLink info="Chi War" />
        &apos;s brutal arenas.
      </>
    ),
  },
  "archetype: masked avenger": {
    title: "Masked Avenger",
    content: (
      <>
        An <ArchetypeLink archetype="Masked Avenger" /> is a mysterious
        crusader, their identity hidden behind a veil as they fight injustice
        with gadgets and combat prowess. Striking from the shadows, they wage a
        personal war against the <InfoLink info="Chi War" />
        &apos;s villains, their legend growing with every daring act.
      </>
    ),
  },
  "archetype: maverick cop": {
    title: "Maverick Cop",
    content: (
      <>
        An <ArchetypeLink archetype="Maverick Cop" /> plays by their own rules,
        bending the law to deliver justice with unorthodox methods and
        unrelenting determination. Their bold tactics and sharp instincts make
        them a wildcard in the <InfoLink info="Chi War" />, feared by criminals
        and respected by allies.
      </>
    ),
  },
  "archetype: ninja": {
    title: "Ninja",
    content: (
      <>
        An <ArchetypeLink archetype="Ninja" /> is a master of stealth and
        subterfuge, striking with lethal precision from the shadows. With
        unmatched agility and a deadly array of{" "}
        <InfoLink href="/weapons" info="Weapons" />, they weave through the{" "}
        <InfoLink info="Chi War" />
        &apos;s intrigues, their silent footsteps heralding doom for their
        unsuspecting foes.
      </>
    ),
  },
  "archetype: old master": {
    title: "Old Master",
    content: (
      <>
        An <ArchetypeLink archetype="Old Master" /> is a sage of combat and
        wisdom, their years of experience forging them into a living legend.
        With profound knowledge and unmatched skill, they guide others through
        the <InfoLink info="Chi War" />, their serene presence belying the
        deadly power they wield in battle.
      </>
    ),
  },
  "archetype: private investigator": {
    title: "Private Investigator",
    content: (
      <>
        An <ArchetypeLink archetype="Private Investigator" /> is a relentless
        seeker of truth, their keen mind and sharp instincts unraveling the
        mysteries of the <InfoLink href="/junctures" info="Junctures" />. From
        shadowy alleys to ancient ruins, they uncover secrets that shape the{" "}
        <InfoLink info="Chi War" />, their deductions as sharp as any blade.
      </>
    ),
  },
  "archetype: redeemed pirate": {
    title: "Redeemed Pirate",
    content: (
      <>
        An <ArchetypeLink archetype="Redeemed Pirate" /> has turned their back
        on a life of plunder, seeking atonement through acts of heroism or
        justice. With a roguish charm and seafaring skills, they navigate the{" "}
        <InfoLink info="Chi War" />
        &apos;s dangers, their past sins fueling their quest for redemption
        across the <InfoLink href="/junctures" info="Junctures" />.
      </>
    ),
  },
  "archetype: scrappy kid": {
    title: "Scrappy Kid",
    content: (
      <>
        An <ArchetypeLink archetype="Scrappy Kid" /> is a pint-sized powerhouse,
        their youthful energy and resourcefulness defying their age. With quick
        wits and fearless determination, they surprise foes in the{" "}
        <InfoLink info="Chi War" />, proving that even the smallest hero can
        cast a long shadow in the fight for <InfoLink info="Chi" />.
      </>
    ),
  },
  "archetype: sifu": {
    title: "Sifu",
    content: (
      <>
        An <ArchetypeLink archetype="Sifu" /> is a revered master of{" "}
        <InfoLink info="Martial Arts" />, their wisdom and skill shaping the
        next generation of warriors. With a blend of philosophy and devastating
        techniques, they guide their students through the{" "}
        <InfoLink info="Chi War" />, their teachings a beacon in the chaos of
        battle.
      </>
    ),
  },
  "archetype: spy": {
    title: "Spy",
    content: (
      <>
        An <ArchetypeLink archetype="Spy" /> is a master of deception, slipping
        through the cracks of the <InfoLink info="Chi War" /> to gather secrets
        and sabotage enemies. With charm, gadgets, and deadly precision, they
        operate in the shadows, their covert actions shaping the fate of{" "}
        <InfoLink href="/factions" info="Factions" /> and{" "}
        <InfoLink href="/junctures" info="Junctures" /> alike.
      </>
    ),
  },
  "archetype: supernatural creature": {
    title: "Supernatural Creature",
    content: (
      <>
        An <ArchetypeLink archetype="Supernatural Creature" /> defies the laws
        of nature, their otherworldly powers drawn from the{" "}
        <InfoLink info="Netherworld" /> or ancient forces. From spectral ghosts
        to monstrous beasts, they wield terrifying abilities that make them both
        ally and threat in the <InfoLink info="Chi War" />
        &apos;s cosmic struggle.
      </>
    ),
  },
  "archetype: sword master": {
    title: "Sword Master",
    content: (
      <>
        An <ArchetypeLink archetype="Sword Master" /> is a virtuoso of the
        blade, their swordsmanship a deadly art form that carves through enemies
        with grace and precision. In the <InfoLink info="Chi War" />, their
        steel sings a song of destruction, defending allies and cutting down
        foes with unmatched skill.
      </>
    ),
  },
  "archetype: thief": {
    title: "Thief",
    content: (
      <>
        An <ArchetypeLink archetype="Thief" /> is a shadow in the night, their
        nimble fingers and cunning mind unlocking treasures and secrets alike.
        With stealth and guile, they navigate the <InfoLink info="Chi War" />
        &apos;s dangers, stealing not just wealth but the advantage in the
        ever-shifting battle for power.
      </>
    ),
  },
  "archetype: transformed crab": {
    title: "Transformed Crab",
    content: (
      <>
        An <ArchetypeLink archetype="Transformed Crab" /> is a being of ancient
        lineage, imbued with the primal power of crustacean ancestors. With
        armored resilience and crushing strength, they scuttle through the{" "}
        <InfoLink info="Chi War" />, their unique abilities turning the tide in
        battles across the <InfoLink href="/junctures" info="Junctures" />.
      </>
    ),
  },
  "archetype: transformed dragon": {
    title: "Transformed Dragon",
    content: (
      <>
        An <ArchetypeLink archetype="Transformed Dragon" /> channels the mythic
        might of ancient draconic blood, their fiery breath and towering
        presence dominating the battlefield. In the <InfoLink info="Chi War" />,
        they soar as both protectors and destroyers, their primal power
        reshaping the fate of entire{" "}
        <InfoLink href="/junctures" info="Junctures" />.
      </>
    ),
  },
  "archetype: two-fisted archaeologist": {
    title: "Two-Fisted Archaeologist",
    content: (
      <>
        An <ArchetypeLink archetype="Two-Fisted Archaeologist" /> is a daring
        explorer, blending scholarly knowledge with raw combat prowess to
        uncover the secrets of ancient{" "}
        <InfoLink href="/junctures" info="Junctures" />. From dodging traps in
        forgotten ruins to battling foes over sacred artifacts, they live for
        adventure in the <InfoLink info="Chi War" />
        &apos;s timeless saga.
      </>
    ),
  },
}
