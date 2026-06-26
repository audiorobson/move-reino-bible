export function getDevServerUrl(): string {
  return process.env.VITE_DEV_SERVER_URL ?? "http://localhost:5173";
}

export function getDevRendererUrl(query = ""): string {
  const base = getDevServerUrl().replace(/\/$/, "");
  return query ? `${base}/?${query}` : `${base}/`;
}
