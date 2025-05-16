import { withAuth } from "@/components/with-auth";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <AnalyticsDashboard />
    </div>
  );
}

export default withAuth(AnalyticsPage);
