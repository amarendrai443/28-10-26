import { useEffect, useRef } from 'react';

const INACTIVITY_TIMEOUT_MS = 8 * 60 * 1000; // 8 minutes (480,000 ms)
const STORAGE_LAST_ACTIVE_KEY = 'nhealth_patient_last_active_time';
const STORAGE_BG_TIME_KEY = 'nhealth_patient_background_time';

/**
 * Hook to enforce 8-minute inactivity auto-refresh for logged-in patients.
 * If the patient exits the app, switches apps/tabs, or remains idle for >= 8 minutes,
 * returning triggers an app refresh that lands them directly on the "Overview" page.
 */
export function usePatientInactivityRefresh(isLoggedInPatient: boolean) {
  const lastActiveRef = useRef<number>(Date.now());
  const isRefreshingRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isLoggedInPatient || typeof window === 'undefined') return;

    // Helper: Perform clean refresh and land on the Overview tab
    const triggerOverviewRefresh = () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;

      try {
        localStorage.setItem('nhealth_patient_tab', 'overview');
        sessionStorage.setItem('nhealth_patient_tab', 'overview');
        localStorage.setItem('nhealth_active_route', 'patient-dashboard');
        sessionStorage.setItem('nhealth_active_route', 'patient-dashboard');
        localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, Date.now().toString());
        localStorage.removeItem(STORAGE_BG_TIME_KEY);
      } catch {}

      // Hard redirect and refresh to guarantee fresh state landed on Overview
      const targetUrl = '/patient-dashboard#overview';
      if (window.location.pathname === '/patient-dashboard' && window.location.hash === '#overview') {
        window.location.reload();
      } else {
        window.location.href = targetUrl;
        window.location.reload();
      }
    };

    // Check on hook initialization if past inactivity threshold
    try {
      const storedActive = Number(localStorage.getItem(STORAGE_LAST_ACTIVE_KEY) || 0);
      const storedBg = Number(localStorage.getItem(STORAGE_BG_TIME_KEY) || 0);
      const lastRecorded = Math.max(storedActive, storedBg);

      if (lastRecorded > 0 && Date.now() - lastRecorded >= INACTIVITY_TIMEOUT_MS) {
        triggerOverviewRefresh();
        return;
      }
    } catch {}

    // Initialize timestamps
    lastActiveRef.current = Date.now();
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, Date.now().toString());
    } catch {}

    // Handler to check elapsed time and refresh if >= 8 minutes
    const checkInactivityAndResume = () => {
      try {
        const storedActive = Number(localStorage.getItem(STORAGE_LAST_ACTIVE_KEY) || lastActiveRef.current);
        const storedBg = Number(localStorage.getItem(STORAGE_BG_TIME_KEY) || 0);
        const referenceTime = Math.max(storedActive, storedBg, lastActiveRef.current);
        const elapsed = Date.now() - referenceTime;

        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          triggerOverviewRefresh();
          return;
        }

        // Within 8 minutes: update active timestamp
        lastActiveRef.current = Date.now();
        localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, Date.now().toString());
        localStorage.removeItem(STORAGE_BG_TIME_KEY);
      } catch {}
    };

    // 1. Visibility Change: App minimized / tab switched / mobile phone locked
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const now = Date.now();
        lastActiveRef.current = now;
        try {
          localStorage.setItem(STORAGE_BG_TIME_KEY, now.toString());
          localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, now.toString());
        } catch {}
      } else if (document.visibilityState === 'visible') {
        checkInactivityAndResume();
      }
    };

    // 2. Window Focus & Page Show (re-entering from another app / browser tab)
    const handleFocus = () => {
      checkInactivityAndResume();
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      checkInactivityAndResume();
    };

    const handlePageHide = () => {
      try {
        const now = Date.now();
        localStorage.setItem(STORAGE_BG_TIME_KEY, now.toString());
        localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, now.toString());
      } catch {}
    };

    // 3. User Interaction Throttling (keeps active timestamp current when in active use)
    let throttleTimeout: NodeJS.Timeout | null = null;
    const handleUserActivity = () => {
      const now = Date.now();
      const elapsed = now - lastActiveRef.current;

      // If user became active after 8 minutes of idle without switching tabs
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        checkInactivityAndResume();
        return;
      }

      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          lastActiveRef.current = Date.now();
          try {
            localStorage.setItem(STORAGE_LAST_ACTIVE_KEY, lastActiveRef.current.toString());
          } catch {}
          throttleTimeout = null;
        }, 5000); // Throttle writes to every 5s
      }
    };

    // 4. Periodic background check interval (every 30 seconds)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          triggerOverviewRefresh();
        }
      }
    }, 30000);

    // Attach event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);

    const userEvents: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    userEvents.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      userEvents.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      clearInterval(intervalId);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isLoggedInPatient]);
}
