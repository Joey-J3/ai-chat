import { CircularProgress } from "@mui/material"
import { DynamicOptions } from "next/dynamic"

export function getDynamicOptions<T>(options: DynamicOptions<T>): DynamicOptions<T> {
  return {
    loading: ({
      error,
      isLoading,
      pastDelay,
      retry,
      timedOut,
    }) => {
      if (isLoading) {
        return <CircularProgress />
      }
      if (timedOut || error) {
        throw timedOut || error
      }
      return null
    },
    ...options,
  }
}