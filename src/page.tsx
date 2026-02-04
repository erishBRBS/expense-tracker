import { AppSidebar } from "@/components/app-sidebar";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <div className="p-6">
          <DashboardContent />
        </div>
      </main>
    </div>
  );
}
