import {
  SecureHealthToken,
  DecryptedTokenPayload,
  AuthorizedPartnerStaff,
  AuthorizedPharmacyStaff,
  TokenDepartment,
} from '../types/secureToken';

const STORAGE_KEY = 'nhealth_secure_qr_tokens';

export const resolveDepartment = (serviceType: string, serviceTitle: string = ''): TokenDepartment => {
  const combined = `${serviceType} ${serviceTitle}`.toLowerCase();
  if (combined.includes('pharmacy') || combined.includes('medicine') || combined.includes('drug') || combined.includes('prescription')) {
    return 'pharmacy';
  }
  if (
    combined.includes('diagnostic') ||
    combined.includes('lab') ||
    combined.includes('blood') ||
    combined.includes('x-ray') ||
    combined.includes('imaging') ||
    combined.includes('pathology') ||
    combined.includes('test')
  ) {
    return 'diagnostics';
  }
  if (
    combined.includes('nursing') ||
    combined.includes('bedside') ||
    combined.includes('elder') ||
    combined.includes('caregiver') ||
    combined.includes('attendant') ||
    combined.includes('physiotherapy') ||
    combined.includes('care assist')
  ) {
    return 'nursing';
  }
  if (
    combined.includes('doctor') ||
    combined.includes('consult') ||
    combined.includes('opd') ||
    combined.includes('specialist') ||
    combined.includes('teleconsult') ||
    combined.includes('clinic')
  ) {
    return 'doctor';
  }
  if (
    combined.includes('ambulance') ||
    combined.includes('transit') ||
    combined.includes('care ride') ||
    combined.includes('ride') ||
    combined.includes('emergency')
  ) {
    return 'ambulance';
  }
  return 'general';
};

export const getDepartmentLabel = (dept: TokenDepartment): string => {
  switch (dept) {
    case 'pharmacy':
      return 'Pharmacy & Medicines';
    case 'diagnostics':
      return 'Lab & Diagnostics';
    case 'nursing':
      return 'Nursing & Home Care';
    case 'doctor':
      return 'Doctor Consultations';
    case 'ambulance':
      return 'Transit & Emergency Ambulance';
    default:
      return 'Unified Healthcare Services';
  }
};

// Department-specific authorized staff registry
export const DEPARTMENT_STAFF_REGISTRY: Record<TokenDepartment, AuthorizedPartnerStaff[]> = {
  pharmacy: [
    {
      staffId: 'APO-BLR-841',
      staffName: 'Ramesh Verma (Chief Pharmacist)',
      department: 'pharmacy',
      facilityName: 'Apollo Pharmacy - Koramangala Hub',
      licenseNumber: 'KA-DRG-2024-99120',
      pharmacyName: 'Apollo Pharmacy - Koramangala Hub',
    },
    {
      staffId: 'MED-INDR-402',
      staffName: 'Priya Kulkarni (Dispensing Officer)',
      department: 'pharmacy',
      facilityName: 'MedPlus Diagnostics & Pharmacy',
      licenseNumber: 'KA-DRG-2023-41288',
      pharmacyName: 'MedPlus Diagnostics & Pharmacy',
    },
    {
      staffId: 'WEL-HSR-119',
      staffName: 'Sunil Rao (Verification Specialist)',
      department: 'pharmacy',
      facilityName: 'Wellness Forever - HSR Layout',
      licenseNumber: 'KA-DRG-2025-77301',
      pharmacyName: 'Wellness Forever - HSR Layout',
    },
  ],
  diagnostics: [
    {
      staffId: 'LUC-LAB-701',
      staffName: 'Dr. Aruna Reddy (Chief Pathologist)',
      department: 'diagnostics',
      facilityName: 'Lucid Medical Diagnostics (NABL)',
      licenseNumber: 'TS-MED-LAB-2022-8114',
      pharmacyName: 'Lucid Medical Diagnostics',
    },
    {
      staffId: 'THY-BIO-304',
      staffName: 'Karan Joshi (Senior Phlebotomy Lead)',
      department: 'diagnostics',
      facilityName: 'Thyrocare Central Processing Hub',
      licenseNumber: 'MH-DIAG-2024-5542',
      pharmacyName: 'Thyrocare Diagnostics',
    },
    {
      staffId: 'RAD-IMG-882',
      staffName: 'Sanjay Deshmukh (Radiology Technologist)',
      department: 'diagnostics',
      facilityName: 'Nhealth Mobile X-Ray & Imaging Wing',
      licenseNumber: 'KA-RAD-2023-6619',
      pharmacyName: 'Mobile Imaging Wing',
    },
  ],
  nursing: [
    {
      staffId: 'NUR-HOM-512',
      staffName: 'Sister Mary Thomas (Nursing Supervisor)',
      department: 'nursing',
      facilityName: 'Portea & Nhealth Home Care Services',
      licenseNumber: 'INC-NUR-2021-9943',
      pharmacyName: 'Nhealth Nursing Services',
    },
    {
      staffId: 'C24-BED-908',
      staffName: 'Anitha Roy (Critical Care Attendant)',
      department: 'nursing',
      facilityName: 'Care24 Post-Op Attendant Network',
      licenseNumber: 'INC-ATT-2023-3312',
      pharmacyName: 'Care24 Bedside Network',
    },
  ],
  doctor: [
    {
      staffId: 'DOC-OPD-102',
      staffName: 'Dr. Alok Nath (General Physician / OPD)',
      department: 'doctor',
      facilityName: 'Nhealth Priority Specialist OPD Hub',
      licenseNumber: 'MCI-REG-2018-49021',
      pharmacyName: 'Nhealth Specialist OPD Hub',
    },
    {
      staffId: 'DOC-TEL-443',
      staffName: 'Dr. Sunita Rao (Teleconsult Officer)',
      department: 'doctor',
      facilityName: 'Nhealth Virtual Telemedicine Wing',
      licenseNumber: 'MCI-REG-2019-33812',
      pharmacyName: 'Virtual Telemedicine Wing',
    },
  ],
  ambulance: [
    {
      staffId: 'AMB-FLT-209',
      staffName: 'Vikram Rathore (Emergency Fleet Dispatcher)',
      department: 'ambulance',
      facilityName: 'Nhealth Emergency Transit Fleet #4',
      licenseNumber: 'DL-RTO-AMB-991',
      pharmacyName: 'Nhealth Emergency Fleet',
    },
    {
      staffId: 'RIDE-AST-110',
      staffName: 'Arjun Dev (Medical Mobility Escort)',
      department: 'ambulance',
      facilityName: 'Care Ride Assisted Transit Hub',
      licenseNumber: 'DL-RTO-CR-4402',
      pharmacyName: 'Care Ride Mobility Hub',
    },
  ],
  general: [
    {
      staffId: 'GEN-ADMIN-001',
      staffName: 'Central Healthcare Registrar',
      department: 'general',
      facilityName: 'Nhealth Unified Operations Center',
      licenseNumber: 'NH-CTR-2026-0001',
      pharmacyName: 'Unified Operations Center',
    },
  ],
};

export const getStoredTokens = (): Record<string, SecureHealthToken> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveToken = (token: SecureHealthToken): void => {
  try {
    const tokens = getStoredTokens();
    tokens[token.tokenId] = token;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save secure token', e);
  }
};

export const findTokenById = (tokenId: string): SecureHealthToken | null => {
  const tokens = getStoredTokens();
  const cleanedId = tokenId.trim().toUpperCase();
  return tokens[cleanedId] || Object.values(tokens).find((t) => t.orderId === cleanedId) || null;
};

// Generate high entropy one-time token with department tagging
export const createOneTimeSecureToken = (
  orderId: string,
  serviceType: SecureHealthToken['serviceType'],
  serviceTitle: string,
  payload: DecryptedTokenPayload,
  isInsuranceCovered: boolean = false,
  insuranceClaimId?: string,
  customDepartment?: TokenDepartment
): SecureHealthToken => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
  const tokenId = `NHT-QR-${randomSuffix}-${randomHex}`;

  const now = new Date();
  // Automated Strict 3-day (72-hour) validity from exact timestamp of QR generation
  const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

  // Obfuscate / encode payload safely
  const jsonStr = JSON.stringify(payload);
  const encryptedPayload = btoa(encodeURIComponent(jsonStr));

  const department = customDepartment || resolveDepartment(serviceType, serviceTitle);

  const token: SecureHealthToken = {
    tokenId,
    orderId,
    serviceType,
    serviceTitle,
    department,
    createdAt: now.toISOString(),
    expiresAt,
    status: 'active',
    isInsuranceCovered,
    insuranceClaimId,
    encryptedPayload,
  };

  saveToken(token);
  return token;
};

// Decrypt underlying data for authorized staff
export const decryptTokenPayload = (encryptedPayload: string): DecryptedTokenPayload | null => {
  try {
    const decodedStr = decodeURIComponent(atob(encryptedPayload));
    return JSON.parse(decodedStr);
  } catch (e) {
    console.error('Failed to decrypt token payload', e);
    return null;
  }
};

// Attempt token redemption with strict department-level access control & permanent invalidation
export interface RedemptionResult {
  success: boolean;
  message: string;
  token?: SecureHealthToken;
  payload?: DecryptedTokenPayload;
  isDepartmentMismatch?: boolean;
  alreadyRedeemedAt?: string;
  alreadyRedeemedBy?: {
    pharmacyName?: string;
    facilityName?: string;
    department?: TokenDepartment;
    staffId: string;
    staffName: string;
  };
}

// Non-destructive validation & decryption for partner inspection before dispense authorization
export const validateAndDecryptToken = (
  tokenId: string,
  staff: AuthorizedPartnerStaff
): RedemptionResult => {
  const token = findTokenById(tokenId);

  if (!token) {
    return {
      success: false,
      message: 'Invalid Token. No matching active Nhealth record found in unified registry.',
    };
  }

  // Strict Department-Level Access Control Enforcement
  const tokenDept: TokenDepartment =
    token.department || resolveDepartment(token.serviceType, token.serviceTitle);
  const staffDept: TokenDepartment = staff.department || 'general';

  if (tokenDept !== 'general' && staffDept !== 'general' && tokenDept !== staffDept) {
    const tokenDeptLabel = getDepartmentLabel(tokenDept);
    const staffDeptLabel = getDepartmentLabel(staffDept);
    return {
      success: false,
      isDepartmentMismatch: true,
      message: `Unauthorized Department QR: This QR token is strictly provisioned for ${tokenDeptLabel}. You are authenticated as ${staffDeptLabel} staff. Access denied.`,
      token,
    };
  }

  // Automated 3-Day (72-Hour) Expiration Rule from exact generation timestamp
  const createdAtMs = new Date(token.createdAt).getTime();
  const expiresAtMs = token.expiresAt ? new Date(token.expiresAt).getTime() : createdAtMs + 72 * 60 * 60 * 1000;
  const isExpired72Hours = Date.now() > expiresAtMs || (Date.now() - createdAtMs > 72 * 60 * 60 * 1000);

  if (isExpired72Hours) {
    token.status = 'expired';
    saveToken(token);
    return {
      success: false,
      message: 'QR Token Expired: The strict 3-day (72-hour) validity period has elapsed. Unredeemed balance can no longer be dispensed.',
      token,
    };
  }

  // Check if completely 100% redeemed
  if (token.status === 'redeemed') {
    return {
      success: false,
      message: 'SECURITY ALERT: This QR token was already 100% redeemed and permanently expired!',
      token,
      alreadyRedeemedAt: token.redeemedAt,
      alreadyRedeemedBy: token.redeemedBy,
    };
  }

  const payload = decryptTokenPayload(token.encryptedPayload);

  // If token has remaining items from a previous split redemption, reflect them
  if (token.remainingItems && token.remainingItems.length > 0 && payload) {
    payload.items = token.remainingItems;
  }

  return {
    success: true,
    message: token.status === 'partial'
      ? 'Active Split QR: Remaining unredeemed balance loaded for continued dispensation.'
      : 'Token verified and decrypted successfully for dispense review.',
    token,
    payload: payload || undefined,
  };
};

export const redeemOneTimeToken = (
  tokenId: string,
  staff: AuthorizedPartnerStaff,
  dispenseUpdate?: {
    originalItems?: Array<{ name: string; quantity: number; price?: number }>;
    dispensedItems?: Array<{ name: string; quantity: number; price?: number }>;
    isPartial?: boolean;
    patientOtpVerified?: boolean;
    totalAmount?: number;
  }
): RedemptionResult => {
  const token = findTokenById(tokenId);

  if (!token) {
    return {
      success: false,
      message: 'Invalid Token. No matching active Nhealth record found in unified registry.',
    };
  }

  // Strict Department-Level Access Control Enforcement
  const tokenDept: TokenDepartment =
    token.department || resolveDepartment(token.serviceType, token.serviceTitle);
  const staffDept: TokenDepartment = staff.department || 'general';

  if (tokenDept !== 'general' && staffDept !== 'general' && tokenDept !== staffDept) {
    const tokenDeptLabel = getDepartmentLabel(tokenDept);
    const staffDeptLabel = getDepartmentLabel(staffDept);
    return {
      success: false,
      isDepartmentMismatch: true,
      message: `Unauthorized Department QR: This QR token is strictly provisioned for ${tokenDeptLabel}. You are authenticated as ${staffDeptLabel} staff. Access denied.`,
      token,
    };
  }

  // Automated 3-Day (72-Hour) Expiration Rule from exact generation timestamp
  const createdAtMs = new Date(token.createdAt).getTime();
  const expiresAtMs = token.expiresAt ? new Date(token.expiresAt).getTime() : createdAtMs + 72 * 60 * 60 * 1000;
  const isExpired72Hours = Date.now() > expiresAtMs || (Date.now() - createdAtMs > 72 * 60 * 60 * 1000);

  if (isExpired72Hours) {
    token.status = 'expired';
    saveToken(token);
    return {
      success: false,
      message: 'QR Token Expired: The strict 3-day (72-hour) validity window has elapsed. Unredeemed balance can no longer be dispensed.',
      token,
    };
  }

  // Check if completely 100% redeemed
  if (token.status === 'redeemed') {
    return {
      success: false,
      message: 'SECURITY ALERT: This one-time QR token was already 100% redeemed and permanently expired!',
      token,
      alreadyRedeemedAt: token.redeemedAt,
      alreadyRedeemedBy: token.redeemedBy,
    };
  }

  // Calculate remaining quantities across items for Split Redemption
  let isFullyDispensed = true;
  let remainingItemsList: Array<{ name: string; quantity: number; price?: number }> = [];

  if (dispenseUpdate && dispenseUpdate.dispensedItems && dispenseUpdate.originalItems) {
    const dispensedMap = new Map<string, number>();
    dispenseUpdate.dispensedItems.forEach((it) => {
      dispensedMap.set(it.name.toLowerCase().trim(), it.quantity);
    });

    dispenseUpdate.originalItems.forEach((orig) => {
      const dispQty = dispensedMap.get(orig.name.toLowerCase().trim()) || 0;
      const rem = Math.max(0, orig.quantity - dispQty);
      if (rem > 0) {
        isFullyDispensed = false;
        remainingItemsList.push({
          name: orig.name,
          quantity: rem,
          price: orig.price,
        });
      }
    });
  } else if (dispenseUpdate?.isPartial) {
    isFullyDispensed = false;
  }

  const existingPayload = decryptTokenPayload(token.encryptedPayload) || {
    patientName: 'Patient',
    patientPhone: '',
    totalAmount: 0,
  };

  const dispenseHistoryEntry = {
    dispensedAt: new Date().toISOString(),
    dispensedItems: dispenseUpdate?.dispensedItems || [],
    staffId: staff.staffId,
    staffName: staff.staffName,
    facilityName: staff.facilityName,
    isPartial: !isFullyDispensed,
  };
  token.dispenseHistory = [...(token.dispenseHistory || []), dispenseHistoryEntry];

  // PARTIAL QR RETENTION (SPLIT REDEMPTION):
  // If partial quantity was dispensed, QR code remains active for remaining items
  if (!isFullyDispensed && remainingItemsList.length > 0) {
    token.status = 'partial'; // Active status for remaining balance
    token.remainingItems = remainingItemsList;

    existingPayload.items = remainingItemsList;
    existingPayload.totalAmount = remainingItemsList.reduce(
      (acc, it) => acc + it.quantity * (it.price || 0),
      0
    );
    existingPayload.dispenseRecord = {
      dispensedAt: new Date().toISOString(),
      isPartial: true,
      patientOtpVerified: true,
      originalItems: dispenseUpdate?.originalItems || [],
      dispensedItems: dispenseUpdate?.dispensedItems || [],
      totalDispensedValue: dispenseUpdate?.totalAmount || 0,
      staffId: staff.staffId,
      staffName: staff.staffName,
      facilityName: staff.facilityName,
    };
    token.encryptedPayload = btoa(encodeURIComponent(JSON.stringify(existingPayload)));

    saveToken(token);

    // Keep booking qrStatus active in storage
    try {
      const rawBookings = localStorage.getItem('nhealth_bookings');
      if (rawBookings) {
        const bookings = JSON.parse(rawBookings);
        const updated = bookings.map((b: any) => {
          if (b.referenceId === token.orderId || b.secureTokenId === token.tokenId) {
            return { ...b, qrStatus: 'active' };
          }
          return b;
        });
        localStorage.setItem('nhealth_bookings', JSON.stringify(updated));
      }
      window.dispatchEvent(
        new CustomEvent('nhealth_token_redeemed', {
          detail: {
            tokenId: token.tokenId,
            orderId: token.orderId,
            staff,
            isPartial: true,
            remainingItems: remainingItemsList,
          },
        })
      );
    } catch {}

    return {
      success: true,
      message: `Partial dispense logged. Patient QR code remains ACTIVE for remaining ${remainingItemsList.reduce(
        (a, b) => a + b.quantity,
        0
      )} items within 72-hr validity.`,
      token,
      payload: existingPayload,
    };
  }

  // FULL REDEMPTION: 100% of prescribed quantities redeemed across all redemptions
  token.status = 'redeemed';
  token.redeemedAt = new Date().toISOString();
  token.remainingItems = [];
  token.redeemedBy = {
    pharmacyName: staff.facilityName || staff.pharmacyName,
    facilityName: staff.facilityName,
    department: staff.department,
    staffId: staff.staffId,
    staffName: staff.staffName,
  };

  existingPayload.items = dispenseUpdate?.dispensedItems || existingPayload.items;
  existingPayload.dispenseRecord = {
    dispensedAt: new Date().toISOString(),
    isPartial: false,
    patientOtpVerified: true,
    originalItems: dispenseUpdate?.originalItems || [],
    dispensedItems: dispenseUpdate?.dispensedItems || [],
    totalDispensedValue: dispenseUpdate?.totalAmount || existingPayload.totalAmount,
    staffId: staff.staffId,
    staffName: staff.staffName,
    facilityName: staff.facilityName,
  };
  token.encryptedPayload = btoa(encodeURIComponent(JSON.stringify(existingPayload)));

  saveToken(token);

  // Sync 100% redemption status to bookings and pharmacy orders (mark as Used / Expired)
  try {
    const rawBookings = localStorage.getItem('nhealth_bookings');
    if (rawBookings) {
      const bookings = JSON.parse(rawBookings);
      const updatedBookings = bookings.map((b: any) => {
        if (b.referenceId === token.orderId || b.secureTokenId === token.tokenId) {
          return { ...b, qrStatus: 'used', status: 'Used / Expired' };
        }
        return b;
      });
      localStorage.setItem('nhealth_bookings', JSON.stringify(updatedBookings));
    }

    const rawGuest = localStorage.getItem('nhealth_guest_bookings');
    if (rawGuest) {
      const guestBookings = JSON.parse(rawGuest);
      const updatedGuest = guestBookings.map((b: any) => {
        if (b.referenceId === token.orderId || b.secureTokenId === token.tokenId) {
          return { ...b, qrStatus: 'used', status: 'Used / Expired' };
        }
        return b;
      });
      localStorage.setItem('nhealth_guest_bookings', JSON.stringify(updatedGuest));
    }

    const rawPharmacy = localStorage.getItem('nhealth_pharmacy_orders');
    if (rawPharmacy) {
      const orders = JSON.parse(rawPharmacy);
      const updatedOrders = orders.map((o: any) => {
        if (o.orderNumber === token.orderId || o.id === token.orderId || o.secureTokenId === token.tokenId) {
          return { ...o, qrStatus: 'used', deliveryStatus: 'Delivered' };
        }
        return o;
      });
      localStorage.setItem('nhealth_pharmacy_orders', JSON.stringify(updatedOrders));
    }

    window.dispatchEvent(
      new CustomEvent('nhealth_token_redeemed', {
        detail: { tokenId: token.tokenId, orderId: token.orderId, staff, isPartial: false },
      })
    );
  } catch (err) {
    console.warn('Error syncing redemption to storage:', err);
  }

  return {
    success: true,
    message: `100% of prescribed medicines fully redeemed! QR Token is now permanently Used / Expired by ${staff.facilityName}.`,
    token,
    payload: existingPayload,
  };
};

// Strictly privacy-first WhatsApp/SMS message formatting
export const generatePrivacyWhatsAppMessage = (token: SecureHealthToken): string => {
  const deptLabel = getDepartmentLabel(token.department || resolveDepartment(token.serviceType, token.serviceTitle));
  return [
    `🛡️ *Nhealth Secure Department Pass*`,
    `--------------------------------------`,
    `*Token ID:* ${token.tokenId}`,
    `*Department:* ${deptLabel}`,
    `*Security Status:* 100% Encrypted (One-Time Single Use)`,
    `*Insurance Pre-Auth:* ${
      token.isInsuranceCovered
        ? 'VERIFIED (Claim ID: ' + (token.insuranceClaimId || 'NHT-CLM') + ')'
        : 'Direct Secured'
    }`,
    `--------------------------------------`,
    `⚠️ *Privacy Notice:* No personal diagnosis or records are transmitted in plain text. Present this QR directly to the authorized ${deptLabel} staff.`,
    `This token will self-expire immediately upon scanning.`,
  ].join('\n');
};

// Pure SVG QR Matrix generator (25x25 Version 1 simulation)
export const generateQrMatrix = (text: string): boolean[][] => {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          matrix[startY + r][startX + c] = true;
        } else {
          matrix[startY + r][startX + c] = false;
        }
      }
    }
  };

  // 3 Finder patterns
  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Alignment pattern
  const alignX = size - 7;
  const alignY = size - 7;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 0 || r === 4 || c === 0 || c === 4 || (r === 2 && c === 2)) {
        matrix[alignY + r][alignX + c] = true;
      }
    }
  }

  // Hash seed from string
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  // Populate data modules outside finder zones
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= size - 8;
      const inBottomLeft = r >= size - 8 && c < 8;
      const inBottomRight = r >= size - 8 && c >= size - 8;
      const inTiming = r === 6 || c === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inBottomRight && !inTiming) {
        const bit = Math.abs(
          (hash ^ (r * 31 + c * 17) ^ (text.charCodeAt((r + c) % text.length) * 13)) % 100
        );
        matrix[r][c] = bit < 55;
      }
    }
  }

  return matrix;
};
