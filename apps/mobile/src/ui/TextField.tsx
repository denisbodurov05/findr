import { ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { colors, fonts, radius, spacing } from "@/config/theme";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  left?: ReactNode;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  error?: string;
}

export function TextField({ left, right, inputStyle, style, error, ...props }: TextFieldProps) {
  return (
    <View style={style}>
      <View style={[styles.container, error ? styles.containerError : null]}>
        {left ? <View style={styles.side}>{left}</View> : null}
        <TextInput
          {...props}
          placeholderTextColor={colors.mutedText}
          style={[
            styles.input,
            left ? styles.inputWithLeft : null,
            right ? styles.inputWithRight : null,
            inputStyle,
          ]}
        />
        {right ? <View style={styles.side}>{right}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 48,
    overflow: "hidden",
    width: "100%",
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: spacing.md,
  },
  inputWithLeft: {
    paddingLeft: 0,
  },
  inputWithRight: {
    paddingRight: 0,
  },
  side: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 44,
  },
  containerError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginLeft: spacing.md,
    marginTop: spacing.xs,
  },
});
