"use client";

import Cookies from "js-cookie";
import axios from "axios";

const TOKEN_COOKIE_NAME = "token";

export function setAuthTokenCookie(token: string) {
  // Set for 1 hour to align with backend expiry
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: 1 / 24, // 1 hour
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function getAuthTokenCookie(): string | undefined {
  return Cookies.get(TOKEN_COOKIE_NAME);
}

export function clearAuthTokenCookie() {
  Cookies.remove(TOKEN_COOKIE_NAME, { path: "/" });
}

export async function isTokenValid(): Promise<boolean> {
  const token = getAuthTokenCookie();
  console.log(token);
  if (!token) return false;
  try {
    const res = await axios.get("http://localhost:3001/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
      validateStatus: () => true,
    });
    console.log(res);
    return res.status === 200 && Boolean(res.data?.ok);
  } catch {
    return false;
  }
}
