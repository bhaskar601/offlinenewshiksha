/**
 * API base for LAN + Electron + Vite dev.
 * - Browser on http://<server>:5000 → same origin
 * - Vite dev (8080) → backend on port 5000
 * - Electron file:// → loopback backend
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return "http://127.0.0.1:5000";
  }
  const { protocol, hostname, port } = window.location;
  if (protocol === "file:") {
    return "http://127.0.0.1:5000";
  }
  const devPorts = new Set(["8080", "5173"]);
  if (devPorts.has(port || "")) {
    const host =
      hostname === "[::1]" || hostname === "::1" || hostname === "" ? "127.0.0.1" : hostname;
    return `http://${host}:5000`;
  }
  return window.location.origin;
}
