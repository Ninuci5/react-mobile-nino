import { yupResolver } from "@hookform/resolvers/yup";
import { Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as yup from "yup";
import { formStyles as styles } from "../auth/formStyles";
import {
  clearRememberedLogin,
  readRememberedLogin,
  saveRememberedLogin,
} from "../auth/rememberedLogin";
import { useSession } from "../auth/session";

const schema = yup.object({
  username: yup.string().trim().required("Username is required."),
  password: yup.string().required("Password is required."),
});

type LoginValues = yup.InferType<typeof schema>;

export default function Login() {
  const { session, isLoading, saveSession } = useSession();
  const [remember, setRemember] = useState(false);
  const [rememberLoading, setRememberLoading] = useState(true);
  const [rememberUpdating, setRememberUpdating] = useState(false);
  const [rememberError, setRememberError] = useState<string | null>(null);
  const [rememberUnavailable, setRememberUnavailable] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    let active = true;
    readRememberedLogin()
      .then((saved) => {
        if (active && saved) {
          setRemember(true);
          setValue("username", saved.username);
          if (saved.password !== undefined)
            setValue("password", saved.password);
        }
      })
      .catch(() => {
        if (active) {
          setRememberUnavailable(true);
          setRememberError(
            "Unable to load saved login details. Restart the app to try again.",
          );
        }
      })
      .finally(() => {
        if (active) setRememberLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setValue]);

  async function toggleRemember() {
    setRememberUpdating(true);
    try {
      if (remember) {
        await clearRememberedLogin();
      } else {
        await saveRememberedLogin();
      }
      setRemember(!remember);
      setRememberError(null);
    } catch {
      setRememberError("Unable to update Remember me. Please try again.");
    } finally {
      setRememberUpdating(false);
    }
  }

  async function onSubmit(values: LoginValues) {
    let response: Response;
    try {
      response = await fetch("https://fakestoreapi.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      setError("root", {
        message: "Unable to connect. Check your connection and try again.",
      });
      return;
    }

    if (!response.ok) {
      setError("root", {
        message:
          response.status === 400 || response.status === 401
            ? "Invalid username or password."
            : `Login failed (HTTP ${response.status}). Please try again.`,
      });
      return;
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      setError("root", {
        message: "The login service returned an invalid response.",
      });
      return;
    }
    if (
      typeof data !== "object" ||
      data === null ||
      !("token" in data) ||
      typeof data.token !== "string" ||
      !data.token.trim()
    ) {
      setError("root", {
        message: "The login service did not return a valid token.",
      });
      return;
    }

    if (remember) {
      try {
        await saveRememberedLogin(values);
      } catch {
        setError("root", {
          message: "Unable to save your login details. Please try again.",
        });
        return;
      }
    }

    try {
      await saveSession(data.token);
    } catch {
      setError("root", {
        message: "Unable to save your session. Please try again.",
      });
      return;
    }
    router.dismissTo("/");
  }

  if (isLoading || rememberLoading)
    return <Text style={styles.loading}>Loading session...</Text>;
  if (session) return <Redirect href="/" />;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title} accessibilityRole="header">
        Log in
      </Text>
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
        {errors.username && (
          <Text style={styles.error} accessibilityRole="alert">
            {errors.username.message}
          </Text>
        )}
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
        {errors.password && (
          <Text style={styles.error} accessibilityRole="alert">
            {errors.password.message}
          </Text>
        )}
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel="Remember me"
        accessibilityState={{
          checked: remember,
          disabled: rememberUnavailable || rememberUpdating || isSubmitting,
        }}
        aria-checked={remember}
        disabled={rememberUnavailable || rememberUpdating || isSubmitting}
        onPress={() => {
          void toggleRemember();
        }}
        style={checkboxStyles.row}
      >
        <View style={checkboxStyles.box}>
          {remember && <View style={checkboxStyles.checked} />}
        </View>
        <Text>Remember me</Text>
      </Pressable>
      {Platform.OS === "web" && (
        <Text style={styles.description}>
          Use your browser&apos;s password manager to save your password.
        </Text>
      )}
      {rememberError && (
        <Text style={styles.error} accessibilityRole="alert">
          {rememberError}
        </Text>
      )}
      {errors.root && (
        <Text style={styles.error} accessibilityRole="alert">
          {errors.root.message}
        </Text>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isSubmitting || rememberUpdating }}
        disabled={isSubmitting || rememberUpdating}
        onPress={() => {
          void handleSubmit(onSubmit)();
        }}
        style={[styles.button, isSubmitting && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const checkboxStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    marginBottom: 8,
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 4,
    padding: 3,
    marginRight: 10,
  },
  checked: { flex: 1, backgroundColor: "#1565c0", borderRadius: 1 },
});
