"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { status: string; count: number }[];
}

const COLORS: Record<string, string> = {
  pending: "#94a3b8",
  paid: "#f59e0b",
  processing: "#60a5fa",
  shipped: "#a78bfa",
  delivered: "#34d399",
  cancelled: "#f87171",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs capitalize text-slate-500">{payload[0].name}</p>
      <p className="text-sm font-bold text-slate-900">
        {payload[0].value} orders
      </p>
    </div>
  );
}

export function OrderStatusChart({ data }: Props) {
  if (data.every((d) => d.count === 0)) {
    return (
      <p className="py-10 text-center text-sm text-slate-400">Noordersyet</p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.status} fill={COLORS[entry.status] ?? "#cbd5e1"} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs capitalize text-slate-500">{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
