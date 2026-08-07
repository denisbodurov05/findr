import { Pressable } from "react-native";

import { colors } from "@/config/theme";
import { useTranslation } from "@/providers/I18nProvider";
import { AppIcon } from "@/ui/AppIcon";

interface PasswordToggleProps {
  secure: boolean;
  onChange: (secure: boolean) => void;
}

export function PasswordToggle({ secure, onChange }: PasswordToggleProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityLabel={secure ? t("auth.showPassword") : t("auth.hidePassword")}
      onPress={() => onChange(!secure)}
      hitSlop={10}
    >
      <AppIcon
        library="Feather"
        name={secure ? "eye" : "eye-off"}
        size={22}
        color={colors.mutedText}
      />
    </Pressable>
  );
}
