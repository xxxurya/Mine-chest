import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { fetchWithAuth } from "../api";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  "PENDING": "bg-secondary text-secondary-foreground border-border",
  "IN_PROGRESS": "bg-primary/10 text-primary border-primary/20",
  "COMPLETED": "bg-success/10 text-success border-success/20",
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Date" },
  { value: "title", label: "Title" },
  { value: "status", label: "Status" },
];

const ORDER_OPTIONS = [
  { value: "DESC", label: "Newest First" },
  { value: "ASC", label: "Oldest First" },
];

const TASKS_PER_PAGE = 10;

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("DESC");

  const fetchTasks = useCallback(async (page: number, search: string, sort: string, sortOrder: string) => {
    try {
      setIsLoading(true);
      
      // Build endpoint with server-side pagination, search, and sorting
      let endpoint = `/api/tasks/assigned?page=${page}&limit=${TASKS_PER_PAGE}&sortBy=${sort}&order=${sortOrder}`;
      
      // Add search query parameter for server-side filtering
      if (search.trim()) {
        endpoint += `&q=${encodeURIComponent(search.trim())}`;
      }
      
      const data = await fetchWithAuth(endpoint);
      
      // Handle response with pagination metadata from backend
      if (data.tasks && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        setTotalTasks(data.total || 0);
        // Update total pages from backend response
        if (data.pagination && data.pagination.totalPages) {
          setTotalPages(data.pagination.totalPages);
        } else {
          setTotalPages(Math.ceil((data.total || 0) / TASKS_PER_PAGE) || 1);
        }
      } else if (Array.isArray(data)) {
        // Fallback for array response
        setTasks(data);
        setTotalTasks(data.length);
        setTotalPages(1);
      } else {
        setTasks([]);
        setTotalTasks(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch tasks when page, search, or sort changes
  useEffect(() => {
    fetchTasks(currentPage, searchQuery, sortBy, order);
  }, [currentPage, fetchTasks, searchQuery, sortBy, order]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Reset to page 1 when search changes
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOrder(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your assigned tasks
          </p>
        </div>

        {/* Search Bar - Server-side search with q parameter */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Sort Options - Dropdown for sort field and order */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Sort by:</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Order:</label>
            <select
              value={order}
              onChange={handleOrderChange}
              className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ORDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter UI - Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                statusFilter === filter.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground">
              {searchQuery ? "No tasks match your search" : "No tasks found"}
            </p>
          </div>
        ) : (
          <>
            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <Card key={task.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold">
                        {task.title}
                      </CardTitle>
                      <span className={cn("status-pill border", statusStyles[task.status] || "bg-muted text-muted-foreground border-border")}>
                        {task.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="mb-2">
                      {task.description || "No description provided"}
                    </CardDescription>
                    <div className="text-xs text-muted-foreground mt-4">
                      <p>Assigned: {task.created_at ? new Date(task.created_at).toLocaleDateString() : "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    currentPage === 1
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    currentPage >= totalPages
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;
