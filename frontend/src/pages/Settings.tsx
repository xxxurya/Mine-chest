import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your account and preferences</p>
        </div>

        <div className="dashboard-card space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Company Information</h3>
            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label className="text-xs">Company Name</Label>
                <Input defaultValue="InvenTrack Pvt Ltd" className="h-9" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Default Currency</Label>
                <Input defaultValue="INR (₹)" className="h-9" disabled />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-4">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Low stock alerts</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Expiry warnings</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">PO status updates</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Email notifications</Label>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button size="sm">Save Changes</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
