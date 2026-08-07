import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts, spacing } from "@/config/theme";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { AppIcon } from "@/ui/AppIcon";
import { BrandLogo } from "@/ui/BrandLogo";
import { Button } from "@/ui/Button";
import { PasswordToggle } from "@/ui/PasswordToggle";
import { TextField } from "@/ui/TextField";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
}

export function SignUpScreen() {
  const { signUp } = useAuth();
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureEntry, setSecureEntry] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) {
      next.username = t("auth.usernameRequired");
    }

    if (!cleanEmail) {
      next.email = t("auth.emailRequired");
    } else if (!emailPattern.test(cleanEmail)) {
      next.email = t("auth.invalidEmail");
    }

    if (!password) {
      next.password = t("auth.passwordRequired");
    } else if (password.length < 8) {
      next.password = t("auth.shortPassword");
    }

    return next;
  }

  function clearError(field: keyof FieldErrors) {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
    if (formError) {
      setFormError(null);
    }
  }

  async function handleSubmit() {
    const nextErrors = validate();
    setErrors(nextErrors);

    if (nextErrors.username || nextErrors.email || nextErrors.password) {
      return;
    }

    setSubmitting(true);
    setFormError(null);
    const result = await signUp(username.trim(), email.trim(), password);
    setSubmitting(false);

    if (result?.error) {
      setFormError(result.error);
      return;
    }

    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <BrandLogo />

          <View style={styles.form}>
            <TextField
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                clearError("email");
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder={t("auth.email")}
              error={errors.email}
              left={<AppIcon library="FontAwesome" name="envelope" size={22} color={colors.mutedText} />}
            />

            <TextField
              value={username}
              onChangeText={(value) => {
                setUsername(value);
                clearError("username");
              }}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t("auth.username")}
              error={errors.username}
              left={<AppIcon library="FontAwesome" name="user" size={22} color={colors.mutedText} />}
            />

            <TextField
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                clearError("password");
              }}
              placeholder={t("auth.password")}
              secureTextEntry={secureEntry}
              error={errors.password}
              left={<AppIcon library="FontAwesome5" name="lock" size={22} color={colors.mutedText} />}
              right={<PasswordToggle secure={secureEntry} onChange={setSecureEntry} />}
            />

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Button
              label={submitting ? t("auth.signingUp") : t("auth.signUp")}
              disabled={submitting}
              onPress={handleSubmit}
              style={styles.submitButton}
            />

            <Link asChild href="/(auth)/sign-in">
              <Button label={t("auth.haveAccount")} variant="ghost" />
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  form: {
    gap: spacing.md,
    marginTop: spacing.xxl,
    width: "100%",
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  formError: {
    color: colors.danger,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textAlign: "center",
  },
});
