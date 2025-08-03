"use client"

import { Stack, Box } from "@mui/material"
import type { Character } from "@/types"
import { CS } from "@/services"
import { EditableRichText, SectionHeader } from "@/components/ui"
import { DescriptionValue } from "@/components/characters"
import { Icon } from "@/lib"

type DescriptionProps = {
  character: Character
  updateCharacter: (character: Character) => Promise<void>
}

export default function Description({
  character,
  updateCharacter,
}: DescriptionProps) {
  const handleChange = async event => {
    const updatedCharacter = CS.changeDescriptionValue(
      character,
      event.target.name,
      event.target.value
    )
    await updateCharacter(updatedCharacter)
  }

  if (CS.isMook(character)) {
    return (
      <Box>
        <SectionHeader
          title="Appearance"
          icon={<Icon keyword="Appearance" />}
          sx={{ mt: 4 }}
        >
          A brief description of your character, including their background,
          personality, and notable traits.
        </SectionHeader>
        <EditableRichText
          name="Appearance"
          html={CS.description(character)}
          editable={true}
          onChange={handleChange}
          fallback="No description available."
        />
      </Box>
    )
  }

  return (
    <Box>
      <SectionHeader
        title="Appearance"
        icon={<Icon keyword="Appearance" size="28" />}
        sx={{ mt: 4 }}
      >
        A brief description of your character, including their background,
        personality, and notable traits.
      </SectionHeader>
      <EditableRichText
        name="Appearance"
        html={CS.description(character)}
        editable={true}
        onChange={handleChange}
        fallback="No description available."
      />
      <Stack
        direction="row"
        spacing={2}
        sx={{ my: 2 }}
        justifyContent="space-between"
      >
        <DescriptionValue
          name="Age"
          value={CS.age(character)}
          character={character}
          updateCharacter={updateCharacter}
        />
        <DescriptionValue
          name="Height"
          value={CS.height(character)}
          character={character}
          updateCharacter={updateCharacter}
        />
        <DescriptionValue
          name="Weight"
          value={CS.weight(character)}
          character={character}
          updateCharacter={updateCharacter}
        />
        <DescriptionValue
          name="Hair Color"
          value={CS.hairColor(character)}
          character={character}
          updateCharacter={updateCharacter}
        />
        <DescriptionValue
          name="Eye Color"
          value={CS.eyeColor(character)}
          character={character}
          updateCharacter={updateCharacter}
        />
      </Stack>
      <Box>
        <SectionHeader
          title="Style of Dress"
          icon={<Icon keyword="Dress" />}
          sx={{ mt: 4 }}
        >
          A brief description of your character&rsquo;s style of dress,
          including any notable fashion choices or accessories.
        </SectionHeader>
        <EditableRichText
          name="Style of Dress"
          html={CS.styleOfDress(character)}
          editable={true}
          onChange={handleChange}
          fallback="No fashion details available."
        />
      </Box>
      {CS.isPC(character) && (
        <Box>
          <SectionHeader
            title="Melodramatic Hook"
            icon={<Icon keyword="Melodramatic Hook" />}
            sx={{ mt: 4 }}
          >
            A melodramatic hook is a brief, dramatic statement that captures the
            essence of your character&rsquo;s story or personality.
          </SectionHeader>
          <EditableRichText
            name="Melodramatic Hook"
            html={CS.melodramaticHook(character)}
            editable={true}
            onChange={handleChange}
            fallback="No details available."
          />
        </Box>
      )}
      <Box>
        <SectionHeader
          title="Background"
          icon={<Icon keyword="Background" />}
          sx={{ mt: 4 }}
        >
          A brief description of your character&rsquo;s background, including
          their history, upbringing, and any significant events that shaped
          them.
        </SectionHeader>
        <EditableRichText
          name="Background"
          html={CS.background(character)}
          editable={true}
          onChange={handleChange}
          fallback="No background details available."
        />
      </Box>
    </Box>
  )
}
