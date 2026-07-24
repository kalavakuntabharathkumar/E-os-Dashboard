import { useAuthStore } from "../store";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const customFetch = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = useAuthStore.getState().token;
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
};
