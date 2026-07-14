import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { formatCents, formatDateTime } from "../lib/format";
import type { PriceCheck } from "../lib/api";

type PriceChartProps = {
  history: PriceCheck[];
  targetPriceCents: number;
  currency: string;
};

export function PriceChart({ history, targetPriceCents, currency }: PriceChartProps) {
  const points = history
    .filter((entry) => entry.success && entry.priceCents !== null)
    .map((entry) => ({
      time: entry.checkedAt,
      price: entry.priceCents! / 100,
    }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#1E2A3F" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(value: string) => formatDateTime(value)}
            stroke="#5A6478"
            fontSize={11}
            fontFamily="JetBrains Mono"
            minTickGap={40}
          />
          <YAxis
            stroke="#5A6478"
            fontSize={11}
            fontFamily="JetBrains Mono"
            tickFormatter={(value: number) => formatCents(value * 100, currency)}
            width={90}
          />
          <Tooltip
            contentStyle={{
              background: "#121826",
              border: "1px solid #00F0FF33",
              borderRadius: 4,
              fontFamily: "JetBrains Mono",
              fontSize: 12,
            }}
            labelFormatter={(value: string) => formatDateTime(value)}
            formatter={(value: number) => [formatCents(value * 100, currency), "preço"]}
          />
          <ReferenceLine
            y={targetPriceCents / 100}
            stroke="#FF2E6C"
            strokeDasharray="6 4"
            label={{ value: "alvo", position: "insideTopLeft", fill: "#FF2E6C", fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#00F0FF"
            strokeWidth={2}
            dot={{ r: 2, fill: "#00F0FF" }}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
