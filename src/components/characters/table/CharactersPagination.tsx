import { Pagination } from "@mui/material"
import type { PaginationMeta } from "@/types"

interface CharactersPaginationProps {
  meta: PaginationMeta
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void
}

export default function CharactersPagination({
  meta,
  onPageChange,
}: CharactersPaginationProps) {
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
