import { useEffect, useState, type PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppDispatch, useAppSelector } from "./hooks";
import { createCartStore, loadCart, retrySave } from "./store";

function CartStorageStatus() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.cart.status);
  const saveError = useAppSelector((state) => state.cart.saveError);

  useEffect(() => {
    void dispatch(loadCart());
  }, [dispatch]);

  if (status !== "error" && !saveError) return null;
  return (
    <View style={styles.notice}>
      <Text accessibilityRole="alert">
        {status === "error" ? "Unable to load your saved cart." : "Unable to save your cart. Changes may be lost."}
      </Text>
      <Pressable accessibilityRole="button" onPress={() => {
        if (status === "error") void dispatch(loadCart());
        else dispatch(retrySave());
      }}>
        <Text style={styles.retry}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function CartProvider({ children }: PropsWithChildren) {
  const [store] = useState(createCartStore);
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <CartStorageStatus />
        {children}
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  notice: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#fff2cc" },
  retry: { color: "#1565c0", paddingVertical: 8 },
});
