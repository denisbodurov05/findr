import { isAxiosError } from "axios";

export function getErrorMessage(error: unknown, fallback = "Something went wrong...") {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    const message = error.response?.data?.message;

    if (typeof detail === "string") {
      return detail;
    }

    if (typeof message === "string") {
      return message;
    }

    if (typeof error.response?.data === "string") {
      return error.response.data;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
