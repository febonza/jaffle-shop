import useSWR from "swr";

const fetcher = async (path: string) => {
  const res = await fetch(path);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }
  return res.json();
};

export function useApi<T>(path: string) {
  const { data, error, isLoading } = useSWR<T>(path, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  });
  return { data, error, isLoading };
}
