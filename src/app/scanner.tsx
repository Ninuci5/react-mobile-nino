import {
  Camera,
  CameraView,
  type BarcodeScanningResult,
  type BarcodeType,
  type PermissionResponse,
} from "expo-camera";
import { useFocusEffect, useIsFocused } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { AppState, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const barcodeTypes: BarcodeType[] = [
  "qr", "ean13", "ean8", "upc_a", "upc_e", "code128",
  "code39", "code93", "itf14", "codabar", "datamatrix", "pdf417", "aztec",
];

type PermissionState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; permission: PermissionResponse };

export default function Scanner() {
  const isFocused = useIsFocused();
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  const [permissionState, setPermissionState] = useState<PermissionState>({ status: "loading" });
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [result, setResult] = useState<Pick<BarcodeScanningResult, "data" | "type"> | null>(null);
  const scanned = useRef(false);

  const refreshPermission = useCallback(async () => {
    try {
      const permission = await Camera.getCameraPermissionsAsync();
      setPermissionState({ status: "ready", permission });
    } catch {
      setPermissionState({ status: "error" });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setAppActive(AppState.currentState === "active");
      void refreshPermission();
      const subscription = AppState.addEventListener("change", (state) => {
        setAppActive(state === "active");
        if (state === "active") void refreshPermission();
      });
      return () => subscription.remove();
    }, [refreshPermission])
  );

  async function requestPermission() {
    setRequesting(true);
    setError(null);
    try {
      const permission = await Camera.requestCameraPermissionsAsync();
      setPermissionState({ status: "ready", permission });
    } catch {
      setError("Unable to request camera permission. Please try again.");
    } finally {
      setRequesting(false);
    }
  }

  async function openSettings() {
    try {
      await Linking.openSettings();
    } catch {
      setError("Unable to open settings. Please enable camera access in your device settings.");
    }
  }

  function onBarcodeScanned({ data, type }: BarcodeScanningResult) {
    if (scanned.current) return;
    scanned.current = true;
    setResult({ data, type });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Scan a barcode or QR code</Text>
      {permissionState.status === "loading" ? (
        <Text>Checking camera permission...</Text>
      ) : permissionState.status === "error" ? (
        <View>
          <Text accessibilityRole="alert">Unable to check camera permission.</Text>
          <Pressable accessibilityRole="button" onPress={() => { void refreshPermission(); }} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      ) : !permissionState.permission.granted ? (
        <View>
          <Text>Camera access is needed to scan codes.</Text>
          {Platform.OS === "web" && permissionState.permission.status === "denied" && (
            <Text style={styles.message}>Enable camera access in your browser site settings, then try again.</Text>
          )}
          {permissionState.permission.canAskAgain ? (
            <Pressable accessibilityRole="button" disabled={requesting} accessibilityState={{ disabled: requesting }} onPress={() => { void requestPermission(); }} style={styles.button}>
              <Text style={styles.buttonText}>{requesting ? "Requesting..." : "Allow camera access"}</Text>
            </Pressable>
          ) : Platform.OS === "web" ? (
            <Text style={styles.message}>Enable camera access in your browser site settings, then return to this page.</Text>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => { void openSettings(); }} style={styles.button}>
              <Text style={styles.buttonText}>Open settings</Text>
            </Pressable>
          )}
        </View>
      ) : result ? (
        <View>
          <Text accessibilityRole="header" style={styles.resultTitle}>Scanned code</Text>
          <Text>Type: {result.type}</Text>
          <Text selectable style={styles.result}>{result.data}</Text>
          <Pressable accessibilityRole="button" onPress={() => { scanned.current = false; setResult(null); }} style={styles.button}>
            <Text style={styles.buttonText}>Scan again</Text>
          </Pressable>
        </View>
      ) : cameraError ? (
        <View>
          <Text accessibilityRole="alert">Unable to start the camera. Check that a camera is available and try again.</Text>
          <Pressable accessibilityRole="button" onPress={() => setCameraError(false)} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.message}>Point your camera at a barcode or QR code.</Text>
          {isFocused && appActive && (
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes }}
              onBarcodeScanned={onBarcodeScanned}
              onMountError={() => setCameraError(true)}
            />
          )}
        </>
      )}
      {error && <Text style={styles.error} accessibilityRole="alert">{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: "600", marginBottom: 16 },
  message: { marginTop: 12, marginBottom: 12 },
  camera: { width: "100%", height: 360, backgroundColor: "#000", borderRadius: 8, overflow: "hidden" },
  resultTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  result: { fontSize: 16, marginTop: 8 },
  button: { alignSelf: "flex-start", backgroundColor: "#1565c0", borderRadius: 6, padding: 14, marginTop: 16 },
  buttonText: { color: "#fff", fontWeight: "600" },
  error: { color: "#b00020", marginTop: 12 },
});
