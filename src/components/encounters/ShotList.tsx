import { Box, Typography, List } from "@mui/material"
import { Shot } from "@/types"
import { ShotDetailItem } from "@/components/encounters"

interface ShotListProps {
  shots: Shot[]
}

export default function ShotList({ shots }: ShotListProps) {
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Shots
      </Typography>
      {shots.length > 0 ? (
        <List>
          {shots.map((shot: Shot) => (
            <Box key={shot.shot} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" color="primary">
                Shot {shot.shot}
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
