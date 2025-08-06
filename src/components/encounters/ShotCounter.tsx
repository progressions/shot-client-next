import type { Encounter } from "@/types"
import { AppBar, Toolbar, Typography, List } from "@mui/material"
import { ShotDetail } from "@/components/encounters"
import { useEncounter } from "@/contexts"

export default function ShotCounter() {
  const { encounter } = useEncounter()

  return (
    <>
      <AppBar position="sticky" sx={{ top: 0, zIndex: 1100 }}>
        <Toolbar>
          <Typography variant="h6">Menu</Typography>
        </Toolbar>
      </AppBar>
      <List>
        {encounter.shots.map((shot, index) => (
          <ShotDetail key={`${shot.shot}-${index}`} shot={shot} />
        ))}
      </List>
    </>
  )
}
