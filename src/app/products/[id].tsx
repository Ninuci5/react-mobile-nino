import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { isProductDetail, type ProductDetail } from "../../products/product";

type DetailState =
  | { status: "loading" }
  | { status: "error"; id: string; message: string; retry: boolean }
  | { status: "loaded"; id: string; product: ProductDetail };

export default function ProductPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state, setState] = useState<DetailState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const validId = typeof id === "string" && /^[1-9]\d*$/.test(id) && Number.isSafeInteger(Number(id));

  useEffect(() => {
    if (!validId) return;

    const controller = new AbortController();
    let active = true;

    async function loadProduct() {
      setState({ status: "loading" });
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`, { signal: controller.signal });
        if (response.status === 404) {
          if (active) setState({ status: "error", id, message: "Product not found.", retry: false });
          return;
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const body = await response.text();
        if (!body.trim()) {
          if (active) setState({ status: "error", id, message: "Product not found.", retry: false });
          return;
        }
        const data: unknown = JSON.parse(body);
        if (data === null) {
          if (active) setState({ status: "error", id, message: "Product not found.", retry: false });
          return;
        }
        if (!isProductDetail(data) || data.id !== Number(id)) throw new Error("Invalid product response");
        if (active) setState({ status: "loaded", id, product: data });
      } catch {
        if (active) setState({ status: "error", id, message: "Unable to load product. Please try again.", retry: true });
      }
    }

    void loadProduct();
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, validId, attempt]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: "Product details" }} />
      {!validId ? (
        <Text accessibilityRole="alert">Invalid product ID.</Text>
      ) : state.status === "loading" || state.id !== id ? (
        <Text>Loading product...</Text>
      ) : state.status === "error" ? (
        <View>
          <Text accessibilityRole="alert">{state.message}</Text>
          {state.retry && (
            <Pressable accessibilityRole="button" onPress={() => setAttempt((value) => value + 1)}>
              <Text style={styles.retry}>Try again</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <>
          <Image source={{ uri: state.product.image }} style={styles.image} contentFit="contain" accessibilityLabel={state.product.title} />
          <Text style={styles.title} accessibilityRole="header">{state.product.title}</Text>
          <Text style={styles.price}>${state.product.price.toFixed(2)}</Text>
          <Text style={styles.category}>{state.product.category}</Text>
          <Text style={styles.rating}>Rating: {state.product.rating.rate} / 5 ({state.product.rating.count} reviews)</Text>
          <Text style={styles.description}>{state.product.description}</Text>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  image: { width: "100%", height: 280, backgroundColor: "#fff", borderRadius: 8, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 12 },
  price: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
  category: { fontSize: 16, marginBottom: 8 },
  rating: { fontSize: 16, marginBottom: 16 },
  description: { fontSize: 16, lineHeight: 24 },
  retry: { color: "#1565c0", fontSize: 16, paddingVertical: 12 },
});
