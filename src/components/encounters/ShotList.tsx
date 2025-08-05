import { Box, Typography, List, ListItem } from "@mui/material"
import type { Shot } from "@/types"
import { ShotDetailItem } from "@/components/encounters"

interface ShotListProps {
  shots: Shot[] | undefined
}

export default function ShotList({ shots }: ShotListProps) {
  if (!shots) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No shots available.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 2 }}>
      {shots.length > 0 ? (
        <List>
          {shots.map((shot: Shot) => (
            <ListItem key={shot.id} sx={{ display: "block", mb: 2 }}>
              <Typography
                variant="subtitle1"
                color="primary.main"
                sx={{
                  backgroundColor: "background.paper",
                  width: "100%",
                  py: 1,
                  px: 2,
                  borderRadius: 1,
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {shot.shot}
              </Typography>
              <ShotDetailItem detail={shot.shot_details} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No shots available.
        </Typography>
      )}
    </Box>
  )
}
