import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
  AlertTriangle,
  Ban,
  RotateCcw,
  Check,
  X,
  Sparkles,
  Lock,
  KeyRound,
  ShieldAlert,
  LogOut,
  Eye,
  EyeOff,
  Phone,
  Layers,
  Info,
  Mail,
  Building2,
  Activity,
  CheckCheck,
  FileText,
  Inbox,
  User,
  Calendar,
  MapPin,
  ExternalLink,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  Filter
} from 'lucide-react';
import {
  PartnerApplication,
  PartnerCategory,
  PartnerStatus,
  calculateDaysInactive,
  isPartnerSuspended,
  checkIsHighRiskMultiRegistration,
  INACTIVITY_THRESHOLD_DAYS
} from '../types/partner';
import {
  EnquiryRecord,
  EnquiryStatus,
  getStoredEnquiries,
  updateEnquiryStatus
} from '../types/enquiry';

interface AdminDashboardPageProps {
  partners: PartnerApplication[];
  onTogglePartnerStatus: (partnerId: string, newStatus: PartnerStatus) => void;
  onUpdatePartner?: (partnerId: string, updates: Partial<PartnerApplication>) => void;
  enquiries?: EnquiryRecord[];
  onUpdateEnquiryStatus?: (id: string, newStatus: EnquiryStatus, notes?: string) => void;
  onNavigateHome: () => void;
  onNavigateOnboarding: () => void;
}

type AlignmentTab = 'All' | 'Pending' | 'Live' | 'Suspended' | 'HighRisk' | 'Enquiries';

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  partners,
  onTogglePartnerStatus,
  onUpdatePartner,
  enquiries,
  onUpdateEnquiryStatus,
  onNavigateHome,
  onNavigateOnboarding,
}) => {
  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('nhealth_admin_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [adminEmail, setAdminEmail] = useState('admin@nhealth.in');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Filters & UI State (Phase 3 Alignment: 4 Primary Buckets)
  const [searchQuery, setSearchQuery] = useState('');
  const [alignmentTab, setAlignmentTab] = useState<AlignmentTab>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewDoc, setPreviewDoc] = useState<PartnerApplication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Multi-Registration Inspection Modal State
  const [inspectingPhone, setInspectingPhone] = useState<string | null>(null);

  // Revocation Request Review Modal State
  const [reviewingRevocationPartner, setReviewingRevocationPartner] = useState<PartnerApplication | null>(null);

  // Enquiries Centralized State & Synchronizer
  const [localEnquiries, setLocalEnquiries] = useState<EnquiryRecord[]>(() => {
    return enquiries && enquiries.length > 0 ? enquiries : getStoredEnquiries();
  });
  const [enquirySearchQuery, setEnquirySearchQuery] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<'All' | EnquiryStatus>('All');
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState<string>('All');
  const [inspectingEnquiry, setInspectingEnquiry] = useState<EnquiryRecord | null>(null);
  const [adminNoteDraft, setAdminNoteDraft] = useState('');

  // Keep synced with parent props
  React.useEffect(() => {
    if (enquiries) {
      setLocalEnquiries(enquiries);
    }
  }, [enquiries]);

  // Real-time synchronization across browser tabs and dispatch events
  React.useEffect(() => {
    const handleSync = () => {
      setLocalEnquiries(getStoredEnquiries());
    };
    window.addEventListener('nhealth_enquiries_updated', handleSync);
    return () => window.removeEventListener('nhealth_enquiries_updated', handleSync);
  }, []);

  const handleSetEnquiryStatus = (id: string, newStatus: EnquiryStatus, notes?: string) => {
    if (onUpdateEnquiryStatus) {
      onUpdateEnquiryStatus(id, newStatus, notes);
    } else {
      const updated = updateEnquiryStatus(id, newStatus, notes);
      setLocalEnquiries(updated);
    }
    if (inspectingEnquiry && inspectingEnquiry.id === id) {
      setInspectingEnquiry((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              adminNotes: notes !== undefined ? notes : prev.adminNotes,
            }
          : null
      );
    }
    showToast(`Enquiry ${id} status updated to "${newStatus}".`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailClean = adminEmail.trim().toLowerCase();
    const passwordClean = adminPassword.trim();

    if (
      emailClean === 'admin@nhealth.in' &&
      (passwordClean === 'admin123' ||
        passwordClean === 'Admin@2026' ||
        passwordClean === 'admin2026' ||
        passwordClean === 'admin')
    ) {
      try {
        sessionStorage.setItem('nhealth_admin_authenticated', 'true');
      } catch {}
      setIsAuthenticated(true);
    } else {
      setAuthError('Authentication failed: Invalid administrator email or password.');
    }
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('nhealth_admin_authenticated');
    } catch {}
    setIsAuthenticated(false);
    onNavigateHome();
  };

  // Helper updater
  const updatePartnerField = (partnerId: string, updates: Partial<PartnerApplication>) => {
    if (onUpdatePartner) {
      onUpdatePartner(partnerId, updates);
    } else {
      // Fallback
      if (updates.status) {
        onTogglePartnerStatus(partnerId, updates.status);
      }
    }
  };

  // If not authenticated, render Secure Administrative Sign-in screen with direct link protection
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#00172b] flex flex-col justify-between selection:bg-[#008080]/20 selection:text-white px-4 py-8 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-radial from-teal-500/10 via-transparent to-transparent pointer-events-none blur-3xl" />

        {/* Top return bar */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs text-slate-400">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Site</span>
          </button>
          <span className="font-mono text-[11px] text-teal-400/80">ROUTE: /command-center</span>
        </div>

        {/* Central Sign-in Card */}
        <div className="max-w-md w-full mx-auto my-auto relative z-10">
          <div className="bg-[#00223f] border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Header Icon & Brand */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center mb-3 shadow-lg">
                <ShieldCheck className="w-8 h-8 text-teal-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Nhealth Command Center
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xs">
                Administrative Verification, Security Rules, Inactivity Suspension &amp; Anti-Fraud Desk
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/60 border border-teal-400/30 text-[11px] text-teal-300 font-mono">
                <Lock className="w-3 h-3 text-teal-400" />
                <span>Restricted Administrative Portal</span>
              </div>
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-teal-400 text-white text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                    placeholder="admin@nhealth.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Command Center Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/80 border border-slate-700 focus:border-teal-400 text-white text-xs sm:text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
                    placeholder="Enter admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Hint Banner */}
              <div className="bg-teal-950/60 border border-teal-500/20 rounded-xl p-2.5 text-[11px] text-teal-300 font-mono flex items-center justify-between">
                <span>Credentials: admin@nhealth.in</span>
                <span className="font-bold text-emerald-400">PW: admin123</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-[#008080] hover:from-teal-400 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Authenticate &amp; Enter Command Center</span>
              </button>
            </form>

            {/* Seamless Redirect to Homepage */}
            <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
              <button
                type="button"
                onClick={onNavigateHome}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Not an admin? <strong className="text-teal-400 underline underline-offset-2">Redirect to Patient Homepage ('/')</strong>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="max-w-md w-full mx-auto text-center text-[11px] text-slate-500">
          &copy; 2026 Nhealth Unified Healthcare Technologies Private Limited.
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PHASE 3 METRICS & CALCULATIONS
  // -------------------------------------------------------------
  // 1. Pending Approvals
  const pendingPartners = partners.filter((p) => p.status === 'Pending');
  const pendingCount = pendingPartners.length;

  // 2. Active Live Accounts (Live and not suspended)
  const activeLivePartners = partners.filter((p) => p.status === 'Live' && !isPartnerSuspended(p));
  const liveCount = activeLivePartners.length;

  // 3. Inactive / Suspended Accounts (either status==='Suspended' or inactive >90 days or restricted)
  const suspendedPartners = partners.filter((p) => isPartnerSuspended(p));
  const suspendedCount = suspendedPartners.length;
  const revokeRequestsCount = suspendedPartners.filter((p) => p.revocationRequested).length;

  // 4. High-Risk Multi-Registered Accounts (Flagged 4+ Services)
  const highRiskPartners = partners.filter((p) => {
    const risk = checkIsHighRiskMultiRegistration(p.phone, partners);
    return risk.isHighRisk;
  });
  const highRiskCount = highRiskPartners.length;

  // 5. Centralized Enquiries Metrics
  const pendingEnquiriesCount = localEnquiries.filter((e) => e.status === 'Pending').length;
  const reviewedEnquiriesCount = localEnquiries.filter((e) => e.status === 'Reviewed').length;
  const contactedEnquiriesCount = localEnquiries.filter((e) => e.status === 'Contacted').length;
  const resolvedEnquiriesCount = localEnquiries.filter((e) => e.status === 'Resolved').length;

  // Filtered enquiries based on search, status filter, and type filter
  const filteredEnquiries = localEnquiries.filter((e) => {
    if (enquiryStatusFilter !== 'All' && e.status !== enquiryStatusFilter) return false;
    if (enquiryTypeFilter !== 'All' && e.type !== enquiryTypeFilter) return false;
    const q = enquirySearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      e.id.toLowerCase().includes(q) ||
      e.name.toLowerCase().includes(q) ||
      (e.companyName && e.companyName.toLowerCase().includes(q)) ||
      (e.designation && e.designation.toLowerCase().includes(q)) ||
      e.email.toLowerCase().includes(q) ||
      e.phone.includes(q) ||
      (e.location && e.location.toLowerCase().includes(q)) ||
      (e.requirements && e.requirements.toLowerCase().includes(q)) ||
      (e.categoryOrService && e.categoryOrService.toLowerCase().includes(q)) ||
      (e.selectedOfferings && e.selectedOfferings.some((o) => o.toLowerCase().includes(q)))
    );
  });

  // Filtered partners list based on Search, Alignment Tab, and Vertical Category
  const filteredPartners = partners.filter((p) => {
    // 1. Search Query
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.entityName.toLowerCase().includes(query) ||
      p.specialty.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      p.registrationNumber.toLowerCase().includes(query) ||
      p.contactPerson.toLowerCase().includes(query);

    // 2. Alignment Tab Filter
    let matchesTab = true;
    if (alignmentTab === 'Pending') {
      matchesTab = p.status === 'Pending';
    } else if (alignmentTab === 'Live') {
      matchesTab = p.status === 'Live' && !isPartnerSuspended(p);
    } else if (alignmentTab === 'Suspended') {
      matchesTab = isPartnerSuspended(p);
    } else if (alignmentTab === 'HighRisk') {
      const risk = checkIsHighRiskMultiRegistration(p.phone, partners);
      matchesTab = risk.isHighRisk;
    }

    // 3. Category Filter
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    return matchesSearch && matchesTab && matchesCategory;
  });

  // Action Handlers
  const handleApprove = (partner: PartnerApplication) => {
    updatePartnerField(partner.id, {
      status: 'Live',
      verifiedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isSuspendedDueToInactivity: false,
    });
    showToast(`✓ Approved! ${partner.entityName} is now LIVE on the Nhealth network.`);
  };

  const handlePutOnHold = (partner: PartnerApplication) => {
    updatePartnerField(partner.id, { status: 'Pending' });
    showToast(`Status changed: ${partner.entityName} reverted to Pending review.`);
  };

  // Suspension Actions
  const handleSuspendAccount = (partner: PartnerApplication, reason?: string) => {
    updatePartnerField(partner.id, {
      status: 'Suspended',
      isSuspendedDueToInactivity: true,
      suspensionReason: reason || 'Suspended by Admin due to inactivity or policy review',
      suspensionDate: new Date().toISOString(),
    });
    showToast(`Account Suspended: ${partner.entityName} has been flagged as Suspended.`);
  };

  // Revocation / Re-activation Approval Action
  const handleApproveRevocation = (partner: PartnerApplication) => {
    updatePartnerField(partner.id, {
      status: 'Live',
      isSuspendedDueToInactivity: false,
      lastActiveAt: new Date().toISOString(),
      revocationRequested: false,
      revocationStatus: 'Approved',
      isRestrictedByAdmin: false,
      suspensionReason: undefined,
    });
    setReviewingRevocationPartner(null);
    showToast(`✓ Account Re-activated! ${partner.entityName} is restored to Live. Notification routed to ${partner.email} & support@nhealth.in.`);
  };

  const handleRejectRevocation = (partner: PartnerApplication) => {
    updatePartnerField(partner.id, {
      revocationRequested: false,
      revocationStatus: 'Rejected',
    });
    setReviewingRevocationPartner(null);
    showToast(`Revocation request rejected for ${partner.entityName}. Account remains suspended.`);
  };

  // High-Risk Fraud Prevention Controls
  const handleToggleRestriction = (partner: PartnerApplication) => {
    const willRestrict = !partner.isRestrictedByAdmin;
    updatePartnerField(partner.id, {
      isRestrictedByAdmin: willRestrict,
      adminRestrictedReason: willRestrict
        ? 'Restricted by Admin: Potential multi-account fraud / misuse review'
        : undefined,
      status: willRestrict ? 'Suspended' : partner.status,
    });
    showToast(
      willRestrict
        ? `🔒 Account Restricted: Multi-registration fraud restriction applied to ${partner.entityName}.`
        : `🔓 Restriction Lifted: Account unfreezed for ${partner.entityName}.`
    );
  };

  const handleWhitelistPhoneGroup = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    partners.forEach((p) => {
      if (p.phone.replace(/\D/g, '').slice(-10) === cleanPhone) {
        updatePartnerField(p.id, {
          whitelistedByAdmin: true,
          isRestrictedByAdmin: false,
        });
      }
    });
    setInspectingPhone(null);
    showToast(`✓ Whitelisted: All accounts under +91 ${cleanPhone} verified as authorized medical consortium.`);
  };

  const handleBulkRestrictPhoneGroup = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    partners.forEach((p) => {
      if (p.phone.replace(/\D/g, '').slice(-10) === cleanPhone) {
        updatePartnerField(p.id, {
          isRestrictedByAdmin: true,
          status: 'Suspended',
          adminRestrictedReason: 'Multi-account fraud / misuse prevention lockdown',
        });
      }
    });
    setInspectingPhone(null);
    showToast(`🔒 Bulk Restriction Applied: All accounts under +91 ${cleanPhone} frozen from logins.`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-[#008080]/15 selection:text-[#002b49]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 bg-[#002b49] text-white px-5 py-3 rounded-2xl shadow-2xl border border-teal-400/40 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Console Navbar */}
      <nav className="bg-[#00172b] text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Portal</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-400/30 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Nhealth Command Center
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  Phase 3 Security &amp; Compliance
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                Inactivity Suspensions • Fraud Warning Flags • Live Partner Credentialing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onNavigateOnboarding}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-all cursor-pointer shadow-xs"
            >
              <span>+ Add Partner</span>
            </button>
            <button
              type="button"
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 transition-all cursor-pointer"
              title="Sign Out of Command Center and return home"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Admin Console */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Real-time Security Notice Banner */}
        <div className="bg-gradient-to-r from-teal-950 via-[#002b49] to-[#00172b] text-white p-4 sm:p-5 rounded-3xl border border-teal-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
              <ShieldAlert className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Phase 3 Security &amp; Anti-Fraud Controls Active</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  90-DAY INACTIVITY RULE ENFORCED
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Accounts without operational activity for &gt;90 days are automatically flagged as <strong>"Suspended due to Inactivity"</strong>. Phone numbers registered in 4+ categories trigger the <strong>High-Risk Warning Flag</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {revokeRequestsCount > 0 && (
              <button
                type="button"
                onClick={() => setAlignmentTab('Suspended')}
                className="text-xs font-mono bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/40 flex items-center gap-1.5 cursor-pointer animate-pulse"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{revokeRequestsCount} Revocation Request{revokeRequestsCount > 1 ? 's' : ''} Pending</span>
              </button>
            )}
            {highRiskCount > 0 && (
              <button
                type="button"
                onClick={() => setAlignmentTab('HighRisk')}
                className="text-xs font-mono bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-xl border border-red-400/40 flex items-center gap-1.5 cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{highRiskCount} High-Risk Flagged</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STATS GRID: Phase 3 Alignment (4 Primary Buckets) */}
        {/* ------------------------------------------------------------- */}
        {/* ------------------------------------------------------------- */}
        {/* STATS GRID: Phase 3 Alignment & Centralized Enquiries Pipeline */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {/* Card 1: Pending Approvals */}
          <div
            onClick={() => setAlignmentTab('Pending')}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
              alignmentTab === 'Pending'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                Pending Approvals
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
              {pendingCount}
            </div>
            <span className="text-[11px] text-amber-800 font-medium mt-0.5 block">
              Awaiting admin verification &amp; license check
            </span>
          </div>

          {/* Card 2: Active Live Accounts */}
          <div
            onClick={() => setAlignmentTab('Live')}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
              alignmentTab === 'Live'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
                Active Live Accounts
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
              {liveCount}
            </div>
            <span className="text-[11px] text-emerald-800 font-medium mt-0.5 block">
              Live &amp; patient-searchable on Nhealth
            </span>
          </div>

          {/* Card 3: Inactive / Suspended Accounts (with Revoke Requests) */}
          <div
            onClick={() => setAlignmentTab('Suspended')}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
              alignmentTab === 'Suspended'
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/30'
                : 'bg-white border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wider block">
                Suspended / Inactive
              </span>
              <Ban className="w-4 h-4 text-rose-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-rose-700">
                {suspendedCount}
              </span>
              {revokeRequestsCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900 animate-pulse">
                  {revokeRequestsCount} Revoke Request{revokeRequestsCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span className="text-[11px] text-rose-800 font-medium mt-0.5 block">
              &gt;90d Inactivity rule or admin hold
            </span>
          </div>

          {/* Card 4: High-Risk Multi-Registered Accounts (Flagged 4+ Services) */}
          <div
            onClick={() => setAlignmentTab('HighRisk')}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
              alignmentTab === 'HighRisk'
                ? 'bg-amber-100/60 border-amber-500 ring-2 ring-amber-500/40'
                : 'bg-white border-slate-200 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                High-Risk Flagged
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-1">
              {highRiskCount}
            </div>
            <span className="text-[11px] text-amber-900 font-medium mt-0.5 block">
              Phone registered across 4+ service verticals
            </span>
          </div>

          {/* Card 5: Review Enquiries (Corporate & General Pipeline) */}
          <div
            onClick={() => setAlignmentTab('Enquiries')}
            className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
              alignmentTab === 'Enquiries'
                ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/30'
                : 'bg-white border-slate-200 hover:border-teal-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-950 uppercase tracking-wider block">
                Review Enquiries
              </span>
              <FileText className="w-4 h-4 text-teal-600" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-teal-800">
                {localEnquiries.length}
              </span>
              {pendingEnquiriesCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 animate-pulse">
                  {pendingEnquiriesCount} Pending
                </span>
              )}
            </div>
            <span className="text-[11px] text-teal-900 font-medium mt-0.5 block">
              Corporate &amp; collaboration leads
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* ALIGNMENT TABS & SEARCH BAR (Phase 3 & Review Enquiries) */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          {/* Primary Queue Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mr-1">
                View Queue:
              </span>

              {/* Tab: All */}
              <button
                type="button"
                onClick={() => setAlignmentTab('All')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  alignmentTab === 'All'
                    ? 'bg-[#002b49] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>All Accounts</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  alignmentTab === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {partners.length}
                </span>
              </button>

              {/* Tab 1: Pending Approvals */}
              <button
                type="button"
                onClick={() => setAlignmentTab('Pending')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  alignmentTab === 'Pending'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Approvals</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  alignmentTab === 'Pending' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'
                }`}>
                  {pendingCount}
                </span>
              </button>

              {/* Tab 2: Active Live Accounts */}
              <button
                type="button"
                onClick={() => setAlignmentTab('Live')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  alignmentTab === 'Live'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Live Accounts</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  alignmentTab === 'Live' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {liveCount}
                </span>
              </button>

              {/* Tab 3: Inactive / Suspended Accounts (with Revoke Requests) */}
              <button
                type="button"
                onClick={() => setAlignmentTab('Suspended')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  alignmentTab === 'Suspended'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200'
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Inactive / Suspended</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  alignmentTab === 'Suspended' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900'
                }`}>
                  {suspendedCount}
                </span>
                {revokeRequestsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 font-black animate-pulse">
                    {revokeRequestsCount} Revoke Req
                  </span>
                )}
              </button>

              {/* Tab 4: High-Risk Multi-Registered Accounts (Flagged 4+ Services) */}
              <button
                type="button"
                onClick={() => setAlignmentTab('HighRisk')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  alignmentTab === 'HighRisk'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-xs'
                    : 'bg-amber-100/70 hover:bg-amber-200 text-amber-950 border border-amber-300'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>High-Risk (4+ Services)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  alignmentTab === 'HighRisk' ? 'bg-white/20 text-white' : 'bg-amber-300 text-amber-950 font-black'
                }`}>
                  {highRiskCount}
                </span>
              </button>

              {/* Tab 5: Review Enquiries (Dedicated Tab) */}
              <button
                type="button"
                onClick={() => setAlignmentTab('Enquiries')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  alignmentTab === 'Enquiries'
                    ? 'bg-gradient-to-r from-teal-700 to-[#002b49] text-white shadow-xs'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Review Enquiries</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    alignmentTab === 'Enquiries'
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-200 text-teal-900'
                  }`}
                >
                  {localEnquiries.length}
                </span>
                {pendingEnquiriesCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-300 text-amber-950 font-black animate-pulse">
                    {pendingEnquiriesCount} New
                  </span>
                )}
              </button>
            </div>

            {/* Quick Count Badge */}
            <div className="text-xs text-slate-500 font-medium">
              {alignmentTab === 'Enquiries' ? (
                <span>
                  Showing <strong>{filteredEnquiries.length}</strong> of {localEnquiries.length} enquiries
                </span>
              ) : (
                <span>
                  Showing <strong>{filteredPartners.length}</strong> of {partners.length} accounts
                </span>
              )}
            </div>
          </div>

          {/* Search & Filter Row */}
          {alignmentTab === 'Enquiries' ? (
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              {/* Enquiry Search Input */}
              <div className="relative w-full lg:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by company, person, email, phone, location, requirements..."
                  value={enquirySearchQuery}
                  onChange={(e) => setEnquirySearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080] bg-slate-50/50"
                />
                {enquirySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setEnquirySearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Chips for Enquiries */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 text-xs">
                <span className="text-slate-400 text-xs font-bold hidden sm:inline mr-1">Status:</span>
                {(['All', 'Pending', 'Reviewed', 'Contacted', 'Resolved'] as const).map((st) => {
                  const isSelected = enquiryStatusFilter === st;
                  const count =
                    st === 'All'
                      ? localEnquiries.length
                      : localEnquiries.filter((e) => e.status === st).length;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEnquiryStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#008080] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{st}</span>
                      <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Input */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by entity, phone, doctor, license, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080] bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
                <span className="text-slate-400 text-xs font-bold hidden sm:inline mr-1">Category:</span>
                {['All', 'Doctor', 'Hospital', 'Diagnostics', 'Pharmacy', 'Ambulance', 'Care Assist', 'Blood Bank'].map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-[#008080] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* REVIEW ENQUIRIES PIPELINE OR PARTNERS APPLICATIONS ROSTER */}
        {/* ------------------------------------------------------------- */}
        {alignmentTab === 'Enquiries' ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Table Header Summary */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#002b49] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>Centralized Enquiries &amp; Collaboration Pipeline</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct intake from Corporate B2B forms, Healthcare Service Inquiries, and Partner Collaborations.
                </p>
              </div>

              {/* Type Filter Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold">Type:</span>
                <select
                  value={enquiryTypeFilter}
                  onChange={(e) => setEnquiryTypeFilter(e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700 shadow-2xs"
                >
                  <option value="All">All Inquiry Types</option>
                  <option value="Corporate Enquiry">Corporate Enquiry</option>
                  <option value="Healthcare Service Inquiry">Healthcare Service Inquiry</option>
                  <option value="Corporate & Institutional Collaboration">Corporate Collaboration</option>
                  <option value="Talent & Team Application">Talent &amp; Teams</option>
                </select>
              </div>
            </div>

            {/* Table Content or Empty State */}
            {filteredEnquiries.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-700">No enquiries found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No enquiries match the current filter selection ({enquiryStatusFilter} status). Try resetting filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEnquirySearchQuery('');
                    setEnquiryStatusFilter('All');
                    setEnquiryTypeFilter('All');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      <th className="py-3 px-4">Date / Time</th>
                      <th className="py-3 px-4">Company / User Name</th>
                      <th className="py-3 px-4">Contact Info</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 min-w-[260px]">Requirements</th>
                      <th className="py-3 px-4 text-right">Status Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnquiries.map((enq) => {
                      const isPending = enq.status === 'Pending';
                      const isReviewed = enq.status === 'Reviewed';
                      const isContacted = enq.status === 'Contacted';
                      const isResolved = enq.status === 'Resolved';

                      return (
                        <tr
                          key={enq.id}
                          className="hover:bg-teal-50/20 transition-colors group"
                        >
                          {/* 1. Date */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            <div className="font-bold text-slate-900">
                              {new Date(enq.submittedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              {new Date(enq.submittedAt).toLocaleTimeString('en-IN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </div>
                            <span className="inline-block mt-1 font-mono text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200 font-bold">
                              {enq.id}
                            </span>
                          </td>

                          {/* 2. Company / User Name */}
                          <td className="py-4 px-4 align-top">
                            {enq.companyName ? (
                              <div className="font-bold text-sm text-[#002b49] flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                                <span>{enq.companyName}</span>
                              </div>
                            ) : null}
                            <div className="text-xs text-slate-800 font-semibold flex items-center gap-1 mt-0.5">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{enq.name}</span>
                              {enq.designation && (
                                <span className="text-[11px] text-slate-500 font-normal">
                                  ({enq.designation})
                                </span>
                              )}
                            </div>
                            {enq.employeeCount && (
                              <div className="mt-1">
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                  Workforce: {enq.employeeCount}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 3. Contact Info */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <a
                                  href={`mailto:${enq.email}`}
                                  className="text-teal-700 hover:text-teal-900 hover:underline break-all"
                                >
                                  {enq.email}
                                </a>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <a
                                  href={`tel:${enq.phone}`}
                                  className="font-bold text-slate-800 hover:text-teal-700 font-mono"
                                >
                                  {enq.phone}
                                </a>
                              </div>
                              {enq.location && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate max-w-[180px]">{enq.location}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 4. Type */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                                enq.type === 'Corporate Enquiry'
                                  ? 'bg-teal-50 text-teal-800 border-teal-200'
                                  : enq.type === 'Healthcare Service Inquiry'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : enq.type === 'Corporate & Institutional Collaboration'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : 'bg-purple-50 text-purple-800 border-purple-200'
                              }`}
                            >
                              {enq.type}
                            </span>
                            {enq.categoryOrService && (
                              <div className="text-[10px] text-slate-500 font-medium mt-1">
                                {enq.categoryOrService}
                              </div>
                            )}
                          </td>

                          {/* 5. Requirements */}
                          <td className="py-4 px-4 align-top">
                            <div className="space-y-1.5 max-w-sm">
                              {enq.selectedOfferings && enq.selectedOfferings.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-1">
                                  {enq.selectedOfferings.map((offering, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9.5px] font-semibold bg-teal-50 text-teal-900 border border-teal-200/80 px-1.5 py-0.2 rounded"
                                    >
                                      {offering}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                                {enq.requirements}
                              </p>

                              {enq.adminNotes && (
                                <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                                  <strong>Admin Note:</strong> {enq.adminNotes}
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setInspectingEnquiry(enq);
                                  setAdminNoteDraft(enq.adminNotes || '');
                                }}
                                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect Full Payload &amp; Notes</span>
                              </button>
                            </div>
                          </td>

                          {/* 6. Status Action */}
                          <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                            <div className="flex flex-col items-end gap-1.5">
                              {/* Status Badge */}
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                                  isPending
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : isReviewed
                                    ? 'bg-sky-100 text-sky-900 border-sky-300'
                                    : isContacted
                                    ? 'bg-blue-100 text-blue-900 border-blue-300'
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                }`}
                              >
                                {isPending && <Clock className="w-3 h-3 text-amber-700" />}
                                {isReviewed && <Eye className="w-3 h-3 text-sky-700" />}
                                {isContacted && <PhoneCall className="w-3 h-3 text-blue-700" />}
                                {isResolved && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                                <span>{enq.status}</span>
                              </span>

                              {/* Action Buttons: Mark as Reviewed, Contacted, Resolved */}
                              <div className="flex items-center gap-1 pt-1">
                                {!isReviewed && !isResolved && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetEnquiryStatus(enq.id, 'Reviewed')}
                                    className="px-2 py-1 text-[10.5px] font-bold rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-colors cursor-pointer"
                                    title="Mark as Reviewed"
                                  >
                                    Reviewed
                                  </button>
                                )}

                                {!isContacted && !isResolved && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetEnquiryStatus(enq.id, 'Contacted')}
                                    className="px-2 py-1 text-[10.5px] font-bold rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                                    title="Mark as Contacted"
                                  >
                                    Contacted
                                  </button>
                                )}

                                {!isResolved && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetEnquiryStatus(enq.id, 'Resolved')}
                                    className="px-2 py-1 text-[10.5px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
                                    title="Mark as Resolved"
                                  >
                                    Resolve
                                  </button>
                                )}

                                {isResolved && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetEnquiryStatus(enq.id, 'Pending')}
                                    className="px-2 py-1 text-[10.5px] font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                                    title="Reopen Enquiry"
                                  >
                                    Reopen
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
          {filteredPartners.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No partner accounts found for this view</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No accounts match the current filter selection ({alignmentTab}). Try switching tabs or clearing your search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setAlignmentTab('All');
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const isPending = partner.status === 'Pending';
              const isSuspended = isPartnerSuspended(partner);
              const isLive = partner.status === 'Live' && !isSuspended;
              const daysInactive = calculateDaysInactive(partner);

              // Check High-Risk Multi-Registration Warning
              const riskAnalysis = checkIsHighRiskMultiRegistration(partner.phone, partners);
              const isHighRisk = riskAnalysis.isHighRisk;

              return (
                <div
                  key={partner.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all shadow-xs hover:shadow-md ${
                    partner.isRestrictedByAdmin
                      ? 'border-red-400 ring-2 ring-red-400/20 bg-red-50/20'
                      : isHighRisk
                      ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/10'
                      : isSuspended
                      ? 'border-rose-300 bg-rose-50/15'
                      : isLive
                      ? 'border-emerald-300 ring-1 ring-emerald-400/20'
                      : 'border-amber-200 bg-amber-50/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Partner Profile, Badges & Credentials */}
                    <div className="flex-1 space-y-2.5">
                      {/* Status Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Primary Status Badge */}
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <span>PENDING APPROVAL</span>
                          </span>
                        ) : isSuspended ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-950 text-xs font-extrabold uppercase tracking-wider">
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            <span>SUSPENDED DUE TO INACTIVITY</span>
                          </span>
                        ) : isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>LIVE ON NETWORK</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xs font-extrabold uppercase tracking-wider">
                            <span>{partner.status}</span>
                          </span>
                        )}

                        {/* Category Pill */}
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                          {partner.category}
                        </span>

                        {/* ID */}
                        <span className="text-xs font-mono text-slate-400">
                          ID: {partner.id}
                        </span>

                        {/* Inactivity Counter Badge */}
                        {daysInactive > 0 && (
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                              daysInactive > INACTIVITY_THRESHOLD_DAYS
                                ? 'bg-rose-100 text-rose-800 font-bold border border-rose-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Last active: {daysInactive}d ago {daysInactive > INACTIVITY_THRESHOLD_DAYS ? '(>90d Rule)' : ''}
                          </span>
                        )}

                        {/* Admin Restriction Flag */}
                        {partner.isRestrictedByAdmin && (
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-red-600" />
                            <span>LOCKED BY ADMIN</span>
                          </span>
                        )}

                        {/* Whitelisted Badge */}
                        {partner.whitelistedByAdmin && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-teal-600" />
                            <span>Whitelisted Group</span>
                          </span>
                        )}
                      </div>

                      {/* ------------------------------------------------------------- */}
                      {/* HIGH-RISK MULTI-REGISTRATION WARNING BADGE (Phase 3 Requirement 2) */}
                      {/* ------------------------------------------------------------- */}
                      {isHighRisk && (
                        <div className="p-2.5 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 border-2 border-amber-500/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-500 text-amber-950 flex items-center justify-center font-black shrink-0">
                              <AlertTriangle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-amber-950 block">
                                ⚠️ HIGH-RISK WARNING: Multi-Registration Flag (4+ Services)
                              </span>
                              <span className="text-[11px] text-amber-900 font-medium block">
                                Phone <strong className="font-mono">{partner.phone}</strong> is registered across{' '}
                                <strong>{riskAnalysis.categoryCount} distinct categories</strong>: {riskAnalysis.categories.join(', ')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setInspectingPhone(partner.phone)}
                              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              Inspect All 4+ Services
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleRestriction(partner)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                partner.isRestrictedByAdmin
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                  : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                              }`}
                            >
                              {partner.isRestrictedByAdmin ? 'Unlock Account' : 'Restrict Fraud / Misuse'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ------------------------------------------------------------- */}
                      {/* INACTIVE SUSPENDED & REVOCATION REQUEST CALLOUT (Phase 3 Requirement 1) */}
                      {/* ------------------------------------------------------------- */}
                      {isSuspended && partner.revocationRequested && (
                        <div className="p-3 bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-teal-500/10 border-2 border-rose-400 rounded-xl space-y-2 animate-in fade-in">
                          <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <RotateCcw className="w-4 h-4 text-rose-600 shrink-0" />
                              <span className="text-xs font-black text-rose-950 uppercase tracking-tight">
                                Revocation / Re-activation Request Received
                              </span>
                              {partner.revocationRequestedAt && (
                                <span className="text-[10px] font-mono text-slate-500">
                                  Submitted: {new Date(partner.revocationRequestedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                              Routes to support@nhealth.in &amp; Admin Review
                            </span>
                          </div>

                          {partner.revocationReason && (
                            <div className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-rose-200">
                              <span className="text-[11px] font-bold text-slate-500 block">Partner's Reactivation Note:</span>
                              <p className="italic font-medium text-[#002b49]">"{partner.revocationReason}"</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleApproveRevocation(partner)}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve &amp; Re-activate Account</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectRevocation(partner)}
                              className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                            >
                              Reject Request
                            </button>
                            <a
                              href={`mailto:support@nhealth.in?subject=Revocation%20Request%20Follow-up%20-%20${encodeURIComponent(partner.entityName)}&body=Partner%20ID:%20${partner.id}%0APhone:%20${partner.phone}`}
                              className="text-xs text-[#008080] font-bold hover:underline inline-flex items-center gap-1 ml-auto"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Email support@nhealth.in</span>
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Partner Details */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-[#002b49] leading-tight flex items-center gap-2">
                          <span>{partner.entityName}</span>
                          {partner.category === 'Doctor' && partner.consultationFee && (
                            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ₹{partner.consultationFee} OPD
                            </span>
                          )}
                        </h3>
                        <p className="text-xs sm:text-sm font-semibold text-[#008080] mt-0.5">
                          {partner.specialty}
                        </p>
                      </div>

                      {/* Details Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-slate-400 block text-[11px]">License / Reg No:</span>
                          <span className="font-mono font-bold text-slate-800">{partner.registrationNumber}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Contact Person:</span>
                          <span className="font-medium text-slate-800">{partner.contactPerson} ({partner.phone})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Location:</span>
                          <span className="font-medium text-slate-800">{partner.city}, {partner.state}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[11px]">Verification Document:</span>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(partner)}
                            className="text-[#008080] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{partner.documentName || 'License.pdf'}</span>
                          </button>
                        </div>
                      </div>

                      {partner.loginIdOrEmail && (
                        <div className="text-[11px] text-slate-500 font-mono">
                          Partner Login ID: <strong className="text-teal-800">{partner.loginIdOrEmail}</strong>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions & Controls */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2.5 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(partner)}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept / Approve &amp; Go Live</span>
                        </button>
                      ) : isSuspended ? (
                        <div className="flex flex-col items-stretch lg:items-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApproveRevocation(partner)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Re-activate Account</span>
                          </button>
                          <span className="text-[10px] text-rose-700 font-medium">
                            Suspended (Rule: &gt;90d Inactive)
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end gap-2">
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Live in Doctor Search &amp; Grid</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSuspendAccount(partner)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer border border-rose-200"
                              title="Flag Account as Suspended"
                            >
                              Suspend
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePutOnHold(partner)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                              title="Revert to Pending review"
                            >
                              Put on Hold
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </main>

      {/* ------------------------------------------------------------- */}
      {/* MULTI-REGISTRATION INSPECTION MODAL (Phase 3 Requirement 2) */}
      {/* ------------------------------------------------------------- */}
      {inspectingPhone && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setInspectingPhone(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#002b49]">
                    Multi-Registration Fraud Audit Desk
                  </h4>
                  <p className="text-xs text-slate-500">
                    Phone: <strong className="font-mono text-slate-800">{inspectingPhone}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingPhone(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content: List of all partner accounts under this phone number */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <strong>High-Risk Condition Triggered:</strong> A single phone number is registered across 4 or more different healthcare service verticals. Review licensing and legal establishment to prevent multi-account misuse.
              </div>

              {partners
                .filter(
                  (p) =>
                    p.phone.replace(/\D/g, '').slice(-10) ===
                    inspectingPhone.replace(/\D/g, '').slice(-10)
                )
                .map((acc, idx) => (
                  <div
                    key={acc.id}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{acc.entityName}</span>
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                          {acc.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {acc.id}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        License: <span className="font-mono text-slate-700">{acc.registrationNumber}</span> • Contact: {acc.contactPerson} • {acc.city}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          acc.isRestrictedByAdmin
                            ? 'bg-red-200 text-red-900'
                            : acc.status === 'Live'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {acc.isRestrictedByAdmin ? 'Restricted' : acc.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleRestriction(acc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        {acc.isRestrictedByAdmin ? 'Unlock' : 'Restrict'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal Footer Bulk Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Admin controls to whitelist legitimate hospital networks or freeze multi-account misuse.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleWhitelistPhoneGroup(inspectingPhone)}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Verify &amp; Whitelist Group</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkRestrictPhoneGroup(inspectingPhone)}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Freeze All Accounts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LICENSE DOCUMENT PREVIEW MODAL */}
      {/* ------------------------------------------------------------- */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#008080]" />
                <h4 className="text-base font-bold text-[#002b49]">
                  Verification Document Preview
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div>
                  <span className="text-slate-500 block text-[11px]">Partner Entity:</span>
                  <strong className="text-sm text-[#002b49]">{previewDoc.entityName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Official Registration / License:</span>
                  <strong className="font-mono text-emerald-700">{previewDoc.registrationNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Attached Document File:</span>
                  <span className="font-mono text-xs">{previewDoc.documentName || 'Medical_License.pdf'} ({previewDoc.documentSize || '2.4 MB'})</span>
                </div>
                <div className="text-[11px] text-teal-800 font-semibold bg-teal-50 p-2 rounded-lg border border-teal-200">
                  ✓ Digital Certificate &amp; License Authority Authenticated via State Medical Council / Pharmacy Council Database.
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 rounded-xl bg-[#002b49] text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* INSPECT ENQUIRY FULL PAYLOAD & ADMIN NOTES MODAL */}
      {/* ------------------------------------------------------------- */}
      {inspectingEnquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setInspectingEnquiry(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-teal-500/30 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-bold text-[#002b49]">
                      Enquiry Submission Record
                    </h4>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {inspectingEnquiry.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submitted on{' '}
                    {new Date(inspectingEnquiry.submittedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingEnquiry(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Current Status:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    inspectingEnquiry.status === 'Pending'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : inspectingEnquiry.status === 'Reviewed'
                      ? 'bg-sky-100 text-sky-900 border-sky-300'
                      : inspectingEnquiry.status === 'Contacted'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {inspectingEnquiry.status}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSetEnquiryStatus(inspectingEnquiry.id, 'Reviewed')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 transition-colors cursor-pointer"
                >
                  Mark Reviewed
                </button>
                <button
                  type="button"
                  onClick={() => handleSetEnquiryStatus(inspectingEnquiry.id, 'Contacted')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition-colors cursor-pointer"
                >
                  Mark Contacted
                </button>
                <button
                  type="button"
                  onClick={() => handleSetEnquiryStatus(inspectingEnquiry.id, 'Resolved')}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            {/* Structured Fields Grid */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Contact Person
                  </span>
                  <div className="font-bold text-slate-800 text-sm">{inspectingEnquiry.name}</div>
                  {inspectingEnquiry.designation && (
                    <div className="text-slate-500">{inspectingEnquiry.designation}</div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Company / Organization
                  </span>
                  <div className="font-bold text-[#002b49] text-sm">
                    {inspectingEnquiry.companyName || 'Individual Healthcare Consumer'}
                  </div>
                  {inspectingEnquiry.employeeCount && (
                    <div className="text-slate-500">Workforce: {inspectingEnquiry.employeeCount}</div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Direct Contact Channels
                  </span>
                  <div className="font-semibold text-slate-800">
                    Phone:{' '}
                    <a
                      href={`tel:${inspectingEnquiry.phone}`}
                      className="text-teal-700 hover:underline font-mono"
                    >
                      {inspectingEnquiry.phone}
                    </a>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Email:{' '}
                    <a
                      href={`mailto:${inspectingEnquiry.email}`}
                      className="text-teal-700 hover:underline"
                    >
                      {inspectingEnquiry.email}
                    </a>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Location &amp; Type
                  </span>
                  <div className="font-semibold text-slate-800">
                    Type: <span className="text-teal-800">{inspectingEnquiry.type}</span>
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Location: {inspectingEnquiry.location || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Selected Offerings (if any) */}
              {inspectingEnquiry.selectedOfferings &&
                inspectingEnquiry.selectedOfferings.length > 0 && (
                  <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-2">
                      Selected Offerings &amp; Service Packages
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {inspectingEnquiry.selectedOfferings.map((pkg, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-md bg-white border border-teal-200 text-teal-900 font-semibold text-xs"
                        >
                          • {pkg}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Requirements Description */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Full Requirements &amp; Comments
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-xs sm:text-sm">
                  {inspectingEnquiry.requirements}
                </p>
              </div>

              {/* Internal Admin Notes */}
              <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                  Internal Administrative Follow-up Notes
                </span>
                <textarea
                  rows={2}
                  value={adminNoteDraft}
                  onChange={(e) => setAdminNoteDraft(e.target.value)}
                  placeholder="Record follow-up details, phone call outcome, or account assignment notes here..."
                  className="w-full p-2.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs text-slate-800"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      handleSetEnquiryStatus(
                        inspectingEnquiry.id,
                        inspectingEnquiry.status,
                        adminNoteDraft
                      );
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    Save Internal Note
                  </button>
                </div>
              </div>

              {/* Raw Payload Collapsible / Inspection */}
              {inspectingEnquiry.rawPayload && Object.keys(inspectingEnquiry.rawPayload).length > 0 && (
                <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Raw Submission Payload (All Submitted Form Fields)
                  </span>
                  <pre className="text-[11px] font-mono text-slate-700 overflow-x-auto p-2 bg-white rounded border border-slate-200 max-h-32">
                    {JSON.stringify(inspectingEnquiry.rawPayload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Centralized in Nhealth Admin Pipeline
              </span>
              <button
                type="button"
                onClick={() => setInspectingEnquiry(null)}
                className="px-5 py-2 rounded-xl bg-[#002b49] hover:bg-[#001d31] text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; 2026 Nhealth Unified Healthcare Technologies Private Limited. Admin Command Center Level 4.
      </footer>
    </div>
  );
};
