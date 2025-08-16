import { Typography } from "@mui/material";
import { InfoLink, TypeLink, ArchetypeLink } from "@/components/ui";

export const contents: Record<PopupProps["id"], React.ReactElement> = {
  character: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Character</Typography>
      <p>
        A <InfoLink href="/characters" info="Character" /> in the Feng Shui universe is a vibrant, larger-than-life figure—either a Player <InfoLink href="/characters" info="Character" /> (PC), driven by the ambitions and cunning of the player, or a Game Master-controlled <InfoLink href="/characters" info="Character" /> (GMC), woven into the narrative by the GM’s deft hand. These are the heroes, villains, and enigmatic figures whose actions shape the chaotic tapestry of the <InfoLink info="Chi War" />, wielding <InfoLink href="/schticks" info="Schticks" />, <InfoLink href="/weapons" info="Weapons" />, and raw determination to leave their mark on the <InfoLink href="/junctures" info="Junctures" />.
      </p>
    </>
  ),
  party: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Party</Typography>
      <p>
        A <InfoLink href="/parties" info="Party" /> is a motley crew of Player <InfoLink href="/characters" info="Characters" /> (PCs) or Game Master-controlled <InfoLink href="/characters" info="Characters" /> (GMCs), bound by shared goals, uneasy alliances, or sheer necessity. Whether a ragtag band of heroes or a cabal of scheming rogues, they navigate the treacherous currents of the Feng Shui universe together, their fates intertwined as they battle for control of mystical <InfoLink href="/feng-shui-sites" info="Feng Shui Sites" /> or unravel ancient secrets across the <InfoLink href="/junctures" info="Junctures" />.
      </p>
    </>
  ),
  "chi war": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Chi War</Typography>
      <p>
        The <InfoLink info="Chi War" /> is a clandestine, world-shattering conflict that rages across time and space, where <InfoLink href="/factions" info="Factions" /> vie for dominion over the potent <InfoLink href="/feng-shui-sites" info="Feng Shui Sites" /> scattered throughout the <InfoLink href="/junctures" info="Junctures" />. It’s a high-stakes struggle of martial prowess, mystical power, and cunning strategy, where every victory shifts the balance of <InfoLink info="Chi" /> and reshapes the destiny of entire eras.
      </p>
    </>
  ),
  chi: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Chi</Typography>
      <p>
        <InfoLink info="Chi" /> is the lifeblood of the Feng Shui universe, a mystical energy that pulses through the world, fueling extraordinary feats and supernatural abilities. <InfoLink href="/characters" info="Characters" /> who master <InfoLink info="Chi" /> can bend reality to their will, unleashing devastating <InfoLink info="Martial Arts" />, casting arcane <InfoLink info="Magic" /> spells, or defying the laws of physics in their quest for power and glory.
      </p>
    </>
  ),
  "feng shui site": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Feng Shui Site</Typography>
      <p>
        A <InfoLink href="/feng-shui-sites" info="Feng Shui Site" /> is a nexus of mystical power, a sacred or cursed location where the flow of <InfoLink info="Chi" /> converges to shape fate itself. From ancient temples hidden in mist-shrouded mountains to neon-lit urban shrines, these sites are coveted prizes in the <InfoLink info="Chi War" />, fiercely contested by <InfoLink href="/characters" info="Characters" /> who seek to harness their energy to alter the course of history.
      </p>
    </>
  ),
  faction: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Faction</Typography>
      <p>
        A <InfoLink href="/factions" info="Faction" /> is a powerful alliance of <InfoLink href="/characters" info="Characters" /> united by a shared vision, whether it’s noble, nefarious, or something in between. From shadowy cabals to heroic brotherhoods, <InfoLink href="/factions" info="Factions" /> drive the conflicts of the <InfoLink info="Chi War" />, wielding influence, martial might, and arcane secrets to dominate the <InfoLink href="/junctures" info="Junctures" /> and secure their place in the annals of time.
      </p>
    </>
  ),
  schtick: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Schtick</Typography>
      <p>
        A <InfoLink href="/schticks" info="Schtick" /> is a signature ability or flair that defines a <InfoLink href="/characters" info="Character" />’s style and prowess. Whether it’s a gravity-defying <InfoLink info="Martial Art" /> technique, a cunning sleight of hand, or a devastating <InfoLink info="Magic" />al incantation, <InfoLink href="/schticks" info="Schticks" /> are the tools that make <InfoLink href="/characters" info="Characters" /> stand out in the whirlwind of combat and intrigue that defines the Feng Shui universe.
      </p>
    </>
  ),
  weapon: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Weapon</Typography>
      <p>
        A <InfoLink href="/weapons" info="Weapon" /> is more than steel or gunpowder—it’s an extension of a <InfoLink href="/characters" info="Character" />’s will, a deadly instrument crafted for chaos or justice. From razor-sharp katanas to futuristic plasma rifles, <InfoLink href="/weapons" info="Weapons" /> amplify a <InfoLink href="/characters" info="Character" />’s ability to dominate <InfoLink href="/fights" info="Fights" />, deliver devastating blows, or execute precise, game-changing actions in the heat of battle.
      </p>
    </>
  ),
  type: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Type</Typography>
      <p>
        A <TypeLink characterType="Type" /> is the essence of a <InfoLink href="/characters" info="Character" />’s role in the Feng Shui saga, a classification that shapes their strengths and destiny. Whether a battle-hardened <TypeLink characterType="Martial Artist" />, a cunning <TypeLink characterType="Spy" />, or a mystical <TypeLink characterType="Sorcerer" />, a <InfoLink href="/characters" info="Character" />’s <TypeLink characterType="Type" /> defines their approach to the <InfoLink info="Chi War" /> and their place in the ever-shifting balance of power.
      </p>
    </>
  ),
  archetype: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Archetype</Typography>
      <p>
        An <InfoLink info="Archetype" /> is a legendary blueprint for a <InfoLink href="/characters" info="Character" />, a template brimming with unique abilities, traits, and flair. From the shadowy <ArchetypeLink archetype="Ninja" /> to the indomitable <ArchetypeLink archetype="Big Bruiser" />, <InfoLink info="Archetypes" /> provide the foundation for heroes and villains alike, guiding their path through the chaotic battles and intricate plots of the Feng Shui universe.
      </p>
    </>
  ),
  juncture: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Juncture</Typography>
      <p>
        A <InfoLink href="/junctures" info="Juncture" /> is a vibrant slice of time in the Feng Shui universe, a distinct era where past, present, and future collide. From ancient dynasties to dystopian futures, <InfoLink href="/characters" info="Characters" /> traverse these temporal battlegrounds via <InfoLink info="Portals" />, influencing events and battling for control of <InfoLink info="Chi" /> to reshape history itself.
      </p>
    </>
  ),
  fight: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Fight</Typography>
      <p>
        A <InfoLink href="/fights" info="Fight" /> is the heart-pounding clash of steel, <InfoLink info="Chi" />, and willpower, where <InfoLink href="/characters" info="Characters" /> unleash their <InfoLink href="/schticks" info="Schticks" /> and <InfoLink href="/weapons" info="Weapons" /> in explosive combat. These encounters are the crucible of the <InfoLink info="Chi War" />, where fortunes are won, rivalries are settled, and the fate of <InfoLink href="/junctures" info="Junctures" /> hangs in the balance with every strike.
      </p>
    </>
  ),
  campaign: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Campaign</Typography>
      <p>
        A <InfoLink href="/campaigns" info="Campaign" /> is an epic saga, a series of interconnected adventures that weave a grand tale across the Feng Shui universe. From daring heists in neon-soaked futures to desperate battles in ancient temples, <InfoLink href="/campaigns" info="Campaigns" /> draw <InfoLink href="/characters" info="Characters" /> into a web of intrigue, betrayal, and heroism that spans time and space.
      </p>
    </>
  ),
  category: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Category</Typography>
      <p>
        A <InfoLink info="Category" /> is a way to classify the myriad <InfoLink href="/schticks" info="Schticks" />, <InfoLink href="/weapons" info="Weapons" />, and items of the Feng Shui world, grouping them by their function or nature. Whether it’s a blazing array of firearms or a suite of mystical spells, <InfoLink info="Categorys" /> help <InfoLink href="/characters" info="Characters" /> navigate the tools of their trade in the relentless <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  path: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Path</Typography>
      <p>
        A <InfoLink info="Path" /> is a specialized branch of <InfoLink href="/schticks" info="Schticks" />, a focused discipline within a <InfoLink href="/characters" info="Character" />’s arsenal. Whether mastering a specific <InfoLink info="Martial Art" /> or honing a unique <InfoLink info="Magic" />al technique, <InfoLink info="Paths" /> allow <InfoLink href="/characters" info="Characters" /> to refine their craft, unlocking new depths of power to wield in their battles across the <InfoLink href="/junctures" info="Junctures" />.
      </p>
    </>
  ),
  damage: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Damage</Typography>
      <p>
        <InfoLink info="Damage" /> is the raw destructive force of a <InfoLink href="/weapons" info="Weapon" /> or <InfoLink href="/characters" info="Character" />, the measure of pain inflicted when an attack lands true. Added to the Outcome of a successful Action Result, <InfoLink info="Damage" /> can turn the tide of a <InfoLink href="/fights" info="Fight" />, leaving foes broken and battlegrounds scarred in the relentless clash for <InfoLink info="Chi" />.
      </p>
    </>
  ),
  concealment: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Concealment</Typography>
      <p>
        <InfoLink info="Concealment" /> measures a <InfoLink href="/weapons" info="Weapon" />’s subtlety, the ease with which it can be hidden from prying eyes. A low <InfoLink info="Concealment" /> score means a blade or pistol can be tucked away unnoticed, perfect for assassins or spies slipping through the shadows of the <InfoLink info="Chi War" />’s deadly intrigues.
      </p>
    </>
  ),
  reload: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Reload</Typography>
      <p>
        <InfoLink info="Reload" /> reflects the risk that a firearm might run dry in the chaos of a <InfoLink href="/fights" info="Fight" />, forcing a <InfoLink href="/characters" info="Character" /> to pause and rearm starting from the second Sequence. A high <InfoLink info="Reload" /> score can mean the difference between victory and vulnerability in the heat of battle.
      </p>
    </>
  ),
  netherworld: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Netherworld</Typography>
      <p>
        The <InfoLink info="Netherworld" /> is a shadowy, mystical realm that exists between <InfoLink href="/junctures" info="Junctures" />, a liminal space ruled by the enigmatic Four Monarchs. This eerie dimension is a battleground of its own, where <InfoLink href="/characters" info="Characters" /> navigate treacherous alliances and supernatural forces to seize control of <InfoLink info="Chi" /> and time itself.
      </p>
    </>
  ),
  portal: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Portal</Typography>
      <p>
        A <InfoLink info="Portal" /> is a shimmering gateway through time and space, connecting the <InfoLink href="/junctures" info="Junctures" /> of the Feng Shui universe. These mystical passages allow <InfoLink href="/characters" info="Characters" /> to leap from ancient battlefields to futuristic sprawls, chasing power, destiny, or escape in the ever-shifting <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  user: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>User</Typography>
      <p>
        A <InfoLink href="/users" info="User" /> is the mastermind behind the action, a player or Game Master who breathes life into the Feng Shui universe. Whether crafting epic <InfoLink href="/campaigns" info="Campaigns" /> or embodying a single <InfoLink href="/characters" info="Character" />’s journey, <InfoLink href="/users" info="Users" /> shape the chaos, intrigue, and heroism that define the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "martial art": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Martial Art</Typography>
      <p>
        A <InfoLink info="Martial Art" /> is a disciplined combat style, honed through years of training, that empowers <InfoLink href="/characters" info="Characters" /> to dominate <InfoLink href="/fights" info="Fights" />. From the fluid grace of kung fu to the brutal efficiency of krav maga, these techniques transform a warrior’s body into a living <InfoLink href="/weapons" info="Weapon" />, striking fear into their foes.
      </p>
    </>
  ),
  magic: (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Magic</Typography>
      <p>
        <InfoLink info="Magic" /> is the arcane pulse of the Feng Shui universe, a primal force that <InfoLink href="/characters" info="Characters" /> wield to bend reality itself. From summoning storms to weaving illusions, <InfoLink info="Magic" /> empowers <TypeLink characterType="Sorcerers" /> and mystics to unleash supernatural feats that can turn the tide of any battle or intrigue.
      </p>
    </>
  ),
  "av gun": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Guns</Typography>
      <p>
        <InfoLink info="Guns" /> represent a <InfoLink href="/characters" info="Character" />’s mastery of firearms, from sleek pistols to thunderous shotguns. This skill turns a mere <InfoLink href="/weapons" info="Weapon" /> into an extension of their will, delivering precise, devastating strikes that echo across the battlegrounds of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "av defense": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Defense</Typography>
      <p>
        <InfoLink info="Defense" /> is a <InfoLink href="/characters" info="Character" />’s ability to evade or withstand attacks, a critical shield in the chaos of a <InfoLink href="/fights" info="Fight" />. An attacker must roll an Action Result equal to or greater than a <InfoLink href="/characters" info="Character" />’s <InfoLink info="Defense" /> to land a blow, making this stat the difference between survival and defeat.
      </p>
    </>
  ),
  "av toughness": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Toughness</Typography>
      <p>
        <InfoLink info="Toughness" /> is a <InfoLink href="/characters" info="Character" />’s raw resilience, their ability to shrug off pain and keep fighting. By reducing the Smackdown taken from a hit, <InfoLink info="Toughness" /> allows warriors to endure the fiercest assaults and stand tall in the relentless storm of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "av speed": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Speed</Typography>
      <p>
        <InfoLink info="Speed" /> is the lightning in a <InfoLink href="/characters" info="Character" />’s veins, their quickness and agility in the heat of battle. For Initiative, a <InfoLink href="/characters" info="Character" /> rolls a single non-exploding die and adds their <InfoLink info="Speed" />, determining who strikes first in the frenetic clashes that define a <InfoLink href="/fights" info="Fight" />.
      </p>
    </>
  ),
  "av fortune": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Fortune</Typography>
      <p>
        <InfoLink info="Fortune" /> is a <InfoLink href="/characters" info="Character" />’s luck, a subtle force that tips fate in their favor. By spending a <InfoLink info="Fortune" /> point, they can add a single non-exploding die to a Swerve roll, turning a desperate moment into a triumphant victory in the unpredictable <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "av sorcery": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Sorcery</Typography>
      <p>
        <InfoLink info="Sorcery" /> is a <InfoLink href="/characters" info="Character" />’s mastery of the arcane, their ability to weave spells and unleash mystical power. From conjuring elemental forces to manipulating minds, <InfoLink info="Sorcery" /> transforms a <InfoLink href="/characters" info="Character" /> into a force of nature, feared and revered across the <InfoLink href="/junctures" info="Junctures" />.
      </p>
    </>
  ),
  "av chi": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Chi</Typography>
      <p>
        <InfoLink info="Chi" /> is a <InfoLink href="/characters" info="Character" />’s command of the mystical energy that flows through all things, enabling feats that defy mortal limits. By spending a <InfoLink info="Chi" /> point, they can add a single non-exploding die to a Swerve roll, channeling this primal force to shape the outcome of critical moments.
      </p>
    </>
  ),
  "av martial art": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Martial Arts</Typography>
      <p>
        <InfoLink info="Martial Arts" /> is the art of combat perfected, a <InfoLink href="/characters" info="Character" />’s skill in hand-to-hand fighting and unarmed techniques. This discipline transforms them into a whirlwind of precision and power, capable of felling foes with nothing but their fists and unbreakable will.
      </p>
    </>
  ),
  "av genome": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Genome</Typography>
      <p>
        <InfoLink info="Genome" /> reflects a <InfoLink href="/characters" info="Character" />’s genetic mutations, the unique traits that grant them extraordinary abilities. From superhuman strength to unnatural senses, these gifts set them apart in the <InfoLink info="Chi War" />, making them both feared and coveted by their enemies.
      </p>
    </>
  ),
  "av scroungetech": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Scroungetech</Typography>
      <p>
        <InfoLink info="Scroungetech" /> is a <InfoLink href="/characters" info="Character" />’s mastery of cobbled-together gadgets and cybernetic enhancements, blending ingenuity with raw power. From jury-rigged <InfoLink href="/weapons" info="Weapons" /> to biomechanical implants, <InfoLink info="Scroungetech" /> turns a <InfoLink href="/characters" info="Character" /> into a walking arsenal, ready to dominate any battlefield.
      </p>
    </>
  ),
  "av creature": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Creature</Typography>
      <p>
        <InfoLink info="Creature" /> represents a <TypeLink characterType="Supernatural Creature" />’s innate ferocity, their ability to wield claws, fangs, or other natural <InfoLink href="/weapons" info="Weapons" /> in combat. These primal attacks deliver devastating <InfoLink info="Damage" />, making such beings terrifying forces in the chaotic clashes of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "av damage": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Damage</Typography>
      <p>
        For <InfoLink href="/characters" info="Characters" /> without specialized <InfoLink href="/weapons" info="Weapons" />, <InfoLink info="Damage" /> is their baseline ability to inflict harm, added to the Outcome of a successful Action Result. With a base <InfoLink info="Damage" /> of 7, these warriors rely on raw strength or skill to leave their mark in the heat of battle.
      </p>
    </>
  ),
  "archetype: sorcerer": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Sorcerer</Typography>
      <p>
        An <ArchetypeLink archetype="Sorcerer" /> is a master of the arcane, weaving spells that bend reality to their will. Drawing on ancient knowledge and the raw power of <InfoLink info="Chi" />, they unleash devastating <InfoLink info="Magic" />, from fiery blasts to subtle enchantments, making them feared architects of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "archetype: everyday hero": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Everyday Hero</Typography>
      <p>
        An <ArchetypeLink archetype="Everyday Hero" /> is the underdog who rises above, relying on grit, wits, and sheer determination rather than supernatural gifts. From street-smart hustlers to unassuming scholars, they prove that heart and ingenuity can triumph in the chaotic crucible of the Feng Shui universe.
      </p>
    </>
  ),
  "archetype: archer": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Archer</Typography>
      <p>
        An <ArchetypeLink archetype="Archer" /> is a master of precision, wielding bows and arrows with deadly accuracy. From ancient longbows to high-tech compound bows, they strike from afar, threading arrows through the chaos of battle to hit their mark and turn the tide of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "archetype: bandit": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Bandit</Typography>
      <p>
        An <ArchetypeLink archetype="Bandit" /> thrives in the shadows, using stealth, cunning, and a quick blade to outwit their foes. Whether robbing from the rich or sabotaging tyrannical <InfoLink href="/factions" info="Factions" />, their guile and daring make them unpredictable wildcards in the intricate dance of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "archetype: big bruiser": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Big Bruiser</Typography>
      <p>
        An <ArchetypeLink archetype="Big Bruiser" /> is a towering force of raw power, smashing through obstacles with brute strength and unshakable resolve. Their fists are their <InfoLink href="/weapons" info="Weapons" />, and their presence alone can shift the momentum of a <InfoLink href="/fights" info="Fight" />, making them legends in the <InfoLink info="Chi War" />’s brutal arenas.
      </p>
    </>
  ),
  "archetype: bodyguard": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Bodyguard</Typography>
      <p>
        An <ArchetypeLink archetype="Bodyguard" /> is a stalwart protector, trained to shield their charge from harm with a blend of combat prowess and tactical cunning. Whether deflecting bullets or facing down mystical threats, their loyalty and skill make them indispensable in the <InfoLink info="Chi War" />’s deadly conflicts.
      </p>
    </>
  ),
  "archetype: cyborg": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Cyborg</Typography>
      <p>
        An <ArchetypeLink archetype="Cyborg" /> is a fusion of flesh and machine, their body enhanced with cutting-edge cybernetics that grant superhuman abilities. From bionic limbs to neural implants, they wield <InfoLink info="Scroungetech" /> with deadly precision, carving their legacy in the futuristic battlegrounds of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "archetype: bounty hunter": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Bounty Hunter</Typography>
      <p>
        An <ArchetypeLink archetype="Bounty Hunter" /> is a relentless tracker, driven by profit or justice to hunt down their quarry across the <InfoLink href="/junctures" info="Junctures" />. With a keen eye and a loaded <InfoLink href="/weapons" info="Weapon" />, they pursue their targets through time and space, never resting until the job is done in the <InfoLink info="Chi War" />’s unforgiving landscape.
      </p>
    </>
  ),
  "archetype: drifter": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Drifter</Typography>
      <p>
        An <ArchetypeLink archetype="Drifter" /> is a wanderer of the <InfoLink href="/junctures" info="Junctures" />, a lone soul seeking adventure, redemption, or escape from a haunted past. With a quick wit and survival instincts honed by a life on the road, they navigate the <InfoLink info="Chi War" />’s dangers with a restless spirit and a ready blade.
      </p>
    </>
  ),
  "archetype: driver": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Driver</Typography>
      <p>
        An <ArchetypeLink archetype="Driver" /> is a master of machines, their hands steady on the wheel of roaring <InfoLink href="/vehicles" info="Vehicles" /> that tear through the <InfoLink href="/junctures" info="Junctures" />. Whether outrunning pursuers or charging into combat, their skill behind the controls makes them a vital asset in the high-speed chaos of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "archetype: ex-special forces": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Ex-Special Forces</Typography>
      <p>
        An <ArchetypeLink archetype="Ex-Special Forces" /> <InfoLink href="/characters" info="Character" /> is a battle-hardened veteran, trained in elite tactics and combat skills that make them a force to be reckoned with. Their disciplined precision and adaptability shine in the <InfoLink info="Chi War" />, where their past missions fuel their drive for victory.
      </p>
    </>
  ),
  "archetype: exorcist monk": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Exorcist Monk</Typography>
      <p>
        An <ArchetypeLink archetype="Exorcist Monk" /> is a spiritual warrior, wielding ancient rituals and martial prowess to banish supernatural threats. Trained in the sacred arts, they face demons and ghosts with unshakable resolve, protecting the <InfoLink href="/junctures" info="Junctures" /> from the horrors of the <InfoLink info="Netherworld" />.
      </p>
    </>
  ),
  "archetype: full-metal nutball": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Full-Metal Nutball</Typography>
      <p>
        An <ArchetypeLink archetype="Full-Metal Nutball" /> is chaos incarnate, reveling in destruction with an arsenal of heavy <InfoLink href="/weapons" info="Weapons" /> and explosives. Their reckless abandon and love for mayhem make them a walking catastrophe, leaving devastation in their wake as they charge through the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "archetype: gambler": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Gambler</Typography>
      <p>
        An <ArchetypeLink archetype="Gambler" /> thrives on risk, their charm and luck turning the odds in their favor. Whether bluffing through high-stakes negotiations or rolling the dice in a <InfoLink href="/fights" info="Fight" />, they dance through the <InfoLink info="Chi War" /> with a sly grin, always betting on their own cunning to win the day.
      </p>
    </>
  ),
  "archetype: gene freak": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Gene Freak</Typography>
      <p>
        An <ArchetypeLink archetype="Gene Freak" /> is a living anomaly, their body warped by <InfoLink info="Genome" /> mutations that grant extraordinary powers. From unnatural strength to bizarre abilities, they wield their <InfoLink info="Genome" /> like a <InfoLink href="/weapons" info="Weapon" />, carving a unique path through the treacherous battles of the <InfoLink info="Chi War" />.
      </p>
    </>
  ),
  "archetype: ghost": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Ghost</Typography>
      <p>
        An <ArchetypeLink archetype="Ghost" /> is a spectral entity, tethered to the physical world by unfinished business or supernatural will. With eerie powers like phasing through walls or haunting their foes, they drift through the <InfoLink info="Chi War" />, their presence a chilling reminder of the <InfoLink info="Netherworld" />’s reach.
      </p>
    </>
  ),
  "archetype: highway ronin": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Highway Ronin</Typography>
      <p>
        An <ArchetypeLink archetype="Highway Ronin" /> is a lone warrior of the open road, a master of survival and combat who roams the <InfoLink href="/junctures" info="Junctures" />. With a blade or gun always at hand, they protect the weak or hunt their enemies, their solitary path etched in the dust of the <InfoLink info="Chi War" />’s battlegrounds.
      </p>
    </>
  ),
  "archetype: karate cop": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Karate Cop</Typography>
      <p>
        An <ArchetypeLink archetype="Karate Cop" /> blends law enforcement grit with <InfoLink info="Martial Arts" /> mastery, delivering justice with a swift kick or a well-placed strike. Their disciplined training and unyielding moral code make them a beacon of order in the chaotic swirl of the <InfoLink info="Chi War" />’s conflicts.
      </p>
    </>
  ),
  "archetype: killer": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Killer</Typography>
      <p>
        An <ArchetypeLink archetype="Killer" /> is a shadow in the night, a master of assassination whose precision and stealth make them a deadly predator. Striking from the darkness with lethal efficiency, they eliminate targets in the <InfoLink info="Chi War" />, leaving no trace but whispers of their deadly reputation.
      </p>
    </>
  ),
  "archetype: magic cop": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Magic Cop</Typography>
      <p>
        An <ArchetypeLink archetype="Magic Cop" /> wields <InfoLink info="Magic" /> in the name of justice, using spells to combat supernatural threats and enforce order. From banishing demons to unraveling mystical crimes, they stand as guardians of the <InfoLink href="/junctures" info="Junctures" />, their <InfoLink info="Magic" /> a shield against the <InfoLink info="Chi War" />’s chaos.
      </p>
    </>
  ),
  "archetype: martial artist": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Martial Artist</Typography>
      <p>
        An <ArchetypeLink archetype="Martial Artist" /> is a living <InfoLink href="/weapons" info="Weapon" />, their body honed through years of grueling training to master the art of combat. With fluid strikes and unshakable focus, they dance through <InfoLink href="/fights" info="Fights" />, their skill a testament to their dominance in the <InfoLink info="Chi War" />’s brutal arenas.
      </p>
    </>
  ),
  "archetype: masked avenger": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Masked Avenger</Typography>
      <p>
        An <ArchetypeLink archetype="Masked Avenger" /> is a mysterious crusader, their identity hidden behind a veil as they fight injustice with gadgets and combat prowess. Striking from the shadows, they wage a personal war against the <InfoLink info="Chi War" />’s villains, their legend growing with every daring act.
      </p>
    </>
  ),
  "archetype: maverick cop": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Maverick Cop</Typography>
      <p>
        An <ArchetypeLink archetype="Maverick Cop" /> plays by their own rules, bending the law to deliver justice with unorthodox methods and unrelenting determination. Their bold tactics and sharp instincts make them a wildcard in the <InfoLink info="Chi War" />, feared by criminals and respected by allies.
      </p>
    </>
  ),
  "archetype: ninja": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Ninja</Typography>
      <p>
        An <ArchetypeLink archetype="Ninja" /> is a master of stealth and subterfuge, striking with lethal precision from the shadows. With unmatched agility and a deadly array of <InfoLink href="/weapons" info="Weapons" />, they weave through the <InfoLink info="Chi War" />’s intrigues, their silent footsteps heralding doom for their unsuspecting foes.
      </p>
    </>
  ),
  "archetype: old master": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Old Master</Typography>
      <p>
        An <ArchetypeLink archetype="Old Master" /> is a sage of combat and wisdom, their years of experience forging them into a living legend. With profound knowledge and unmatched skill, they guide others through the <InfoLink info="Chi War" />, their serene presence belying the deadly power they wield in battle.
      </p>
    </>
  ),
  "archetype: private investigator": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Private Investigator</Typography>
      <p>
        An <ArchetypeLink archetype="Private Investigator" /> is a relentless seeker of truth, their keen mind and sharp instincts unraveling the mysteries of the <InfoLink href="/junctures" info="Junctures" />. From shadowy alleys to ancient ruins, they uncover secrets that shape the <InfoLink info="Chi War" />, their deductions as sharp as any blade.
      </p>
    </>
  ),
  "archetype: redeemed pirate": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Redeemed Pirate</Typography>
      <p>
        An <ArchetypeLink archetype="Redeemed Pirate" /> has turned their back on a life of plunder, seeking atonement through acts of heroism or justice. With a roguish charm and seafaring skills, they navigate the <InfoLink info="Chi War" />’s dangers, their past sins fueling their quest for redemption across the <InfoLink href="/junctures" info="Junctures" />.
      </p>
    </>
  ),
  "archetype: scrappy kid": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Scrappy Kid</Typography>
      <p>
        An <ArchetypeLink archetype="Scrappy Kid" /> is a pint-sized powerhouse, their youthful energy and resourcefulness defying their age. With quick wits and fearless determination, they surprise foes in the <InfoLink info="Chi War" />, proving that even the smallest hero can cast a long shadow in the fight for <InfoLink info="Chi" />.
      </p>
    </>
  ),
  "archetype: sifu": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Sifu</Typography>
      <p>
        An <ArchetypeLink archetype="Sifu" /> is a revered master of <InfoLink info="Martial Arts" />, their wisdom and skill shaping the next generation of warriors. With a blend of philosophy and devastating techniques, they guide their students through the <InfoLink info="Chi War" />, their teachings a beacon in the chaos of battle.
      </p>
    </>
  ),
  "archetype: spy": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Spy</Typography>
      <p>
        An <ArchetypeLink archetype="Spy" /> is a master of deception, slipping through the cracks of the <InfoLink info="Chi War" /> to gather secrets and sabotage enemies. With charm, gadgets, and deadly precision, they operate in the shadows, their covert actions shaping the fate of <InfoLink href="/factions" info="Factions" /> and <InfoLink href="/junctures" info="Junctures" /> alike.
      </p>
    </>
  ),
  "archetype: supernatural creature": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Supernatural Creature</Typography>
      <p>
        An <ArchetypeLink archetype="Supernatural Creature" /> defies the laws of nature, their otherworldly powers drawn from the <InfoLink info="Netherworld" /> or ancient forces. From spectral ghosts to monstrous beasts, they wield terrifying abilities that make them both ally and threat in the <InfoLink info="Chi War" />’s cosmic struggle.
      </p>
    </>
  ),
  "archetype: sword master": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Sword Master</Typography>
      <p>
        An <ArchetypeLink archetype="Sword Master" /> is a virtuoso of the blade, their swordsmanship a deadly art form that carves through enemies with grace and precision. In the <InfoLink info="Chi War" />, their steel sings a song of destruction, defending allies and cutting down foes with unmatched skill.
      </p>
    </>
  ),
  "archetype: thief": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Thief</Typography>
      <p>
        An <ArchetypeLink archetype="Thief" /> is a shadow in the night, their nimble fingers and cunning mind unlocking treasures and secrets alike. With stealth and guile, they navigate the <InfoLink info="Chi War" />’s dangers, stealing not just wealth but the advantage in the ever-shifting battle for power.
      </p>
    </>
  ),
  "archetype: transformed crab": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Transformed Crab</Typography>
      <p>
        An <ArchetypeLink archetype="Transformed Crab" /> is a being of ancient lineage, imbued with the primal power of crustacean ancestors. With armored resilience and crushing strength, they scuttle through the <InfoLink info="Chi War" />, their unique abilities turning the tide in battles across the <InfoLink href="/junctures" info="Junctures" />.
      </p>
    </>
  ),
  "archetype: transformed dragon": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Transformed Dragon</Typography>
      <p>
        An <ArchetypeLink archetype="Transformed Dragon" /> channels the mythic might of ancient draconic blood, their fiery breath and towering presence dominating the battlefield. In the <InfoLink info="Chi War" />, they soar as both protectors and destroyers, their primal power reshaping the fate of entire <InfoLink href="/junctures" info="Junctures" />.
      </p>
    </>
  ),
  "archetype: two-fisted archaeologist": (
    <>
      <Typography variant="h6" sx={{fontWeight: 800}}>Two-Fisted Archaeologist</Typography>
      <p>
        An <ArchetypeLink archetype="Two-Fisted Archaeologist" /> is a daring explorer, blending scholarly knowledge with raw combat prowess to uncover the secrets of ancient <InfoLink href="/junctures" info="Junctures" />. From dodging traps in forgotten ruins to battling foes over sacred artifacts, they live for adventure in the <InfoLink info="Chi War" />’s timeless saga.
      </p>
    </>
  ),
  "action value": (
  <>
    <Typography variant="h6" sx={{fontWeight: 800}}>Action Value</Typography>
    <p>
      An <InfoLink info="Action Value" /> represents a <InfoLink href="/characters" info="Character" />’s raw skill in a specific area, such as <InfoLink info="Martial Arts" />, <InfoLink info="Guns" />, or <InfoLink info="Sorcery" />. This numerical measure determines their effectiveness when rolling dice to perform actions in a <InfoLink href="/fights" info="Fight" /> or other challenges, shaping their ability to dominate the chaotic battlegrounds of the <InfoLink info="Chi War" />.
    </p>
  </>
  ),
  wealth: (
  <>
    <Typography variant="h6" sx={{fontWeight: 800}}>Wealth</Typography>
    <p>
      <InfoLink info="Wealth" /> reflects a <InfoLink href="/characters" info="Character" />’s access to resources, from cold hard cash to valuable connections or rare artifacts. In the Feng Shui universe, <InfoLink info="Wealth" /> fuels their ability to acquire <InfoLink href="/weapons" info="Weapons" />, <InfoLink href="/vehicles" info="Vehicles" />, or influence, giving them an edge in the relentless intrigues and power struggles of the <InfoLink info="Chi War" />.
    </p>
  </>
  ),
  };
