const API_ORIGIN = (
  import.meta.env?.VITE_API_ORIGIN || "http://localhost:8080"
).replace(/\/$/, "");
const BASE_URL = `${API_ORIGIN}/api`;

export function assetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_ORIGIN}${path}`;
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `GET ${path} failed`);
  }

  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${path} failed`);
  }

  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `DELETE ${path} failed`);
  }

  return res.json();
}

export async function apiUpload(path, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `UPLOAD ${path} failed`);
  }

  return res.json();
}
