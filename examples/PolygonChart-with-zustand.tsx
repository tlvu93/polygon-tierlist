"use client";

import { cn } from "@/lib/utils";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState, useCallback } from "react";
import {
  useCurrentPolyList,
  useIsDraggable,
  useDragState,
  useChartSettings,
  useTierListDataStore,
  useTierListUIStore,
} from "@/stores";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 640px)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

interface PolygonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  // Most props are now handled by Zustand stores
  // Only keep props that are truly specific to this component instance
  hideLabels?: boolean;
  isPreview?: boolean;
}

export function PolygonChart({
  hideLabels = false,
  isPreview = false,
  className = "polygon-chart",
  ...props
}: PolygonChartProps) {
  const isMobile = useIsMobile();

  // Get data from Zustand stores instead of props
  const currentPolyList = useCurrentPolyList();
  const isDraggable = useIsDraggable();
  const dragState = useDragState();
  const chartSettings = useChartSettings();

  // Get store actions
  const updateStat = useTierListDataStore((state) => state.updateStat);
  const setSelectedStatIndex = useTierListUIStore(
    (state) => state.setSelectedStatIndex
  );
  const setDragState = useTierListUIStore((state) => state.setDragState);

  // Use chart settings from store if not overridden by props
  const actualHideLabels = hideLabels || chartSettings.hideLabels;
  const actualIsPreview = isPreview || chartSettings.isPreview;

  // Transform stats into chart data
  const data = currentPolyList
    ? Object.entries(
        currentPolyList.stats.reduce((acc, stat) => {
          acc[stat.name] = stat.value;
          return acc;
        }, {} as { [key: string]: number })
      ).map(([key, value]) => ({
        subject: key.toUpperCase(),
        fullName: key.toUpperCase(),
        value: value,
      }))
    : [];

  const handleMouseDown = useCallback(
    (index: number) => {
      if (!isDraggable || actualIsPreview) return;
      console.log("Mouse down on stat:", index);
      setDragState(true, index);
    },
    [isDraggable, actualIsPreview, setDragState]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (
        !dragState.isDragging ||
        dragState.dragIndex === null ||
        !isDraggable ||
        actualIsPreview
      ) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const mouseX = event.clientX - rect.left - centerX;
      const mouseY = event.clientY - rect.top - centerY;

      // Calculate distance from center
      const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
      const maxRadius = (Math.min(rect.width, rect.height) / 2) * 0.8;

      // Calculate new value based on distance (0-10 scale)
      const normalizedDistance = Math.min(distance / maxRadius, 1);
      const newValue = Math.round(normalizedDistance * 10 * 10) / 10;

      // Update the stat using Zustand store
      if (currentPolyList) {
        updateStat(currentPolyList.id, dragState.dragIndex, {
          value: newValue,
        });
      }
    },
    [
      dragState.isDragging,
      dragState.dragIndex,
      isDraggable,
      actualIsPreview,
      updateStat,
      currentPolyList,
    ]
  );

  const handleMouseUp = useCallback(() => {
    console.log("Mouse up, stopping drag");
    setDragState(false, null);
  }, [setDragState]);

  const handleMouseLeave = useCallback(() => {
    console.log("Mouse leave, stopping drag");
    setDragState(false, null);
  }, [setDragState]);

  return (
    <div
      className={cn(
        "w-full h-full bg-slate-900/95 rounded-lg flex flex-col",
        actualIsPreview ? "p-1" : "p-1 sm:p-4",
        isDraggable && !actualIsPreview ? "cursor-crosshair" : "",
        className
      )}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        if (e.target === e.currentTarget && !actualIsPreview) {
          setSelectedStatIndex(null);
        }
      }}
      {...props}
    >
      <div
        className="flex-1"
        style={{ minHeight: actualIsPreview ? "48px" : "200px" }}
      >
        <div
          style={{
            width: "100%",
            height: actualIsPreview ? "48px" : "100%",
            maxWidth: actualIsPreview ? "none" : "800px",
            margin: "0 auto",
            minHeight: actualIsPreview ? "48px" : "200px",
          }}
          onClick={() => {
            if (!actualIsPreview) {
              setSelectedStatIndex(null);
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={actualIsPreview ? "130%" : isMobile ? "90%" : "80%"}
              data={data}
            >
              <PolarGrid
                gridType="polygon"
                stroke="rgba(209, 213, 219, 0.2)"
                strokeWidth={1}
                radialLines={true}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tickCount={2}
                tick={false}
              />
              {!actualHideLabels && (
                <PolarAngleAxis
                  dataKey="subject"
                  tick={(props) => {
                    const { x, y, textAnchor, payload } = props;
                    const statIndex = data.findIndex(
                      (item) => item.subject === payload.value
                    );

                    return (
                      <g>
                        <text
                          x={x}
                          y={y}
                          textAnchor={textAnchor}
                          fill="rgb(229, 231, 235)"
                          fontSize={actualIsPreview ? 12 : isMobile ? 9 : 12}
                          style={{
                            cursor: !actualIsPreview ? "pointer" : "default",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!actualIsPreview) {
                              setSelectedStatIndex(statIndex);
                            }
                          }}
                        >
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
              )}
              <Radar
                name="Stats"
                dataKey="value"
                stroke="#ea580c"
                strokeWidth={actualIsPreview ? 1 : 2}
                fill="#ea580c"
                fillOpacity={0.2}
                dot={(props) => {
                  const { cx, cy } = props;
                  const size = actualIsPreview ? 1 : isMobile ? 4 : 8;
                  const isActive = dragState.dragIndex === props.index;

                  return (
                    <g
                      key={`dot-${cx}-${cy}-${props.index}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMouseDown(props.index);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!actualIsPreview) {
                          setSelectedStatIndex(null);
                        }
                      }}
                      style={{
                        cursor:
                          isDraggable && !actualIsPreview ? "grab" : "default",
                      }}
                    >
                      <circle
                        key={`outer-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={actualIsPreview ? size + 1 : size + 2}
                        fill="white"
                        opacity={0.25}
                      />
                      <circle
                        key={`middle-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={actualIsPreview ? size + 0.5 : size + 1}
                        fill={isActive ? "#f97316" : "#ea580c"}
                        opacity={0.7}
                      />
                      <circle
                        key={`inner-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={size}
                        fill={isActive ? "#f97316" : "#ea580c"}
                        style={{
                          filter: isActive
                            ? "drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))"
                            : "none",
                        }}
                      />
                    </g>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Migration Notes:
// 1. Removed props: stats, onStatChange, onStatSelect, isDraggable - now handled by stores
// 2. Added store subscriptions to replace prop drilling
// 3. Component is now much simpler and automatically stays in sync with global state
// 4. Still supports override props for specific use cases (hideLabels, isPreview)
// 5. No need to pass callbacks down through multiple component levels
