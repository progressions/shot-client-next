import React from "react"
import { Box } from "@mui/material"
import {
  SkeletonText,
  SkeletonButton,
  SkeletonTable,
  SkeletonCard,
  SkeletonAvatar,
} from "./BaseSkeleton"

interface ListPageSkeletonProps {
  entityType: string
  showSearch?: boolean
  showFilters?: boolean
  itemCount?: number
  viewMode?: "table" | "mobile"
  showSpeedDial?: boolean
}

const SpeedDialSkeleton: React.FC = () => (
  <Box position="fixed" bottom={24} right={24} zIndex={1000}>
    <SkeletonButton width={56} height={56} />
  </Box>
)

const HeaderSkeleton: React.FC<{ entityType: string }> = ({ entityType }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 2,
    }}
  >
    <Box display="flex" alignItems="center" gap={1}>
      <SkeletonAvatar size={36} />
      <SkeletonText width={150} height={36} />
    </Box>
  </Box>
)

const SortControlsSkeleton: React.FC<{ showFilters?: boolean }> = ({
  showFilters,
}) => (
  <Box sx={{ width: "100%", mb: 2 }}>
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
      flexWrap="wrap"
      gap={2}
    >
      {/* Search input skeleton */}
      <Box flex={1} minWidth={250}>
        <SkeletonText width="100%" height={56} variant="rectangular" />
      </Box>

      {/* Sort controls skeleton */}
      <Box display="flex" gap={1}>
        <SkeletonButton width={120} height={40} />
        <SkeletonButton width={80} height={40} />
      </Box>
    </Box>

    {/* Filters skeleton */}
    {showFilters && (
      <Box display="flex" gap={2} mb={2} flexWrap="wrap">
        <SkeletonButton width={140} height={56} />
        <SkeletonButton width={120} height={56} />
        <SkeletonButton width={160} height={56} />
      </Box>
    )}
  </Box>
)

const MobileViewSkeleton: React.FC<{
  itemCount: number
  entityType: string
}> = ({ itemCount, entityType }) => (
  <Box
    display="grid"
    gridTemplateColumns={{
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
      lg: "repeat(4, 1fr)",
    }}
    gap={2}
  >
    {Array.from({ length: itemCount }).map((_, index) => (
      <SkeletonCard key={`mobile-${index}`} height="180px">
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <SkeletonAvatar size={40} />
          <Box flex={1}>
            <SkeletonText width="80%" height={20} />
            <SkeletonText width="60%" height={16} />
          </Box>
        </Box>
        <Box mb={2}>
          <SkeletonText width="100%" height={16} />
          <SkeletonText width="85%" height={16} />
          <SkeletonText width="70%" height={16} />
        </Box>
        <Box display="flex" gap={1} mt="auto">
          <SkeletonButton width={60} height={32} />
          <SkeletonButton width={60} height={32} />
        </Box>
      </SkeletonCard>
    ))}
  </Box>
)

const TableViewSkeleton: React.FC<{
  itemCount: number
  entityType: string
}> = ({ itemCount, entityType }) => {
  // Determine columns based on entity type
  const getColumnCount = (entityType: string): number => {
    switch (entityType.toLowerCase()) {
      case "campaigns":
        return 4 // Name, Description, Members, Actions
      case "characters":
        return 5 // Avatar, Name, Archetype, Type, Actions
      case "fights":
        return 4 // Name, Description, Status, Actions
      case "vehicles":
        return 4 // Name, Archetype, Description, Actions
      case "weapons":
        return 5 // Name, Category, Juncture, Damage, Actions
      case "schticks":
        return 4 // Name, Category, Path, Actions
      default:
        return 4 // Default column count
    }
  }

  const columnCount = getColumnCount(entityType)
  const showAvatar = ["characters", "users", "campaigns"].includes(
    entityType.toLowerCase()
  )

  return (
    <SkeletonTable
      rows={itemCount}
      columns={columnCount}
      showHeader={true}
      showAvatar={showAvatar}
    />
  )
}

const PaginationSkeleton: React.FC = () => (
  <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
    <SkeletonText width={100} height={20} />
    <Box display="flex" gap={1}>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonButton key={`page-${index}`} width={40} height={36} />
      ))}
    </Box>
    <SkeletonText width={120} height={20} />
  </Box>
)

export const ListPageSkeleton: React.FC<ListPageSkeletonProps> = ({
  entityType,
  showSearch = true,
  showFilters = true,
  itemCount = 8,
  viewMode = "table",
  showSpeedDial = true,
}) => {
  return (
    <Box
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
        position: "relative",
      }}
    >
      {/* Breadcrumbs skeleton */}
      <Box mb={2}>
        <SkeletonText width={200} height={20} />
      </Box>

      {/* Speed dial menu skeleton */}
      <Box mb={3}>
        <Box display="flex" gap={1} justifyContent="flex-end">
          <SkeletonButton width={120} height={40} />
          <SkeletonButton width={100} height={40} />
        </Box>
      </Box>

      {/* Header skeleton */}
      <HeaderSkeleton entityType={entityType} />

      {/* Sort controls and filters skeleton */}
      <SortControlsSkeleton showFilters={showFilters} />

      {/* Main content skeleton */}
      <Box sx={{ width: "100%", mb: 2 }}>
        {viewMode === "mobile" ? (
          <MobileViewSkeleton itemCount={itemCount} entityType={entityType} />
        ) : (
          <TableViewSkeleton itemCount={itemCount} entityType={entityType} />
        )}
      </Box>

      {/* Pagination skeleton */}
      <PaginationSkeleton />

      {/* Speed dial skeleton */}
      {showSpeedDial && <SpeedDialSkeleton />}
    </Box>
  )
}
