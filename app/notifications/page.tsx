import { withAuth } from "@/components/with-auth";
import NotificationList from "@/components/notifications/notification-list";

function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <NotificationList />
    </div>
  );
}

export default withAuth(NotificationsPage);
