/**
 * Universal API Gateway & Connector Layer for Nhealth
 * Centralized API integration middleware handling RESTful APIs, Webhooks,
 * and secure token-based authentication (OAuth 2.0 / API Key validation).
 */

import {
  PartnerCredentials,
  PartnerScope,
  OAuthTokenResponse,
  PartnerPrescriptionPayload,
  PartnerLabBookingPayload,
  PartnerDiagnosticOrderPayload,
  PartnerAppointmentSlotPayload,
  PartnerWebhookEvent,
} from '../types/apiGateway';

// In-memory registered partner registry
export const REGISTERED_PARTNERS: PartnerCredentials[] = [
  {
    partnerId: 'PRT-HOSP-APOLLO',
    partnerName: 'Apollo Hospitals Clinical HIS',
    partnerType: 'hospital',
    apiKey: 'nh_live_hosp_apollo_9921e4b',
    apiSecret: 'sec_apollo_live_9921',
    clientId: 'client_apollo_his_v1',
    clientSecret: 'secret_apollo_his_pwd99',
    allowedScopes: ['prescriptions:write', 'slots:sync', 'slots:read', 'webhooks:listen'],
    webhookUrl: 'https://his.apollohospitals.com/api/v1/nhealth/webhook',
    webhookSecret: 'whsec_apollo_hmac_256',
    status: 'active',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    partnerId: 'PRT-LAB-DRLAL',
    partnerName: 'Dr Lal PathLabs LIS Network',
    partnerType: 'lab',
    apiKey: 'nh_live_lab_drlal_4410a8c',
    apiSecret: 'sec_drlal_live_4410',
    clientId: 'client_drlal_lis_v1',
    clientSecret: 'secret_drlal_lis_pwd44',
    allowedScopes: ['lab:orders:create', 'lab:reports:publish', 'webhooks:listen'],
    webhookUrl: 'https://lis.lalpathlabs.com/webhooks/nhealth/callback',
    webhookSecret: 'whsec_drlal_hmac_256',
    status: 'active',
    createdAt: '2026-02-01T10:30:00Z',
  },
  {
    partnerId: 'PRT-PHARM-MEDPLUS',
    partnerName: 'MedPlus Doorstep Pharmacy PMS',
    partnerType: 'pharmacy',
    apiKey: 'nh_live_pharm_medplus_8820f1d',
    apiSecret: 'sec_medplus_live_8820',
    clientId: 'client_medplus_pms_v1',
    clientSecret: 'secret_medplus_pms_pwd88',
    allowedScopes: ['prescriptions:read', 'webhooks:listen'],
    webhookUrl: 'https://pms.medplusindia.com/api/nhealth/dispense-sync',
    webhookSecret: 'whsec_medplus_hmac_256',
    status: 'active',
    createdAt: '2026-02-10T14:15:00Z',
  },
  {
    partnerId: 'PRT-IMAG-MAX',
    partnerName: 'Max Healthcare Portable Radiology',
    partnerType: 'imaging',
    apiKey: 'nh_live_diag_max_1102c9a',
    apiSecret: 'sec_max_live_1102',
    clientId: 'client_max_pacs_v1',
    clientSecret: 'secret_max_pacs_pwd11',
    allowedScopes: ['diagnostics:schedule', 'webhooks:listen'],
    webhookUrl: 'https://pacs.maxhealthcare.com/nhealth/radiology-webhook',
    webhookSecret: 'whsec_max_hmac_256',
    status: 'active',
    createdAt: '2026-03-05T11:00:00Z',
  },
];

// Active OAuth Token Store
interface ActiveTokenRecord {
  token: string;
  partnerId: string;
  partnerName: string;
  scopes: PartnerScope[];
  expiresAt: number;
}

const activeTokenStore = new Map<string, ActiveTokenRecord>();

// Simple deterministic signature utility for Webhook HMAC simulation
export function generateHmacSignature(payload: any, secret: string): string {
  const content = typeof payload === 'string' ? payload : JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = (hash << 5) - hash + content.charCodeAt(i) + secret.charCodeAt(i % secret.length);
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16).padStart(12, '0')}${Date.now().toString(16).slice(-6)}`;
}

/**
 * 1. SECURE AUTHENTICATION LAYER
 */
export class PartnerAuthValidator {
  // Validate incoming API Key (X-API-Key header)
  static validateApiKey(
    apiKey?: string | null,
    requiredScope?: PartnerScope
  ): { valid: boolean; partner?: PartnerCredentials; error?: string } {
    if (!apiKey) {
      return { valid: false, error: 'Missing X-API-Key authentication header.' };
    }

    const partner = REGISTERED_PARTNERS.find((p) => p.apiKey === apiKey);
    if (!partner) {
      return { valid: false, error: 'Invalid API Key provided.' };
    }

    if (partner.status !== 'active') {
      return { valid: false, error: `Partner account status is ${partner.status}.` };
    }

    if (requiredScope && !partner.allowedScopes.includes(requiredScope) && !partner.allowedScopes.includes('all')) {
      return { valid: false, error: `Insufficient scope. Required: ${requiredScope}.` };
    }

    return { valid: true, partner };
  }

  // Issue OAuth 2.0 Bearer Token (Client Credentials Grant)
  static generateOAuthToken(
    clientId: string,
    clientSecret: string,
    requestedScope?: string
  ): { success: boolean; data?: OAuthTokenResponse; error?: string } {
    const partner = REGISTERED_PARTNERS.find(
      (p) => p.clientId === clientId && p.clientSecret === clientSecret
    );

    if (!partner) {
      return {
        success: false,
        error: 'Invalid client_id or client_secret for OAuth 2.0 client_credentials flow.',
      };
    }

    const tokenString = `nh_bearer_${Math.random().toString(36).substring(2, 15)}_${Date.now().toString(36)}`;
    const expiresIn = 3600; // 1 hour validity

    activeTokenStore.set(tokenString, {
      token: tokenString,
      partnerId: partner.partnerId,
      partnerName: partner.partnerName,
      scopes: partner.allowedScopes,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    return {
      success: true,
      data: {
        access_token: tokenString,
        token_type: 'Bearer',
        expires_in: expiresIn,
        scope: requestedScope || partner.allowedScopes.join(' '),
        partner_id: partner.partnerId,
        partner_name: partner.partnerName,
        issued_at: new Date().toISOString(),
      },
    };
  }

  // Validate incoming OAuth 2.0 Bearer Token (Authorization: Bearer <token>)
  static validateBearerToken(
    authHeader?: string | null,
    requiredScope?: PartnerScope
  ): { valid: boolean; partner?: PartnerCredentials; error?: string } {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or malformed Authorization Bearer header.' };
    }

    const token = authHeader.replace(/^Bearer\s+/, '').trim();
    const tokenRecord = activeTokenStore.get(token);

    if (!tokenRecord) {
      return { valid: false, error: 'Expired or invalid Bearer access token.' };
    }

    if (Date.now() > tokenRecord.expiresAt) {
      activeTokenStore.delete(token);
      return { valid: false, error: 'Bearer access token has expired. Request a new token via /oauth/token.' };
    }

    const partner = REGISTERED_PARTNERS.find((p) => p.partnerId === tokenRecord.partnerId);
    if (!partner) {
      return { valid: false, error: 'Partner not found.' };
    }

    if (requiredScope && !tokenRecord.scopes.includes(requiredScope) && !tokenRecord.scopes.includes('all')) {
      return { valid: false, error: `Forbidden: Token lacks scope '${requiredScope}'.` };
    }

    return { valid: true, partner };
  }

  // Universal validator accepting either Bearer token or API Key
  static authenticateRequest(
    headers: Record<string, string | undefined>,
    requiredScope?: PartnerScope
  ): { valid: boolean; partner?: PartnerCredentials; error?: string; authType?: 'oauth' | 'api_key' } {
    const authHeader = headers['authorization'] || headers['Authorization'];
    const apiKeyHeader = headers['x-api-key'] || headers['X-API-Key'];

    if (authHeader) {
      const result = this.validateBearerToken(authHeader, requiredScope);
      return { ...result, authType: 'oauth' };
    }

    if (apiKeyHeader) {
      const result = this.validateApiKey(apiKeyHeader, requiredScope);
      return { ...result, authType: 'api_key' };
    }

    return {
      valid: false,
      error: 'Unauthenticated: Please provide an Authorization Bearer token or X-API-Key header.',
    };
  }
}

/**
 * 2. UNIVERSAL CONNECTOR LAYER
 */
export class HospitalHISConnector {
  static transformPrescription(payload: PartnerPrescriptionPayload) {
    const secureTokenId = payload.secureTokenId || `NHT-QR-HOSP-${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      traceId: `req_hisp_${Date.now()}`,
      prescriptionId: payload.prescriptionId,
      patientMrn: payload.patient.mrn,
      itemsCount: payload.medications.length,
      secureTokenId,
      status: 'ingested_ready_for_dispense',
      estimatedFulfillment: 'Doorstep dispatch within 60 minutes',
      timestamp: new Date().toISOString(),
    };
  }

  static syncAppointmentSlot(payload: PartnerAppointmentSlotPayload) {
    return {
      success: true,
      traceId: `req_slot_${Date.now()}`,
      slotId: payload.slotId,
      clinicianName: payload.clinicianName,
      status: payload.status,
      syncedWithNhealthCalendar: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export class LabLISConnector {
  static scheduleLabOrder(payload: PartnerLabBookingPayload) {
    const assignedBarcode = payload.barcodes?.[0] || `NHT-BAR-${Math.floor(100000 + Math.random() * 900000)}`;
    return {
      success: true,
      traceId: `req_lab_${Date.now()}`,
      orderId: payload.orderId,
      testCount: payload.tests.length,
      assignedBarcode,
      phlebotomistStatus: 'assigned',
      collectionWindow: `${payload.collectionSchedule.date} (${payload.collectionSchedule.timeSlot})`,
      timestamp: new Date().toISOString(),
    };
  }
}

export class PharmacyPMSConnector {
  static processDispense(prescriptionId: string, dispensedItems: Array<{ itemCode: string; qty: number }>) {
    return {
      success: true,
      traceId: `req_pms_${Date.now()}`,
      prescriptionId,
      dispensedItems,
      inventoryStatus: 'deducted',
      otpVerificationStatus: 'verified_patient_mobile',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 3. UNIVERSAL API GATEWAY DISPATCHER & MIDDLEWARE
 */
export interface GatewayResponse<T = any> {
  statusCode: number;
  headers: Record<string, string>;
  data: T;
}

export class UniversalApiGateway {
  static async handleRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH',
    headers: Record<string, string | undefined>,
    body?: any
  ): Promise<GatewayResponse> {
    const traceId = `trace_${Math.random().toString(36).substring(2, 9)}`;
    const commonHeaders = {
      'Content-Type': 'application/json',
      'X-Nhealth-Trace-Id': traceId,
      'X-Nhealth-Gateway-Version': 'v1.0.0-enterprise',
      'X-RateLimit-Limit': '1000',
      'X-RateLimit-Remaining': '994',
    };

    // Route: OAuth 2.0 Token Generation
    if (endpoint === '/api/v1/oauth/token' && method === 'POST') {
      const clientId = body?.client_id || body?.clientId;
      const clientSecret = body?.client_secret || body?.clientSecret;
      const scope = body?.scope;

      if (!clientId || !clientSecret) {
        return {
          statusCode: 400,
          headers: commonHeaders,
          data: { error: 'invalid_request', error_description: 'client_id and client_secret are required.' },
        };
      }

      const res = PartnerAuthValidator.generateOAuthToken(clientId, clientSecret, scope);
      if (!res.success) {
        return {
          statusCode: 401,
          headers: commonHeaders,
          data: { error: 'invalid_client', error_description: res.error },
        };
      }

      return {
        statusCode: 200,
        headers: commonHeaders,
        data: res.data,
      };
    }

    // Require authentication for all partner resource endpoints
    const auth = PartnerAuthValidator.authenticateRequest(headers);
    if (!auth.valid) {
      return {
        statusCode: 401,
        headers: commonHeaders,
        data: { error: 'unauthorized', message: auth.error },
      };
    }

    // Route: Ingest Prescriptions
    if (endpoint === '/api/v1/partners/prescriptions' && method === 'POST') {
      const result = HospitalHISConnector.transformPrescription(body);
      return {
        statusCode: 201,
        headers: commonHeaders,
        data: {
          message: 'Prescription successfully ingested into Nhealth Doorstep Pharmacy & Clinical Queue.',
          partner: auth.partner?.partnerName,
          ...result,
        },
      };
    }

    // Route: Lab Test Bookings
    if (endpoint === '/api/v1/partners/lab-bookings' && method === 'POST') {
      const result = LabLISConnector.scheduleLabOrder(body);
      return {
        statusCode: 201,
        headers: commonHeaders,
        data: {
          message: 'Lab sample collection request scheduled successfully with NABL partner.',
          partner: auth.partner?.partnerName,
          ...result,
        },
      };
    }

    // Route: Diagnostic & Portable Imaging Orders
    if (endpoint === '/api/v1/partners/diagnostic-orders' && method === 'POST') {
      return {
        statusCode: 201,
        headers: commonHeaders,
        data: {
          message: 'Portable diagnostic unit and technician assigned for doorstep scan.',
          partner: auth.partner?.partnerName,
          requisitionId: body?.requisitionId || `DIAG-${Date.now()}`,
          modality: body?.modality || 'Portable X-Ray',
          status: 'technician_assigned',
          homeVisitEtaMinutes: 45,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Route: Appointment Slots Synchronization
    if (endpoint === '/api/v1/partners/appointment-slots' && (method === 'POST' || method === 'PUT')) {
      const result = HospitalHISConnector.syncAppointmentSlot(body);
      return {
        statusCode: 200,
        headers: commonHeaders,
        data: {
          message: 'Appointment slot synced with Nhealth Master Schedule.',
          partner: auth.partner?.partnerName,
          ...result,
        },
      };
    }

    // Route: Webhook Dispatch Simulation / Test
    if (endpoint === '/api/v1/partners/webhooks/dispatch' && method === 'POST') {
      const partner = auth.partner!;
      const signature = generateHmacSignature(body, partner.webhookSecret || 'secret');
      return {
        statusCode: 200,
        headers: {
          ...commonHeaders,
          'X-Nhealth-Signature': signature,
        },
        data: {
          deliveryStatus: 'delivered_200_ok',
          targetWebhookUrl: partner.webhookUrl,
          signature,
          deliveredAt: new Date().toISOString(),
          echoPayload: body,
        },
      };
    }

    // 404 Endpoint Not Found
    return {
      statusCode: 404,
      headers: commonHeaders,
      data: { error: 'not_found', message: `Endpoint ${endpoint} not recognized in Nhealth Gateway.` },
    };
  }
}
