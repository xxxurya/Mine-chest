import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchWithAuth } from "../api";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assigned_to: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  changes: Record<string, any>;
  created_at: string;
}

interface TaskDetailsModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusStyles: Record<string, string> = {
  "PENDING": "bg-secondary text-secondary-foreground border-border",
  "IN_PROGRESS": "bg-primary/10 text-primary border-primary/20",
  "COMPLETED": "bg-success/10 text-success border-success/20",
  "APPROVED": "bg-success/10 text-success border-success/20",
  "REJECTED": "bg-destructive/10 text-destructive border-destructive/20",
};

const statusLabels: Record<string, string> = {
  "PENDING": "Pending",
  "IN_PROGRESS": "In Progress",
  "COMPLETED": "Completed",
  "APPROVED": "Approved",
  "REJECTED": "Rejected",
};

const TaskDetailsModal = ({ taskId, isOpen, onClose }: TaskDetailsModalProps) => {
  const [taskDetails, setTaskDetails] = useState<{ task: Task; auditHistory: AuditLog[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (taskId && isOpen) {
      loadTaskDetails();
    }
  }, [taskId, isOpen]);

  const loadTaskDetails = async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError("");

    try {
      // Fetch from GET /api/tasks/:id/details
      const data = await fetchWithAuth(`/api/tasks/${taskId}/details`);
      setTaskDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load task details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTaskDetails(null);
    setError("");
    onClose();
  };

  // Build timeline from audit history
  const getTimeline = () => {
    if (!taskDetails?.auditHistory) return [];
    
    return taskDetails.auditHistory.map((log) => {
      let statusChange = null;
      
      // Extract status change from audit log
      if (log.changes && log.changes.status) {
        statusChange = {
          from: log.changes.status.from || log.changes.status.from === '' ? statusLabels[log.changes.status.from] || log.changes.status.from : 'Unknown',
          to: log.changes.status.to ? statusLabels[log.changes.status.to] || log.changes.status.to : 'Unknown'
        };
      }

      return {
        id: log.id,
        action: log.action,
        statusChange,
        userId: log.user_id,
        timestamp: log.created_at
      };
    });
  };

  const timeline = getTimeline();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Task Details</DialogTitle>
          <DialogDescription>
            View full details and history of the task
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading task details...</p>
          </div>
        ) : taskDetails?.task ? (
          <div className="space-y-6">
            {/* Task Title and Status */}
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-foreground">{taskDetails.task.title}</h3>
              <Badge className={cn("border", statusStyles[taskDetails.task.status] || "bg-muted text-muted-foreground border-border")}>
                {statusLabels[taskDetails.task.status] || taskDetails.task.status}
              </Badge>
            </div>

            {/* Task Description */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Description</h4>
              <p className="text-sm text-muted-foreground">
                {taskDetails.task.description || "No description provided"}
              </p>
            </div>

            {/* Task Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Task ID</p>
                <p className="text-sm font-medium text-foreground">#{taskDetails.task.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="text-sm font-medium text-foreground">User #{taskDetails.task.assigned_to}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Assigned By</p>
                <p className="text-sm font-medium text-foreground">User #{taskDetails.task.assigned_by}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="text-sm font-medium text-foreground">
                  {taskDetails.task.created_at ? new Date(taskDetails.task.created_at).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>

            {/* Timeline / Audit History */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Status Timeline</h4>
              
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">No history available</p>
              ) : (
                <div className="relative pl-6 space-y-4 border-l-2 border-muted">
                  {timeline.map((item) => (
                    <div key={item.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background"></div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {item.statusChange ? `Status changed: ${item.statusChange.from} → ${item.statusChange.to}` : item.action}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString() : "N/A"}
                        </p>
                        {item.userId && (
                          <p className="text-xs text-muted-foreground">
                            By: User #{item.userId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No task data available</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailsModal;
