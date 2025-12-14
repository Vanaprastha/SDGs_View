"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "2019", value: 50 },
  { name: "2020", value: 55 },
  { name: "2021", value: 60 },
  { name: "2022", value: 66 },
  { name: "2023", value: 69 },
  { name: "2024", value: 71 },
];

// Tooltip kustom dengan Tailwind classes yang kamu minta
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black text-white border border-white/20 rounded-lg px-2 py-2 text-sm shadow-lg">
        <div className="font-medium">Tahun: {label}</div>
        <div className="opacity-90">Nilai: {payload[0].value}</div>
      </div>
    );
  }
  return null;
}

export default function Revenue() {
  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.25)", strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

