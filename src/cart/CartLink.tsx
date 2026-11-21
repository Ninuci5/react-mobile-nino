import { Link } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { ActionLabel } from "../components/ActionLabel";
import { useAppSelector } from "./hooks";

export function CartLink() {
  const { count, ready } = useAppSelector((state) => ({
    count: state.cart.items.reduce((total, item) => total + item.quantity, 0),
    ready: state.cart.status === "ready",
  }), (left, right) => left.count === right.count && left.ready === right.ready);
  const label = ready ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart";
  return (
    <Link href="/cart" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={label} style={styles.link}>
        <ActionLabel label={ready ? `Cart (${count})` : "Cart"} icon={{ ios: "cart", android: "shopping_cart", web: "shopping_cart" }} />
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: { paddingHorizontal: 5, paddingVertical: 8, minHeight: 44, justifyContent: "center" },
});
