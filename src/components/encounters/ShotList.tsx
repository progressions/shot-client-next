import { Box, Typography, List } from "@mui/material"
import type { Shot } from "@/types"
import { Character, ShotDetailItem } from "@/components/encounters"

interface ShotListProps {
  shots: Shot[]
}

export default function ShotList({ shots }: ShotListProps) {
  return (
    <Box sx={{ mt: 2 }}>
      {shots.length > 0 ? (
        <List>
          {shots.map((shot: Shot) => (
            <Box key={shot.shot} sx={{ mb: 2 }}>
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
              {shot.shot_details.map((detail) => (
                <ShotDetailItem key={detail.id} detail={detail} />
              ))}
            </Box>
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
