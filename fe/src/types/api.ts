// Khớp ApiResponseDTO và PageResponse của Spring Boot
export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

export interface Page<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}
