/** Admin API fetch — always send session cookie (needed on mobile Safari). */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type") && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers,
  });
}
