import { Link } from "expo-router";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSession } from "../auth/session";

type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
};

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "number" && Number.isFinite(product.id)
    && typeof product.title === "string" && product.title.trim().length > 0
    && typeof product.price === "number" && Number.isFinite(product.price) && product.price >= 0
    && typeof product.image === "string" && product.image.startsWith("https://");
}

export default function Index() {
  const { session, isLoading, storageError, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productsAttempt, setProductsAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadProducts() {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const response = await fetch("https://fakestoreapi.com/products", { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(isProduct)) throw new Error("Invalid product response");
        if (active) setProducts(data);
      } catch {
        if (active) setProductsError("Unable to load products. Please try again.");
      } finally {
        if (active) setProductsLoading(false);
      }
    }

    void loadProducts();
    return () => {
      active = false;
      controller.abort();
    };
  }, [productsAttempt]);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} accessibilityRole="header">
          Home
        </Text>
        {!isLoading &&
          (session ? (
            <View style={styles.account}>
              <Text>Signed in</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSigningOut }}
                disabled={isSigningOut}
                onPress={() => {
                  void handleSignOut();
                }}
              >
                <Text style={styles.loginLink}>
                  {isSigningOut ? "Logging out..." : "Log out"}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.account}>
              <Link href="/login" asChild>
                <Pressable accessibilityRole="button">
                  <Text style={styles.loginLink}>Log in</Text>
                </Pressable>
              </Link>
              <Link href="/register" asChild>
                <Pressable accessibilityRole="button">
                  <Text style={styles.loginLink}>Register</Text>
                </Pressable>
              </Link>
            </View>
          ))}
      </View>
      <View style={styles.content}>
        {isLoading && <Text>Loading session...</Text>}
        {storageError && <Text accessibilityRole="alert">{storageError}</Text>}
        <Text style={styles.sectionTitle} accessibilityRole="header">Products</Text>
        {productsLoading ? (
          <Text>Loading products...</Text>
        ) : productsError ? (
          <View>
            <Text accessibilityRole="alert">{productsError}</Text>
            <Pressable accessibilityRole="button" onPress={() => setProductsAttempt((attempt) => attempt + 1)}>
              <Text style={styles.retry}>Try again</Text>
            </Pressable>
          </View>
        ) : products.length === 0 ? (
          <Text>No products available.</Text>
        ) : (
          <View style={styles.products}>
            {products.map((product) => (
              <View key={product.id} style={styles.product}>
                <Image source={{ uri: product.image }} style={styles.productImage} contentFit="contain" accessibilityLabel={product.title} />
                <View style={styles.productDetails}>
                  <Text style={styles.productTitle}>{product.title}</Text>
                  <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#888",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  account: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginLink: {
    color: "#1565c0",
    fontSize: 16,
    padding: 8,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
  },
  products: {
    gap: 12,
  },
  product: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
  },
  productImage: {
    width: 90,
    height: 110,
    backgroundColor: "#fff",
    borderRadius: 4,
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
  },
  retry: {
    color: "#1565c0",
    fontSize: 16,
    paddingVertical: 12,
  },
});
