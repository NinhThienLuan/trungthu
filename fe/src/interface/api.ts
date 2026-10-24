/** Mirrors be/dto/response/ApiResponseDTO.java. */
export interface ApiResponseDTO<T> {
  status: number;
  message: string;
  data: T | null;
}
