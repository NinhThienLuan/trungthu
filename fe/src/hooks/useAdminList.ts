import { useEffect, useState } from 'react'
import type { Page } from '../types/api'
import { useApi } from './useApi'

const PAGE_SIZE = 10

export function useAdminList<Status, Item>(
  initialStatus: NoInfer<Status>,
  fetchPage: (status: Status, page: number, size: number) => Promise<Page<Item>>,
) {
  const [query, setQuery] = useState({ status: initialStatus, page: 0 })
  const request = useApi(async () => ({
    query,
    result: await fetchPage(query.status, query.page, PAGE_SIZE),
  }), [query])
  const data = request.data?.query === query ? request.data.result : null
  const lastPage = data ? Math.max(0, data.totalPages - 1) : query.page

  // Reviewing the last item on a page can remove that page from the current status.
  useEffect(() => {
    if (query.page > lastPage) {
      setQuery((current) => current === query ? { ...current, page: lastPage } : current)
    }
  }, [query, lastPage])

  return {
    ...query,
    data,
    pagination: request.data?.query.status === query.status ? request.data?.result ?? null : null,
    loading: request.loading || (!request.error && (!data || query.page > lastPage)),
    error: request.error,
    reload: request.reload,
    setPage: (page: number) => setQuery((current) => ({ ...current, page })),
    setStatus: (status: Status) => setQuery((current) => current.status === status ? current : { status, page: 0 }),
  }
}
