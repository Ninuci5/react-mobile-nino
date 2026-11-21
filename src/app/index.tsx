import { Image } from "expo-image";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSession } from "../auth/session";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CartLink } from "../cart/CartLink";
import { ActionLabel } from "../components/ActionLabel";
import { isProduct, type Product } from "../products/product";

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
        const response = await fetch("https://fakestoreapi.com/products", {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data: unknown = await response.json();
        if (!Array.isArray(data) || !data.every(isProduct))
          throw new Error("Invalid product response");
        if (active) setProducts(data);
      } catch {
        if (active)
          setProductsError("Unable to load products. Please try again.");
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
        <Link href="/scanner" asChild>
          <Pressable accessibilityRole="button" accessibilityLabel="Scan" style={styles.headerAction}>
            <ActionLabel label="Scan" icon={{ ios: "qrcode.viewfinder", android: "qr_code_scanner", web: "qr_code_scanner" }} />
          </Pressable>
        </Link>
        <CartLink />
        {!isLoading &&
          (session ? (
            <View style={styles.account}>
              <Text>Signed in</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={isSigningOut ? "Logging out" : "Log out"}
                accessibilityState={{ disabled: isSigningOut }}
                disabled={isSigningOut}
                style={styles.headerAction}
                onPress={() => {
                  void handleSignOut();
                }}
              >
                <ActionLabel
                  label={isSigningOut ? "Logging out..." : "Log out"}
                  icon={{ ios: "rectangle.portrait.and.arrow.right", android: "logout", web: "logout" }}
                />
              </Pressable>
            </View>
          ) : (
            <View style={styles.account}>
              <Link href="/login" asChild>
                <Pressable accessibilityRole="button" accessibilityLabel="Log in" style={styles.headerAction}>
                  <ActionLabel label="Log in" icon={{ ios: "rectangle.portrait.and.arrow.forward", android: "login", web: "login" }} />
                </Pressable>
              </Link>
              <Link href="/register" asChild>
                <Pressable accessibilityRole="button" accessibilityLabel="Register" style={styles.headerAction}>
                  <ActionLabel label="Register" icon={{ ios: "person.badge.plus", android: "person_add", web: "person_add" }} />
                </Pressable>
              </Link>
            </View>
          ))}
      </View>
      <View style={styles.content}>
        {isLoading && <Text>Loading session...</Text>}
        {storageError && <Text accessibilityRole="alert">{storageError}</Text>}
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Products
        </Text>
        {productsLoading ? (
          <Text>Loading products...</Text>
        ) : productsError ? (
          <View>
            <Text accessibilityRole="alert">{productsError}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setProductsAttempt((attempt) => attempt + 1)}
            >
              <Text style={styles.retry}>Try again</Text>
            </Pressable>
          </View>
        ) : products.length === 0 ? (
          <Text>No products available.</Text>
        ) : (
          <View style={styles.products}>
            {products.map((product) => (
              <View key={product.id} style={styles.product}>
                <Link
                  href={{
                    pathname: "/products/[id]",
                    params: { id: String(product.id) },
                  }}
                  asChild
                >
                  <Pressable
                    style={styles.productLink}
                    accessibilityLabel={`View ${product.title}`}
                  >
                    <Image
                      source={{ uri: product.image }}
                      style={styles.productImage}
                      contentFit="contain"
                      accessibilityLabel={product.title}
                    />
                    <View style={styles.productDetails}>
                      <Text style={styles.productTitle}>{product.title}</Text>
                      <Text style={styles.price}>
                        ${product.price.toFixed(2)}
                      </Text>
                    </View>
                  </Pressable>
                </Link>
                <AddToCartButton product={product} />
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
    justifyContent: "flex-end",
    flexWrap: "wrap",
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
  headerAction: {
    paddingHorizontal: 5,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
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
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
  },
  productLink: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
