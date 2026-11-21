import { Stack } from "expo-router";
import { SessionProvider } from "../auth/session";
import { CartProvider } from "../cart/CartProvider";

export default function RootLayout() {
  return (
    <SessionProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen name="index" options={{ title: "Index" }} />
          <Stack.Screen name="login" options={{ title: "Login" }} />
          <Stack.Screen name="register" options={{ title: "Register" }} />
        </Stack>
      </CartProvider>
    </SessionProvider>
  );
}
