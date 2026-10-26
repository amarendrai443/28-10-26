import React, { useState, useEffect } from 'react';
import { Bell, X, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { requestNotificationPermission, triggerNativeDeviceNotification } from '../utils/pushNotificationStorage';

export const NotificationPermissionPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    setPermissionState(Notification.permission);

    // If permission is already granted or denied, or dismissed this session, don't show
    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return;
    }

    const dismissed = sessionStorage.getItem('nhealth_notif_prompt_dismissed');
    if (!dismissed) {
      // Show after a subtle 2.5 second delay so the page loads first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnable = async () => {
    const perm = await requestNotificationPermission();
    setPermissionState(perm);
    setIsVisible(false);

    if (perm === 'granted') {
      triggerNativeDeviceNotification(
        'Nhealth Notifications Enabled',
        'You will receive instant alerts for doctor video calls, vital scans, and appointment confirmations.',
        { targetUrl: '/patient-dashboard#overview' }
      );
    } else {
      sessionStorage.setItem('nhealth_notif_prompt_dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('nhealth_notif_prompt_dismissed', 'true');
  };

  if (!isVisible || permissionState === 'granted' || permissionState === 'denied') {
    return null;
  }

  return (
    <div className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#00172b]/95 backdrop-blur-md text-white p-4 sm:p-5 rounded-2xl border border-teal-500/40 shadow-2xl animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-400/30">
              Web Push Alerts
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-white mt-1">
            Allow Healthcare Alerts?
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Get notified immediately when your <strong>doctor connects</strong>, your <strong>Vital Lens™ report</strong> is ready, or your home visit is confirmed.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
        >
          Not Now
        </button>
        <button
          type="button"
          onClick={handleEnable}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5 text-slate-950" />
          <span>Allow Alerts</span>
        </button>
      </div>
    </div>
  );
};
