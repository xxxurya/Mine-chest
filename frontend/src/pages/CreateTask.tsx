import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchUsers, createTask } from "../api";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

interface User {
  id: number;
  username: string;
  role: string;
}

const CreateTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch users on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load users";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsFetchingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Client-side validation
  const isValid = title.trim() !== "" && assignedTo !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        assigned_to: parseInt(assignedTo),
      });

      setSuccess("Task created successfully!");
      toast.success("Task created successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setAssignedTo("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Create Task</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create a new task and assign it to a team member
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="bg-success/10 border-success/20 text-success">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Create Task Form */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
            <CardDescription>
              Fill in the details below to create a new task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Field */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-foreground">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter task title"
                  className={cn(
                    "w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    title.trim() === "" && "border-muted-foreground/50"
                  )}
                  required
                />
                {title.trim() === "" && (
                  <p className="text-xs text-muted-foreground">Title is required</p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description (optional)"
                  rows={4}
                  className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* Assigned To Field */}
              <div className="space-y-2">
                <label htmlFor="assignedTo" className="text-sm font-medium text-foreground">
                  Assign To <span className="text-destructive">*</span>
                </label>
                {isFetchingUsers ? (
                  <div className="flex items-center justify-center py-2">
                    <p className="text-sm text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <select
                    id="assignedTo"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className={cn(
                      "w-full px-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                      assignedTo === "" && "border-muted-foreground/50"
                    )}
                    required
                  >
                    <option value="">Select a team member</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.role})
                      </option>
                    ))}
                  </select>
                )}
                {assignedTo === "" && (
                  <p className="text-xs text-muted-foreground">Please select a team member</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isValid || isLoading}
                className={cn(
                  "w-full px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isValid && !isLoading
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isLoading ? "Creating..." : "Create Task"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateTask;
