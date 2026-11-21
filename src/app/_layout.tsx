import { Stack } from "expo-router";
import { SessionProvider } from "../auth/session";
import { CartProvider } from "../cart/CartProvider";

export default function RootLayout() {
  return (
    <SessionProvider>
      <CartProvider>
        <Stack />
      </CartProvider>
    </SessionProvider>
  );
}
