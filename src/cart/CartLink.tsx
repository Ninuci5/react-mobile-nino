import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
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
        <Text style={styles.text}>{ready ? `Cart (${count})` : "Cart"}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  link: { padding: 8, minHeight: 44, justifyContent: "center" },
  text: { color: "#1565c0", fontSize: 16 },
});
