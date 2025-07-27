import { FormActions } from "@/reducers"

type useCollectionProps = {
  url: string
  fetch: (page: number, sort: string, order: string) => Promise<void>
  dispatchForm: React.Dispatch<any>
  data: {
    sort: string
    order: string
    meta: {
      total_pages: number
      current_page: number
    }
  }
}

export function useCollection({ url, fetch: fetchCollection, dispatchForm, data, router }) {
  const { sort, order, meta } = data

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    if (page <= 0 || page > meta.total_pages) {
      router.push(`${url}?page=1&sort=${sort}&order=${order}`, { scroll: false })
      fetchCollection(1, sort, order)
    } else {
      router.push(`/${url}?page=${page}&sort=${sort}&order=${order}`, { scroll: false })
      fetchCollection(page, sort, order)
    }
  }

  const handleSortChange = (newSort: ValidSort) => {
    const newOrder = sort === newSort && order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    router.push(`${url}?page=1&sort=${newSort}&order=${newOrder}`, { scroll: false })
    fetchCollection(1, newSort, newOrder)
  }

  const handleSortChangeMobile = (event: SelectChangeEvent<string>) => {
    const newSort = event.target.value as ValidSort
    if (validSorts.includes(newSort)) {
      dispatchForm({ type: FormActions.UPDATE, name: "sort", value: newSort })
      dispatchForm({ type: FormActions.UPDATE, name: "order", value: "asc" })
      router.push(`${url}?page=1&sort=${newSort}&order=asc`, { scroll: false })
      fetchCollection(1, newSort, "asc")
    }
  }

  const handleOrderChangeMobile = () => {
    const newOrder = order === "asc" ? "desc" : "asc"
    dispatchForm({ type: FormActions.UPDATE, name: "order", value: newOrder })
    router.push(`${url}?page=1&sort=${sort}&order=${newOrder}`, { scroll: false })
    fetchCollection(1, sort, newOrder)
  }

  return {
    handlePageChange, handleSortChange, handleSortChangeMobile, handleOrderChangeMobile
  }
}
