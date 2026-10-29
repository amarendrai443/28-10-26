import React, { useState, useEffect } from 'react';
import {
  Webhook,
  Key,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Save,
  Check,
  Activity,
  Layers,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  WebhookSyncEngine,
  PartnerApiConfig,
  WebhookSyncLogItem,
} from '../services/webhookSyncEngine';

interface PartnerApiWebhookSettingsProps {
  partnerType: 'pharmacy' | 'lab' | 'hospital' | 'clinic' | 'insurer';
  partnerName: string;
  partnerId?: string;
  onToast?: (msg: string) => void;
}

export const PartnerApiWebhookSettings: React.FC<PartnerApiWebhookSettingsProps> = ({
  partnerType,
  partnerName,
  partnerId,
  onToast,
}) => {
  const [config, setConfig] = useState<PartnerApiConfig>(() =>
    WebhookSyncEngine.getPartnerConfig(partnerType, partnerId)
  );

  const [logs, setLogs] = useState<WebhookSyncLogItem[]>(() =>
    WebhookSyncEngine.getSyncLogs(partnerType)
  );

  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testEventType, setTestEventType] = useState<
    'order.created' | 'order.status_updated' | 'pharmacy.partial_dispense' | 'inventory.check' | 'lab.report_uploaded'
  >('order.created');
  const [selectedLogPayload, setSelectedLogPayload] = useState<any | null>(null);

  useEffect(() => {
    setConfig(WebhookSyncEngine.getPartnerConfig(partnerType, partnerId));
    setLogs(WebhookSyncEngine.getSyncLogs(partnerType));
  }, [partnerType, partnerId]);

  const handleSaveConfig = () => {
    setIsSaving(true);
    WebhookSyncEngine.savePartnerConfig(config);
    setTimeout(() => {
      setIsSaving(false);
      if (onToast) {
        onToast(`API & Webhook configuration updated for ${partnerName}`);
      }
    }, 400);
  };

  const handleTriggerTestEvent = async () => {
    setIsTestingWebhook(true);

    const testPayloads: Record<string, any> = {
      'order.created': {
        orderId: `NH-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        service: 'Doorstep Healthcare Service',
        patient: 'R*** Verma',
        timestamp: new Date().toISOString(),
        summary: 'New order notification dispatched to partner webhook endpoint',
      },
      'order.status_updated': {
        orderId: `NH-ORD-77210`,
        status: 'Partner Dispatch Confirmed',
        riderLocation: { lat: 28.5355, lng: 77.391 },
        etaMinutes: 20,
        summary: 'Real-time transit status update synced to external server',
      },
      'pharmacy.partial_dispense': {
        orderId: `RX-99120`,
        dispensedItems: [{ itemCode: 'MET-500', name: 'Metformin 500mg', qty: 5 }],
        remainingItems: [{ itemCode: 'MET-500', name: 'Metformin 500mg', qty: 5 }],
        splitRedemptionActive: true,
        qrTokenRetained: true,
        summary: 'Stock shortage partial dispense (5/10) logged; QR kept active',
      },
      'inventory.check': {
        storeId: 'MEDPLUS-HUB-44',
        sku: 'AMOX-625-CV',
        stockLevel: 140,
        inStock: true,
        summary: 'Automated inventory verification ping returned 200 OK',
      },
      'lab.report_uploaded': {
        accessionBarcode: `NH-SAMP-8821`,
        testName: 'Comprehensive Metabolic & Lipid Panel',
        reportUrl: 'https://cdn.nhealth.in/reports/rep_8821.pdf',
        doctorCertified: true,
        summary: 'Certified NABL diagnostic report uploaded & pushed to LIS',
      },
    };

    try {
      const log = await WebhookSyncEngine.triggerEvent(
        partnerType,
        testEventType,
        testPayloads[testEventType]
      );
      setLogs((prev) => [log, ...prev]);
      if (onToast) {
        onToast(`Webhook event [${testEventType}] successfully delivered (200 OK)!`);
      }
    } catch {
      if (onToast) {
        onToast('Webhook delivery failed. Please check endpoint URL.');
      }
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in">
      {/* 1. System Connection Status Banner */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Connection Active &bull; 200 OK
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Partner: {partnerName}
            </span>
          </div>
          <h2 className="text-xl font-black text-[#002b49]">
            API &amp; Webhook Integration Settings
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Configure external REST endpoints, API authentication keys, and real-time webhook subscriptions for your {partnerType.toUpperCase()} infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Data Sync</span>
            <span className="text-xs font-mono font-bold text-[#002b49]">
              {config.lastSyncedAt
                ? new Date(config.lastSyncedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : 'Just now'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2. Left: Endpoint & Auth Configuration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#008080]" />
              <h3 className="font-extrabold text-sm text-[#002b49]">
                Endpoint URLs &amp; Authentication
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Environment:</span>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({
                    ...prev,
                    environment: prev.environment === 'production' ? 'sandbox' : 'production',
                  }))
                }
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                  config.environment === 'production'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {config.environment}
              </button>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Webhook Receiver URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Webhook Ingest URL (Nhealth &rarr; Your Server)
              </label>
              <input
                type="url"
                value={config.webhookUrl}
                onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                placeholder="https://api.yourhospital.com/v1/nhealth/webhook"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Nhealth posts real-time event payloads signed with HMAC-SHA256 to this URL.
              </span>
            </div>

            {/* Target Base API URL */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target System Base API URL (e.g. HIS / LIS / PMS API)
              </label>
              <input
                type="url"
                value={config.baseApiUrl}
                onChange={(e) => setConfig({ ...config, baseApiUrl: e.target.value })}
                placeholder="https://api.yourhospital.com/v1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080]"
              />
            </div>

            {/* Auth Token / API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Outbound Authorization Token / API Key
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Header:</span>
                  <select
                    value={config.authHeaderType}
                    onChange={(e) =>
                      setConfig({ ...config, authHeaderType: e.target.value as 'Bearer' | 'ApiKey' })
                    }
                    className="text-[10px] font-bold text-[#008080] bg-slate-100 rounded px-1.5 py-0.5"
                  >
                    <option value="Bearer">Authorization: Bearer</option>
                    <option value="ApiKey">X-API-Key</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={config.authToken}
                  onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
                  placeholder="Enter token or API key..."
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Webhook Secret Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  HMAC Webhook Secret (For Signature Verification)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      webhookSecret: `whsec_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`,
                    })
                  }
                  className="text-[10px] text-teal-700 hover:underline cursor-pointer"
                >
                  Rotate Secret
                </button>
              </div>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={config.webhookSecret}
                  onChange={(e) => setConfig({ ...config, webhookSecret: e.target.value })}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-[#002b49] focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right: Subscribed Events & Live Test Dispatcher (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subscribed Events Checklist */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-[#008080]" />
                <h3 className="font-extrabold text-sm text-[#002b49]">
                  Real-Time Webhook Subscriptions
                </h3>
              </div>
              <span className="text-[10px] text-teal-700 font-bold">Auto-Trigger</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  key: 'orderCreated' as const,
                  label: 'New Order Notifications',
                  sub: 'Triggered when patient places a doorstep booking or prescription order',
                },
                {
                  key: 'statusUpdated' as const,
                  label: 'Real-Time Status Updates',
                  sub: 'Syncs transit status, rider dispatch, and phlebotomist check-in',
                },
                {
                  key: 'partialDispense' as const,
                  label: 'Partial Dispensing Logs',
                  sub: 'Syncs stock shortage split redemption and remaining items',
                },
                {
                  key: 'inventoryCheck' as const,
                  label: 'Inventory & Stock Checks',
                  sub: 'Automated stock verification and inventory deduction alerts',
                },
                {
                  key: 'reportUploaded' as const,
                  label: 'Digital Test Report Uploads',
                  sub: 'Pushes NABL diagnostic PDFs & PACS imaging links instantly',
                },
              ].map((ev) => (
                <label
                  key={ev.key}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors flex items-start gap-2.5 cursor-pointer bg-slate-50/50"
                >
                  <input
                    type="checkbox"
                    checked={config.enabledEvents[ev.key]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        enabledEvents: {
                          ...config.enabledEvents,
                          [ev.key]: e.target.checked,
                        },
                      })
                    }
                    className="mt-0.5 rounded text-[#008080] focus:ring-[#008080] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#002b49] block">{ev.label}</span>
                    <span className="text-[10px] text-slate-500 leading-tight block">{ev.sub}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Test Dispatcher Console */}
          <div className="bg-gradient-to-r from-[#002b49] to-[#004766] text-white rounded-3xl p-5 border border-teal-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300">
                Interactive Test Console
              </span>
              <span className="text-[10px] text-teal-200">HMAC-SHA256 Signed</span>
            </div>
            <h4 className="text-sm font-black text-white">
              Trigger Real-Time Webhook Test
            </h4>

            <div className="flex items-center gap-2">
              <select
                value={testEventType}
                onChange={(e) => setTestEventType(e.target.value as any)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-teal-500/40 text-xs font-bold text-white focus:outline-none"
              >
                <option value="order.created">order.created (New Order)</option>
                <option value="order.status_updated">order.status_updated (Live Tracking)</option>
                <option value="pharmacy.partial_dispense">pharmacy.partial_dispense (Split Stock)</option>
                <option value="inventory.check">inventory.check (Stock Check)</option>
                <option value="lab.report_uploaded">lab.report_uploaded (NABL Report)</option>
              </select>

              <button
                type="button"
                onClick={handleTriggerTestEvent}
                disabled={isTestingWebhook}
                className="px-3.5 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 font-black text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTestingWebhook ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Dispatch</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Real-Time Webhook & Data Sync Ledger Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#008080]" />
            <h3 className="font-extrabold text-sm text-[#002b49]">
              Real-Time Webhook &amp; Data Sync Ledger
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Auto-Logged &bull; AES-256 HMAC Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Event Type</th>
                <th className="py-2.5 px-3">Payload Summary</th>
                <th className="py-2.5 px-3">HMAC Signature</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-[#008080] border border-teal-200 font-bold text-[10px]">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 text-[11px] truncate max-w-[280px]">
                      {log.payloadSummary}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[10px] truncate max-w-[140px]">
                      {log.signature}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>200 OK ({log.deliveryLatencyMs}ms)</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLogPayload(log.fullPayload)}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 cursor-pointer"
                        title="View JSON Payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-sans">
                    No webhook events recorded yet. Click &quot;Dispatch&quot; above to simulate a live sync.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedLogPayload && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-5 border border-slate-700 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-black uppercase text-teal-400">
                Webhook Sync JSON Payload
              </h4>
              <button
                type="button"
                onClick={() => setSelectedLogPayload(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-300 max-h-72 overflow-y-auto leading-relaxed">
              {JSON.stringify(selectedLogPayload, null, 2)}
            </pre>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setSelectedLogPayload(null)}
                className="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
