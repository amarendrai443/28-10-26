import React, { useState } from 'react';
import {
  Server,
  Key,
  ShieldCheck,
  Send,
  Code,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Lock,
  Layers,
  FileCode,
  Activity,
  AlertTriangle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import {
  REGISTERED_PARTNERS,
  UniversalApiGateway,
  PartnerAuthValidator,
} from '../services/apiGateway';
import { PartnerCredentials } from '../types/apiGateway';

interface PartnerApiGatewayPortalProps {
  onNavigateHome: () => void;
}

type EndpointKey =
  | 'oauth_token'
  | 'prescriptions'
  | 'lab_bookings'
  | 'diagnostic_orders'
  | 'appointment_slots'
  | 'webhooks_dispatch';

const ENDPOINTS: Array<{
  id: EndpointKey;
  method: 'POST' | 'GET' | 'PUT';
  path: string;
  name: string;
  category: 'Hospital HIS' | 'Lab LIS' | 'Pharmacy PMS' | 'Radiology PACS' | 'Core Auth';
  description: string;
}> = [
  {
    id: 'oauth_token',
    method: 'POST',
    path: '/api/v1/oauth/token',
    name: 'OAuth 2.0 Token Minting',
    category: 'Core Auth',
    description: 'Issues short-lived Bearer tokens via Client Credentials grant.',
  },
  {
    id: 'prescriptions',
    method: 'POST',
    path: '/api/v1/partners/prescriptions',
    name: 'Ingest E-Prescription',
    category: 'Hospital HIS',
    description: 'FHIR-compliant prescription intake for doorstep fulfillment & QR generation.',
  },
  {
    id: 'lab_bookings',
    method: 'POST',
    path: '/api/v1/partners/lab-bookings',
    name: 'Schedule Lab Sample Collection',
    category: 'Lab LIS',
    description: 'Bi-directional LIMS diagnostic order sync with phlebotomist dispatch.',
  },
  {
    id: 'diagnostic_orders',
    method: 'POST',
    path: '/api/v1/partners/diagnostic-orders',
    name: 'Portable Imaging Requisition',
    category: 'Radiology PACS',
    description: 'Schedules mobile X-Ray, ECG, or Ultrasound units at patient residence.',
  },
  {
    id: 'appointment_slots',
    method: 'POST',
    path: '/api/v1/partners/appointment-slots',
    name: 'Sync Appointment Slots',
    category: 'Hospital HIS',
    description: 'Syncs hospital doctor rosters and home visit appointment windows.',
  },
  {
    id: 'webhooks_dispatch',
    method: 'POST',
    path: '/api/v1/partners/webhooks/dispatch',
    name: 'Webhook Event Dispatch',
    category: 'Pharmacy PMS',
    description: 'Simulates webhook event delivery signed with HMAC-SHA256 signature.',
  },
];

const DEFAULT_PAYLOADS: Record<EndpointKey, any> = {
  oauth_token: {
    client_id: 'client_apollo_his_v1',
    client_secret: 'secret_apollo_his_pwd99',
    scope: 'prescriptions:write slots:sync',
  },
  prescriptions: {
    prescriptionId: 'RX-APOLLO-2026-9901',
    externalRefId: 'MRN-88129-DEL',
    patient: {
      mrn: 'AP-PAT-44812',
      fullName: 'Sunita Sharma',
      gender: 'Female',
      age: 58,
      phone: '+91 98112 34567',
      address: 'B-44, Greater Kailash 1, New Delhi',
    },
    doctor: {
      registrationNumber: 'MCI-88219',
      fullName: 'Dr. Vivek Mehra, MD',
      specialty: 'Internal Medicine & Geriatrics',
      clinicOrHospital: 'Apollo Multi-Specialty Hospital',
    },
    diagnosis: {
      icd10Code: 'E11.9',
      clinicalDescription: 'Type 2 Diabetes Mellitus with Essential Hypertension',
    },
    medications: [
      {
        itemCode: 'MET-500-SR',
        name: 'Metformin Hydrochloride 500mg SR',
        form: 'Tablet',
        dosage: '500mg',
        frequency: '1-0-1 after meals',
        durationDays: 30,
        dispenseQuantity: 60,
        instructions: 'Take with warm water after food',
      },
      {
        itemCode: 'TEL-40',
        name: 'Telmisartan 40mg',
        form: 'Tablet',
        dosage: '40mg',
        frequency: '1-0-0 morning',
        durationDays: 30,
        dispenseQuantity: 30,
        instructions: 'Morning before breakfast',
      },
    ],
    urgency: 'routine',
    issuedAt: new Date().toISOString(),
  },
  lab_bookings: {
    orderId: 'LAB-LAL-2026-10492',
    externalLabRef: 'LAL-REQ-7721',
    patient: {
      mrn: 'LAL-P-9921',
      fullName: 'Rajesh K. Verma',
      phone: '+91 98765 43210',
      address: 'Flat 402, Lotus Towers, Whitefield, Bengaluru',
    },
    tests: [
      {
        testCode: 'LIPID-PROF',
        testName: 'Complete Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)',
        sampleType: 'Serum',
        fastingRequired: true,
        turnaroundHours: 12,
        price: 850,
      },
      {
        testCode: 'HBA1C-HPLC',
        testName: 'Glycated Hemoglobin (HbA1c) by HPLC',
        sampleType: 'Whole Blood',
        fastingRequired: false,
        turnaroundHours: 8,
        price: 600,
      },
    ],
    collectionSchedule: {
      date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      timeSlot: '07:30 AM - 08:30 AM',
      homeCollection: true,
    },
    phlebotomistStatus: 'unassigned',
    createdAt: new Date().toISOString(),
  },
  diagnostic_orders: {
    requisitionId: 'RAD-MAX-882194',
    modality: 'Portable X-Ray',
    anatomicalRegion: 'Chest PA View (Portable Digital DR)',
    clinicalIndication: 'Suspected lower lobe pneumonia with limited bed mobility',
    patient: {
      mrn: 'MAX-RAD-1092',
      fullName: 'Col. R. S. Bakshi (Retd.)',
      phone: '+91 98210 11223',
      homeAddress: 'Villa 12, Defense Colony, New Delhi',
    },
    portableUnitRequired: true,
    priority: 'stat',
    createdAt: new Date().toISOString(),
  },
  appointment_slots: {
    slotId: 'SLOT-HOSP-2026-03-01',
    facilityId: 'FAC-APOLLO-DEL',
    facilityName: 'Apollo HomeCare Division',
    clinicianId: 'DOC-MEHRA-88',
    clinicianName: 'Dr. Vivek Mehra',
    specialty: 'Internal Medicine',
    serviceType: 'home_doctor_visit',
    startDateTime: new Date(Date.now() + 2 * 3600000).toISOString(),
    endDateTime: new Date(Date.now() + 3 * 3600000).toISOString(),
    slotDurationMinutes: 60,
    status: 'available',
    fee: 999,
    synchronizedAt: new Date().toISOString(),
  },
  webhooks_dispatch: {
    eventId: `evt_${Date.now()}`,
    eventType: 'prescription.dispensed',
    partnerId: 'PRT-PHARM-MEDPLUS',
    timestamp: new Date().toISOString(),
    data: {
      prescriptionId: 'RX-APOLLO-2026-9901',
      dispensedBy: 'MedPlus Store #442',
      pharmacistLicense: 'DL-PH-99124',
      dispensedItems: [{ itemCode: 'MET-500-SR', qty: 60 }],
      patientOtpConfirmed: true,
      qrStatus: 'fully_redeemed',
    },
  },
};

export const PartnerApiGatewayPortal: React.FC<PartnerApiGatewayPortalProps> = ({
  onNavigateHome,
}) => {
  const [selectedPartner, setSelectedPartner] = useState<PartnerCredentials>(REGISTERED_PARTNERS[0]);
  const [authMode, setAuthMode] = useState<'api_key' | 'oauth'>('api_key');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointKey>('prescriptions');
  const [payloadText, setPayloadText] = useState<string>(
    JSON.stringify(DEFAULT_PAYLOADS['prescriptions'], null, 2)
  );
  const [customApiKey, setCustomApiKey] = useState<string>(REGISTERED_PARTNERS[0].apiKey);
  const [activeBearerToken, setActiveBearerToken] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);

  // Response state
  const [isExecuting, setIsExecuting] = useState(false);
  const [responseOutput, setResponseOutput] = useState<{
    statusCode: number;
    latencyMs: number;
    headers: Record<string, string>;
    data: any;
  } | null>(null);

  // Handle partner selection
  const handleSelectPartner = (partner: PartnerCredentials) => {
    setSelectedPartner(partner);
    setCustomApiKey(partner.apiKey);
  };

  // Switch endpoint & auto-populate corresponding standardized payload
  const handleSelectEndpoint = (ep: EndpointKey) => {
    setSelectedEndpoint(ep);
    const template = DEFAULT_PAYLOADS[ep];
    if (ep === 'oauth_token') {
      setPayloadText(
        JSON.stringify(
          {
            client_id: selectedPartner.clientId,
            client_secret: selectedPartner.clientSecret,
            scope: selectedPartner.allowedScopes.join(' '),
          },
          null,
          2
        )
      );
    } else {
      setPayloadText(JSON.stringify(template, null, 2));
    }
    setResponseOutput(null);
  };

  // Generate OAuth 2.0 Token directly
  const handleGenerateOAuthToken = () => {
    const res = PartnerAuthValidator.generateOAuthToken(
      selectedPartner.clientId,
      selectedPartner.clientSecret,
      selectedPartner.allowedScopes.join(' ')
    );
    if (res.success && res.data) {
      setActiveBearerToken(res.data.access_token);
      setAuthMode('oauth');
    }
  };

  // Execute API Request via Universal Gateway
  const handleExecuteRequest = async () => {
    setIsExecuting(true);
    const start = performance.now();

    try {
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(payloadText);
      } catch {
        parsedBody = payloadText;
      }

      const headers: Record<string, string> = {
        'content-type': 'application/json',
      };

      const currentEndpointDef = ENDPOINTS.find((e) => e.id === selectedEndpoint)!;

      if (currentEndpointDef.id !== 'oauth_token') {
        if (authMode === 'api_key') {
          headers['x-api-key'] = customApiKey;
        } else {
          headers['authorization'] = `Bearer ${activeBearerToken}`;
        }
      }

      const res = await UniversalApiGateway.handleRequest(
        currentEndpointDef.path,
        currentEndpointDef.method,
        headers,
        parsedBody
      );

      const elapsed = Math.round(performance.now() - start);

      setResponseOutput({
        statusCode: res.statusCode,
        latencyMs: elapsed,
        headers: res.headers,
        data: res.data,
      });

      if (currentEndpointDef.id === 'oauth_token' && res.data?.access_token) {
        setActiveBearerToken(res.data.access_token);
      }
    } catch (err: any) {
      setResponseOutput({
        statusCode: 500,
        latencyMs: 1,
        headers: {},
        data: { error: 'gateway_exception', message: err?.message || 'Execution error' },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const currentEp = ENDPOINTS.find((e) => e.id === selectedEndpoint)!;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#001f33] border-b border-teal-500/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-sm">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white">Nhealth™</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-wider border border-teal-500/30">
                  Universal Gateway v1
                </span>
              </div>
              <h1 className="text-xs font-bold text-teal-300 uppercase tracking-wide">
                Partner Integration &amp; RESTful API Layer
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              Back to Patient App
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 text-left">
        {/* Architecture Banner */}
        <div className="bg-gradient-to-r from-[#002b49] via-[#003859] to-[#004f66] rounded-3xl p-5 sm:p-7 border border-teal-500/30 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-teal-400/10 text-teal-300 text-[10px] font-black uppercase tracking-wider border border-teal-400/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise API-First Gateway Architecture</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Universal Hospital, Lab &amp; Pharmacy Connector Layer
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl">
                RESTful endpoints and Webhooks for external Hospital Information Systems (HIS), Laboratory Information Systems (LIS), and Pharmacy Management Systems (PMS).
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-teal-500/20 text-center">
                <span className="text-[10px] text-teal-300 font-bold uppercase block">Connector Throughput</span>
                <span className="text-lg font-black text-white font-mono">1,000 req/s</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-teal-500/20 text-center">
                <span className="text-[10px] text-teal-300 font-bold uppercase block">Security Protocol</span>
                <span className="text-lg font-black text-emerald-400 font-mono">OAuth 2.0 / HMAC</span>
              </div>
            </div>
          </div>

          {/* 3 Connector Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-black uppercase">
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital HIS Connector</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Bi-directional sync of doctor rosters, appointment slots, and discharge e-prescriptions.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-black uppercase">
                <Activity className="w-3.5 h-3.5" />
                <span>Lab LIS &amp; PACS Connector</span>
              </div>
              <p className="text-[11px] text-slate-300">
                LIMS test orders, home phlebotomist barcode assignment, and portable digital X-Ray requisition.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase">
                <Zap className="w-3.5 h-3.5" />
                <span>Pharmacy PMS Connector</span>
              </div>
              <p className="text-[11px] text-slate-300">
                FHIR e-scripts, split quantity redemption, patient OTP validation, and HMAC Webhooks.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Partner & Authentication Layer */}
        <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-black text-sm">
              <Key className="w-4 h-4 text-teal-400" />
              <span>Partner Credentials &amp; Security Layer</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">IRDAI &amp; ABDM Standardized</span>
          </div>

          {/* Partner Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGISTERED_PARTNERS.map((p) => (
              <button
                key={p.partnerId}
                type="button"
                onClick={() => handleSelectPartner(p)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                  selectedPartner.partnerId === p.partnerId
                    ? 'border-teal-400 bg-teal-500/10 ring-1 ring-teal-400'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                    {p.partnerType}
                  </span>
                  {selectedPartner.partnerId === p.partnerId && (
                    <Check className="w-3.5 h-3.5 text-teal-400" />
                  )}
                </div>
                <div className="text-xs font-bold text-white truncate">{p.partnerName}</div>
                <div className="text-[10px] text-slate-400 font-mono truncate">{p.partnerId}</div>
              </button>
            ))}
          </div>

          {/* Auth Method Selector & Key Manager */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">Auth Mechanism:</span>
                <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setAuthMode('api_key')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'api_key' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    X-API-Key Header
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('oauth')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      authMode === 'oauth' ? 'bg-teal-500 text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    OAuth 2.0 Bearer Token
                  </button>
                </div>
              </div>

              {authMode === 'oauth' && (
                <button
                  type="button"
                  onClick={handleGenerateOAuthToken}
                  className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Mint New Bearer Token</span>
                </button>
              )}
            </div>

            {authMode === 'api_key' ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(customApiKey)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      readOnly
                      value={activeBearerToken ? `Bearer ${activeBearerToken}` : 'Click "Mint New Bearer Token" to issue token via OAuth 2.0 Client Credentials flow'}
                      placeholder="Bearer token will appear here..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-teal-300 focus:outline-none"
                    />
                  </div>
                  {activeBearerToken && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`Bearer ${activeBearerToken}`)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <div className="text-[10px] text-slate-400">
                  Scopes granted: <strong className="font-mono text-teal-300">{selectedPartner.allowedScopes.join(' ')}</strong> &bull; Validity: 3600s
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Interactive API Console & Standardized Payload Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Endpoint Selector Navigation */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block px-1">
              Standardized API Endpoints
            </span>
            <div className="space-y-1.5">
              {ENDPOINTS.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  onClick={() => handleSelectEndpoint(ep.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                    selectedEndpoint === ep.id
                      ? 'border-teal-400 bg-slate-800 ring-1 ring-teal-400'
                      : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
                      {ep.method}
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-400">{ep.category}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{ep.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">{ep.path}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Request & Response Sandbox */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-800 rounded-3xl p-5 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-xs font-mono font-bold">
                      {currentEp.method}
                    </span>
                    <span className="font-mono text-xs text-white font-bold">{currentEp.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{currentEp.description}</p>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteRequest}
                  disabled={isExecuting}
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isExecuting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Execute API Call</span>
                </button>
              </div>

              {/* Request Payload Editor */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-teal-400" />
                    <span>Standardized Request Body (JSON)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSelectEndpoint(selectedEndpoint)}
                    className="text-[10px] text-teal-400 hover:underline cursor-pointer"
                  >
                    Reset Template
                  </button>
                </div>
                <textarea
                  rows={9}
                  value={payloadText}
                  onChange={(e) => setPayloadText(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs font-mono text-teal-200 focus:outline-none focus:border-teal-400 leading-relaxed resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Live Gateway Output */}
              {responseOutput && (
                <div className="space-y-2 pt-2 border-t border-slate-700 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black font-mono ${
                          responseOutput.statusCode >= 200 && responseOutput.statusCode < 300
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        HTTP {responseOutput.statusCode} {responseOutput.statusCode === 201 ? 'CREATED' : responseOutput.statusCode === 200 ? 'OK' : 'ERROR'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Latency: <strong className="text-white">{responseOutput.latencyMs}ms</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-teal-400 font-mono">
                      Trace: {responseOutput.headers['X-Nhealth-Trace-Id'] || 'req_live'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-700 max-h-60 overflow-y-auto">
                    <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(responseOutput.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
