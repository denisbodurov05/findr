import { memo, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { colors, radius, spacing } from "@/config/theme";

const DOT_SIZE = 8;
const ROD_HEIGHT = 34;
const CYCLE_MS = 1400;
const ROD_COUNT = 3;

interface LoaderProps {
  color?: string;
  size?: "small" | "default";
}

interface RodProps {
  color: string;
  index: number;
  progress: SharedValue<number>;
  scale: number;
}

function LoaderRod({ color, index, progress, scale }: RodProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const cycle = progress.get();
    const growStart = 0.06 + index * 0.12;
    const growEnd = growStart + 0.16;
    const shrinkStart = 0.58 + index * 0.12;
    const shrinkEnd = shrinkStart + 0.16;

    const amount = interpolate(
      cycle,
      [0, growStart, growEnd, shrinkStart, shrinkEnd, 1],
      [0, 0, 1, 1, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      height: (DOT_SIZE + (ROD_HEIGHT - DOT_SIZE) * amount) * scale,
      opacity: interpolate(amount, [0, 1], [0.55, 1]),
    };
  }, [index, scale]);

  return (
    <View style={[styles.rodTrack, { height: ROD_HEIGHT * scale }]}>
      <Animated.View
        style={[
          styles.rod,
          {
            backgroundColor: color,
            borderRadius: radius.sm,
            width: DOT_SIZE * scale,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export const Loader = memo(function Loader({
  color = colors.primary,
  size = "default",
}: LoaderProps) {
  const progress = useSharedValue(0);
  const scale = size === "small" ? 0.78 : 1;

  useEffect(() => {
    progress.set(
      withRepeat(
        withTiming(1, {
          duration: CYCLE_MS,
          easing: Easing.inOut(Easing.cubic),
        }),
        -1,
        false
      )
    );

    return () => cancelAnimation(progress);
  }, [progress]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[styles.container, { gap: spacing.xs * scale }]}
    >
      {Array.from({ length: ROD_COUNT }, (_, index) => (
        <LoaderRod key={index} color={color} index={index} progress={progress} scale={scale} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  rodTrack: {
    justifyContent: "center",
  },
  rod: {
    minHeight: DOT_SIZE,
  },
});
