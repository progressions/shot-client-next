import { List } from "@mui/material"
import { ShotDetail } from "@/components/encounters"
import { useEncounter } from "@/contexts"

export default function ShotCounter() {
  const { encounter } = useEncounter()

  return (
    <List>
      {encounter.shots.map((shot, index) => (
        <ShotDetail key={`${shot.shot}-${index}`} shot={shot} />
      ))}
    </List>
  )
}
