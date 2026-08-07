import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/config/theme";
import { AppIcon } from "@/ui/AppIcon";

export function BrandLogo() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>F</Text>
      <View style={styles.icon}>
        <AppIcon library="FontAwesome" name="map-marker" size={30} color={colors.danger} />
      </View>
      <Text style={styles.text}>NDR</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  text: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 32,
  },
  icon: {
    transform: [{ translateY: 3 }],
  },
});
