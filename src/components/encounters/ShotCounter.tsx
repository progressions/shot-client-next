import type { Encounter, Character, Vehicle } from "@/types"
import {
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  ListSubheader,
  Box,
} from "@mui/material"
import { useForm } from "@/reducers"
import {
  VehicleHeader,
  CharacterHeader,
  Wounds,
  ChaseConditionPoints,
  Character,
  Vehicle,
} from "@/components/encounters"

type ShotCounterProps = {
  encounter: Encounter
}

type FormData = Encounter

export default function ShotCounter({
  encounter: initialEncounter,
}: ShotCounterProps) {
  const { formState, dispatchForm } = useForm<FormData>(initialEncounter)
  const { saving, errors, status } = formState
  const { data: encounter } = formState

  return (
    <List>
      {encounter.shots.map((shot, index) => (
        <Box key={`${shot.shot}-${index}`}>
          <ListSubheader
            sx={{
              textAlign: "right",
              fontSize: "1.5rem",
              fontWeight: "bold",
              width: "100%",
              borderRadius: "8px 8px 1px 1px",
            }}
            key={index}
          >
            {shot.shot}
          </ListSubheader>
          {shot.characters.map((character: Character) => (
            <ListItem
              key={`${shot.shot}-${character.id}`}
              sx={{ alignItems: "flex-start" }}
            >
              <ListItemIcon>
                <Wounds character={character} />
              </ListItemIcon>
              <ListItemText
                sx={{ ml: 2 }}
                primary={<CharacterHeader character={character} />}
                secondary={<Character character={character} />}
              />
            </ListItem>
          ))}
          {shot.vehicles.map((vehicle: Vehicle) => (
            <ListItem
              key={`${shot.shot}-vehicle-${vehicle.id}`}
              sx={{ alignItems: "flex-start" }}
            >
              <ListItemIcon>
                <ChaseConditionPoints vehicle={vehicle} />
              </ListItemIcon>
              <ListItemText
                sx={{ ml: 2 }}
                primary={<VehicleHeader vehicle={vehicle} />}
                secondary={<Vehicle vehicle={vehicle} />}
              />
            </ListItem>
          ))}
        </Box>
      ))}
    </List>
  )
}
