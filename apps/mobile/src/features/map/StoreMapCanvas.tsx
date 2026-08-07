import { memo, useEffect, useMemo } from "react";
import { Dimensions, PixelRatio, StyleSheet, View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect } from "react-native-svg";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { colors, radius } from "@/config/theme";
import { getCellColor } from "@/features/map/mapColors";
import { PathfindResult, Point, StoreMap } from "@/types/domain";

const { width: screenWidth } = Dimensions.get("window");
const gridRows = 20;
const gridCols = 40;
const viewBoxWidth = gridCols + 1;
const viewBoxHeight = gridRows + 1;
const canvasWidth = screenWidth * 0.92;
const canvasHeight = canvasWidth * (viewBoxHeight / viewBoxWidth);
const mapRenderScale = Math.min(PixelRatio.get(), 3);
const renderedCanvasWidth = canvasWidth * mapRenderScale;
const renderedCanvasHeight = canvasHeight * mapRenderScale;
const cornerRadius = 0.16;
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StoreMapCanvasProps {
  storeMap: StoreMap;
  path: PathfindResult;
  currentStepIndex: number;
  visibleSegmentCount: number;
}

interface RenderedCell {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

interface RenderedRoute {
  key: string;
  index: number;
  length: number;
  d: string;
}

interface RenderedStop {
  key: string;
  index: number;
  x: number;
  y: number;
}

interface RouteLineProps {
  route: RenderedRoute;
  reveal: SharedValue<number>;
}

const RouteLine = memo(function RouteLine({ route, reveal }: RouteLineProps) {
  const animatedProps = useAnimatedProps(() => {
    const segmentProgress = interpolate(
      reveal.get(),
      [route.index, route.index + 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      strokeDashoffset: route.length * (1 - segmentProgress),
    };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      d={route.d}
      fill="none"
      stroke={colors.route}
      strokeDasharray={`${route.length} ${route.length}`}
      strokeWidth={0.32}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
});

export function StoreMapCanvas({
  storeMap,
  path,
  currentStepIndex,
  visibleSegmentCount,
}: StoreMapCanvasProps) {
  const reveal = useSharedValue(0);
  const routes = useMemo(() => getRouteLines(path), [path]);
  const stops = useMemo(() => getStops(path), [path]);

  useEffect(() => {
    reveal.set(0);
  }, [path, reveal]);

  useEffect(() => {
    reveal.set(
      withTiming(visibleSegmentCount, {
        duration: 640,
      })
    );
  }, [visibleSegmentCount, reveal]);

  return (
    <View style={styles.container}>
      <Svg
        width={renderedCanvasWidth}
        height={renderedCanvasHeight}
        style={styles.svg}
        viewBox={`-0.5 -0.5 ${viewBoxWidth} ${viewBoxHeight}`}
      >
        <Rect
          x={-0.5}
          y={-0.5}
          width={viewBoxWidth}
          height={viewBoxHeight}
          rx={0.45}
          fill="#FBFCFA"
          stroke={colors.border}
          strokeWidth={0.12}
        />

        <MapLayer storeMap={storeMap} />

        <G>
          {routes.map((route) => (
            <Path
              key={`${route.key}-trail`}
              d={route.d}
              fill="none"
              opacity={0.24}
              stroke={colors.strongBorder}
              strokeWidth={0.22}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {routes.map((route) => (
            <RouteLine
              key={route.key}
              route={route}
              reveal={reveal}
            />
          ))}
        </G>

        <G>
          {stops.map((stop) => (
            <Circle
              key={stop.key}
              cx={stop.x}
              cy={stop.y}
              r={stop.index === currentStepIndex ? 0.46 : 0.34}
              fill={stop.index === currentStepIndex ? colors.primary : colors.warning}
              stroke={colors.surface}
              strokeWidth={0.16}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

const MapLayer = memo(function MapLayer({ storeMap }: { storeMap: StoreMap }) {
  const cells = useMemo(() => getCellRects(storeMap), [storeMap]);

  return (
    <>
      <G>
        {cells.map((cell) => (
          <Rect
            key={cell.key}
            x={cell.x}
            y={cell.y}
            width={cell.width}
            height={cell.height}
            rx={0.12}
            fill={cell.fill}
          />
        ))}
      </G>
      <G>
        {Array.from({ length: gridCols + 2 }, (_, index) => (
          <Line
            key={`grid-x-${index}`}
            x1={index - 0.5}
            y1={-0.5}
            x2={index - 0.5}
            y2={gridRows + 0.5}
            stroke={colors.grid}
            strokeWidth={0.035}
          />
        ))}
        {Array.from({ length: gridRows + 2 }, (_, index) => (
          <Line
            key={`grid-y-${index}`}
            x1={-0.5}
            y1={index - 0.5}
            x2={gridCols + 0.5}
            y2={index - 0.5}
            stroke={colors.grid}
            strokeWidth={0.035}
          />
        ))}
      </G>
    </>
  );
});

function getCellRects(storeMap: StoreMap) {
  interface Segment {
    row: number;
    x: number;
    width: number;
    fill: string;
  }

  const rows: (string | null)[][] = Array.from({ length: gridRows + 1 }, () =>
    Array(gridCols + 1).fill(null)
  );

  for (let y = 0; y <= gridRows; y += 1) {
    for (let x = 0; x <= gridCols; x += 1) {
      const cell = storeMap.itemDetails[x]?.[y];

      if (cell) {
        rows[y][x] = getCellColor(cell);
      }
    }
  }

  // Merge horizontally: consecutive same-color cells in a row become one segment.
  const segments: Segment[] = [];

  for (let y = 0; y <= gridRows; y += 1) {
    let x = 0;

    while (x <= gridCols) {
      const fill = rows[y][x];

      if (!fill) {
        x += 1;
        continue;
      }

      let xEnd = x;

      while (xEnd + 1 <= gridCols && rows[y][xEnd + 1] === fill) {
        xEnd += 1;
      }

      segments.push({ row: y, x, width: xEnd - x + 1, fill });
      x = xEnd + 1;
    }
  }

  // Merge vertically: identical adjacent segments on consecutive rows become one rect.
  const merged = new Set<number>();
  const rects: RenderedCell[] = [];

  for (let index = 0; index < segments.length; index += 1) {
    if (merged.has(index)) {
      continue;
    }

    const segment = segments[index];
    let height = 1;

    for (let next = index + 1; next < segments.length; next += 1) {
      const candidate = segments[next];

      if (merged.has(next)) {
        continue;
      }

      if (candidate.row > segment.row + height) {
        break;
      }

      if (
        candidate.row === segment.row + height &&
        candidate.x === segment.x &&
        candidate.width === segment.width &&
        candidate.fill === segment.fill
      ) {
        merged.add(next);
        height += 1;
      }
    }

    rects.push({
      key: `store-cell-${segment.x}-${segment.row}-${segment.width}-${height}`,
      x: segment.x - 0.5,
      y: toSvgY(segment.row + height - 1) - 0.5,
      width: segment.width - 1 + 0.96,
      height: height - 1 + 0.96,
      fill: segment.fill,
    });
  }

  return rects;
}

function getRouteLines(path: PathfindResult) {
  return path.pathfind.map<RenderedRoute>((segment, index) => {
    const routePoints = [segment.start, ...segment.path, segment.end];
    const points = simplifyRoutePoints(routePoints).map(toSvgPoint);

    return {
      key: `route-line-${index}`,
      index,
      length: getSmoothPathLength(points),
      d: getSmoothPathData(points),
    };
  });
}

function getStops(path: PathfindResult) {
  return path.pathfind.map<RenderedStop>((segment, index) => ({
    key: `route-stop-${index}`,
    index,
    x: segment.end.x,
    y: toSvgY(segment.end.y),
  }));
}

interface SvgPoint {
  x: number;
  y: number;
}

function simplifyRoutePoints(points: Point[]) {
  const uniquePoints = points.filter((point, index) => {
    const previous = points[index - 1];
    return !previous || previous.x !== point.x || previous.y !== point.y;
  });

  if (uniquePoints.length <= 2) {
    return uniquePoints;
  }

  return uniquePoints.filter((point, index) => {
    if (index === 0 || index === uniquePoints.length - 1) {
      return true;
    }

    const previous = uniquePoints[index - 1];
    const next = uniquePoints[index + 1];
    const previousDirection = getDirection(previous, point);
    const nextDirection = getDirection(point, next);

    return previousDirection.x !== nextDirection.x || previousDirection.y !== nextDirection.y;
  });
}

function getSmoothPathData(points: SvgPoint[]) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${formatNumber(points[0].x)} ${formatNumber(points[0].y)}`;
  }

  const commands = [`M ${formatPoint(points[0])}`];

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];

    if (isCollinear(previous, current, next)) {
      commands.push(`L ${formatPoint(current)}`);
      continue;
    }

    const entryPoint = moveToward(current, previous, getCornerRadius(previous, current, next));
    const exitPoint = moveToward(current, next, getCornerRadius(previous, current, next));

    commands.push(`L ${formatPoint(entryPoint)}`);
    commands.push(`Q ${formatPoint(current)} ${formatPoint(exitPoint)}`);
  }

  commands.push(`L ${formatPoint(points[points.length - 1])}`);

  return commands.join(" ");
}

function getSmoothPathLength(points: SvgPoint[]) {
  if (points.length < 2) {
    return 0;
  }

  let length = 0;
  let cursor = points[0];

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];

    if (isCollinear(previous, current, next)) {
      length += getDistance(cursor, current);
      cursor = current;
      continue;
    }

    const radius = getCornerRadius(previous, current, next);
    const entryPoint = moveToward(current, previous, radius);
    const exitPoint = moveToward(current, next, radius);

    length += getDistance(cursor, entryPoint);
    length += getQuadraticLength(current, entryPoint, exitPoint);
    cursor = exitPoint;
  }

  return length + getDistance(cursor, points[points.length - 1]);
}

function getQuadraticLength(control: SvgPoint, start: SvgPoint, end: SvgPoint) {
  const steps = 8;
  let length = 0;
  let previous = start;

  for (let step = 1; step <= steps; step += 1) {
    const t = step / steps;
    const inverse = 1 - t;
    const point = {
      x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
      y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
    };

    length += getDistance(previous, point);
    previous = point;
  }

  return length;
}

function getCornerRadius(previous: SvgPoint, current: SvgPoint, next: SvgPoint) {
  return Math.min(
    cornerRadius,
    getDistance(previous, current) / 2,
    getDistance(current, next) / 2
  );
}

function moveToward(from: SvgPoint, to: SvgPoint, distance: number) {
  const totalDistance = getDistance(from, to);

  if (totalDistance === 0) {
    return from;
  }

  const ratio = distance / totalDistance;

  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function getDistance(start: SvgPoint, end: SvgPoint) {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

function isCollinear(previous: SvgPoint, current: SvgPoint, next: SvgPoint) {
  return (
    (current.x - previous.x) * (next.y - current.y) ===
    (current.y - previous.y) * (next.x - current.x)
  );
}

function getDirection(start: Point, end: Point) {
  return {
    x: Math.sign(end.x - start.x),
    y: Math.sign(end.y - start.y),
  };
}

function toSvgPoint(point: Point) {
  return {
    x: point.x,
    y: toSvgY(point.y),
  };
}

function formatPoint(point: SvgPoint) {
  return `${formatNumber(point.x)} ${formatNumber(point.y)}`;
}

function formatNumber(value: number) {
  return Number(value.toFixed(3));
}

function toSvgY(y: number) {
  return gridRows - y;
}

export const mapMetrics = {
  screenWidth,
  canvasWidth,
  canvasHeight,
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: canvasHeight,
    justifyContent: "center",
    overflow: "hidden",
    width: canvasWidth,
  },
  svg: {
    transform: [{ scale: 1 / mapRenderScale }],
  },
});
