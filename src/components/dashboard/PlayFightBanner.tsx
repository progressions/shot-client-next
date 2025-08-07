import { Box, Typography } from "@mui/material"
import type { Fight } from "@/types"
import { FightName } from "@/components/fights"
import { JoinFightButton } from "@/components/ui"
import { RichTextRenderer } from "@/components/editor"

type FightProperties = {
  fight: Fight
}

export default function FightBanner({ fight }: FightProperties) {
  return (
    <Box
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        backgroundColor: "#1d1d1d",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background image container */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          backgroundImage: `url(${fight.image_url || "/default-fight-banner.jpg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 1,
        }}
      />
      {/* Overlay to ensure text readability */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.2)",
          zIndex: 2,
        }}
      />
      {/* Content container with semi-transparent background */}
      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          borderRadius: 1,
          p: 2,
          mt: 10,
          mx: "auto",
          maxWidth: "80%",
        }}
      >
        <Typography variant="body2" color="white" textAlign="center">
          Current Fight
        </Typography>
        <Typography variant="h5" color="white" textAlign="center" gutterBottom>
          <FightName fight={fight} />
        </Typography>
        <RichTextRenderer html={fight.description} />
        <JoinFightButton fight={fight} />
      </Box>
    </Box>
  )
}
