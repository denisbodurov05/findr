import { memo, useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors, fonts, radius, shadows, spacing } from "@/config/theme";
import type { TranslationKey } from "@/i18n/translations";
import { Product } from "@findr/types";
import { useTranslation } from "@/providers/I18nProvider";
import { AppIcon } from "@/ui/AppIcon";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface ProductCardProps {
  product: Product;
  selected: boolean;
  onAdd: (product: Product) => void;
}

export const ProductCard = memo(function ProductCard({ product, selected, onAdd }: ProductCardProps) {
  const { t } = useTranslation();
  const productName = product.nameKey ? t(product.nameKey as TranslationKey) : product.name;
  const selectedProgress = useSharedValue(selected ? 1 : 0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    selectedProgress.set(
      withTiming(selected ? 1 : 0, {
        duration: 220,
      })
    );

    if (selected) {
      pressScale.set(
        withSequence(
          withTiming(0.97, { duration: 70 }),
          withSpring(1, { damping: 12, stiffness: 220 })
        )
      );
    }
  }, [pressScale, selected, selectedProgress]);

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      selectedProgress.get(),
      [0, 1],
      [colors.border, colors.success]
    ),
    transform: [{ scale: pressScale.get() }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectedProgress.get(),
      [0, 1],
      [colors.surface, colors.success]
    ),
    borderColor: interpolateColor(
      selectedProgress.get(),
      [0, 1],
      [colors.primary, colors.success]
    ),
  }));

  const buttonTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      selectedProgress.get(),
      [0, 1],
      [colors.primary, colors.surface]
    ),
  }));

  function handlePressIn() {
    if (!selected) {
      pressScale.set(withTiming(0.985, { duration: 90 }));
    }
  }

  function handlePressOut() {
    pressScale.set(withSpring(1, { damping: 14, stiffness: 220 }));
  }

  function handleAdd() {
    onAdd(product);
  }

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      {product.imageUri ? (
        <Image source={{ uri: product.imageUri }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <AppIcon library="Feather" name="package" size={40} color={colors.mutedText} />
        </View>
      )}
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.name}>
          {productName}
        </Text>
      </View>
      <AnimatedPressable
        disabled={selected}
        onPress={handleAdd}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.addButton, buttonStyle]}
        accessibilityLabel={selected ? t("products.added") : productName}
      >
        <AnimatedText style={[styles.addButtonText, buttonTextStyle]}>
          {selected ? t("products.added") : t("products.addToCart")}
        </AnimatedText>
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    alignItems: "stretch",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: "47.8%",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 236,
    overflow: "hidden",
    ...shadows.sm,
  },
  image: {
    aspectRatio: 1,
    backgroundColor: colors.mutedSurface,
    width: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: colors.mutedSurface,
    justifyContent: "center",
    width: "100%",
  },
  body: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    width: "100%",
  },
  name: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    minHeight: 38,
    textAlign: "left",
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
  },
  addButtonText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
