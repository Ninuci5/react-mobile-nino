import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, StyleSheet, View } from "react-native";
import { useSession } from "../auth/session";

export default function Index() {
  const { session, isLoading, storageError, signOut } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        {!isLoading && (session ? (
          <View style={styles.account}>
            <Text>Signed in</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isSigningOut }}
              disabled={isSigningOut}
              onPress={() => { void handleSignOut(); }}
            >
              <Text style={styles.loginLink}>{isSigningOut ? "Logging out..." : "Log out"}</Text>
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
        <Text>Edit src/app/index.tsx to edit this screen.</Text>
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
