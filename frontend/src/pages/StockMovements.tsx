import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { stockMovements } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons = {
  Inbound: ArrowDownLeft,
  Outbound: ArrowUpRight,
  Transfer: ArrowLeftRight,
  Adjustment: Settings2,
};

const typeColors = {
  Inbound: "text-success",
  Outbound: "text-destructive",
  Transfer: "text-primary",
  Adjustment: "text-warning",
};

const StockMovements = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return stockMovements.filter((m) => {
      const matchSearch = !search || m.productName.toLowerCase().includes(search.toLowerCase()) || m.sku.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || m.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Stock Movements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all inventory movements</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search movements..." className="pl-9 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] h-9"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Inbound">Inbound</SelectItem>
              <SelectItem value="Outbound">Outbound</SelectItem>
              <SelectItem value="Transfer">Transfer</SelectItem>
              <SelectItem value="Adjustment">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="dashboard-card p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">SKU</TableHead>
                <TableHead className="text-xs">Product</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs text-right">Qty</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Destination</TableHead>
                <TableHead className="text-xs">Handled By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => {
                const Icon = typeIcons[m.type];
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-sm text-muted-foreground">{m.date}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{m.sku}</TableCell>
                    <TableCell className="font-medium text-sm">{m.productName}</TableCell>
                    <TableCell>
                      <span className={cn("flex items-center gap-1.5 text-sm font-medium", typeColors[m.type])}>
                        <Icon className="w-3.5 h-3.5" />
                        {m.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-right font-medium">{m.quantity > 0 ? `+${m.quantity}` : m.quantity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.source}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.destination}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.handledBy}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StockMovements;
