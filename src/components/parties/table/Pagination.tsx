"use client"
import { Pagination } from "@mui/material"
import type { PaginationMeta } from "@/types"

interface PartiesMenuProps {
  meta: PaginationMeta
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void
}

export default function PartiesMenu({
  meta,
  onPageChange
}: PartiesMenuProps) {
  return (
    <Pagination
      count={meta.total_pages}
      page={meta.current_page}
      onChange={onPageChange}
      variant="outlined"
      color="primary"
      shape="rounded"
      size="large"
      sx={{ mt: 2 }}
    />
  )
}
