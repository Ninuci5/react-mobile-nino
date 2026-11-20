import { yupResolver } from "@hookform/resolvers/yup";
import { Link, Redirect } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from "react-native";
import * as yup from "yup";
import { formStyles as styles } from "../auth/formStyles";
import { useSession } from "../auth/session";

const schema = yup.object({
  name: yup.string().trim().required("Name is required."),
  surname: yup.string().trim().required("Surname is required."),
  phone: yup.string().trim().required("Phone number is required."),
  email: yup.string().trim().email("Enter a valid email address.").required("Email is required."),
});

type RegistrationValues = yup.InferType<typeof schema>;

const fields: {
  name: keyof RegistrationValues;
  label: string;
  autoComplete: TextInputProps["autoComplete"];
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize: TextInputProps["autoCapitalize"];
}[] = [
  { name: "name", label: "Name", autoComplete: "given-name", autoCapitalize: "words" },
  { name: "surname", label: "Surname", autoComplete: "family-name", autoCapitalize: "words" },
  { name: "phone", label: "Phone number", autoComplete: "tel", keyboardType: "phone-pad", autoCapitalize: "none" },
  { name: "email", label: "Email", autoComplete: "email", keyboardType: "email-address", autoCapitalize: "none" },
];

export default function Register() {
  const { session, isLoading } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", surname: "", phone: "", email: "" },
  });

  async function onSubmit(values: RegistrationValues) {
    let response: Response;
    try {
      response = await fetch("https://fakestoreapi.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: { firstname: values.name, lastname: values.surname },
          phone: values.phone,
          email: values.email,
        }),
      });
    } catch {
      setError("root", { message: "Unable to connect. Check your connection and try again." });
      return;
    }

    if (!response.ok) {
      setError("root", { message: `Registration failed (HTTP ${response.status}). Please try again.` });
      return;
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      setError("root", { message: "The registration service returned an invalid response." });
      return;
    }
    if (typeof data !== "object" || data === null || !("id" in data) || typeof data.id !== "number") {
      setError("root", { message: "The registration service did not return a valid user ID." });
      return;
    }
    setSubmitted(true);
  }

  if (isLoading) return <Text style={styles.loading}>Loading session...</Text>;
  if (session) return <Redirect href="/" />;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title} accessibilityRole="header">Register</Text>
      <Text style={styles.description}>
        Demo only: use fictional details. Fake Store does not save accounts, and this will not create a login.
      </Text>
      {submitted ? (
        <View>
          <Text accessibilityRole="alert">Demo registration submitted. No account was created.</Text>
          <Link href="/">Return home</Link>
        </View>
      ) : (
        <>
          {fields.map(({ name, label, autoComplete, autoCapitalize, keyboardType }) => (
            <View style={styles.field} key={name}>
              <Text style={styles.label}>{label}</Text>
              <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    accessibilityLabel={label}
                    autoComplete={autoComplete}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                    keyboardType={keyboardType}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    style={styles.input}
                  />
                )}
              />
              {errors[name] && <Text style={styles.error} accessibilityRole="alert">{errors[name]?.message}</Text>}
            </View>
          ))}
          {errors.root && <Text style={styles.error} accessibilityRole="alert">{errors.root.message}</Text>}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting }}
            disabled={isSubmitting}
            onPress={() => { void handleSubmit(onSubmit)(); }}
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>{isSubmitting ? "Submitting..." : "Register"}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}
