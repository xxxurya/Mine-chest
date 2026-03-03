import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { suppliers } from "@/data/mockData";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Star } from "lucide-react";

const Suppliers = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage supplier relationships and performance</p>
        </div>

        <div className="dashboard-card p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Supplier</TableHead>
                <TableHead className="text-xs">Contact</TableHead>
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs text-right">Total Orders</TableHead>
                <TableHead className="text-xs text-right">On-Time %</TableHead>
                <TableHead className="text-xs text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id} className="cursor-pointer">
                  <TableCell className="font-medium text-sm">{s.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.contact}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="text-sm text-right">{s.totalOrders}</TableCell>
                  <TableCell className="text-sm text-right">{s.onTimeDelivery}%</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-warning">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {s.rating}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;
