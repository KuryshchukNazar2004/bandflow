"use client"

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

interface AnalyticsDashboardProps {
  monthlyData: { name: string; total: number }[]
  views: number
  conversionRate: number
  avgPrice: number
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("uk-UA").format(n) + " ₴"

export function AnalyticsDashboard({
  monthlyData,
  views,
  conversionRate,
  avgPrice,
}: AnalyticsDashboardProps) {
  const lastIndex = monthlyData.length - 1

  return (
    <div className="space-y-4">
      {/* Bar chart card */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="font-semibold mb-6">Бронювань по місяцях</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={monthlyData} barCategoryGap="35%" margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 13 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(124,58,237,0.06)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                fontSize: 13,
              }}
              formatter={(v) => [v, "Бронювань"]}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={90}>
              {monthlyData.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === lastIndex ? "#7C3AED" : "#EDE9FE"}
                />
              ))}
              <LabelList
                dataKey="total"
                position="top"
                formatter={(v: unknown) => (Number(v) > 0 ? String(v) : "")}
                style={{ fill: "#7C3AED", fontSize: 13, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="text-4xl font-bold text-violet-600">{views}</div>
          <div className="mt-2 font-medium">Переглядів профілю</div>
          <div className="text-sm text-muted-foreground">цього місяця</div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="text-4xl font-bold text-violet-600">{conversionRate}%</div>
          <div className="mt-2 font-medium">Конверсія</div>
          <div className="text-sm text-muted-foreground">переглядів → бронь</div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="text-4xl font-bold text-violet-600">{formatPrice(avgPrice)}</div>
          <div className="mt-2 font-medium">Середній чек</div>
          <div className="text-sm text-muted-foreground">за виступ</div>
        </div>
      </div>
    </div>
  )
}
