import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEY = "auth.rememberedLogin";

type Credentials = { username: string; password: string };
type RememberedLogin = { username: string; password?: string };

export async function readRememberedLogin(): Promise<RememberedLogin | null> {
  const stored = Platform.OS === "web"
    ? localStorage.getItem(KEY)
    : await SecureStore.getItemAsync(KEY);
  if (stored === null) return null;

  const value: unknown = JSON.parse(stored);
  if (
    typeof value !== "object" || value === null ||
    !("username" in value) || typeof value.username !== "string" ||
    ("password" in value && typeof value.password !== "string")
  ) {
    throw new Error("Invalid remembered login");
  }
  return {
    username: value.username,
    ...(Platform.OS !== "web" && "password" in value && typeof value.password === "string"
      ? { password: value.password }
      : {}),
  };
}

export async function saveRememberedLogin(credentials?: Credentials): Promise<void> {
  const username = credentials?.username ?? "";
  if (Platform.OS === "web") {
    localStorage.setItem(KEY, JSON.stringify({ username }));
  } else {
    await SecureStore.setItemAsync(KEY, JSON.stringify({
      username,
      password: credentials?.password ?? "",
    }));
  }
}

export async function clearRememberedLogin(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(KEY);
  } else {
    await SecureStore.deleteItemAsync(KEY);
  }
}
