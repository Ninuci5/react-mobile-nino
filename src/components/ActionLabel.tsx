import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  label: string;
  icon: ComponentProps<typeof SymbolView>["name"];
};

export function ActionLabel({ label, icon }: Props) {
  return (
    <View style={styles.content}>
      <SymbolView
        name={icon}
        size={18}
        tintColor="#1565c0"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexDirection: "row", alignItems: "center", gap: 4 },
  text: { color: "#1565c0", fontSize: 16 },
});
