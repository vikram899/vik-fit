import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { COLORS } from "../styles";

const SCREEN_WIDTH = Dimensions.get("window").width;
const VISIBLE_GRAPH_WIDTH = SCREEN_WIDTH - 32; // padding 16 on each side
const GRAPH_HEIGHT = 280;
const PADDING = 45;
const POINTS_SPACING = 40; // pixels between each data point (for 7-day spacing)

/**
 * WeightProgressGraph
 * Simple line graph component for visualizing weight progress
 */
export const WeightProgressGraph = ({ data = [], targetWeight }) => {
  const scrollViewRef = React.useRef(null);

  console.log('WeightProgressGraph received:', data.length, 'data points');

  // Scroll to end to show today's date on the right
  React.useEffect(() => {
    if (scrollViewRef.current && data && data.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No weight data to display</Text>
      </View>
    );
  }

  // Filter data to show only last 2 months (60 days)
  const today = new Date();
  const twoMonthsAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.weightDate);
    return entryDate >= twoMonthsAgo;
  });

  // If no data in 2 months, show what we have
  const displayData = filteredData.length > 0 ? filteredData : data.slice(-15);

  // Set fixed weight range 50-100 with 5kg gap
  const minWeight = 50;
  const maxWeight = 100;
  const weightRange = maxWeight - minWeight;

  // Calculate positions for graph with fixed spacing
  const graphHeight = GRAPH_HEIGHT - PADDING * 2;
  const scrollableGraphWidth = PADDING + (displayData.length - 1) * POINTS_SPACING + PADDING;
  const yScale = graphHeight / weightRange;

  // Create SVG-like path for the line with fixed spacing between points
  const points = displayData.map((entry, index) => {
    const x = PADDING + index * POINTS_SPACING;
    const y =
      PADDING +
      graphHeight -
      (entry.currentWeight - minWeight) * yScale;
    return { x, y, weight: entry.currentWeight, date: entry.weightDate };
  });

  // Target weight line y position
  const targetRatio = (targetWeight - minWeight) / weightRange;
  const targetY = PADDING + graphHeight * (1 - targetRatio);

  return (
    <View style={styles.container}>
      <View style={styles.graphContainer}>
        {/* Horizontal Scrollable Graph */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={true}
          scrollEventThrottle={16}
        >
          {/* Graph Background */}
          <View
            style={[
              styles.graph,
              {
                width: scrollableGraphWidth,
                height: GRAPH_HEIGHT,
              },
            ]}
          >
          {/* Target Weight Line */}
          <View
            style={[
              styles.targetLine,
              {
                top: targetY,
                width: scrollableGraphWidth - PADDING * 2,
                left: PADDING,
              },
            ]}
          />

          {/* Grid Lines - Every 5kg */}
          {[50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map((weight, index) => {
            const ratio = (weight - minWeight) / weightRange;
            const y = PADDING + graphHeight * (1 - ratio);
            return (
              <View
                key={`grid-${index}`}
                style={[
                  styles.gridLine,
                  {
                    top: y,
                    width: scrollableGraphWidth - PADDING * 2,
                    left: PADDING,
                  },
                ]}
              />
            );
          })}

          {/* Weight Points and Line */}
          {points.map((point, index) => {
            const nextPoint = points[index + 1];
            return (
              <View key={`point-${index}`}>
                {/* Line to next point */}
                {nextPoint && (
                  <View
                    style={[
                      styles.line,
                      {
                        left: point.x,
                        top: point.y,
                        width: Math.sqrt(
                          Math.pow(nextPoint.x - point.x, 2) +
                            Math.pow(nextPoint.y - point.y, 2)
                        ),
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              nextPoint.y - point.y,
                              nextPoint.x - point.x
                            )}rad`,
                          },
                        ],
                      },
                    ]}
                  />
                )}

                {/* Data Point Circle */}
                <View
                  style={[
                    styles.dataPoint,
                    {
                      left: point.x - 6,
                      top: point.y - 6,
                    },
                  ]}
                />
              </View>
            );
          })}

          {/* Y-axis Labels - Every 5kg */}
          {[50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map((weight, index) => {
            const ratio = (weight - minWeight) / weightRange;
            const y = PADDING + graphHeight * (1 - ratio);
            return (
              <Text
                key={`y-label-${index}`}
                style={[
                  styles.yLabel,
                  {
                    top: y - 10,
                  },
                ]}
              >
                {weight}
              </Text>
            );
          })}

          {/* X-axis Labels - Weekly gaps */}
          {points.map((point, index) => {
            // Show first point, last point, and every point that is approximately 7 days apart
            const isFirstPoint = index === 0;
            const isLastPoint = index === points.length - 1;

            // Calculate days from first data point
            const firstDate = new Date(points[0].date);
            const currentDate = new Date(point.date);
            const daysSinceStart = Math.round(
              (currentDate - firstDate) / (1000 * 60 * 60 * 24)
            );

            // Show label every 7 days approximately
            const shouldShow = isFirstPoint || isLastPoint || daysSinceStart % 7 < 1.5;

            if (!shouldShow) return null;

            const dateObj = new Date(point.date);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const label = `${day}/${month}`;

            return (
              <Text
                key={`x-label-${index}`}
                style={[
                  styles.xLabel,
                  {
                    left: point.x - 20,
                  },
                ]}
              >
                {label}
              </Text>
            );
          })}
        </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginHorizontal: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  graphContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  graph: {
    backgroundColor: "#fafafa",
    position: "relative",
  },
  gridLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "#e8e8e8",
  },
  targetLine: {
    position: "absolute",
    height: 2,
    backgroundColor: "#FFB84D",
    borderStyle: "dashed",
  },
  line: {
    position: "absolute",
    height: 2,
    backgroundColor: COLORS.primary,
    transformOrigin: "0 50%",
  },
  dataPoint: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: "#fff",
  },
  yLabel: {
    position: "absolute",
    left: 8,
    fontSize: 11,
    color: "#999",
    width: 25,
  },
  xLabel: {
    position: "absolute",
    bottom: 5,
    fontSize: 11,
    color: "#999",
    width: 40,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: "#666",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default WeightProgressGraph;
