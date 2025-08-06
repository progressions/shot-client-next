import { List } from "@mui/material"
import { MenuBar, ShotDetail } from "@/components/encounters"
import { useEncounter } from "@/contexts"

export default function ShotCounter() {
  const { encounter } = useEncounter()

  return (
    <>
      <MenuBar />
      <List>
        {encounter.shots.map((shot, index) => (
          <ShotDetail key={`${shot.shot}-${index}`} shot={shot} />
        ))}
      </List>
    </>
  )
}
