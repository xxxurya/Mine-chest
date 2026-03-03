import { alerts } from "@/data/mockData";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AlertsPanel() {
  return (
    <div className="dashboard-card">
      <h3 className="text-base font-semibold text-card-foreground mb-4">Active Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/50"
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
              alert.type === "critical" ? "bg-destructive/10" : "bg-warning/10"
            )}>
              {alert.type === "critical" ? (
                <AlertCircle className="w-4 h-4 text-destructive" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-card-foreground truncate">{alert.title}</p>
                <span className={alert.type === "critical" ? "alert-badge-critical" : "alert-badge-warning"}>
                  {alert.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{alert.message}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{alert.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
