import { useEffect } from 'react'
import { BRAND } from '../constants'

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND}` : BRAND
  }, [title])
}
