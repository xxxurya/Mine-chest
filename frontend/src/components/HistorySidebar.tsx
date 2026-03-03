import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Clock, User, Activity, AlertCircle } from "lucide-react";
import { fetchAuditHistory } from "../api";
import { cn } from "@/lib/utils";

interface AuditEvent {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  performedBy: number;
  performedByRole?: string;
  timestamp: string;
  details?: any;
}

interface HistorySidebarProps {
  taskId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const actionLabels: Record<string, string> = {
  "CREATE": "Created",
  "UPDATE": "Updated",
  "DELETE": "Deleted",
  "APPROVE": "Approved",
  "REJECT": "Rejected",
  "ASSIGN": "Assigned",
  "STATUS_CHANGE": "Status Changed",
};

const actionStyles: Record<string, string> = {
  "CREATE": "bg-green-100 text-green-800 border-green-200",
  "UPDATE": "bg-blue-100 text-blue-800 border-blue-200",
  "DELETE": "bg-red-100 text-red-800 border-red-200",
  "APPROVE": "bg-green-100 text-green-800 border-green-200",
  "REJECT": "bg-red-100 text-red-800 border-red-200",
  "ASSIGN": "bg-purple-100 text-purple-800 border-purple-200",
  "STATUS_CHANGE": "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const HistorySidebar = ({ taskId, isOpen, onClose }: HistorySidebarProps) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskId && isOpen) {
      loadHistory();
    }
  }, [taskId, isOpen]);

  const loadHistory = async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await fetchAuditHistory("tasks", taskId);
      // Sort by timestamp descending (newest first)
      const sortedEvents = Array.isArray(data) 
        ? data.sort((a: AuditEvent, b: AuditEvent) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        : [];
      setEvents(sortedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleClose = () => {
    setEvents([]);
    setError("");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="sm:max-w-[400px] w-[350px]">
        <SheetHeader>
          <SheetTitle>Task History</SheetTitle>
          <SheetDescription>
            Chronological events for this task
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 h-full">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
              <Clock className="h-12 w-12 opacity-20 mb-2" />
              <p>No history available</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div
                    key={event.id || index}
                    className={cn(
                      "relative pl-6 pb-4 border-l-2 border-muted",
                      index === events.length - 1 && "border-l-transparent"
                    )}
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-0 w-3 h-3 rounded-full border-2 border-background",
                        actionStyles[event.action] || "bg-muted"
                      )}
                      style={{
                        backgroundColor: actionStyles[event.action]?.split(' ')[0]?.replace('bg-', 'var(--') || 'var(--muted)',
                        transform: 'translateX(-1px)'
                      }}
                    />

                    {/* Event content */}
                    <div className="space-y-2">
                      {/* Action and status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-md text-xs font-medium border",
                            actionStyles[event.action] || "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          {actionLabels[event.action] || event.action}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="text-sm space-y-1">
                        {/* Who performed the action */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>
                            {event.performedByRole 
                              ? `${event.performedByRole}` 
                              : `User #${event.performedBy}`}
                          </span>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-xs">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>

                        {/* Additional details if available */}
                        {event.details && (
                          <div className="flex items-start gap-2 text-muted-foreground mt-2">
                            <Activity className="h-3 w-3 mt-0.5" />
                            <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
                              {JSON.stringify(event.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HistorySidebar;
