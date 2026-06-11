"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { Estimation } from "@/types";

const CHART_COLOURS = ["#3B82F6","#06B6D4","#F59E0B","#8B5CF6","#10B981","#94A3B8"];

const BREAKDOWN_KEYS = [
  { key: "civil_work_cost",  label: "Civil Work"    },
  { key: "finishing_cost",   label: "Finishing"     },
  { key: "electrical_cost",  label: "Electrical"    },
  { key: "plumbing_cost",    label: "Plumbing"      },
  { key: "contingency_cost", label: "Contingency"   },
];

interface CostChartProps {
  estimation: Estimation;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold mb-0.5">{payload[0].name}</p>
      <p className="text-brand-500 font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function CostChart({ estimation }: CostChartProps) {
  const pieData = BREAKDOWN_KEYS
    .map(({ key, label }) => ({
      name: label,
      value: Math.round((estimation as any)[key] ?? 0),
    }))
    .filter(d => d.value > 0);

  const barData = BREAKDOWN_KEYS
    .map(({ key, label }) => ({
      name: label.replace(" Work","").replace("Contingency","Cont."),
      amount: Math.round((estimation as any)[key] ?? 0),
    }))
    .filter(d => d.amount > 0);

  if (pieData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Donut */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Cost Distribution
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={CHART_COLOURS[index % CHART_COLOURS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Cost by Category (₹)
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false}
              stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(0)}L` : `₹${(v/1000).toFixed(0)}K`}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              type="category" dataKey="name" width={65}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false} tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]}>
              {barData.map((_, index) => (
                <Cell key={index} fill={CHART_COLOURS[index % CHART_COLOURS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
