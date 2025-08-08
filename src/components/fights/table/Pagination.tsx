import { Pagination } from "@mui/material"
import type { PaginationMeta } from "@/types"

interface FightsPaginationProps {
  meta: PaginationMeta
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void
}

export default function FightsPagination({
  meta,
  onPageChange,
}: FightsPaginationProps) {
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
