// Store and broadcast real-time availability states for doctors

const STORAGE_KEY_GLOBAL = 'nhealth_doctor_global_online';
const STORAGE_KEY_PREFIX = 'nhealth_doc_avail_';
export const DOCTOR_AVAILABILITY_EVENT = 'nhealth_doctor_availability_changed';

export function getGlobalDoctorOnlineStatus(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY_GLOBAL);
    return val !== null ? val === 'true' : true; // Default: online
  } catch {
    return true;
  }
}

export function setGlobalDoctorOnlineStatus(isOnline: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_GLOBAL, String(isOnline));
    window.dispatchEvent(
      new CustomEvent(DOCTOR_AVAILABILITY_EVENT, {
        detail: { doctorId: 'all', isAvailable: isOnline },
      })
    );
  } catch (err) {
    console.error('Failed to set global doctor status:', err);
  }
}

export function isDoctorAvailable(doctorId: string, defaultVal: boolean = true): boolean {
  try {
    const specificVal = localStorage.getItem(STORAGE_KEY_PREFIX + doctorId);
    if (specificVal !== null) {
      return specificVal === 'true';
    }
    // Fall back to global status
    return getGlobalDoctorOnlineStatus();
  } catch {
    return defaultVal;
  }
}

export function setDoctorAvailability(doctorId: string, isAvailable: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + doctorId, String(isAvailable));
    window.dispatchEvent(
      new CustomEvent(DOCTOR_AVAILABILITY_EVENT, {
        detail: { doctorId, isAvailable },
      })
    );
  } catch (err) {
    console.error('Failed to set doctor availability:', err);
  }
}
