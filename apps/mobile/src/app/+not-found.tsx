import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, spacing } from "@/config/theme";
import { useTranslation } from "@/providers/I18nProvider";

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{t("notFound.title")}</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>{t("notFound.home")}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  link: {
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
  },
  linkText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});
