import React from "react"
import { Box, Card, CardContent, Skeleton } from "@mui/material"

interface SkeletonCardProps {
  height?: string
  className?: string
  children?: React.ReactNode
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = "200px",
  className = "",
  children,
}) => {
  return (
    <Card className={className} sx={{ height, mb: 2 }}>
      <CardContent>
        {children || (
          <Skeleton variant="rectangular" width="100%" height="100%" />
        )}
      </CardContent>
    </Card>
  )
}

interface SkeletonTextProps {
  width?: string | number
  height?: string | number
  variant?: "text" | "rectangular" | "circular"
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  width = "100%",
  height = 20,
  variant = "text",
}) => {
  return <Skeleton variant={variant} width={width} height={height} />
}

interface SkeletonAvatarProps {
  size?: number
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 40,
}) => {
  return <Skeleton variant="circular" width={size} height={size} />
}

interface SkeletonButtonProps {
  width?: string | number
  height?: string | number
  variant?: "text" | "outlined" | "contained"
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  width = 100,
  height = 36,
  variant = "contained",
}) => {
  const borderRadius = variant === "contained" ? 1 : 0
  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={height}
      sx={{ borderRadius }}
    />
  )
}

interface SkeletonRowProps {
  columns?: number
  showAvatar?: boolean
  height?: number
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
  columns = 3,
  showAvatar = false,
  height = 20,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={2} mb={1}>
      {showAvatar && <SkeletonAvatar size={32} />}
      {Array.from({ length: columns }).map((_, index) => (
        <Box key={index} flex={index === 0 ? 2 : 1}>
          <SkeletonText height={height} />
        </Box>
      ))}
    </Box>
  )
}

interface SkeletonTableProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  showAvatar?: boolean
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  showAvatar = false,
}) => {
  return (
    <Box>
      {showHeader && (
        <Box
          display="flex"
          gap={2}
          mb={2}
          pb={1}
          borderBottom="1px solid #e0e0e0"
        >
          {showAvatar && <Box width={40} />}
          {Array.from({ length: columns }).map((_, index) => (
            <Box key={`header-${index}`} flex={index === 0 ? 2 : 1}>
              <SkeletonText width="80%" height={16} />
            </Box>
          ))}
        </Box>
      )}
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonRow
          key={`row-${index}`}
          columns={columns}
          showAvatar={showAvatar}
          height={16}
        />
      ))}
    </Box>
  )
}

interface SkeletonFormProps {
  fields?: number
  showActions?: boolean
}

export const SkeletonForm: React.FC<SkeletonFormProps> = ({
  fields = 5,
  showActions = true,
}) => {
  return (
    <Box>
      {Array.from({ length: fields }).map((_, index) => (
        <Box key={`field-${index}`} mb={3}>
          <SkeletonText width="25%" height={16} />
          <Box mt={0.5}>
            <SkeletonText width="100%" height={56} variant="rectangular" />
          </Box>
        </Box>
      ))}
      {showActions && (
        <Box display="flex" gap={2} mt={4}>
          <SkeletonButton width={100} />
          <SkeletonButton width={80} />
        </Box>
      )}
    </Box>
  )
}
