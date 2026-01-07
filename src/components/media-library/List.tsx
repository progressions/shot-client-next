"use client"
import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Box, Pagination, Chip } from "@mui/material"
import { PhotoLibrary as MediaIcon } from "@mui/icons-material"
import JSZip from "jszip"
import { useClient, useToast, useApp, useConfirm } from "@/contexts"
import { MainHeader } from "@/components/ui"
import { queryParams } from "@/lib"
import type {
  MediaImage,
  MediaLibraryFilters,
  MediaLibraryStats,
} from "@/types"
import Filter from "./Filter"
import ImageGrid from "./ImageGrid"
import BulkActions from "./BulkActions"
import ImageDetailsDialog from "./ImageDetailsDialog"

interface InitialData {
  images: MediaImage[]
  meta: { total_pages: number; current_page: number; total_count: number }
  stats: MediaLibraryStats
}

interface ListProps {
  initialFilters?: MediaLibraryFilters
  initialData?: InitialData
}

export default function List({ initialFilters, initialData }: ListProps) {
  const router = useRouter()
  const { client } = useClient()
  const { toastSuccess, toastError, toastInfo } = useToast()
  const { confirm } = useConfirm()
  const { user, campaign } = useApp()
  const isGamemaster = user?.gamemaster || user?.admin || false
  const isInitialRender = useRef(true)

  // Initialize from server-fetched data when available
  const [images, setImages] = useState<MediaImage[]>(initialData?.images || [])
  const [loading, setLoading] = useState(!initialData)
  // Initialize filters with ALL fields (like characters page) so queryParams outputs all params
  const [filters, setFilters] = useState<MediaLibraryFilters>({
    status: "all",
    source: "all",
    entity_type: "",
    page: 1,
    per_page: 24,
    ...initialFilters,
  })
  const [totalPages, setTotalPages] = useState(
    initialData?.meta?.total_pages || 1
  )
  const [stats, setStats] = useState<MediaLibraryStats>(
    initialData?.stats || {
      total: 0,
      orphan: 0,
      attached: 0,
      uploaded: 0,
      ai_generated: 0,
      total_size_bytes: 0,
    }
  )

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

  // Only fetch client-side on initial mount if no server data was provided
  // After initial render, URL changes trigger server-side fetch via page.tsx
  useEffect(() => {
    if (!initialData) {
      fetchImages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync state when server provides new data (e.g., after URL-triggered fetch)
  useEffect(() => {
    if (initialData) {
      setImages(initialData.images)
      setTotalPages(initialData.meta?.total_pages || 1)
      setStats({
        total: initialData.stats?.total ?? 0,
        orphan: initialData.stats?.orphan ?? 0,
        attached: initialData.stats?.attached ?? 0,
        uploaded: initialData.stats?.uploaded ?? 0,
        ai_generated: initialData.stats?.ai_generated ?? 0,
        total_size_bytes: initialData.stats?.total_size_bytes ?? 0,
      })
      setLoading(false)
    }
  }, [initialData])

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds(new Set())
  }, [filters])

  // Update URL when filters change (skip initial render)
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    const url = `/media?${queryParams(filters)}`
    router.push(url, { scroll: false })
  }, [filters, router])

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
    const confirmed = await confirm({
      title: "Delete Image",
      message:
        "Are you sure you want to delete this image? This cannot be undone.",
      confirmText: "Delete",
      confirmColor: "error",
      destructive: true,
    })

    if (!confirmed) return

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

    const confirmed = await confirm({
      title: "Delete Images",
      message: `Are you sure you want to delete ${selectedIds.size} images? This cannot be undone.`,
      confirmText: "Delete All",
      confirmColor: "error",
      destructive: true,
    })

    if (!confirmed) return

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
    // Create a download link and trigger download
    const link = document.createElement("a")
    link.href = image.imagekit_url
    link.download = image.filename || `image-${image.id}.jpg`
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleBulkDownload = async () => {
    const selectedImages = images.filter(img => selectedIds.has(img.id))

    if (selectedImages.length === 0) return

    toastInfo(`Preparing ${selectedImages.length} images for download...`)

    try {
      const zip = new JSZip()

      // Fetch all images and add to zip
      const fetchPromises = selectedImages.map(async (img, index) => {
        try {
          const response = await fetch(img.imagekit_url)
          const blob = await response.blob()

          // Generate unique filename
          const extension = img.content_type?.includes("png") ? "png" : "jpg"
          const filename =
            img.filename ||
            `${img.entity_name || "image"}-${index + 1}.${extension}`

          zip.file(filename, blob)
        } catch (error) {
          console.error(`Failed to fetch image ${img.id}:`, error)
        }
      })

      await Promise.all(fetchPromises)

      // Generate and download the zip file
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url

      // Format campaign name for filename: replace spaces with dashes, truncate to 50 chars
      const campaignSlug = (campaign?.name || "media")
        .replace(/\s+/g, "-")
        .slice(0, 50)
      const dateStr = new Date().toISOString().split("T")[0]
      link.download = `${campaignSlug}-media-${dateStr}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toastSuccess(`Downloaded ${selectedImages.length} images as zip`)
    } catch (error) {
      console.error("Failed to create zip:", error)
      toastError("Failed to download images")
    }
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

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Pagination
            count={totalPages}
            page={filters.page || 1}
            onChange={handlePageChange}
            variant="outlined"
            color="primary"
            shape="rounded"
            size="large"
          />
        </Box>
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
            variant="outlined"
            color="primary"
            shape="rounded"
            size="large"
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
