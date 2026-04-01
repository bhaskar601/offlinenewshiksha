/**
 * Sync server URL resolution:
 * - Electron/file:// on server machine -> localhost
 * - Browser clients opened via http://<server-ip>:5000 -> same host on :5002
 * - Optional override via localStorage: cloudSyncServerUrl
 * - Optional override via Vite env: VITE_SYNC_SERVER_URL
 */
export function getServerUrl() {
  if (typeof window === "undefined") return "http://127.0.0.1:5002";

  const manualOverride = localStorage.getItem("cloudSyncServerUrl");
  if (manualOverride && manualOverride.trim()) return manualOverride.trim();

  const envOverride = import.meta?.env?.VITE_SYNC_SERVER_URL;
  if (envOverride && String(envOverride).trim()) return String(envOverride).trim();

  const { protocol, hostname } = window.location;
  if (protocol === "file:") return "http://127.0.0.1:5002";

  const host =
    hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]"
      ? "127.0.0.1"
      : hostname;

  return `http://${host}:5002`;
}

export const SERVER_URL = getServerUrl();

