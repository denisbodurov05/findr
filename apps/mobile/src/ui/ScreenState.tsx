import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/config/theme";
import { Loader } from "@/ui/Loader";

interface ScreenStateProps {
  title: string;
  message?: string;
  loading?: boolean;
}

export function ScreenState({ title, message, loading = false }: ScreenStateProps) {
  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loader}>
          <Loader />
        </View>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  loader: {
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    textAlign: "center",
  },
  message: {
    color: colors.mutedText,
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
