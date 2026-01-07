"use client"
import { useState, useCallback, useEffect } from "react"
import { Box, Pagination, Chip } from "@mui/material"
import { PhotoLibrary as MediaIcon } from "@mui/icons-material"
import { useClient, useToast, useApp } from "@/contexts"
import { MainHeader } from "@/components/ui"
import type {
  MediaImage,
  MediaLibraryFilters,
  MediaLibraryStats,
} from "@/types"
import Filter from "./Filter"
import ImageGrid from "./ImageGrid"
import BulkActions from "./BulkActions"
import ImageDetailsDialog from "./ImageDetailsDialog"

interface ListProps {
  initialFilters?: MediaLibraryFilters
}

export default function List({ initialFilters }: ListProps) {
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()
  const { user } = useApp()
  const isGamemaster = user?.gamemaster || user?.admin || false

  const [images, setImages] = useState<MediaImage[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<MediaLibraryFilters>(
    initialFilters || { page: 1, per_page: 24 }
  )
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<MediaLibraryStats>({
    total: 0,
    orphan: 0,
    attached: 0,
    uploaded: 0,
    ai_generated: 0,
    total_size_bytes: 0,
  })

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Details dialog
  const [detailsImage, setDetailsImage] = useState<MediaImage | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const fetchImages = useCallback(async () => {
    setLoading(true)
    try {
      const response = await client.getMediaLibrary(filters)
      setImages(response.data.images)
      setTotalPages(response.data.meta.total_pages)
      setTotalCount(response.data.meta.total_count)
      // Ensure all stats fields have default values
      const apiStats = response.data.stats || {}
      setStats({
        total: apiStats.total ?? 0,
        orphan: apiStats.orphan ?? 0,
        attached: apiStats.attached ?? 0,
        uploaded: apiStats.uploaded ?? 0,
        ai_generated: apiStats.ai_generated ?? 0,
        total_size_bytes: apiStats.total_size_bytes ?? 0,
      })
    } catch (error) {
      console.error("Failed to fetch media library:", error)
      toastError("Failed to load media library")
    } finally {
      setLoading(false)
    }
  }, [client, filters, toastError])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [filters])

  const handleFilterChange = (newFilters: MediaLibraryFilters) => {
    setFilters(newFilters)
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedIds(new Set(images.map(img => img.id)))
  }

  const handleClearSelection = () => {
    setSelectedIds(new Set())
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this image? This cannot be undone."
      )
    ) {
      return
    }

    try {
      await client.deleteMediaImage(id)
      toastSuccess("Image deleted")
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      fetchImages()
    } catch (error) {
      console.error("Failed to delete image:", error)
      toastError("Failed to delete image")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.size} images? This cannot be undone.`
      )
    ) {
      return
    }

    try {
      const result = await client.bulkDeleteMediaImages(Array.from(selectedIds))
      const deletedCount = result.data.deleted.length
      const failedCount = result.data.failed.length

      if (failedCount > 0) {
        toastError(`Deleted ${deletedCount} images, ${failedCount} failed`)
      } else {
        toastSuccess(`Deleted ${deletedCount} images`)
      }

      setSelectedIds(new Set())
      fetchImages()
    } catch (error) {
      console.error("Failed to bulk delete images:", error)
      toastError("Failed to delete images")
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await client.duplicateMediaImage(id)
      toastSuccess("Image duplicated")
      fetchImages()
    } catch (error) {
      console.error("Failed to duplicate image:", error)
      toastError("Failed to duplicate image")
    }
  }

  const handleDownload = (image: MediaImage) => {
    // Open image in new tab for download
    window.open(image.imagekit_url, "_blank")
  }

  const handleBulkDownload = () => {
    // Download all selected images
    const selectedImages = images.filter(img => selectedIds.has(img.id))
    selectedImages.forEach(img => {
      window.open(img.imagekit_url, "_blank")
    })
  }

  const handleShowDetails = (image: MediaImage) => {
    setDetailsImage(image)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setDetailsImage(null)
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <MainHeader
          title="Media Library"
          icon={<MediaIcon fontSize="large" />}
        />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={`${stats.total} total`}
            size="small"
            variant="outlined"
          />
          <Chip
            label={`${stats.uploaded} uploaded`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${stats.ai_generated} AI`}
            size="small"
            color="secondary"
            variant="outlined"
          />
          <Chip
            label={`${stats.orphan} orphan`}
            size="small"
            color="warning"
            variant="outlined"
          />
          <Chip
            label={`${stats.attached} attached`}
            size="small"
            color="success"
            variant="outlined"
          />
        </Box>
      </Box>

      <Filter filters={filters} onFilterChange={handleFilterChange} />

      {isGamemaster && (
        <BulkActions
          selectedCount={selectedIds.size}
          totalCount={images.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkDelete={handleBulkDelete}
          onBulkDownload={handleBulkDownload}
        />
      )}

      <ImageGrid
        images={images}
        loading={loading}
        selectedIds={selectedIds}
        onSelect={handleSelect}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onDownload={handleDownload}
        onShowDetails={handleShowDetails}
        isGamemaster={isGamemaster}
      />

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={filters.page || 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <ImageDetailsDialog
        image={detailsImage}
        open={detailsOpen}
        onClose={handleCloseDetails}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onDownload={handleDownload}
        isGamemaster={isGamemaster}
      />
    </Box>
  )
}
