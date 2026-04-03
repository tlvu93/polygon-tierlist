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
import { useEffect, useState, useCallback, useRef } from "react";
import {
  useCurrentPolyList,
  useIsDraggable,
  useDragState,
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

// Simplified props - most data now comes from stores
interface PolygonChartProps extends React.HTMLAttributes<HTMLDivElement> {
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
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Get data from Zustand stores instead of props
  const currentPolyList = useCurrentPolyList();
  const isDraggable = useIsDraggable();
  const dragState = useDragState();

  // Get store actions
  const updateStat = useTierListDataStore((state) => state.updateStat);
  const setSelectedStatIndex = useTierListUIStore(
    (state) => state.setSelectedStatIndex
  );
  const setDragState = useTierListUIStore((state) => state.setDragState);

  // Transform currentPolyList stats into chart data
  const data = currentPolyList
    ? currentPolyList.stats.map((stat) => ({
        subject: stat.name.toUpperCase(),
        fullName: stat.name.toUpperCase(),
        value: stat.value,
      }))
    : [];

  const updateDraggedStat = useCallback(
    (clientX: number, clientY: number) => {
      if (
        !dragState.isDragging ||
        dragState.dragIndex === null ||
        !isDraggable ||
        isPreview ||
        !currentPolyList ||
        !chartContainerRef.current
      ) {
        return;
      }

      const rect = chartContainerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const mouseX = clientX - rect.left - centerX;
      const mouseY = clientY - rect.top - centerY;
      const statCount = currentPolyList.stats.length;
      const angle = 90 - (dragState.dragIndex * 360) / statCount;
      const angleInRadians = (-Math.PI / 180) * angle;
      const axisX = Math.cos(angleInRadians);
      const axisY = Math.sin(angleInRadians);
      const projectedDistance = mouseX * axisX + mouseY * axisY;
      const outerRadiusScale = isMobile ? 0.9 : 0.8;
      const maxRadius = (Math.min(rect.width, rect.height) / 2) * outerRadiusScale;
      const normalizedDistance = Math.min(
        Math.max(projectedDistance / maxRadius, 0),
        1
      );
      const newValue = Math.round(normalizedDistance * 100) / 10;

      updateStat(currentPolyList.id, dragState.dragIndex, {
        value: newValue,
      });
    },
    [
      currentPolyList,
      dragState.dragIndex,
      dragState.isDragging,
      isMobile,
      isDraggable,
      isPreview,
      updateStat,
    ]
  );

  const handlePointerDown = useCallback(
    (index: number, clientX?: number, clientY?: number) => {
      if (!isDraggable || isPreview) return;
      setDragState(true, index);
      if (typeof clientX === "number" && typeof clientY === "number") {
        requestAnimationFrame(() => {
          updateDraggedStat(clientX, clientY);
        });
      }
    },
    [isDraggable, isPreview, setDragState, updateDraggedStat]
  );

  const handlePointerUp = useCallback(() => {
    setDragState(false, null);
  }, [setDragState]);

  const blurFocusedChartElement = useCallback((target?: EventTarget | null) => {
    requestAnimationFrame(() => {
      const maybeBlur = target as
        | (Element & { blur?: () => void })
        | null
        | undefined;
      maybeBlur?.blur?.();

      const activeElement = document.activeElement as
        | (Element & { blur?: () => void })
        | null;

      if (activeElement?.closest(".polygon-chart")) {
        activeElement.blur?.();
      }
    });
  }, []);

  useEffect(() => {
    if (!dragState.isDragging || isPreview) {
      return;
    }

    const handleWindowPointerMove = (event: PointerEvent) => {
      updateDraggedStat(event.clientX, event.clientY);
    };

    const handleWindowPointerEnd = (event: PointerEvent) => {
      handlePointerUp();
      blurFocusedChartElement(event.target);
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerEnd);
    window.addEventListener("pointercancel", handleWindowPointerEnd);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerEnd);
      window.removeEventListener("pointercancel", handleWindowPointerEnd);
    };
  }, [
    blurFocusedChartElement,
    dragState.isDragging,
    handlePointerUp,
    isPreview,
    updateDraggedStat,
  ]);

  return (
    <div
      ref={chartContainerRef}
      className={cn(
        "w-full h-full bg-slate-900/95 rounded-lg flex flex-col",
        isPreview ? "p-1" : "p-1 sm:p-4",
        isDraggable && !isPreview ? "cursor-crosshair" : "",
        className
      )}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onPointerDownCapture={(event) => {
        if (!isPreview) {
          blurFocusedChartElement(event.target);
        }
      }}
      onPointerMove={(event) => {
        updateDraggedStat(event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        handlePointerUp();
        if (!isPreview) {
          blurFocusedChartElement(event.target);
        }
      }}
      onClick={(e) => {
        // Only deselect if clicking on the container itself (not child elements)
        if (e.target === e.currentTarget && !isPreview) {
          setSelectedStatIndex(null);
        }
      }}
      {...props}
    >
      <div
        className="flex-1"
        style={{ minHeight: isPreview ? "48px" : "200px" }}
      >
        <div
          style={{
            width: "100%",
            height: isPreview ? "48px" : "100%",
            maxWidth: isPreview ? "none" : "800px",
            margin: "0 auto",
            minHeight: isPreview ? "48px" : "200px",
          }}
          onClick={() => {
            // Deselect when clicking on the chart area
            if (!isPreview) {
              setSelectedStatIndex(null);
            }
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={isPreview ? "130%" : isMobile ? "90%" : "80%"}
              data={data}
              accessibilityLayer={false}
            >
              <PolarGrid
                gridType="polygon"
                stroke="rgba(209, 213, 219, 0.2)" // Slightly more visible grid lines
                strokeWidth={1}
                radialLines={true}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tickCount={2}
                tick={false}
              />
              {!hideLabels && (
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
                          focusable="false"
                          fontSize={isPreview ? 12 : isMobile ? 9 : 12}
                          style={{
                            cursor: !isPreview ? "pointer" : "default",
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent bubbling to container
                            if (!isPreview) {
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
                stroke="#ea580c" // Deeper orange stroke
                strokeWidth={isPreview ? 1 : 2}
                fill="#ea580c" // Deeper orange fill
                fillOpacity={0.2} // Slightly higher opacity for better visibility
                activeDot={false}
                isAnimationActive={false}
                dot={(props) => {
                  const { cx, cy } = props;
                  const size = isPreview ? 1 : isMobile ? 4 : 8;
                  const isActive = dragState.dragIndex === props.index;

                  return (
                    <g
                      key={`dot-${cx}-${cy}-${props.index}`}
                      focusable="false"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); // Prevent bubbling to container
                        handlePointerDown(props.index, e.clientX, e.clientY);
                        blurFocusedChartElement(e.target);
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent bubbling to container
                        // Deselect when clicking on draggable dots
                        if (!isPreview) {
                          setSelectedStatIndex(null);
                        }
                      }}
                      style={{
                        cursor: isDraggable && !isPreview ? "grab" : "default",
                      }}
                    >
                      <circle
                        key={`hit-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={isPreview ? size + 4 : size + 8}
                        fill="transparent"
                        focusable="false"
                        pointerEvents="all"
                      />
                      <circle
                        key={`outer-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={isPreview ? size + 1 : size + 2}
                        fill="white"
                        opacity={0.25}
                        focusable="false"
                        pointerEvents="none"
                      />
                      <circle
                        key={`middle-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={isPreview ? size + 0.5 : size + 1}
                        fill={isActive ? "#f97316" : "#ea580c"}
                        opacity={0.7}
                        focusable="false"
                        pointerEvents="none"
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
                        focusable="false"
                        pointerEvents="none"
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
