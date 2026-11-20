import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const SESSION_KEY = "auth.session";

type SessionContextValue = {
  session: string | null;
  isLoading: boolean;
  storageError: string | null;
  saveSession: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function readSession(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(SESSION_KEY);
  }
  return SecureStore.getItemAsync(SESSION_KEY);
}

async function writeSession(token: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(SESSION_KEY, token);
  } else {
    await SecureStore.setItemAsync(SESSION_KEY, token);
  }
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readSession()
      .then((token) => {
        if (active) setSession(token);
      })
      .catch(() => {
        if (active) setStorageError("Unable to restore your saved session.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function saveSession(token: string) {
    await writeSession(token);
    setSession(token);
    setStorageError(null);
  }

  async function signOut() {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(SESSION_KEY);
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
      setSession(null);
      setStorageError(null);
    } catch {
      setStorageError("Unable to log out. Please try again.");
    }
  }

  return (
    <SessionContext.Provider value={{ session, isLoading, storageError, saveSession, signOut }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used within SessionProvider");
  return context;
}
