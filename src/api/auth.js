import { api } from "./client";

export async function login(payload) {
  const { data } = await api.post("/auth/login", payload);
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function logout() {
  const { data } = await api.post("/auth/logout");
  return data;
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data;
}

export async function deleteMe() {
  const { data } = await api.delete("/auth/me");
  return data;
}
