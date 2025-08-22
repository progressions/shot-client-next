import React from "react"
import { Box, Card, CardContent, Chip } from "@mui/material"
import {
  SkeletonText,
  SkeletonButton,
  SkeletonAvatar,
} from "@/components/ui/skeletons"

interface FightSkeletonProps {
  showActions?: boolean
  variant?: "table" | "card"
  showParticipants?: boolean
}

const FightTableRowSkeleton: React.FC = () => (
  <Box display="flex" alignItems="center" gap={2} py={1}>
    {/* Name column */}
    <Box flex={2}>
      <SkeletonText width="80%" height={20} />
    </Box>

    {/* Status column */}
    <Box flex={1}>
      <Chip
        label={<SkeletonText width={50} height={16} />}
        size="small"
        sx={{ bgcolor: "rgba(0,0,0,0.1)" }}
      />
    </Box>

    {/* Participants column */}
    <Box flex={1}>
      <SkeletonText width="60%" height={18} />
    </Box>

    {/* Created column */}
    <Box flex={1}>
      <SkeletonText width="70%" height={18} />
    </Box>

    {/* Actions column */}
    <Box flex={1} display="flex" justifyContent="center" gap={1}>
      <SkeletonButton width={32} height={32} />
      <SkeletonButton width={32} height={32} />
    </Box>
  </Box>
)

const FightCardSkeleton: React.FC<{
  showActions?: boolean
  showParticipants?: boolean
}> = ({ showActions = true, showParticipants = true }) => (
  <Card sx={{ mb: 2 }}>
    <CardContent sx={{ p: "1rem" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box flex={1}>
          {/* Fight name */}
          <SkeletonText width="70%" height={24} />

          {/* Status chip */}
          <Box mt={1}>
            <Chip
              label={<SkeletonText width={60} height={16} />}
              size="small"
              sx={{ bgcolor: "rgba(0,0,0,0.1)" }}
            />
          </Box>
        </Box>
        {showActions && (
          <Box display="flex" gap={1}>
            <SkeletonButton width={32} height={32} />
            <SkeletonButton width={32} height={32} />
          </Box>
        )}
      </Box>

      {/* Fight description */}
      <Box mb={2}>
        <SkeletonText width="100%" height={16} />
        <SkeletonText width="85%" height={16} />
        <SkeletonText width="60%" height={16} />
      </Box>

      {/* Participants section */}
      {showParticipants && (
        <Box mb={2}>
          <SkeletonText width={80} height={18} />
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            {Array.from({ length: 4 }).map((_, index) => (
              <Box
                key={`participant-${index}`}
                display="flex"
                alignItems="center"
                gap={1}
              >
                <SkeletonAvatar size={24} />
                <SkeletonText width={60} height={16} />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Fight metadata */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <SkeletonText width={100} height={14} />
        </Box>
        <Box display="flex" gap={1}>
          <SkeletonButton width={70} height={32} />
          <SkeletonButton width={60} height={32} />
        </Box>
      </Box>

      {/* Shot counter / initiative order preview */}
      <Box mt={2}>
        <SkeletonText width={120} height={16} />
        <Box display="flex" gap={1} mt={1}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Box
              key={`shot-${index}`}
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 0.5,
                minWidth: 80,
              }}
            >
              <SkeletonAvatar size={20} />
              <SkeletonText width={30} height={14} />
            </Box>
          ))}
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export const FightSkeleton: React.FC<FightSkeletonProps> = ({
  showActions = true,
  variant = "card",
  showParticipants = true,
}) => {
  if (variant === "table") {
    return <FightTableRowSkeleton />
  }

  return (
    <FightCardSkeleton
      showActions={showActions}
      showParticipants={showParticipants}
    />
  )
}
