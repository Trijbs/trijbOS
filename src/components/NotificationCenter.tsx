import { X } from "lucide-react";
import { useSystemStore } from "../system-store";

export function NotificationCenter() {
  const notifications = useSystemStore((state) => state.notifications);
  const clearNotifications = useSystemStore((state) => state.clearNotifications);
  const dismissNotification = useSystemStore((state) => state.dismissNotification);

  return (
    <aside aria-label="Notification center" className="notification-center">
      <div className="notification-header">
        <h2>Notifications</h2>
        {notifications.length > 0 ? (
          <button aria-label="Clear all notifications" onClick={() => void clearNotifications()} type="button">
            Clear all
          </button>
        ) : null}
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? <p>No recent notifications.</p> : null}
        {notifications.map((item) => (
          <article className={`notification-card tone-${item.tone} ${item.readAt ? "is-read" : "is-unread"}`} key={item.id}>
            <header>
              <strong>{item.title}</strong>
              <div className="notification-meta">
                <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                <button aria-label={`Dismiss ${item.title}`} onClick={() => void dismissNotification(item.id)} type="button">
                  <X size={14} />
                </button>
              </div>
            </header>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
