"use client";

import { cn } from "@/lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface PolygonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: { [key: string]: number };
  hideLabels?: boolean;
  isPreview?: boolean;
}

export function PolygonChart({
  stats,
  hideLabels = false,
  isPreview = false,
  className = "polygon-chart",
  ...props
}: PolygonChartProps) {
  // Transform stats object into array format for Recharts
  const data = Object.entries(stats).map(([key, value]) => ({
    subject: key.toUpperCase(),
    value: value,
  }));

  return (
    <div className={cn("w-full aspect-square bg-slate-900/95 rounded-lg p-4", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius={isPreview ? "130%" : "65%"} data={data}>
          <PolarGrid
            gridType="polygon"
            stroke="rgba(209, 213, 219, 0.2)" // Slightly more visible grid lines
            strokeWidth={1}
            radialLines={true}
          />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tickCount={2} tick={false} />
          {!hideLabels && (
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "rgb(229, 231, 235)", fontSize: 12 }} // Smaller, lighter text
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
              const size = isPreview ? 1 : 8;
              return (
                <g>
                  <circle cx={cx} cy={cy} r={isPreview ? size + 1 : size + 2} fill="white" opacity={0.25} />
                  <circle cx={cx} cy={cy} r={isPreview ? size + 0.5 : size + 1} fill="#ea580c" opacity={0.7} />
                  <circle cx={cx} cy={cy} r={size} fill="#ea580c" />
                </g>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
