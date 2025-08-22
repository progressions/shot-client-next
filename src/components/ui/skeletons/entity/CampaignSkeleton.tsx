import React from "react"
import { Box, Card, CardContent, CardMedia, Chip } from "@mui/material"
import {
  SkeletonText,
  SkeletonButton,
  SkeletonAvatar,
} from "@/components/ui/skeletons"

interface CampaignSkeletonProps {
  showImage?: boolean
  showActions?: boolean
  variant?: "table" | "card"
}

const CampaignTableRowSkeleton: React.FC = () => (
  <Box display="flex" alignItems="center" gap={2} py={1}>
    {/* Avatar column */}
    <SkeletonAvatar size={40} />

    {/* Name column */}
    <Box flex={2}>
      <SkeletonText width="80%" height={20} />
    </Box>

    {/* Created column */}
    <Box flex={1}>
      <SkeletonText width="60%" height={18} />
    </Box>

    {/* Status column */}
    <Box flex={1} display="flex" justifyContent="center">
      <Chip
        label={<SkeletonText width={60} height={16} />}
        size="small"
        sx={{ bgcolor: "rgba(0,0,0,0.1)" }}
      />
    </Box>

    {/* Actions column */}
    <Box flex={1} display="flex" justifyContent="center" gap={1}>
      <SkeletonButton width={80} height={32} />
    </Box>
  </Box>
)

const CampaignCardSkeleton: React.FC<{
  showImage?: boolean
  showActions?: boolean
}> = ({ showImage = true, showActions = true }) => (
  <Card sx={{ mb: 2, bgcolor: "#424242" }}>
    {showImage && (
      <CardMedia sx={{ height: 140 }}>
        <SkeletonText width="100%" height="100%" variant="rectangular" />
      </CardMedia>
    )}
    <CardContent sx={{ p: "1rem" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box flex={1}>
          {/* Campaign name */}
          <SkeletonText width="70%" height={24} />
        </Box>
        {showActions && (
          <Box display="flex" gap={1}>
            <SkeletonButton width={32} height={32} />
            <SkeletonButton width={32} height={32} />
          </Box>
        )}
      </Box>

      {/* Campaign description */}
      <Box mt={1}>
        <SkeletonText width="100%" height={16} />
        <SkeletonText width="85%" height={16} />
        <SkeletonText width="60%" height={16} />
      </Box>

      {/* Members/Players */}
      <Box mt={2}>
        <Box display="flex" flexWrap="wrap" gap={0.5}>
          <SkeletonText width={80} height={16} />
          <SkeletonText width={90} height={16} />
          <SkeletonText width={75} height={16} />
        </Box>
      </Box>

      {/* Created timestamp */}
      <Box mt={1}>
        <SkeletonText width="60%" height={14} />
      </Box>
    </CardContent>
  </Card>
)

export const CampaignSkeleton: React.FC<CampaignSkeletonProps> = ({
  showImage = true,
  showActions = true,
  variant = "card",
}) => {
  if (variant === "table") {
    return <CampaignTableRowSkeleton />
  }

  return (
    <CampaignCardSkeleton showImage={showImage} showActions={showActions} />
  )
}
