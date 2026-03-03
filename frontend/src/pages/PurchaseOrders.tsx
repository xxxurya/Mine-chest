import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { purchaseOrders, formatCurrency } from "@/data/mockData";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  Ordered: "bg-primary/10 text-primary",
  Received: "bg-success/10 text-success",
  Cancelled: "bg-destructive/10 text-destructive",
};

const PurchaseOrders = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage supplier orders and deliveries</p>
        </div>

        <div className="dashboard-card p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">PO Number</TableHead>
                <TableHead className="text-xs">Supplier</TableHead>
                <TableHead className="text-xs text-right">Items</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Expected Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchaseOrders.map((po) => (
                <TableRow key={po.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm font-medium">{po.poNumber}</TableCell>
                  <TableCell className="text-sm">{po.supplier}</TableCell>
                  <TableCell className="text-sm text-right">{po.items}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{formatCurrency(po.amount)}</TableCell>
                  <TableCell>
                    <span className={cn("status-pill", statusStyles[po.status])}>{po.status}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{po.expectedDelivery}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrders;
