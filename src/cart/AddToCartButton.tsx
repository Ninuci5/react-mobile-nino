import { Pressable, StyleSheet, Text } from "react-native";
import type { Product } from "../products/product";
import { useAppDispatch, useAppSelector } from "./hooks";
import { addItem } from "./store";

export function AddToCartButton({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const ready = useAppSelector((state) => state.cart.status === "ready");
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Add ${product.title} to cart`}
      accessibilityState={{ disabled: !ready }}
      disabled={!ready}
      onPress={() => dispatch(addItem(product))}
      style={[styles.button, !ready && styles.disabled]}
    >
      <Text style={styles.text}>Add to cart</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: "#1565c0", borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, alignSelf: "flex-start" },
  disabled: { opacity: 0.5 },
  text: { color: "#fff", fontWeight: "600" },
});
