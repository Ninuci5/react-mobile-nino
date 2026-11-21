import { Image } from "expo-image";
import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "../cart/hooks";
import { addItem, decreaseItem, removeItem } from "../cart/store";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.cart);
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "Cart" }} />
      <Text style={styles.title} accessibilityRole="header">Cart</Text>
      {status === "idle" || status === "loading" ? (
        <Text>Loading cart...</Text>
      ) : status === "error" ? (
        <Text>Your cart is unavailable until it can be loaded.</Text>
      ) : items.length === 0 ? (
        <View>
          <Text>Your cart is empty.</Text>
          <Link href="/" style={styles.continue}>Continue shopping</Link>
        </View>
      ) : (
        <>
          {items.map(({ product, quantity }) => (
            <View style={styles.item} key={product.id}>
              <Link href={{ pathname: "/products/[id]", params: { id: String(product.id) } }} asChild>
                <Pressable accessibilityLabel={`View ${product.title}`} style={styles.product}>
                  <Image source={{ uri: product.image }} style={styles.image} contentFit="contain" accessibilityLabel={product.title} />
                  <View style={styles.details}>
                    <Text style={styles.productTitle}>{product.title}</Text>
                    <Text>${product.price.toFixed(2)} each</Text>
                  </View>
                </Pressable>
              </Link>
              <View style={styles.controls}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Decrease quantity of ${product.title}`} onPress={() => dispatch(decreaseItem(product.id))} style={styles.control}>
                  <Text style={styles.controlText}>−</Text>
                </Pressable>
                <Text accessibilityLabel={`Quantity ${quantity}`}>{quantity}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel={`Increase quantity of ${product.title}`} onPress={() => dispatch(addItem(product))} style={styles.control}>
                  <Text style={styles.controlText}>+</Text>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${product.title} from cart`} onPress={() => dispatch(removeItem(product.id))} style={styles.control}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
              <Text style={styles.subtotal}>Subtotal: ${(product.price * quantity).toFixed(2)}</Text>
            </View>
          ))}
          <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 16 },
  item: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#aaa", borderRadius: 8, padding: 12, marginBottom: 12 },
  product: { flexDirection: "row", alignItems: "center" },
  image: { width: 75, height: 90, backgroundColor: "#fff", borderRadius: 4 },
  details: { flex: 1, marginLeft: 12 },
  productTitle: { fontSize: 16, fontWeight: "500", marginBottom: 8 },
  controls: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", marginTop: 8 },
  control: { minWidth: 44, minHeight: 44, padding: 10, alignItems: "center", justifyContent: "center" },
  controlText: { color: "#1565c0", fontSize: 22 },
  remove: { color: "#b00020" },
  subtotal: { fontWeight: "600", marginTop: 4 },
  total: { fontSize: 20, fontWeight: "600", marginTop: 8 },
  continue: { color: "#1565c0", paddingVertical: 12, fontSize: 16 },
});
