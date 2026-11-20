import { Stack } from "expo-router";
import { SessionProvider } from "../auth/session";

export default function RootLayout() {
  return (
    <SessionProvider>
      <Stack />
    </SessionProvider>
  );
}
