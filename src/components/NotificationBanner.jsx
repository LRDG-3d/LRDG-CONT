import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";

const SEEN_KEY = "last-seen-notification";

function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true // Safari/iOS instalado
  );
}

export default function NotificationBanner() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!isStandaloneApp()) return;

    const q = query(
      collection(db, "notifications"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      const docSnap = snapshot.docs[0];
      const data = { id: docSnap.id, ...docSnap.data() };
      const lastSeen = localStorage.getItem(SEEN_KEY);
      if (lastSeen !== data.id) {
        setNotification(data);
      }
    });

    return unsubscribe;
  }, []);

  if (!notification) return null;

  function handleDismiss() {
    localStorage.setItem(SEEN_KEY, notification.id);
    setNotification(null);
  }

  return (
    <div className="notification-banner">
      <p className="notification-banner__text">{notification.message}</p>
      <button
        type="button"
        className="notification-banner__close"
        onClick={handleDismiss}
        aria-label="Cerrar aviso"
      >
        ×
      </button>
    </div>
  );
}
