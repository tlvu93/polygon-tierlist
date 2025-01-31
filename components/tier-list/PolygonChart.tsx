"use client";

import { cn } from "@/lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

interface PolygonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: { [key: string]: number };
  hideLabels?: boolean;
  isPreview?: boolean;
}

export function PolygonChart({ stats, hideLabels = false, isPreview = false, className, ...props }: PolygonChartProps) {
  // Transform stats object into array format for Recharts
  const data = Object.entries(stats).map(([key, value]) => ({
    subject: key.toUpperCase(),
    value: value,
  }));

  return (
    <div className={cn("w-full aspect-square", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid
            gridType="polygon"
            stroke="rgb(75, 85, 99)" // Tailwind gray-600
            strokeWidth={isPreview ? 0.5 : 1}
            radialLines={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tickCount={2}
            tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }}
          />
          {!hideLabels && (
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }} // Tailwind gray-400
            />
          )}
          <Radar
            name="Stats"
            dataKey="value"
            stroke="rgb(249, 115, 22)" // Tailwind orange-500
            fill="rgb(249, 115, 22)" // Tailwind orange-500
            fillOpacity={0.1}
            dot={{
              fill: "rgb(249, 115, 22)", // Tailwind orange-500
              r: isPreview ? 2 : 4,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
