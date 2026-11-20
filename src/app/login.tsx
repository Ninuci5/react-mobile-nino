import { yupResolver } from "@hookform/resolvers/yup";
import { Redirect, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as yup from "yup";
import { formStyles as styles } from "../auth/formStyles";
import { useSession } from "../auth/session";

const schema = yup.object({
  username: yup.string().trim().required("Username is required."),
  password: yup.string().required("Password is required."),
});

type LoginValues = yup.InferType<typeof schema>;

export default function Login() {
  const { session, isLoading, saveSession } = useSession();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    let response: Response;
    try {
      response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      setError("root", { message: "Unable to connect. Check your connection and try again." });
      return;
    }

    if (!response.ok) {
      setError("root", {
        message: response.status === 400 || response.status === 401
          ? "Invalid username or password."
          : `Login failed (HTTP ${response.status}). Please try again.`,
      });
      return;
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      setError("root", { message: "The login service returned an invalid response." });
      return;
    }
    if (
      typeof data !== "object" || data === null || !("token" in data) ||
      typeof data.token !== "string" || !data.token.trim()
    ) {
      setError("root", { message: "The login service did not return a valid token." });
      return;
    }

    try {
      await saveSession(data.token);
    } catch {
      setError("root", { message: "Unable to save your session. Please try again." });
      return;
    }
    router.dismissTo("/");
  }

  if (isLoading) return <Text style={styles.loading}>Loading session...</Text>;
  if (session) return <Redirect href="/" />;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">Log in</Text>
      <Text style={styles.description}>Use a Fake Store API test account, not a real password.</Text>
      <View style={styles.field}>
        <Text style={styles.label}>Username</Text>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
        />
        {errors.username && <Text style={styles.error} accessibilityRole="alert">{errors.username.message}</Text>}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={styles.input}
            />
          )}
        />
        {errors.password && <Text style={styles.error} accessibilityRole="alert">{errors.password.message}</Text>}
      </View>
      {errors.root && <Text style={styles.error} accessibilityRole="alert">{errors.root.message}</Text>}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting }}
        disabled={isSubmitting}
        onPress={() => { void handleSubmit(onSubmit)(); }}
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>{isSubmitting ? "Logging in..." : "Log in"}</Text>
      </Pressable>
    </ScrollView>
  );
}

