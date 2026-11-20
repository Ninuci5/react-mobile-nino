import { StyleSheet } from "react-native";

export const formStyles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24 },
  loading: { padding: 24 },
  title: { fontSize: 24, fontWeight: "600", marginBottom: 8 },
  description: { marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#888", borderRadius: 6, padding: 12, fontSize: 16 },
  error: { color: "#b00020", marginTop: 6, marginBottom: 8 },
  button: { backgroundColor: "#1565c0", borderRadius: 6, padding: 14, alignItems: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
