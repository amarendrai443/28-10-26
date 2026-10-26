import React, { useState, useEffect } from 'react';
import {
  Bell,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  HeartPulse,
  Calendar,
  X,
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import {
  PushNotificationItem,
  getUserNotifications,
  removeNotificationFromUserInbox,
  USER_NOTIFICATIONS_UPDATED_EVENT
} from '../utils/pushNotificationStorage';

interface UserNotificationCenterProps {
  userId?: string;
  onNavigateTab?: (tabName: string) => void;
}

export const UserNotificationCenter: React.FC<UserNotificationCenterProps> = ({
  userId,
  onNavigateTab,
}) => {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(() =>
    getUserNotifications(userId)
  );
  const [selectedNotification, setSelectedNotification] = useState<PushNotificationItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const handleSync = () => {
      setNotifications(getUserNotifications(userId));
    };
    window.addEventListener(USER_NOTIFICATIONS_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(USER_NOTIFICATIONS_UPDATED_EVENT, handleSync);
  }, [userId]);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeNotificationFromUserInbox(id, userId);
    setNotifications(getUserNotifications(userId));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    showToast('Notification cleared from your inbox.');
  };

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'all') return true;
    return n.category === categoryFilter;
  });

  const getCategoryBadge = (cat: PushNotificationItem['category']) => {
    switch (cat) {
      case 'doctor':
        return {
          icon: Video,
          label: 'Doctor Call',
          style: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        };
      case 'vitals':
        return {
          icon: HeartPulse,
          label: 'Vital Scan',
          style: 'bg-purple-100 text-purple-800 border-purple-300',
        };
      case 'appointment':
        return {
          icon: Calendar,
          label: 'Booking',
          style: 'bg-teal-100 text-teal-800 border-teal-300',
        };
      case 'critical':
        return {
          icon: AlertCircle,
          label: 'Critical Alert',
          style: 'bg-red-100 text-red-800 border-red-300',
        };
      default:
        return {
          icon: Bell,
          label: 'Notification',
          style: 'bg-slate-100 text-slate-800 border-slate-300',
        };
    }
  };

  const formatTimestamp = (iso?: string) => {
    if (!iso) return 'Just now';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002b49] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-teal-400 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00172b] via-[#02213a] to-[#002b49] text-white p-5 sm:p-6 rounded-3xl border border-teal-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30 shadow-inner">
              <Bell className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Notification Center
                </span>
                <span className="text-xs font-mono text-teal-200 font-bold">
                  {notifications.length} Total Alerts
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Healthcare Updates &amp; Alerts Inbox
              </h3>
              <p className="text-xs text-teal-100/80 max-w-xl">
                Stay updated on doctor room connections, digital lab reports, contactless vitals readings, and home visit confirmations.
              </p>
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/10 rounded-2xl border border-white/15">
            {[
              { id: 'all', label: 'All' },
              { id: 'doctor', label: 'Doctors' },
              { id: 'vitals', label: 'Vitals' },
              { id: 'appointment', label: 'Bookings' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-teal-400 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-700">No Notifications in this view</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You are all caught up! When a doctor joins or your reports are ready, alerts will appear right here.
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const badge = getCategoryBadge(item.category);
            const Icon = badge.icon;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedNotification(item)}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-400 p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Thumbnail / Category Icon */}
                  {item.imageUrl ? (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt="Media Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                  )}

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badge.style}`}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        <span>{badge.label}</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimestamp(item.sentAt || item.createdAt)}</span>
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#002b49] group-hover:text-teal-700 transition-colors leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                      {item.body}
                    </p>
                  </div>
                </div>

                {/* Actions: View Details & Remove */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleRemove(e, item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                    title="Remove notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-teal-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* NOTIFICATION DETAIL POPUP MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const b = getCategoryBadge(selectedNotification.category);
                  const Icon = b.icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${b.style}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{b.label}</span>
                    </span>
                  );
                })()}
                <span className="text-xs font-mono text-slate-400">
                  {formatTimestamp(selectedNotification.sentAt || selectedNotification.createdAt)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Body */}
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#002b49] leading-snug">
                {selectedNotification.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-line">
                {selectedNotification.body}
              </p>
            </div>

            {/* Media Image Attachment */}
            {selectedNotification.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm max-h-64 flex items-center justify-center">
                <img
                  src={selectedNotification.imageUrl}
                  alt={selectedNotification.title}
                  className="w-full h-full object-cover max-h-64"
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={(e) => handleRemove(e, selectedNotification.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Alert</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Close
                </button>

                {selectedNotification.targetUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const url = selectedNotification.targetUrl || '/';
                      setSelectedNotification(null);
                      if (url.startsWith('/patient-dashboard#') && onNavigateTab) {
                        const tab = url.split('#')[1];
                        onNavigateTab(tab);
                      } else {
                        window.location.href = url;
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Open Action</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
