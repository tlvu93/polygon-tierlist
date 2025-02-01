"use client";

import { cn } from "@/lib/utils";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

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
}

export function PolygonChart({
  stats,
  hideLabels = false,
  isPreview = false,
  className = "polygon-chart",
  ...props
}: PolygonChartProps) {
  const isMobile = useIsMobile();
  // Transform stats object into array format for Recharts
  // Transform stats object into array format for Recharts with shortened labels
  const data = Object.entries(stats).map(([key, value], index) => {
    const shortLabel = `P${index + 1}`;
    return {
      subject: shortLabel,
      fullName: key.toUpperCase(),
      value: value,
    };
  });

  return (
    <div
      className={cn(
        "w-full h-full bg-slate-900/95 rounded-lg flex flex-col",
        isPreview ? "p-1" : "p-1 sm:p-4",
        className
      )}
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
            <RadarChart cx="50%" cy="50%" outerRadius={isPreview ? "130%" : isMobile ? "90%" : "80%"} data={data}>
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
                  tick={{ fill: "rgb(229, 231, 235)", fontSize: isPreview ? 12 : isMobile ? 9 : 12 }} // Smaller text on mobile
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
                  return (
                    <g key={`dot-${cx}-${cy}-${props.index}`}>
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
                        fill="#ea580c"
                        opacity={0.7}
                      />
                      <circle key={`inner-${cx}-${cy}-${props.index}`} cx={cx} cy={cy} r={size} fill="#ea580c" />
                    </g>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {!isPreview && !hideLabels && (
        <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-gray-300">
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
