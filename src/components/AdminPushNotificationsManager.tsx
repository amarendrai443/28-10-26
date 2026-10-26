import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  Edit3 as Edit,
  Send,
  Calendar,
  Clock,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Eye,
  EyeOff,
  AlertCircle,
  Video,
  HeartPulse,
  Smartphone
} from 'lucide-react';
import {
  PushNotificationItem,
  getStoredPushNotifications,
  createPushNotification,
  updatePushNotification,
  deletePushNotification,
  dispatchNotificationNow,
  checkAndDispatchScheduledNotifications,
  PUSH_NOTIFICATIONS_UPDATED_EVENT
} from '../utils/pushNotificationStorage';

export const AdminPushNotificationsManager: React.FC = () => {
  const [notifications, setNotifications] = useState<PushNotificationItem[]>(getStoredPushNotifications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PushNotificationItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState<PushNotificationItem['category']>('general');
  const [formTargetUrl, setFormTargetUrl] = useState('/patient-dashboard#overview');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImagePreview, setFormImagePreview] = useState('');
  const [formDispatchMode, setFormDispatchMode] = useState<'immediate' | 'schedule'>('immediate');
  const [formScheduledDate, setFormScheduledDate] = useState('');
  const [formScheduledTime, setFormScheduledTime] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete State
  const [deletingItem, setDeletingItem] = useState<PushNotificationItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleSync = () => setNotifications(getStoredPushNotifications());
    window.addEventListener(PUSH_NOTIFICATIONS_UPDATED_EVENT, handleSync);

    // Background timer to check and trigger scheduled notifications every 15 seconds
    const interval = setInterval(() => {
      const dispatched = checkAndDispatchScheduledNotifications();
      if (dispatched > 0) {
        showToast(`✓ Automatic Scheduler: ${dispatched} scheduled notification(s) sent.`);
      }
    }, 15000);

    return () => {
      window.removeEventListener(PUSH_NOTIFICATIONS_UPDATED_EVENT, handleSync);
      clearInterval(interval);
    };
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormBody('');
    setFormCategory('general');
    setFormTargetUrl('/patient-dashboard#overview');
    setFormImageUrl('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80');
    setFormImagePreview('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80');
    setFormDispatchMode('immediate');

    // Default scheduled time to 1 hour from now
    const nextHour = new Date(Date.now() + 60 * 60 * 1000);
    setFormScheduledDate(nextHour.toISOString().split('T')[0]);
    setFormScheduledTime(nextHour.toTimeString().slice(0, 5));

    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: PushNotificationItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormBody(item.body);
    setFormCategory(item.category);
    setFormTargetUrl(item.targetUrl || '/patient-dashboard#overview');
    setFormImageUrl(item.imageUrl || '');
    setFormImagePreview(item.imageUrl || '');
    setFormDispatchMode(item.status === 'scheduled' ? 'schedule' : 'immediate');

    if (item.scheduledFor) {
      try {
        const d = new Date(item.scheduledFor);
        setFormScheduledDate(d.toISOString().split('T')[0]);
        setFormScheduledTime(d.toTimeString().slice(0, 5));
      } catch {
        const nextHour = new Date(Date.now() + 60 * 60 * 1000);
        setFormScheduledDate(nextHour.toISOString().split('T')[0]);
        setFormScheduledTime(nextHour.toTimeString().slice(0, 5));
      }
    } else {
      const nextHour = new Date(Date.now() + 60 * 60 * 1000);
      setFormScheduledDate(nextHour.toISOString().split('T')[0]);
      setFormScheduledTime(nextHour.toTimeString().slice(0, 5));
    }

    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image size exceeds 3MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setFormImageUrl(res);
      setFormImagePreview(res);
      showToast('✓ Image uploaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formBody.trim()) {
      setUploadError('Please provide both a notification title and message body.');
      return;
    }

    let scheduledForIso: string | undefined = undefined;
    if (formDispatchMode === 'schedule') {
      if (!formScheduledDate || !formScheduledTime) {
        setUploadError('Please specify both a scheduled date and time.');
        return;
      }
      try {
        scheduledForIso = new Date(`${formScheduledDate}T${formScheduledTime}:00`).toISOString();
      } catch {
        setUploadError('Invalid date or time format.');
        return;
      }
    }

    if (editingItem) {
      updatePushNotification(editingItem.id, {
        title: formTitle.trim(),
        body: formBody.trim(),
        category: formCategory,
        targetUrl: formTargetUrl.trim(),
        imageUrl: formImageUrl.trim() || undefined,
        status: formDispatchMode === 'immediate' ? 'sent' : 'scheduled',
        scheduledFor: formDispatchMode === 'schedule' ? scheduledForIso : undefined,
        sentAt: formDispatchMode === 'immediate' ? new Date().toISOString() : editingItem.sentAt,
      });

      if (formDispatchMode === 'immediate') {
        dispatchNotificationNow({
          ...editingItem,
          title: formTitle.trim(),
          body: formBody.trim(),
          category: formCategory,
          targetUrl: formTargetUrl.trim(),
          imageUrl: formImageUrl.trim() || undefined,
        });
        showToast(`✓ Notification "${formTitle}" dispatched immediately!`);
      } else {
        showToast(`✓ Notification "${formTitle}" scheduled for ${formScheduledDate} at ${formScheduledTime}.`);
      }
    } else {
      createPushNotification({
        title: formTitle.trim(),
        body: formBody.trim(),
        category: formCategory,
        targetUrl: formTargetUrl.trim(),
        imageUrl: formImageUrl.trim() || undefined,
        dispatchMode: formDispatchMode,
        scheduledFor: scheduledForIso,
      });

      if (formDispatchMode === 'immediate') {
        showToast(`✓ Notification "${formTitle}" created and sent immediately!`);
      } else {
        showToast(`✓ Notification "${formTitle}" scheduled for ${formScheduledDate} at ${formScheduledTime}.`);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deletePushNotification(deletingItem.id);
    showToast(`✓ Deleted notification "${deletingItem.title}".`);
    setDeletingItem(null);
  };

  const handleSendNow = (item: PushNotificationItem) => {
    dispatchNotificationNow(item);
    showToast(`✓ Dispatched "${item.title}" to all users now!`);
  };

  const sentCount = notifications.filter((n) => n.status === 'sent').length;
  const scheduledCount = notifications.filter((n) => n.status === 'scheduled').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002b49] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-teal-400 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Stats Card */}
      <div className="bg-gradient-to-r from-[#00172b] via-[#02213a] to-[#002b49] text-white p-5 sm:p-6 rounded-3xl border border-teal-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30 shadow-inner">
              <Bell className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Web Push Engine
                </span>
                <span className="text-xs font-mono text-emerald-300 font-bold">
                  {sentCount} Sent · {scheduledCount} Scheduled
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Push Notifications &amp; Scheduled Broadcasts
              </h3>
              <p className="text-xs text-teal-100/80 max-w-xl">
                Compose, schedule, or immediately dispatch native device notifications with custom media and deep links to patients and doctors.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Create Notification</span>
            </button>
          </div>
        </div>

        {/* Live Device Notification Mockup Preview */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-200">
            <span className="font-bold flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-teal-300" />
              <span>Native Lock Screen Push Notification Preview</span>
            </span>
            <span className="text-[11px] text-teal-300/70">
              Auto-Scheduler Active
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 sm:p-4 rounded-2xl border border-teal-500/20 max-w-xl">
            <div className="bg-slate-900/90 text-white p-3.5 rounded-xl border border-white/10 shadow-lg flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/30 border border-teal-400/40 p-1 flex items-center justify-center shrink-0">
                <img src="/splash-logo.png" alt="Nhealth" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-0.5">
                  <span className="font-bold uppercase tracking-wider text-teal-300">NHEALTH HEALTHCARE</span>
                  <span>Just now</span>
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {notifications[0]?.title || 'Consultation Video Room Ready'}
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {notifications[0]?.body || 'Your doctor has connected. Tap to join the live video session now.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#002b49]">
              Notification Queue &amp; History ({notifications.length})
            </h4>
            <p className="text-xs text-slate-500">
              Manage immediate alerts, scheduled delivery queues, images, and action links.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Status &amp; Time</th>
                <th className="py-3 px-4">Media</th>
                <th className="py-3 px-4">Notification Content</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Action URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((item) => {
                const isSent = item.status === 'sent';
                const isScheduled = item.status === 'scheduled';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isSent ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Sent (Dispatched)</span>
                          </span>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            {item.sentAt ? new Date(item.sentAt).toLocaleString('en-IN') : 'Recent'}
                          </div>
                        </div>
                      ) : isScheduled ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Scheduled</span>
                          </span>
                          <div className="text-[10px] font-mono text-amber-700 font-bold mt-1">
                            {item.scheduledFor ? new Date(item.scheduledFor).toLocaleString('en-IN') : 'Upcoming'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Media Preview */}
                    <td className="py-3 px-4">
                      {item.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <img src={item.imageUrl} alt="Attached" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">No Image</span>
                      )}
                    </td>

                    {/* Title & Body */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-sm text-[#002b49]">{item.title}</div>
                      <div className="text-slate-500 text-xs mt-0.5 line-clamp-2">{item.body}</div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="capitalize font-bold text-xs text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </td>

                    {/* Action URL */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {item.targetUrl || 'Default'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isScheduled && (
                          <button
                            type="button"
                            onClick={() => handleSendNow(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Send Immediately"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Now</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Notification"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT NOTIFICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Bell className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  {editingItem ? 'Edit Push Notification' : 'Compose Web Push Notification'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              {/* Dispatch Mode Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Dispatch Delivery Mode *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormDispatchMode('immediate')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formDispatchMode === 'immediate'
                        ? 'bg-teal-50 border-[#008080] ring-2 ring-teal-500/20 text-[#002b49]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Send Immediately</span>
                      <Send className="w-4 h-4 text-[#008080]" />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Dispatches instantly via Web Push to all devices
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormDispatchMode('schedule')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      formDispatchMode === 'schedule'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Schedule for Future</span>
                      <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Triggers automatically at exact date &amp; time
                    </span>
                  </button>
                </div>
              </div>

              {/* Schedule Date & Time Pickers */}
              {formDispatchMode === 'schedule' && (
                <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-2">
                  <span className="text-xs font-bold text-amber-950 block">
                    Pick Target Delivery Date &amp; Time
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-amber-900 font-semibold mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={formScheduledDate}
                        onChange={(e) => setFormScheduledDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-amber-900 font-semibold mb-1">Time</label>
                      <input
                        type="time"
                        required
                        value={formScheduledTime}
                        onChange={(e) => setFormScheduledTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-800 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Doctor Ramesh Joined Your Video Consultation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Message Body *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="e.g. Your doctor is waiting in the video call room. Tap to enter the consultation room now."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Category Type
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  >
                    <option value="doctor">Doctor Video Connection</option>
                    <option value="appointment">Appointment / Booking</option>
                    <option value="vitals">Vital Lens Scan Report</option>
                    <option value="critical">Critical Clinical Alert</option>
                    <option value="general">General Healthcare Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Action / Target Route
                  </label>
                  <select
                    value={formTargetUrl}
                    onChange={(e) => setFormTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  >
                    <option value="/online-consultation">Online Consultation (Video Room)</option>
                    <option value="/patient-dashboard#overview">Patient Dashboard Overview</option>
                    <option value="/patient-dashboard#vitals">Vital Lens™ Health Vault</option>
                    <option value="/patient-dashboard#history">Booking History</option>
                    <option value="/patient-dashboard#invoices">Invoices &amp; Orders</option>
                    <option value="/">Homepage</option>
                  </select>
                </div>
              </div>

              {/* Attached Image (Upload or URL) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Notification Media / Banner Image (Upload or URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => {
                      setFormImageUrl(e.target.value);
                      setFormImagePreview(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {formImagePreview && (
                  <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shrink-0">
                      <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-bold text-[#002b49] block">Media Preview Verified</span>
                      <span>Rendered in native device notification &amp; user detail popup.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold cursor-pointer shadow-md flex items-center gap-1.5"
                >
                  {formDispatchMode === 'immediate' ? (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Now</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Schedule Delivery</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-black text-slate-900">
                Delete Notification?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>"{deletingItem.title}"</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Delete Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
