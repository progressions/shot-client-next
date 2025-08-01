import { Typography } from "@mui/material"

export const contents: Record<PopupProps["id"], React.ReactElement> = {
  character: (
    <>
      <Typography variant="h4">Character</Typography>
      <p>A player Character (PC) or GM-controlled Character (GMC).</p>
    </>
  ),
  party: (
    <>
      <Typography variant="h4">Party</Typography>
      <p>
        A group of player Characters (PCs) or GM-controlled Characters (GMCs).
      </p>
    </>
  ),
  "chi war": (
    <>
      <Typography variant="h4">Chi War</Typography>
      <p>
        The Chi War is the battle for control of Feng Shui Sites across the
        Junctures.
      </p>
    </>
  ),
  chi: (
    <>
      <Typography variant="h4">Chi</Typography>
      <p>
        Chi is the mystical energy that powers the abilities of Characters in
        Feng Shui.
      </p>
    </>
  ),
  "feng shui site": (
    <>
      <Typography variant="h4">Site</Typography>
      <p>
        A Feng Shui Site is a location of power that can be controlled by
        Characters.
      </p>
    </>
  ),
  faction: (
    <>
      <Typography variant="h4">Faction</Typography>
      <p>A Faction is a group of Characters with a common goal or ideology.</p>
    </>
  ),
  schtick: (
    <>
      <Typography variant="h4">Schtick</Typography>
      <p>A Schtick is a special ability or power that a Character can use.</p>
    </>
  ),
  weapon: (
    <>
      <Typography variant="h4">Weapon</Typography>
      <p>
        A Weapon is an item used by Characters to deal damage or perform
        actions.
      </p>
    </>
  ),
  type: (
    <>
      <Typography variant="h4">Type</Typography>
      <p>
        A Type is a classification of Characters based on their role or
        abilities.
      </p>
    </>
  ),
  archetype: (
    <>
      <Typography variant="h4">Archetype</Typography>
      <p>
        An Archetype is a template for creating Characters with specific
        abilities and traits.
      </p>
    </>
  ),
  juncture: (
    <>
      <Typography variant="h4">Juncture</Typography>
      <p>
        A Juncture is a time period in the Feng Shui universe where Characters
        can interact and influence events.
      </p>
    </>
  ),
  fight: (
    <>
      <Typography variant="h4">Fight</Typography>
      <p>
        A Fight is a combat encounter between Characters, often involving the
        use of Schticks and Weapons.
      </p>
    </>
  ),
  campaign: (
    <>
      <Typography variant="h4">Campaign</Typography>
      <p>
        A Campaign is a series of interconnected adventures or stories in the
        Feng Shui universe.
      </p>
    </>
  ),
  category: (
    <>
      <Typography variant="h4">Category</Typography>
      <p>
        A Category is a classification of Schticks, Weapons, or other items
        based on their type or function.
      </p>
    </>
  ),
  path: (
    <>
      <Typography variant="h4">Path</Typography>
      <p>A Path is a sub-category of Schticks.</p>
    </>
  ),
  damage: (
    <>
      <Typography variant="h4">Damage</Typography>
      <p>
        Damage is the base amount of damage a weapon does, which is added to the
        Outcome of a successul Action Result.
      </p>
    </>
  ),
  concealment: (
    <>
      <Typography variant="h4">Concealment</Typography>
      <p>
        Concealment represents how hard it is to hide a weapon on your person.
        Lower is better.
      </p>
    </>
  ),
  reload: (
    <>
      <Typography variant="h4">Reload</Typography>
      <p>
        Reload represents the chance that you&rsquo;ll have to reload a weapon,
        starting from the second Sequence of a Fight.
      </p>
    </>
  ),
  netherworld: (
    <>
      <Typography variant="h4">Netherworld</Typography>
      <p>
        The Netherworld is a mystical realm between Junctures, ruled by the Four
        Monarchs.
      </p>
    </>
  ),
  portal: (
    <>
      <Typography variant="h4">Portal</Typography>
      <p>
        A Portal is a gateway between Junctures, allowing Characters to travel
        through time and space.
      </p>
    </>
  ),
  user: (
    <>
      <Typography variant="h4">User</Typography>
      <p>
        A User is a person who interacts with the Feng Shui system, such as a
        player or game master.
      </p>
    </>
  ),
  magic: (
    <>
      <Typography variant="h4">Magic</Typography>
      <p>
        Magic is a mystical force that can be harnessed by Characters to perform
        supernatural feats.
      </p>
    </>
  ),
  "av gun": (
    <>
      <Typography variant="h4">Guns</Typography>
      <p>Guns represents a Character&rsquo;s proficiency with firearms.</p>
    </>
  ),
  "av defense": (
    <>
      <Typography variant="h4">Defense</Typography>
      <p>
        Defense represents a Character&rsquo;s ability to avoid attacks. An
        attacker must roll an Action Result equal to or greater than your
        Defense to hit.
      </p>
    </>
  ),
  "av toughness": (
    <>
      <Typography variant="h4">Toughness</Typography>
      <p>
        Toughness reduces the Smackdown a Character takes when they are hit.
      </p>
    </>
  ),
  "av speed": (
    <>
      <Typography variant="h4">Speed</Typography>
      <p>
        Speed represents a Character&rsquo;s quickness and agility. For
        Initiative, roll one single die (non-exploding) and add your Speed.
      </p>
    </>
  ),
  "av fortune": (
    <>
      <Typography variant="h4">Fortune</Typography>
      <p>
        Fortune represents a Character&rsquo;s luck and ability to influence
        events in their favor. You can spend a Fortune point to add a single
        non-exploding die when rolling a Swerve.
      </p>
    </>
  ),
  "av sorcery": (
    <>
      <Typography variant="h4">Sorcery</Typography>
      <p>
        Sorcery represents a Character&rsquo;s ability to cast spells and use
        magical abilities.
      </p>
    </>
  ),
  "av chi": (
    <>
      <Typography variant="h4">Chi</Typography>
      <p>
        Chi represents a Character&rsquo;s mastery of mystical energy, allowing
        them to perform extraordinary feats. You can spend a Chi point to add a
        single non-exploding die when rolling a Swerve.
      </p>
    </>
  ),
  "av martial arts": (
    <>
      <Typography variant="h4">Martial Arts</Typography>
      <p>
        Martial Arts represents a Character&rsquo;s skill in hand-to-hand combat
        and unarmed fighting techniques.
      </p>
    </>
  ),
  "av genome": (
    <>
      <Typography variant="h4">Genome</Typography>
      <p>
        Genome represents a Character&rsquo;s genetic mutations or traits, which
        power their abilities.
      </p>
    </>
  ),
  "av scroungetech": (
    <>
      <Typography variant="h4">Scroungetech</Typography>
      <p>
        Scroungetech represents a Character&rsquo;s cyborg abilities and use of
        gadgets or technology.
      </p>
    </>
  ),
  "av creature": (
    <>
      <Typography variant="h4">Creature</Typography>
      <p>
        Creature represents a Supernatural Creature&rsquo;s attack abilities,
        using their natural weapons to deal damage.
      </p>
    </>
  ),
  "av damage": (
    <>
      <Typography variant="h4">Damage</Typography>
      <p>
        For the case of Characters without specific weapons, their Damage is
        added to the Outcome of a successful Action Result. Base Damage is 7.
      </p>
    </>
  ),
  "archetype: sorcerer": (
    <>
      <Typography variant="h4">Sorcerer</Typography>
      <p>
        A Sorcerer is a Character who can cast spells and use magical abilities.
      </p>
    </>
  ),
  "archetype: everyday hero": (
    <>
      <Typography variant="h4">Everyday Hero</Typography>
      <p>
        An Everyday Hero is a Character who relies on their wits and skills
        rather than supernatural powers.
      </p>
    </>
  ),
  "archetype: archer": (
    <>
      <Typography variant="h4">Archer</Typography>
      <p>
        An Archer is a Character who specializes in ranged combat, particularly
        with bows and arrows.
      </p>
    </>
  ),
  "archetype: bandit": (
    <>
      <Typography variant="h4">Bandit</Typography>
      <p>
        A Bandit is a Character who uses stealth and cunning to achieve their
        goals, often through thievery or deception.
      </p>
    </>
  ),
  "archetype: big bruiser": (
    <>
      <Typography variant="h4">Big Bruiser</Typography>
      <p>
        A Big Bruiser is a Character who relies on brute strength and physical
        prowess to overcome challenges.
      </p>
    </>
  ),
  "archetype: bodyguard": (
    <>
      <Typography variant="h4">Bodyguard</Typography>
      <p>
        A Bodyguard is a Character who specializes in protecting others, often
        using combat skills and defensive tactics.
      </p>
    </>
  ),
  "archetype: cyborg": (
    <>
      <Typography variant="h4">Cyborg</Typography>
      <p>
        A Cyborg is a Character who has undergone cybernetic enhancements,
        combining human and machine abilities.
      </p>
    </>
  ),
  "archetype: bounty hunter": (
    <>
      <Typography variant="h4">Bounty Hunter</Typography>
      <p>
        A Bounty Hunter is a Character who tracks down and captures or kills
        targets for a reward.
      </p>
    </>
  ),
  "archetype: drifter": (
    <>
      <Typography variant="h4">Drifter</Typography>
      <p>
        A Drifter is a Character who travels from place to place, often seeking
        adventure or escaping their past.
      </p>
    </>
  ),
  "archetype: driver": (
    <>
      <Typography variant="h4">Driver</Typography>
      <p>
        A Driver is a Character who excels at operating vehicles, whether for
        transportation or combat.
      </p>
    </>
  ),
  "archetype: ex-special forces": (
    <>
      <Typography variant="h4">Ex-Special Forces</Typography>
      <p>
        An Ex-Special Forces Character is a former elite soldier with
        specialized training and combat skills.
      </p>
    </>
  ),
  "archetype: exorcist monk": (
    <>
      <Typography variant="h4">Exorcist Monk</Typography>
      <p>
        An Exorcist Monk is a Character trained in spiritual combat and the
        banishment of supernatural entities.
      </p>
    </>
  ),
  "archetype: full-metal nutball": (
    <>
      <Typography variant="h4">Full-Metal Nutball</Typography>
      <p>
        A Full-Metal Nutball is a Character who embraces chaos and destruction,
        often using heavy weaponry and explosives.
      </p>
    </>
  ),
  "archetype: gambler": (
    <>
      <Typography variant="h4">Gambler</Typography>
      <p>
        A Gambler is a Character who takes risks and relies on luck, often using
        their charm and wit to manipulate situations.
      </p>
    </>
  ),
  "archetype: gene freak": (
    <>
      <Typography variant="h4">Gene Freak</Typography>
      <p>
        A Gene Freak is a Character with genetic mutations that grant them
        unique abilities or powers.
      </p>
    </>
  ),
  "archetype: ghost": (
    <>
      <Typography variant="h4">Ghost</Typography>
      <p>
        A Ghost is a supernatural entity that can interact with the physical
        world, often possessing unique abilities related to their spectral
        nature.
      </p>
    </>
  ),
  "archetype: highway ronin": (
    <>
      <Typography variant="h4">Highway Ronin</Typography>
      <p>
        A Highway Ronin is a Character who travels the roads, often as a lone
        warrior or protector, skilled in combat and survival.
      </p>
    </>
  ),
  "archetype: karate cop": (
    <>
      <Typography variant="h4">Karate Cop</Typography>
      <p>
        A Karate Cop is a Character who combines law enforcement skills with
        martial arts expertise, using their training to uphold justice.
      </p>
    </>
  ),
  "archetype: killer": (
    <>
      <Typography variant="h4">Killer</Typography>
      <p>
        A Killer is a Character who is skilled in assassination and stealth,
        often using their abilities to eliminate targets without detection.
      </p>
    </>
  ),
  "archetype: magic cop": (
    <>
      <Typography variant="h4">Magic Cop</Typography>
      <p>
        A Magic Cop is a Character who uses magical abilities to enforce the law
        and combat supernatural threats.
      </p>
    </>
  ),
  "archetype: martial artist": (
    <>
      <Typography variant="h4">Martial Artist</Typography>
      <p>
        A Martial Artist is a Character who has mastered various forms of
        combat, using their skills to defeat opponents and protect others.
      </p>
    </>
  ),
  "archetype: masked avenger": (
    <>
      <Typography variant="h4">Masked Avenger</Typography>
      <p>
        A Masked Avenger is a Character who fights crime and injustice while
        concealing their identity, often using gadgets and combat skills.
      </p>
    </>
  ),
  "archetype: maverick cop": (
    <>
      <Typography variant="h4">Maverick Cop</Typography>
      <p>
        A Maverick Cop is a Character who bends the rules to achieve justice,
        often using unconventional methods and a strong sense of morality.
      </p>
    </>
  ),
  "archetype: ninja": (
    <>
      <Typography variant="h4">Ninja</Typography>
      <p>
        A Ninja is a stealthy and skilled warrior who uses martial arts,
        deception, and agility to achieve their goals.
      </p>
    </>
  ),
  "archetype: old master": (
    <>
      <Typography variant="h4">Old Master</Typography>
      <p>
        An Old Master is a wise and experienced Character who imparts knowledge
        and training to others, often possessing great wisdom and combat skills.
      </p>
    </>
  ),
  "archetype: private investigator": (
    <>
      <Typography variant="h4">Private Investigator</Typography>
      <p>
        A Private Investigator is a Character who specializes in solving
        mysteries and uncovering secrets, often using their skills in
        observation and deduction.
      </p>
    </>
  ),
  "archetype: redeemed pirate": (
    <>
      <Typography variant="h4">Redeemed Pirate</Typography>
      <p>
        A Redeemed Pirate is a Character who has left their life of piracy
        behind, often seeking redemption and a new purpose.
      </p>
    </>
  ),
  "archetype: scrappy kid": (
    <>
      <Typography variant="h4">Scrappy Kid</Typography>
      <p>
        A Scrappy Kid is a young Character who uses their resourcefulness and
        determination to overcome challenges, often surprising others with their
        abilities.
      </p>
    </>
  ),
  "archetype: sifu": (
    <>
      <Typography variant="h4">Sifu</Typography>
      <p>
        A Sifu is a master of martial arts who trains others, often possessing
        deep knowledge of combat techniques and philosophy.
      </p>
    </>
  ),
  "archetype: sorcerer": (
    <>
      <Typography variant="h4">Sorcerer</Typography>
      <p>
        A Sorcerer is a Character who can cast spells and use magical abilities,
        often drawing on ancient knowledge and mystical forces.
      </p>
    </>
  ),
  "archetype: spy": (
    <>
      <Typography variant="h4">Spy</Typography>
      <p>
        A Spy is a Character who gathers intelligence and operates covertly,
        often using deception and stealth to achieve their objectives.
      </p>
    </>
  ),
  "archetype: supernatural creature": (
    <>
      <Typography variant="h4">Supernatural Creature</Typography>
      <p>
        A Supernatural Creature is a being with extraordinary powers, often
        defying the laws of nature and possessing unique abilities.
      </p>
    </>
  ),
  "archetype: sword master": (
    <>
      <Typography variant="h4">Sword Master</Typography>
      <p>
        A Sword Master is a Character who has mastered the art of swordsmanship,
        using their skills to defeat opponents and protect others.
      </p>
    </>
  ),
  "archetype: thief": (
    <>
      <Typography variant="h4">Thief</Typography>
      <p>
        A Thief is a Character who specializes in stealth and deception, often
        using their skills to steal or manipulate situations to their advantage.
      </p>
    </>
  ),
  "archetype: transformed crab": (
    <>
      <Typography variant="h4">Transformed Crab</Typography>
      <p>
        A Transformed Crab is a Character with ancient crab powers, deriving
        from their lineage.
      </p>
    </>
  ),
  "archetype: transformed dragon": (
    <>
      <Typography variant="h4">Transformed Dragon</Typography>
      <p>
        A Transformed Dragon is a Character with ancient dragon powers, deriving
        from their lineage.
      </p>
    </>
  ),
  "archetype: two-fisted archaeologist": (
    <>
      <Typography variant="h4">Two-Fisted Archaeologist</Typography>
      <p>
        A Two-Fisted Archaeologist is a Character who explores ancient ruins and
        artifacts, often using their combat skills and knowledge of history to
        overcome obstacles.
      </p>
    </>
  ),
}
