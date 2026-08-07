import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts, radius, shadows, spacing } from "@/config/theme";
import type { TranslationKey } from "@/i18n/translations";
import { mapLegendSections } from "@/features/map/mapColors";
import { StoreMapCanvas, mapMetrics } from "@/features/map/StoreMapCanvas";
import { useRoutePlan } from "@/features/map/useRoutePlan";
import { useCart } from "@/providers/CartProvider";
import { useTranslation } from "@/providers/I18nProvider";
import { AppIcon } from "@/ui/AppIcon";
import { Button } from "@/ui/Button";
import { ScreenState } from "@/ui/ScreenState";

const minMapScale = 0.68;
const maxMapScale = 3;

function runAfterNextFrame(callback: () => void) {
  requestAnimationFrame(() => {
    setTimeout(callback, 0);
  });
}

export function RoutePlanScreen() {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const savedRotation = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const defaultMapHeight = Math.min(
    windowHeight * 0.68,
    Math.max(mapMetrics.canvasHeight + 96, windowHeight * 0.5)
  );
  const mapHeight = useSharedValue(defaultMapHeight);
  const savedMapHeight = useSharedValue(defaultMapHeight);

  const { clearCart } = useCart();
  const { storeMap, path, loading, error } = useRoutePlan();
  const [legendVisible, setLegendVisible] = useState(false);
  const orderedProducts = useMemo(() => {
    return path?.sorted.filter((product) => product != null) ?? [];
  }, [path]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const maxStepIndex = Math.max(orderedProducts.length - 1, 0);
  const activeStepIndex = Math.min(currentStepIndex, maxStepIndex);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      savedTranslateX.set(translateX.get());
      savedTranslateY.set(translateY.get());
    })
    .onUpdate((event) => {
      translateX.set(savedTranslateX.get() + event.translationX);
      translateY.set(savedTranslateY.get() + event.translationY);
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.set(Math.min(maxMapScale, Math.max(minMapScale, savedScale.get() * event.scale)));
    })
    .onEnd(() => {
      savedScale.set(scale.get());
    });

  const rotationGesture = Gesture.Rotation()
    .onBegin(() => {
      savedRotation.set(rotation.get());
    })
    .onUpdate((event) => {
      rotation.set(savedRotation.get() + event.rotation);
    })
    .onEnd(() => {
      savedRotation.set(rotation.get());
    });

  const dividerGesture = Gesture.Pan()
    .onBegin(() => {
      savedMapHeight.set(mapHeight.get());
    })
    .onUpdate((event) => {
      const minMapHeight = Math.max(240, windowHeight * 0.3);
      const maxMapHeight = Math.max(minMapHeight, windowHeight * 0.68);
      const nextHeight = savedMapHeight.get() + event.translationY;

      mapHeight.set(Math.min(maxMapHeight, Math.max(minMapHeight, nextHeight)));
    });

  const mapGesture = Gesture.Simultaneous(panGesture, pinchGesture, rotationGesture);

  const mapPanStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
    ],
  }));

  const mapTransformStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }, { rotateZ: `${rotation.get()}rad` }],
  }));

  const mapShellStyle = useAnimatedStyle(() => ({
    height: mapHeight.get(),
  }));

  function handleRecenter() {
    scale.set(withTiming(1));
    rotation.set(withTiming(0));
    translateX.set(withTiming(0));
    translateY.set(withTiming(0));
    savedScale.set(1);
    savedRotation.set(0);
    savedTranslateX.set(0);
    savedTranslateY.set(0);
  }

  function handleFinish() {
    router.replace("/(tabs)");
    runAfterNextFrame(clearCart);
  }

  function handlePreviousStep() {
    setCurrentStepIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  }

  function handleNextStep() {
    setCurrentStepIndex((currentIndex) => Math.min(currentIndex + 1, maxStepIndex));
  }

  if (loading) {
    return <ScreenState loading title={t("common.loading")} />;
  }

  if (error) {
    return <ScreenState title={error} />;
  }

  if (!storeMap || !path) {
    return <ScreenState title={t("map.noRouteTitle")} message={t("map.noRouteMessage")} />;
  }

  const canGoBack = activeStepIndex > 0;
  const canGoForward = activeStepIndex < orderedProducts.length - 1;
  const visibleSegmentCount =
    activeStepIndex === orderedProducts.length - 1 ? path.pathfind.length : activeStepIndex + 1;

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <GestureDetector gesture={mapGesture}>
          <Animated.View style={[styles.mapShell, mapShellStyle]}>
            <Text style={styles.distance}>{t("map.distance", { distance: path.distance })}</Text>

            <Animated.View style={[styles.mapContent, mapPanStyle]}>
              <Animated.View style={mapTransformStyle}>
                <StoreMapCanvas
                  storeMap={storeMap}
                  path={path}
                  currentStepIndex={activeStepIndex}
                  visibleSegmentCount={visibleSegmentCount}
                />
              </Animated.View>
            </Animated.View>

            <Button
              accessibilityLabel={t("map.recenter")}
              variant="ghost"
              onPress={handleRecenter}
              icon={
                <AppIcon
                  library="FontAwesome6"
                  name="down-left-and-up-right-to-center"
                  color={colors.text}
                />
              }
              style={styles.recenterButton}
            />
            <Button
              accessibilityLabel={t("map.openLegend")}
              variant="ghost"
              onPress={() => setLegendVisible(true)}
              icon={<AppIcon library="Feather" name="list" color={colors.text} />}
              style={styles.legendButton}
            />
            <View style={styles.mapStepper}>
              <Pressable
                accessibilityLabel={t("map.previousStep")}
                disabled={!canGoBack}
                hitSlop={10}
                onPress={handlePreviousStep}
                style={[styles.stepButton, !canGoBack && styles.stepButtonDisabled]}
              >
                <AppIcon
                  library="Feather"
                  name="chevron-left"
                  size={24}
                  color={canGoBack ? colors.primary : colors.mutedText}
                />
              </Pressable>

              <Text style={styles.stepText}>
                {t("map.routeStep", {
                  current: activeStepIndex + 1,
                  total: orderedProducts.length,
                })}
              </Text>

              <Pressable
                accessibilityLabel={t("map.nextStep")}
                disabled={!canGoForward}
                hitSlop={10}
                onPress={handleNextStep}
                style={[styles.stepButton, !canGoForward && styles.stepButtonDisabled]}
              >
                <AppIcon
                  library="Feather"
                  name="chevron-right"
                  size={24}
                  color={canGoForward ? colors.primary : colors.mutedText}
                />
              </Pressable>
            </View>
            <Button
              accessibilityLabel={t("map.finish")}
              variant="danger"
              onPress={handleFinish}
              icon={<AppIcon library="Ionicons" name="exit-outline" color={colors.surface} />}
              style={styles.finishButton}
            />
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={dividerGesture}>
          <View style={styles.mapDivider}>
            <View style={styles.mapDividerHandle} />
          </View>
        </GestureDetector>

        <ScrollView style={styles.lowerHalf} contentContainerStyle={styles.routeList}>
          <Text style={styles.routeTitle}>{t("map.pickOrder")}</Text>

          {orderedProducts.map((product, index) => {
            const isGolden = product?.isGolden ?? product?.golden ?? false;
            const isLast = index === orderedProducts.length - 1;
            const isCurrent = index === activeStepIndex;
            const productName = product.nameKey
              ? t(product.nameKey as TranslationKey)
              : product.name;

            return (
              <View key={product.productId}>
                <View style={styles.routeStep}>
                  <View style={styles.timelineMarkerCell}>
                    <View style={[styles.timelineCircle, isCurrent && styles.timelineCircleCurrent]}>
                      <Text
                        style={[styles.timelineNumber, isCurrent && styles.timelineNumberCurrent]}
                      >
                        {index + 1}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.productRow, isCurrent && styles.productRowCurrent]}>
                    <Text
                      style={[
                        styles.productText,
                        isCurrent && styles.productTextCurrent,
                        isGolden && styles.goldenProduct,
                      ]}
                    >
                      {productName}
                      {isGolden ? t("map.goldenEggSuffix") : ""}
                    </Text>
                  </View>
                </View>

                {!isLast && (
                  <View style={styles.timelineConnectorRow}>
                    <View style={styles.timelineMarkerCell}>
                      <View style={styles.timelineConnector} />
                    </View>
                    <View style={styles.timelineConnectorSpacer} />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        <Modal
          animationType="fade"
          onRequestClose={() => setLegendVisible(false)}
          transparent
          visible={legendVisible}
        >
          <Pressable style={styles.legendBackdrop} onPress={() => setLegendVisible(false)}>
            <Pressable style={styles.legendModal}>
              <View style={styles.legendHeader}>
                <Text style={styles.legendTitle}>{t("map.legendTitle")}</Text>
                <Pressable
                  accessibilityLabel={t("map.closeLegend")}
                  hitSlop={10}
                  onPress={() => setLegendVisible(false)}
                  style={styles.legendCloseButton}
                >
                  <AppIcon library="Feather" name="x" color={colors.text} size={22} />
                </Pressable>
              </View>

              <View style={styles.legendSections}>
                {mapLegendSections.map((section) => (
                  <View key={section.key} style={styles.legendSection}>
                    <Text style={styles.legendSectionTitle}>{t(section.titleKey)}</Text>
                    <View style={styles.legendGrid}>
                      {section.items.map((item) => (
                        <View key={item.key} style={styles.legendItem}>
                          <View style={styles.legendSwatchFrame}>
                            <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
                          </View>
                          <Text style={styles.legendLabel}>{t(item.labelKey)}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  gestureContainer: {
    flex: 1,
  },
  mapShell: {
    alignItems: "center",
    backgroundColor: "#FBFCFA",
    borderBottomColor: colors.border,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    borderBottomWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  distance: {
    backgroundColor: colors.mutedSurface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 13,
    left: spacing.md,
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: "absolute",
    top: spacing.md,
    zIndex: 2,
  },
  mapContent: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    paddingTop: spacing.xl,
    width: "100%",
  },
  recenterButton: {
    backgroundColor: colors.surface,
    borderColor: colors.strongBorder,
    borderWidth: 1,
    bottom: spacing.md,
    height: 50,
    left: spacing.md,
    position: "absolute",
    width: 50,
    ...shadows.sm,
  },
  legendButton: {
    backgroundColor: colors.surface,
    borderColor: colors.strongBorder,
    borderWidth: 1,
    height: 42,
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    width: 42,
    ...shadows.sm,
  },
  finishButton: {
    backgroundColor: colors.danger,
    borderColor: colors.surface,
    borderWidth: 2,
    bottom: spacing.md,
    height: 50,
    position: "absolute",
    right: spacing.md,
    width: 50,
    ...shadows.sm,
  },
  mapDivider: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderBottomColor: colors.border,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 22,
    justifyContent: "center",
  },
  mapDividerHandle: {
    backgroundColor: colors.strongBorder,
    borderRadius: 2,
    height: 4,
    width: 52,
  },
  lowerHalf: {
    backgroundColor: colors.background,
    flex: 1,
  },
  routeList: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  routeTitle: {
    color: colors.mutedText,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  mapStepper: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.strongBorder,
    borderRadius: radius.md,
    borderWidth: 1,
    bottom: spacing.md,
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
    left: spacing.xxl + 42,
    paddingHorizontal: spacing.sm,
    position: "absolute",
    right: spacing.xxl + 42,
    ...shadows.sm,
  },
  stepButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  stepButtonDisabled: {
    opacity: 0.45,
  },
  stepText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  routeStep: {
    alignItems: "center",
    flexDirection: "row",
  },
  timelineMarkerCell: {
    alignItems: "center",
    marginRight: spacing.md,
    width: 36,
  },
  timelineCircle: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: 17,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    width: 34,
    ...shadows.sm,
  },
  timelineCircleCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timelineNumber: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 14,
    height: 16,
    includeFontPadding: false,
    lineHeight: 16,
    textAlign: "center",
    textAlignVertical: "center",
  },
  timelineNumberCurrent: {
    color: colors.surface,
  },
  timelineConnectorRow: {
    flexDirection: "row",
    height: spacing.lg,
  },
  timelineConnector: {
    backgroundColor: colors.strongBorder,
    borderRadius: 1,
    flex: 1,
    width: 2,
  },
  timelineConnectorSpacer: {
    flex: 1,
  },
  productRow: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 62,
    padding: spacing.md,
    ...shadows.sm,
  },
  productRowCurrent: {
    backgroundColor: colors.mutedSurface,
    borderColor: colors.primary,
  },
  productText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  productTextCurrent: {
    color: colors.primaryDark,
  },
  goldenProduct: {
    color: "#B08900",
  },
  legendBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(23, 32, 31, 0.42)",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  legendModal: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    maxWidth: 420,
    padding: spacing.md,
    width: "100%",
    ...shadows.sm,
  },
  legendHeader: {
    alignItems: "center",
    backgroundColor: colors.mutedSurface,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  legendTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  legendCloseButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 17,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  legendSections: {
    gap: spacing.md,
  },
  legendSection: {
    backgroundColor: "#FBFCFA",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  legendSectionTitle: {
    color: colors.mutedText,
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.sm,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 30,
    paddingRight: spacing.sm,
    width: "50%",
  },
  legendSwatchFrame: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 7,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  legendSwatch: {
    borderRadius: 4,
    height: 14,
    width: 14,
  },
  legendLabel: {
    color: colors.text,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
});
