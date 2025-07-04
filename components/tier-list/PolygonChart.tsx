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
  stats: { [key: string]: number };
  hideLabels?: boolean;
  isPreview?: boolean;
  onStatChange?: (statIndex: number, newValue: number) => void;
  isDraggable?: boolean;
}

export function PolygonChart({
  stats,
  hideLabels = false,
  isPreview = false,
  onStatChange,
  isDraggable = false,
  className = "polygon-chart",
  ...props
}: PolygonChartProps) {
  const isMobile = useIsMobile();
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Transform stats object into Recharts data with shortened labels.
  const data = Object.entries(stats).map(([key, value], index) => {
    const shortLabel = `P${index + 1}`;
    return {
      subject: shortLabel,
      fullName: key.toUpperCase(),
      value: value,
    };
  });

  const handleMouseDown = useCallback(
    (index: number) => {
      if (!isDraggable || isPreview) return;
      console.log("Mouse down on stat:", index);
      setIsDragging(true);
      setDragIndex(index);
    },
    [isDraggable, isPreview]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || dragIndex === null || !isDraggable || isPreview) {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const mouseX = event.clientX - rect.left - centerX;
      const mouseY = event.clientY - rect.top - centerY;

      // Calculate distance from center
      const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
      const maxRadius = (Math.min(rect.width, rect.height) / 2) * 0.8; // 80% of the chart radius

      // Calculate new value based on distance (0-10 scale)
      const normalizedDistance = Math.min(distance / maxRadius, 1);
      const newValue = Math.round(normalizedDistance * 10 * 10) / 10; // Round to 1 decimal place

      console.log(
        "Dragging stat:",
        dragIndex,
        "new value:",
        newValue,
        "distance:",
        distance,
        "maxRadius:",
        maxRadius
      );

      // Update the stat that was initially clicked
      if (onStatChange) {
        onStatChange(dragIndex, newValue);
      }
    },
    [isDragging, dragIndex, isDraggable, isPreview, onStatChange]
  );

  const handleMouseUp = useCallback(() => {
    console.log("Mouse up, stopping drag");
    setIsDragging(false);
    setDragIndex(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    console.log("Mouse leave, stopping drag");
    setIsDragging(false);
    setDragIndex(null);
  }, []);

  return (
    <div
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
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <div className="flex-1" style={{ minHeight: 0 }}>
        <div
          style={{
            width: "100%",
            height: isPreview ? "48px" : "100%",
            maxWidth: isPreview ? "none" : "800px",
            margin: "0 auto",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius={isPreview ? "130%" : isMobile ? "90%" : "80%"}
              data={data}
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
                  tick={{
                    fill: "rgb(229, 231, 235)",
                    fontSize: isPreview ? 12 : isMobile ? 9 : 12,
                  }} // Smaller text on mobile
                />
              )}
              <Radar
                name="Stats"
                dataKey="value"
                stroke="#ea580c" // Deeper orange stroke
                strokeWidth={isPreview ? 1 : 2}
                fill="#ea580c" // Deeper orange fill
                fillOpacity={0.2} // Slightly higher opacity for better visibility
                dot={(props) => {
                  const { cx, cy } = props;
                  const size = isPreview ? 1 : isMobile ? 4 : 8;
                  const isActive = dragIndex === props.index;

                  return (
                    <g
                      key={`dot-${cx}-${cy}-${props.index}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleMouseDown(props.index);
                      }}
                      style={{
                        cursor: isDraggable && !isPreview ? "grab" : "default",
                      }}
                    >
                      <circle
                        key={`outer-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={isPreview ? size + 1 : size + 2}
                        fill="white"
                        opacity={0.25}
                      />
                      <circle
                        key={`middle-${cx}-${cy}-${props.index}`}
                        cx={cx}
                        cy={cy}
                        r={isPreview ? size + 0.5 : size + 1}
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
      {!isPreview && !hideLabels && (
        <div
          className="mt-2 grid grid-cols-3 gap-1 text-xs text-gray-300"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="font-semibold">{item.subject}:</span>
              <span className="truncate">{item.fullName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
