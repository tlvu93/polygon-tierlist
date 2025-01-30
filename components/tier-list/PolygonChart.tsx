"use client";

import { DiagramStats } from "./types";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface PolygonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: DiagramStats;
}

export function PolygonChart({ stats, className, ...props }: PolygonChartProps) {
  // Transform stats object into array format for Recharts
  const data = [
    { subject: "FIGHTING", value: stats.fighting },
    { subject: "FARMING", value: stats.farming },
    { subject: "SUPPORTING", value: stats.supporting },
    { subject: "PUSHING", value: stats.pushing },
    { subject: "VERSATILITY", value: stats.versatility },
  ];

  return (
    <div className={cn("w-full aspect-square", className)} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid
            gridType="polygon"
            stroke="rgb(75, 85, 99)" // Tailwind gray-600
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "rgb(156, 163, 175)", fontSize: 12 }} // Tailwind gray-400
          />
          <Radar
            name="Stats"
            dataKey="value"
            stroke="rgb(249, 115, 22)" // Tailwind orange-500
            fill="rgb(249, 115, 22)" // Tailwind orange-500
            fillOpacity={0.1}
            dot={{
              fill: "rgb(249, 115, 22)", // Tailwind orange-500
              r: 4,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
