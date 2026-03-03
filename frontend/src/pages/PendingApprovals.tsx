import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  AlertCircle,
  Package,
  User,
  Calendar,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchPendingRequests, approveRequest, rejectRequestWithReason } from "../api";

interface RequestItem {
  id: number;
  type: string;
  title: string;
  description: string;
  requestedBy: number;
  requestedAt: string;
  status: string;
  payload?: any;
  makerName?: string;
}

const statusStyles: Record<string, string> = {
  "PENDING": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "APPROVED": "bg-green-100 text-green-800 border-green-200",
  "REJECTED": "bg-red-100 text-red-800 border-red-200",
};

const PendingApprovals = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPendingRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || "Failed to load pending requests");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to load pending requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(id);
      await approveRequest(id);
      // Remove the approved request from the list
      setRequests(requests.filter(req => req.id !== id));
      toast({
        title: "Success",
        description: "Request approved successfully",
        variant: "default",
      });
    } catch (err: any) {
      setError(err.message || "Failed to approve request");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to approve request",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (id: number) => {
    setSelectedRequestId(id);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedRequestId || !rejectReason.trim()) return;

    try {
      setRejectSubmitting(true);
      await rejectRequestWithReason(selectedRequestId, rejectReason);
      // Remove the rejected request from the list
      setRequests(requests.filter(req => req.id !== selectedRequestId));
      setRejectDialogOpen(false);
      setSelectedRequestId(null);
      setRejectReason("");
      toast({
        title: "Success",
        description: "Request rejected successfully",
        variant: "default",
      });
    } catch (err: any) {
      setError(err.message || "Failed to reject request");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to reject request",
      });
    } finally {
      setRejectSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <span className={cn("status-pill border px-2 py-1 rounded-full text-xs font-medium", statusStyles[status] || "bg-muted text-muted-foreground border-border")}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getPayloadPreview = (payload: any) => {
    if (!payload) return "No payload";
    try {
      const preview = typeof payload === 'string' ? JSON.parse(payload) : payload;
      return JSON.stringify(preview, null, 2).substring(0, 100) + (JSON.stringify(preview).length > 100 ? "..." : "");
    } catch {
      return String(payload).substring(0, 100);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Pending Approvals</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review and approve pending requests
            </p>
          </div>
          <Button onClick={loadPendingRequests} variant="outline">
            Refresh
          </Button>
        </div>

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
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="mx-auto h-12 w-12 opacity-20" />
                <p className="mt-4 text-lg">No pending requests</p>
                <p className="text-sm">All caught up!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Maker Name</TableHead>
                    <TableHead>Requested Time</TableHead>
                    <TableHead>Payload Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">#{request.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
                            {request.type}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{request.makerName || `User #${request.requestedBy}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(request.requestedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground font-mono max-w-[150px] truncate">
                            {getPayloadPreview(request.payload)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(request.id)}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectClick(request.id)}
                            disabled={actionLoading === request.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this request. This will be visible to the requester.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Rejection Reason</Label>
              <Textarea
                id="rejectReason"
                placeholder="Enter the reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={rejectSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || rejectSubmitting}
            >
              {rejectSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PendingApprovals;
