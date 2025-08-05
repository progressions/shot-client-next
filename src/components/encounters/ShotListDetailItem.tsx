import { ListItem, ListItemText, Box, Typography } from "@mui/material"
import { ShotDetails } from "@/types/encounter"

interface ShotDetailItemProps {
  detail: ShotDetails
}

export default function ShotDetailItem({ detail }: ShotDetailItemProps) {
  return (
    <ListItem sx={{ py: 0.5 }}>
      <ListItemText
        primary={detail.name}
        secondary={
          <>
            <Typography variant="body2" component="span">
              Count: {detail.count} | Impairments: {detail.impairments}
              {Object.keys(detail.action_values).length > 0 && (
                <>
                  {" | Action Values: "}
                  {Object.entries(detail.action_values)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}
                </>
              )}
            </Typography>
            {detail.color && (
              <Box
                component="span"
                sx={{
                  ml: 1,
                  display: "inline-block",
                  width: 12,
                  height: 12,
                  bgcolor: detail.color,
                  borderRadius: "50%",
                  verticalAlign: "middle",
                }}
              />
            )}
          </>
        }
      />
    </ListItem>
  )
}
