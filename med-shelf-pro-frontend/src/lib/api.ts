export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  health: () => fetch(`${API_BASE}/health`).then(handle),
  list: (q?: string) => {
    const url = new URL(`${API_BASE}/medicines`);
    if (q) url.searchParams.set("q", q);
    return fetch(url).then(handle<{items:any[], total:number}>);
  },
  get: (id: number) => fetch(`${API_BASE}/medicines/${id}`).then(handle),
  create: (data: any) =>
    fetch(`${API_BASE}/medicines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),
  update: (id: number, data: any) =>
    fetch(`${API_BASE}/medicines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle),
  remove: (id: number) =>
    fetch(`${API_BASE}/medicines/${id}`, { method: "DELETE" }).then(handle),
};
