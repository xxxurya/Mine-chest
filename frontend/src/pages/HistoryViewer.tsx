import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2,
  AlertCircle,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  History,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAuditHistory } from "../api";

// Entity types that can be audited
const ENTITY_TYPES = [
  { value: "task", label: "Task" },
  { value: "request", label: "Request" },
  { value: "product", label: "Product" },
  { value: "purchase_order", label: "Purchase Order" },
  { value: "stock_movement", label: "Stock Movement" },
  { value: "user", label: "User" },
  { value: "supplier", label: "Supplier" },
  { value: "warehouse", label: "Warehouse" },
];

// Action type icons and colors
const actionConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  "CREATED": { icon: Plus, color: "text-green-600", bgColor: "bg-green-100" },
  "UPDATED": { icon: Edit, color: "text-blue-600", bgColor: "bg-blue-100" },
  "DELETED": { icon: Trash2, color: "text-red-600", bgColor: "bg-red-100" },
  "APPROVED": { icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
  "REJECTED": { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100" },
  "ASSIGNED": { icon: User, color: "text-purple-600", bgColor: "bg-purple-100" },
  "STATUS_CHANGED": { icon: Clock, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  "VIEWED": { icon: History, color: "text-gray-600", bgColor: "bg-gray-100" },
};

interface AuditEntry {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  description: string;
  performedBy: string;
  performedByRole?: string;
  createdAt: string;
  metadata?: Record<string, any>;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

const HistoryViewer = () => {
  const [entityType, setEntityType] = useState<string>("");
  const [entityId, setEntityId] = useState<string>("");
  const [history, setHistory] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!entityType || !entityId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchAuditHistory(entityType, entityId);
      setHistory(data);
      setHasSearched(true);
    } catch (err: any) {
      setError(err.message || "Failed to load history");
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = (action: string) => {
    return actionConfig[action] || { icon: History, color: "text-gray-600", bgColor: "bg-gray-100" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  const getStatusChangeDisplay = (entry: AuditEntry) => {
    if (entry.previousValue && entry.newValue) {
      return (
        <div className="mt-2 p-2 bg-muted rounded-md text-xs">
          <span className="text-muted-foreground">Changed from: </span>
          <span className="font-medium">{entry.previousValue}</span>
          <ArrowRight className="inline w-3 h-3 mx-1" />
          <span className="font-medium">{entry.newValue}</span>
        </div>
      );
    }
    return null;
  };

  const getReasonDisplay = (entry: AuditEntry) => {
    if (entry.reason) {
      return (
        <div className="mt-2 p-2 bg-red-50 rounded-md text-xs text-red-800">
          <span className="font-medium">Reason: </span>
          {entry.reason}
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">History Viewer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View the complete audit trail of actions for any entity
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle>Search History</CardTitle>
            <CardDescription>
              Enter the entity type and ID to view its complete history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="entityType">Entity Type</Label>
                <Select value={entityType} onValueChange={setEntityType}>
                  <SelectTrigger id="entityType">
                    <SelectValue placeholder="Select entity type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="entityId">Entity ID</Label>
                <Input
                  id="entityId"
                  type="number"
                  placeholder="Enter entity ID"
                  value={entityId}
                  onChange={(e) => setEntityId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={!entityType || !entityId || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <History className="mr-2 h-4 w-4" />
                      View History
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && (
          <>
            {history.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="mx-auto h-12 w-12 opacity-20" />
                    <p className="mt-4 text-lg">No history found</p>
                    <p className="text-sm">No audit entries exist for this entity</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>
                    Showing {history.length} audit {history.length === 1 ? "entry" : "entries"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                    <div className="space-y-6">
                      {history.map((entry, index) => {
                        const config = getActionConfig(entry.action);
                        const Icon = config.icon;

                        return (
                          <div key={entry.id} className="relative flex gap-4">
                            {/* Timeline dot */}
                            <div className={cn(
                              "relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                              config.bgColor
                            )}>
                              <Icon className={cn("w-5 h-5", config.color)} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-6">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={cn("font-semibold px-2 py-0.5 rounded-full text-xs", config.bgColor, config.color)}>
                                      {entry.action.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {entry.entityType} #{entry.entityId}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-sm font-medium">
                                    {entry.description}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(entry.createdAt)}
                                </span>
                              </div>

                              {/* User info */}
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span>{entry.performedBy}</span>
                                {entry.performedByRole && (
                                  <span className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                    {entry.performedByRole}
                                  </span>
                                )}
                              </div>

                              {/* Status change display */}
                              {getStatusChangeDisplay(entry)}

                              {/* Reason display */}
                              {getReasonDisplay(entry)}

                              {/* Metadata display */}
                              {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                                <div className="mt-2 p-2 bg-muted rounded-md text-xs">
                                  <span className="text-muted-foreground">Additional details: </span>
                                  {Object.entries(entry.metadata).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key}: </span>
                                      {typeof value === "object" ? JSON.stringify(value) : String(value)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Empty state before search */}
        {!loading && !hasSearched && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <History className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-4 text-lg">Search for entity history</p>
                <p className="text-sm">Enter an entity type and ID above to view its audit trail</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HistoryViewer;
