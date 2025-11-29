// src/api/api.js
const API_URL = import.meta.env.VITE_API_URL;

export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  return data;
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function getRooms() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/rooms/getRooms`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // must send JWT
    },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message || "Failed to load rooms");
  return data;
}

export async function createRoom(name) {
  const token = localStorage.getItem("token");
  
  const res = await fetch(`${API_URL}/rooms/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create room from api");
  return data;
}


export async function getUser(token) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to get user from api");
  return data;
}
