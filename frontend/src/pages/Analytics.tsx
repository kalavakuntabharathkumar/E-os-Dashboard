import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useAnalyticsSummary } from "@/api/generated";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#1f2937", "#4b5563", "#9ca3af", "#d1d5db"];

export default function Analytics() {
  const { data, isLoading } = useAnalyticsSummary();

  if (isLoading) return <p className="text-sm text-gray-400">Loading analytics…</p>;
  if (!data) return <p className="text-sm text-red-400">Failed to load analytics</p>;

  const kpis = [
    { label: "Total Employees", value: data.employees },
    { label: "Total Revenue", value: `$${data.revenue.toLocaleString()}` },
    { label: "Open Tasks", value: data.open_tasks },
    { label: "Total Leads", value: data.leads_by_status.reduce((a, b) => a + b.count, 0) },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6 text-gray-800">Analytics Engine</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader><CardTitle>{k.label}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Leads by Status — Pie */}
        <Card>
          <CardHeader><CardTitle>Leads by Status</CardTitle></CardHeader>
          <CardContent>
            {data.leads_by_status.length === 0 ? (
              <p className="text-sm text-gray-400">No leads data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.leads_by_status}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {data.leads_by_status.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tasks by Status — Bar */}
        <Card>
          <CardHeader><CardTitle>Tasks by Status</CardTitle></CardHeader>
          <CardContent>
            {data.tasks_by_status.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks data</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.tasks_by_status} margin={{ left: -20 }}>
                  <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1f2937" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
