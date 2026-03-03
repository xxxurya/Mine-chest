import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Download, FileText, TrendingDown, BarChart3, Truck, Package } from "lucide-react";

const reports = [
  { title: "Inventory Valuation", description: "Current stock value across all warehouses", icon: Package },
  { title: "Aging Inventory", description: "Products sitting in stock for extended periods", icon: TrendingDown },
  { title: "Stock Turnover", description: "How quickly inventory is sold and replaced", icon: BarChart3 },
  { title: "Dead Stock Analysis", description: "Items with no movement in 90+ days", icon: FileText },
  { title: "Supplier Performance", description: "Delivery accuracy and quality metrics", icon: Truck },
];

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Generate and export inventory reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div key={report.title} className="dashboard-card flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-3">
                  <report.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-card-foreground">{report.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />PDF
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" />Excel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
