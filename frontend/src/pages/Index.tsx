import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import {
  StockMovementChart,
  StockByCategoryChart,
  WarehouseDistributionChart,
  InboundOutboundChart,
} from "@/components/dashboard/Charts";
import { kpiData, formatCurrency, formatNumber } from "@/data/mockData";
import {
  IndianRupee,
  Package,
  AlertTriangle,
  XCircle,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Inventory overview and real-time insights</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard
            title="Inventory Value"
            value={formatCurrency(kpiData.totalInventoryValue)}
            icon={IndianRupee}
            trend={{ value: "12.5% vs last month", positive: true }}
            delay={0}
          />
          <KpiCard
            title="Total SKUs"
            value={formatNumber(kpiData.totalSKUs)}
            icon={Package}
            trend={{ value: "23 new this month", positive: true }}
            delay={50}
          />
          <KpiCard
            title="Low Stock"
            value={kpiData.lowStockItems.toString()}
            icon={AlertTriangle}
            trend={{ value: "8 more than last week", positive: false }}
            delay={100}
          />
          <KpiCard
            title="Out of Stock"
            value={kpiData.outOfStockItems.toString()}
            icon={XCircle}
            trend={{ value: "3 resolved today", positive: true }}
            delay={150}
          />
          <KpiCard
            title="Pending POs"
            value={kpiData.pendingPurchaseOrders.toString()}
            icon={ShoppingCart}
            trend={{ value: "5 arriving this week", positive: true }}
            delay={200}
          />
          <KpiCard
            title="Stock Turnover"
            value={kpiData.stockTurnoverRatio.toFixed(1) + "x"}
            icon={TrendingUp}
            trend={{ value: "0.3 improvement", positive: true }}
            delay={250}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StockMovementChart />
          <StockByCategoryChart />
          <WarehouseDistributionChart />
          <InboundOutboundChart />
        </div>

        {/* Alerts */}
        <AlertsPanel />
      </div>
    </DashboardLayout>
  );
};

export default Index;
