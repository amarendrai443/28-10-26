/**
 * Web Push Notifications Engine & Storage System for Nhealth
 * Supports immediate dispatch, scheduled queues, native Service Worker notifications,
 * and user notification inbox management.
 */

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  targetUrl?: string;
  category: 'doctor' | 'critical' | 'appointment' | 'vitals' | 'general';
  status: 'sent' | 'scheduled' | 'draft';
  scheduledFor?: string; // ISO string for scheduled dispatch
  sentAt?: string; // ISO string when actually dispatched
  createdAt: string;
  deletedByUsers?: string[]; // user IDs who removed this notification from their inbox
}

const STORAGE_KEY = 'nhealth_push_notifications';
export const PUSH_NOTIFICATIONS_UPDATED_EVENT = 'nhealth_push_notifications_updated';
export const USER_NOTIFICATIONS_UPDATED_EVENT = 'nhealth_user_notifications_updated';

export const INITIAL_NOTIFICATIONS: PushNotificationItem[] = [
  {
    id: 'push-doc-join',
    title: 'Dr. Ramesh Kumar is in the Video Room',
    body: 'Your live consultation is ready. Please tap to connect to video now.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    targetUrl: '/online-consultation',
    category: 'doctor',
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    deletedByUsers: [],
  },
  {
    id: 'push-vital-ready',
    title: 'Vital Lens™ Biometric Report Ready',
    body: 'Your 60-second contactless vitals scan has been calibrated and saved to your health vault.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    targetUrl: '/patient-dashboard#vitals',
    category: 'vitals',
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    deletedByUsers: [],
  },
  {
    id: 'push-booking-confirm',
    title: 'Appointment Confirmed: Home Diagnostics',
    body: 'A certified Nhealth phlebotomist has been assigned. Specimen collection scheduled for tomorrow.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    targetUrl: '/patient-dashboard#overview',
    category: 'appointment',
    status: 'sent',
    sentAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 305).toISOString(),
    deletedByUsers: [],
  },
];

export function getStoredPushNotifications(): PushNotificationItem[] {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_NOTIFICATIONS;
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveStoredPushNotifications(items: PushNotificationItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(PUSH_NOTIFICATIONS_UPDATED_EVENT, { detail: items }));
    window.dispatchEvent(new CustomEvent(USER_NOTIFICATIONS_UPDATED_EVENT, { detail: items }));
  } catch (err) {
    console.error('Failed to save push notifications to localStorage:', err);
  }
}

/**
 * Trigger native browser push notification via Service Worker registration or Notification API
 */
export async function triggerNativeDeviceNotification(
  title: string,
  body: string,
  options?: {
    imageUrl?: string;
    targetUrl?: string;
    tag?: string;
  }
): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const notificationOptions: NotificationOptions = {
    body,
    icon: '/splash-logo.png',
    badge: '/favicon-32x32.png',
    image: options?.imageUrl,
    tag: options?.tag || `nhealth-${Date.now()}`,
    data: {
      url: options?.targetUrl || '/',
    },
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    }
  } catch (err) {
    console.warn('ServiceWorker showNotification failed, trying Notification constructor:', err);
  }

  // Fallback to standard window Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const n = new Notification(title, notificationOptions);
      n.onclick = () => {
        window.focus();
        if (options?.targetUrl) {
          window.location.href = options.targetUrl;
        }
        n.close();
      };
      return true;
    } catch (e) {
      console.warn('Notification constructor failed:', e);
    }
  }

  return false;
}

/**
 * Dispatch an individual push notification immediately
 */
export function dispatchNotificationNow(item: PushNotificationItem): PushNotificationItem {
  const current = getStoredPushNotifications();
  const updatedItem: PushNotificationItem = {
    ...item,
    status: 'sent',
    sentAt: new Date().toISOString(),
  };

  const updated = current.map((n) => (n.id === item.id ? updatedItem : n));
  if (!current.some((n) => n.id === item.id)) {
    updated.unshift(updatedItem);
  }

  saveStoredPushNotifications(updated);

  // Trigger native push popup
  triggerNativeDeviceNotification(updatedItem.title, updatedItem.body, {
    imageUrl: updatedItem.imageUrl,
    targetUrl: updatedItem.targetUrl,
    tag: updatedItem.id,
  });

  return updatedItem;
}

export function createPushNotification(
  data: Omit<PushNotificationItem, 'id' | 'createdAt' | 'status'> & {
    dispatchMode: 'immediate' | 'schedule';
    scheduledFor?: string;
  }
): PushNotificationItem {
  const current = getStoredPushNotifications();
  const isImmediate = data.dispatchMode === 'immediate';

  const newItem: PushNotificationItem = {
    id: `push-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: data.title.trim(),
    body: data.body.trim(),
    imageUrl: data.imageUrl?.trim() || undefined,
    targetUrl: data.targetUrl?.trim() || '/patient-dashboard#overview',
    category: data.category || 'general',
    status: isImmediate ? 'sent' : 'scheduled',
    scheduledFor: !isImmediate && data.scheduledFor ? data.scheduledFor : undefined,
    sentAt: isImmediate ? new Date().toISOString() : undefined,
    createdAt: new Date().toISOString(),
    deletedByUsers: [],
  };

  const updated = [newItem, ...current];
  saveStoredPushNotifications(updated);

  if (isImmediate) {
    triggerNativeDeviceNotification(newItem.title, newItem.body, {
      imageUrl: newItem.imageUrl,
      targetUrl: newItem.targetUrl,
      tag: newItem.id,
    });
  }

  return newItem;
}

export function updatePushNotification(
  id: string,
  updates: Partial<PushNotificationItem>
): void {
  const current = getStoredPushNotifications();
  const updated = current.map((n) => (n.id === id ? { ...n, ...updates } : n));
  saveStoredPushNotifications(updated);
}

export function deletePushNotification(id: string): void {
  const current = getStoredPushNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveStoredPushNotifications(updated);
}

/**
 * Background Scheduler Queue:
 * Checks for any scheduled notification where scheduledFor <= now, and fires it!
 */
export function checkAndDispatchScheduledNotifications(): number {
  const current = getStoredPushNotifications();
  const now = new Date();
  let dispatchedCount = 0;

  const updated = current.map((item) => {
    if (item.status === 'scheduled' && item.scheduledFor) {
      const schedDate = new Date(item.scheduledFor);
      if (schedDate <= now) {
        dispatchedCount++;
        triggerNativeDeviceNotification(item.title, item.body, {
          imageUrl: item.imageUrl,
          targetUrl: item.targetUrl,
          tag: item.id,
        });
        return {
          ...item,
          status: 'sent' as const,
          sentAt: now.toISOString(),
        };
      }
    }
    return item;
  });

  if (dispatchedCount > 0) {
    saveStoredPushNotifications(updated);
  }

  return dispatchedCount;
}

/**
 * User Inbox Filtering: returns sent notifications not cleared by user
 */
export function getUserNotifications(userId?: string): PushNotificationItem[] {
  const all = getStoredPushNotifications();
  const uid = userId || 'default_user';

  return all.filter((n) => {
    if (n.status !== 'sent') return false;
    if (n.deletedByUsers && n.deletedByUsers.includes(uid)) return false;
    return true;
  });
}

/**
 * Delete / Remove single notification from User Inbox
 */
export function removeNotificationFromUserInbox(notificationId: string, userId?: string): void {
  const uid = userId || 'default_user';
  const all = getStoredPushNotifications();

  const updated = all.map((item) => {
    if (item.id === notificationId) {
      const deletedBy = Array.from(new Set([...(item.deletedByUsers || []), uid]));
      return { ...item, deletedByUsers: deletedBy };
    }
    return item;
  });

  saveStoredPushNotifications(updated);
}

/**
 * Request Browser Push Notification Permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Critical Event Dispatcher Helpers for instant user notification
 */
export function notifyDoctorJoined(doctorName: string, roomId?: string): void {
  createPushNotification({
    title: `${doctorName} Joined the Consultation`,
    body: 'Your doctor has arrived in the video consultation room. Tap to enter immediately.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    targetUrl: `/online-consultation${roomId ? `?room=${roomId}` : ''}`,
    category: 'doctor',
    dispatchMode: 'immediate',
  });
}

export function notifyAppointmentConfirmed(serviceName: string, bookingRef: string): void {
  createPushNotification({
    title: `Booking Confirmed: ${serviceName}`,
    body: `Your appointment (Ref: ${bookingRef}) is successfully confirmed. Clinician details will follow.`,
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    targetUrl: '/patient-dashboard#overview',
    category: 'appointment',
    dispatchMode: 'immediate',
  });
}

export function notifyVitalScanReady(metricsSummary: string): void {
  createPushNotification({
    title: 'Vital Lens™ Health Metrics Ready',
    body: `Contactless camera scan results: ${metricsSummary}. Digital PDF report generated.`,
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    targetUrl: '/patient-dashboard#vitals',
    category: 'vitals',
    dispatchMode: 'immediate',
  });
}
