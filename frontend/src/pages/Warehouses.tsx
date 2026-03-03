import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { warehouses, formatCurrency, formatNumber } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { MapPin, Package, IndianRupee, User } from "lucide-react";
import { cn } from "@/lib/utils";

const Warehouses = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Warehouses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor warehouse capacity and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((wh) => (
            <div key={wh.id} className="dashboard-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-card-foreground">{wh.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />{wh.location}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="w-3.5 h-3.5" />{wh.manager}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 rounded-lg bg-background">
                  <Package className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold">{formatNumber(wh.totalItems)}</p>
                  <p className="text-xs text-muted-foreground">Items</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-background">
                  <IndianRupee className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm font-semibold">{formatCurrency(wh.inventoryValue)}</p>
                  <p className="text-xs text-muted-foreground">Value</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-background">
                  <p className={cn(
                    "text-sm font-semibold",
                    wh.capacityUsage > 75 ? "text-warning" : "text-success"
                  )}>{wh.capacityUsage}%</p>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Capacity Usage</span>
                  <span className="font-medium">{wh.capacityUsage}%</span>
                </div>
                <Progress value={wh.capacityUsage} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Warehouses;
