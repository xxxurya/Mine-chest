import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import { stockMovementData, stockByCategoryData, warehouseDistribution } from "@/data/mockData";

const COLORS = [
  "hsl(234, 85%, 55%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 65%, 55%)",
  "hsl(190, 80%, 45%)",
  "hsl(0, 72%, 51%)",
];

export function StockMovementChart() {
  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Stock Movement (6 Months)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={stockMovementData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} />
          <Line type="monotone" dataKey="inbound" stroke="hsl(234, 85%, 55%)" strokeWidth={2} dot={{ r: 3 }} name="Inbound" />
          <Line type="monotone" dataKey="outbound" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ r: 3 }} name="Outbound" />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StockByCategoryChart() {
  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Stock by Category</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={stockByCategoryData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
          <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} />
          <Bar dataKey="value" fill="hsl(234, 85%, 55%)" radius={[4, 4, 0, 0]} name="Items" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WarehouseDistributionChart() {
  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Warehouse Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={warehouseDistribution}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {warehouseDistribution.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} />
          <Legend fontSize={12} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InboundOutboundChart() {
  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Inbound vs Outbound Trend</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={stockMovementData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
          <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
          <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(220, 13%, 91%)", fontSize: 12 }} />
          <Area type="monotone" dataKey="inbound" stackId="1" stroke="hsl(234, 85%, 55%)" fill="hsl(234, 85%, 55%, 0.15)" name="Inbound" />
          <Area type="monotone" dataKey="outbound" stackId="2" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%, 0.15)" name="Outbound" />
          <Legend />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
