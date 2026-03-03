import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Circle, ClipPath, Defs, Path, Rect } from "react-native-svg";

const OUTLINE = "#000000";
const LIQUID = "#B0B6BB";
const HIGHLIGHT = "#FFFFFF";
const SHADOW = "#9AA0A6";

const VIEWBOX_SIZE = 100;
const OUTLINE_STROKE_WIDTH = 24;
const INNER_STROKE_WIDTH = 14;
const LIQUID_MASK_RADIUS = INNER_STROKE_WIDTH / 2;

const AIRLOCK_PATH_D = "M50 14 L50 34 L64 34 L64 56 L36 56 L36 84 L50 84";

const LIQUID_SURFACE_BASE_Y = 49;
const LIQUID_SURFACE_AMPLITUDE = 2.5;

const BUBBLE_KEYFRAMES = [0, 0.3, 0.55, 0.82, 1];
const BUBBLE_X_POINTS = [50, 36, 64, 50, 50];
const BUBBLE_Y_POINTS = [84, 68, 54, 34, 16];

const LIQUID_MASK_RECTS = [
  { x: 43, y: 14, width: 14, height: 20 },
  { x: 50, y: 27, width: 14, height: 14 },
  { x: 57, y: 34, width: 14, height: 22 },
  { x: 36, y: 49, width: 28, height: 14 },
  { x: 29, y: 56, width: 14, height: 28 },
  { x: 36, y: 77, width: 14, height: 14 },
] as const;

const LIQUID_MASK_JOINTS = [
  { cx: 50, cy: 34 },
  { cx: 64, cy: 34 },
  { cx: 64, cy: 56 },
  { cx: 36, cy: 56 },
  { cx: 36, cy: 84 },
  { cx: 50, cy: 84 },
] as const;

const BUBBLES = [
  { phase: 0, maxOpacity: 0.78, radius: 3.8 },
  { phase: 0.35, maxOpacity: 0.72, radius: 3.3 },
  { phase: 0.68, maxOpacity: 0.66, radius: 2.8 },
] as const;

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type AirlockLoaderProps = {
  size?: number;
  durationMs?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function AirlockLoader({
  size = 96,
  durationMs = 1400,
  style,
  accessibilityLabel = "Loading",
}: AirlockLoaderProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const clipPathIdRef = useRef(
    `airlock-liquid-clip-${Math.round(Math.random() * 1_000_000_000)}`,
  );
  const clipPathId = clipPathIdRef.current;

  useEffect(() => {
    progress.setValue(0);

    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: durationMs,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [durationMs, progress]);

  const liquidSurfaceY = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
          LIQUID_SURFACE_BASE_Y + LIQUID_SURFACE_AMPLITUDE,
          LIQUID_SURFACE_BASE_Y - LIQUID_SURFACE_AMPLITUDE,
          LIQUID_SURFACE_BASE_Y + LIQUID_SURFACE_AMPLITUDE,
        ],
      }),
    [progress],
  );

  const bubbleAnimations = useMemo(() => {
    return BUBBLES.map((bubble) => {
      const phasedProgress = Animated.modulo(
        Animated.add(progress, bubble.phase),
        1,
      );

      return {
        cx: phasedProgress.interpolate({
          inputRange: BUBBLE_KEYFRAMES,
          outputRange: BUBBLE_X_POINTS,
        }),
        cy: phasedProgress.interpolate({
          inputRange: BUBBLE_KEYFRAMES,
          outputRange: BUBBLE_Y_POINTS,
        }),
        opacity: phasedProgress.interpolate({
          inputRange: BUBBLE_KEYFRAMES,
          outputRange: [
            0,
            bubble.maxOpacity * 0.5,
            bubble.maxOpacity,
            bubble.maxOpacity * 0.75,
            0,
          ],
        }),
        r: phasedProgress.interpolate({
          inputRange: BUBBLE_KEYFRAMES,
          outputRange: [
            bubble.radius * 0.45,
            bubble.radius * 0.85,
            bubble.radius,
            bubble.radius * 1.12,
            bubble.radius * 0.25,
          ],
        }),
      };
    });
  }, [progress]);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, style]}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      >
        <Defs>
          <ClipPath id={clipPathId}>
            {LIQUID_MASK_RECTS.map((rect, index) => {
              return (
                <Rect
                  key={`mask-rect-${index}`}
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  rx={LIQUID_MASK_RADIUS}
                />
              );
            })}
            {LIQUID_MASK_JOINTS.map((joint, index) => {
              return (
                <Circle
                  key={`mask-joint-${index}`}
                  cx={joint.cx}
                  cy={joint.cy}
                  r={LIQUID_MASK_RADIUS}
                />
              );
            })}
          </ClipPath>
        </Defs>

        <Path
          d={AIRLOCK_PATH_D}
          fill="none"
          stroke={OUTLINE}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={OUTLINE_STROKE_WIDTH}
        />

        <Path
          d={AIRLOCK_PATH_D}
          fill="none"
          stroke={HIGHLIGHT}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={INNER_STROKE_WIDTH}
        />

        <AnimatedRect
          x={0}
          y={liquidSurfaceY as unknown as number}
          width={VIEWBOX_SIZE}
          height={VIEWBOX_SIZE}
          fill={LIQUID}
          clipPath={`url(#${clipPathId})`}
        />

        <Path
          d="M50 18 L50 32 L61 32"
          fill="none"
          stroke={HIGHLIGHT}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          opacity={0.85}
        />

        <Path
          d="M39 84 L49 84"
          fill="none"
          stroke={SHADOW}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          opacity={0.5}
        />

        {bubbleAnimations.map((bubble, index) => {
          return (
            <AnimatedCircle
              key={`bubble-${index}`}
              cx={bubble.cx as unknown as number}
              cy={bubble.cy as unknown as number}
              r={bubble.r as unknown as number}
              fill={HIGHLIGHT}
              opacity={bubble.opacity as unknown as number}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
