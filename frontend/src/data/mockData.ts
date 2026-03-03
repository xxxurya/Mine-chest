// Mock data for the inventory management dashboard

export const kpiData = {
  totalInventoryValue: 24567890,
  totalSKUs: 3842,
  lowStockItems: 47,
  outOfStockItems: 12,
  pendingPurchaseOrders: 23,
  stockTurnoverRatio: 4.2,
};

export const stockMovementData = [
  { month: "Oct", inbound: 4200, outbound: 3800 },
  { month: "Nov", inbound: 3900, outbound: 4100 },
  { month: "Dec", inbound: 5100, outbound: 4500 },
  { month: "Jan", inbound: 4600, outbound: 3900 },
  { month: "Feb", inbound: 5300, outbound: 4800 },
  { month: "Mar", inbound: 4800, outbound: 5200 },
];

export const stockByCategoryData = [
  { category: "Electronics", value: 1240 },
  { category: "Clothing", value: 890 },
  { category: "Food & Bev", value: 560 },
  { category: "Furniture", value: 340 },
  { category: "Chemicals", value: 220 },
  { category: "Raw Materials", value: 592 },
];

export const warehouseDistribution = [
  { name: "Mumbai Central", value: 35 },
  { name: "Delhi NCR", value: 28 },
  { name: "Bangalore Hub", value: 22 },
  { name: "Chennai Port", value: 15 },
];

export const alerts = [
  { id: 1, type: "critical", title: "Low Stock: USB-C Cables", message: "Only 12 units remaining. Reorder point: 50", time: "2 min ago" },
  { id: 2, type: "warning", title: "Expiring Soon: Organic Milk Batch #4521", message: "Expires in 3 days. 200 units in stock", time: "15 min ago" },
  { id: 3, type: "critical", title: "Out of Stock: Wireless Mouse M200", message: "0 units available. 45 pending orders", time: "1 hr ago" },
  { id: 4, type: "warning", title: "Overstock: Paper Clips Box", message: "3,400 units (280% of target). Consider redistribution", time: "2 hr ago" },
  { id: 5, type: "warning", title: "Delayed Delivery: PO-2024-0891", message: "Supplier: TechParts Ltd. Expected: Feb 28. Status: In Transit", time: "3 hr ago" },
];

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Discontinued";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  availableQty: number;
  reservedQty: number;
  costPrice: number;
  sellingPrice: number;
  status: ProductStatus;
}

export const products: Product[] = [
  { id: "1", sku: "ELC-001", name: "USB-C Cable 1m", category: "Electronics", warehouse: "Mumbai Central", availableQty: 12, reservedQty: 5, costPrice: 120, sellingPrice: 249, status: "Low Stock" },
  { id: "2", sku: "ELC-002", name: "Wireless Mouse M200", category: "Electronics", warehouse: "Delhi NCR", availableQty: 0, reservedQty: 0, costPrice: 450, sellingPrice: 899, status: "Out of Stock" },
  { id: "3", sku: "CLT-010", name: "Cotton T-Shirt L", category: "Clothing", warehouse: "Bangalore Hub", availableQty: 340, reservedQty: 20, costPrice: 180, sellingPrice: 499, status: "In Stock" },
  { id: "4", sku: "FNB-005", name: "Organic Milk 500ml", category: "Food & Bev", warehouse: "Mumbai Central", availableQty: 200, reservedQty: 0, costPrice: 28, sellingPrice: 45, status: "In Stock" },
  { id: "5", sku: "FRN-020", name: "Office Chair Ergonomic", category: "Furniture", warehouse: "Chennai Port", availableQty: 85, reservedQty: 12, costPrice: 4500, sellingPrice: 8999, status: "In Stock" },
  { id: "6", sku: "ELC-015", name: "HDMI Cable 2m", category: "Electronics", warehouse: "Delhi NCR", availableQty: 560, reservedQty: 30, costPrice: 90, sellingPrice: 199, status: "In Stock" },
  { id: "7", sku: "CHM-003", name: "Isopropyl Alcohol 1L", category: "Chemicals", warehouse: "Chennai Port", availableQty: 25, reservedQty: 10, costPrice: 220, sellingPrice: 380, status: "Low Stock" },
  { id: "8", sku: "RWM-008", name: "Steel Rods Bundle", category: "Raw Materials", warehouse: "Mumbai Central", availableQty: 430, reservedQty: 100, costPrice: 3200, sellingPrice: 4800, status: "In Stock" },
  { id: "9", sku: "CLT-025", name: "Denim Jeans 32", category: "Clothing", warehouse: "Bangalore Hub", availableQty: 0, reservedQty: 0, costPrice: 650, sellingPrice: 1499, status: "Out of Stock" },
  { id: "10", sku: "ELC-030", name: "Bluetooth Speaker Mini", category: "Electronics", warehouse: "Delhi NCR", availableQty: 178, reservedQty: 15, costPrice: 800, sellingPrice: 1599, status: "In Stock" },
  { id: "11", sku: "FRN-035", name: "Standing Desk 120cm", category: "Furniture", warehouse: "Mumbai Central", availableQty: 42, reservedQty: 8, costPrice: 12000, sellingPrice: 24999, status: "In Stock" },
  { id: "12", sku: "FNB-012", name: "Green Tea Box (25 bags)", category: "Food & Bev", warehouse: "Bangalore Hub", availableQty: 890, reservedQty: 50, costPrice: 85, sellingPrice: 175, status: "In Stock" },
];

export interface StockMovement {
  id: string;
  date: string;
  sku: string;
  productName: string;
  type: "Inbound" | "Outbound" | "Transfer" | "Adjustment";
  quantity: number;
  source: string;
  destination: string;
  handledBy: string;
}

export const stockMovements: StockMovement[] = [
  { id: "1", date: "2024-03-01", sku: "ELC-001", productName: "USB-C Cable 1m", type: "Inbound", quantity: 500, source: "TechParts Ltd", destination: "Mumbai Central", handledBy: "Rajesh K." },
  { id: "2", date: "2024-03-01", sku: "CLT-010", productName: "Cotton T-Shirt L", type: "Outbound", quantity: 120, source: "Bangalore Hub", destination: "Retail Store #5", handledBy: "Priya M." },
  { id: "3", date: "2024-02-28", sku: "FRN-020", productName: "Office Chair Ergonomic", type: "Transfer", quantity: 30, source: "Mumbai Central", destination: "Chennai Port", handledBy: "Amit S." },
  { id: "4", date: "2024-02-28", sku: "ELC-015", productName: "HDMI Cable 2m", type: "Adjustment", quantity: -15, source: "Delhi NCR", destination: "Delhi NCR", handledBy: "Sneha R." },
  { id: "5", date: "2024-02-27", sku: "FNB-005", productName: "Organic Milk 500ml", type: "Inbound", quantity: 1000, source: "Dairy Fresh Co", destination: "Mumbai Central", handledBy: "Rajesh K." },
  { id: "6", date: "2024-02-27", sku: "RWM-008", productName: "Steel Rods Bundle", type: "Outbound", quantity: 200, source: "Mumbai Central", destination: "Construction Site A", handledBy: "Vikram P." },
  { id: "7", date: "2024-02-26", sku: "CHM-003", productName: "Isopropyl Alcohol 1L", type: "Inbound", quantity: 300, source: "ChemSupply Inc", destination: "Chennai Port", handledBy: "Amit S." },
  { id: "8", date: "2024-02-26", sku: "ELC-030", productName: "Bluetooth Speaker Mini", type: "Transfer", quantity: 50, source: "Delhi NCR", destination: "Bangalore Hub", handledBy: "Priya M." },
];

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  amount: number;
  status: "Draft" | "Ordered" | "Received" | "Cancelled";
  expectedDelivery: string;
  items: number;
}

export const purchaseOrders: PurchaseOrder[] = [
  { id: "1", poNumber: "PO-2024-0901", supplier: "TechParts Ltd", amount: 245000, status: "Ordered", expectedDelivery: "2024-03-10", items: 12 },
  { id: "2", poNumber: "PO-2024-0900", supplier: "Dairy Fresh Co", amount: 56000, status: "Received", expectedDelivery: "2024-02-28", items: 4 },
  { id: "3", poNumber: "PO-2024-0899", supplier: "FabricWorld", amount: 189000, status: "Ordered", expectedDelivery: "2024-03-15", items: 8 },
  { id: "4", poNumber: "PO-2024-0898", supplier: "SteelCorp India", amount: 780000, status: "Draft", expectedDelivery: "2024-03-20", items: 3 },
  { id: "5", poNumber: "PO-2024-0897", supplier: "ChemSupply Inc", amount: 92000, status: "Ordered", expectedDelivery: "2024-03-08", items: 6 },
  { id: "6", poNumber: "PO-2024-0896", supplier: "WoodCraft Pvt", amount: 340000, status: "Cancelled", expectedDelivery: "2024-03-05", items: 5 },
  { id: "7", poNumber: "PO-2024-0895", supplier: "TechParts Ltd", amount: 125000, status: "Received", expectedDelivery: "2024-02-25", items: 10 },
];

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  totalItems: number;
  inventoryValue: number;
  capacityUsage: number;
  manager: string;
}

export const warehouses: Warehouse[] = [
  { id: "1", name: "Mumbai Central", location: "Mumbai, MH", totalItems: 12450, inventoryValue: 8900000, capacityUsage: 78, manager: "Rajesh Kumar" },
  { id: "2", name: "Delhi NCR", location: "Gurugram, HR", totalItems: 9820, inventoryValue: 6700000, capacityUsage: 65, manager: "Sneha Reddy" },
  { id: "3", name: "Bangalore Hub", location: "Bangalore, KA", totalItems: 7650, inventoryValue: 5200000, capacityUsage: 52, manager: "Priya Menon" },
  { id: "4", name: "Chennai Port", location: "Chennai, TN", totalItems: 5340, inventoryValue: 3700000, capacityUsage: 41, manager: "Amit Singh" },
];

export const suppliers = [
  { id: "1", name: "TechParts Ltd", contact: "Arun Mehta", email: "arun@techparts.com", phone: "+91 98765 43210", totalOrders: 145, onTimeDelivery: 92, rating: 4.5 },
  { id: "2", name: "Dairy Fresh Co", contact: "Meera Joshi", email: "meera@dairyfresh.in", phone: "+91 87654 32109", totalOrders: 89, onTimeDelivery: 97, rating: 4.8 },
  { id: "3", name: "FabricWorld", contact: "Karan Shah", email: "karan@fabricworld.com", phone: "+91 76543 21098", totalOrders: 67, onTimeDelivery: 85, rating: 4.0 },
  { id: "4", name: "SteelCorp India", contact: "Deepak Verma", email: "deepak@steelcorp.in", phone: "+91 65432 10987", totalOrders: 34, onTimeDelivery: 88, rating: 4.2 },
  { id: "5", name: "ChemSupply Inc", contact: "Nisha Patel", email: "nisha@chemsupply.com", phone: "+91 54321 09876", totalOrders: 56, onTimeDelivery: 91, rating: 4.3 },
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("en-IN").format(value);
};
