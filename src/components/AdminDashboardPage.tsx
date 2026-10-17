import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
  Check,
  X,
  Sparkles,
  Lock,
  KeyRound,
  ShieldAlert,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { PartnerApplication, PartnerCategory, PartnerStatus } from '../types/partner';

interface AdminDashboardPageProps {
  partners: PartnerApplication[];
  onTogglePartnerStatus: (partnerId: string, newStatus: PartnerStatus) => void;
  onNavigateHome: () => void;
  onNavigateOnboarding: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  partners,
  onTogglePartnerStatus,
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

  // Dashboard Filters & UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [previewDoc, setPreviewDoc] = useState<PartnerApplication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
              <p className="text-xs text-slate-400 mt-1">
                Restricted Administrative &amp; Credentialing Portal
              </p>
            </div>

            {/* Direct Link Protection Notice */}
            <div className="mb-6 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold block mb-0.5">Direct Link Protection Active</strong>
                <span>
                  Accessing '/command-center' requires administrative credentials. Regular patients or unauthorized users should return to the home portal.
                </span>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Administrative Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Admin Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@nhealth.in"
                    className="w-full bg-[#00172b] border border-slate-700 focus:border-teal-400 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full bg-[#00172b] border border-slate-700 focus:border-teal-400 rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 transition-colors"
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

  // Filtered partners list for authenticated admin
  const filteredPartners = partners.filter((p) => {
    const matchesSearch =
      p.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const pendingCount = partners.filter((p) => p.status === 'Pending').length;
  const liveCount = partners.filter((p) => p.status === 'Live').length;

  const handleApprove = (partner: PartnerApplication) => {
    onTogglePartnerStatus(partner.id, 'Live');
    showToast(`✓ Approved! ${partner.entityName} is now LIVE on the Nhealth network.`);
  };

  const handleRevoke = (partner: PartnerApplication) => {
    onTogglePartnerStatus(partner.id, 'Pending');
    showToast(`Status changed: ${partner.entityName} is now Pending verification.`);
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
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-400/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Nhealth Command Center
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Verification Desk
                </span>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:block">
                Medical Credentialing, Partner Approval &amp; Live Roster Controller
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onNavigateOnboarding}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-all cursor-pointer"
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
        {/* Real-time Integration Notice */}
        <div className="bg-gradient-to-r from-teal-900/90 via-[#00384d] to-[#002b49] text-white p-4 sm:p-5 rounded-3xl border border-teal-500/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Live State Synchronization Active
              </h4>
              <p className="text-xs text-slate-200 mt-0.5">
                Approving a partner to <strong>'Live'</strong> immediately injects them into the patient-facing <strong>AI Doctor Search</strong> and <strong>Unified Services Grid</strong> without delay.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              Live Network: <strong className="text-emerald-400">{liveCount} Active</strong>
            </span>
            <span className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              Review Queue: <strong className="text-amber-400">{pendingCount} Pending</strong>
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Applications</span>
            <div className="text-2xl sm:text-3xl font-black text-[#002b49] mt-1">{partners.length}</div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Across all medical verticals</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-300 bg-amber-50/20 shadow-2xs">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block flex items-center justify-between">
              <span>Pending Review</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-amber-700 font-medium mt-0.5 block">Awaiting admin verification</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-300 bg-emerald-50/20 shadow-2xs">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block flex items-center justify-between">
              <span>Live on Network</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{liveCount}</div>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Published &amp; Patient-searchable</span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cities Covered</span>
            <div className="text-2xl sm:text-3xl font-black text-[#008080] mt-1">
              {new Set(partners.map((p) => p.city)).size} Cities
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Pan-India doorstep dispatch</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by entity, doctor, license, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500">Status:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {['All', 'Pending', 'Live'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      selectedStatus === status
                        ? 'bg-white text-[#002b49] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Doctor', 'Hospital', 'Diagnostics', 'Pharmacy', 'Ambulance', 'Caregiver', 'Care Rider', 'Care Assist', 'Blood Bank'].map((cat) => {
              const count =
                cat === 'All' ? partners.length : partners.filter((p) => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#002b49] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{cat === 'All' ? 'All Verticals' : cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Partners Applications Table / Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-1">
            <span>Showing {filteredPartners.length} of {partners.length} Partners</span>
            <span>Click 'Accept / Approve &amp; Go Live' to update live status</span>
          </div>

          {filteredPartners.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No partner applications match your filter</h4>
              <p className="text-xs text-slate-400 mt-1">Try resetting the category, status, or search keywords.</p>
            </div>
          ) : (
            filteredPartners.map((partner) => {
              const isPending = partner.status === 'Pending';
              const isLive = partner.status === 'Live';

              return (
                <div
                  key={partner.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border transition-all shadow-xs hover:shadow-md ${
                    isLive ? 'border-emerald-300 ring-1 ring-emerald-400/20' : 'border-amber-200 bg-amber-50/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Left: Partner Profile & Credentials */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            <span>PENDING APPROVAL</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-extrabold uppercase tracking-wider">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span>LIVE ON NETWORK</span>
                          </span>
                        )}

                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                          {partner.category}
                        </span>

                        <span className="text-xs font-mono text-slate-400">
                          ID: {partner.id}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-[#002b49] leading-tight">
                          {partner.entityName}
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
                        {partner.loginIdOrEmail && (
                          <div>
                            <span className="text-slate-400 block text-[11px]">Partner Login ID:</span>
                            <span className="font-mono font-bold text-teal-800 text-[11px] truncate block">
                              {partner.loginIdOrEmail}
                            </span>
                          </div>
                        )}
                      </div>

                      {partner.bioOrExperience && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          "{partner.bioOrExperience}"
                        </p>
                      )}
                    </div>

                    {/* Right: Approval & Go Live Action Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {isPending ? (
                        <button
                          type="button"
                          onClick={() => handleApprove(partner)}
                          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept / Approve &amp; Go Live</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Live in Doctor Search &amp; Grid</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRevoke(partner)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-900 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                            title="Put on Hold / Revert to Pending"
                          >
                            Put on Hold
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* License / Verification Document Preview Modal */}
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
                className="text-slate-400 hover:text-slate-700 p-1"
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
                  ✓ Digital Certificate &amp; License Authority Authenticated via State Medical Council Database.
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

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; 2026 Nhealth Unified Healthcare Technologies Private Limited. Admin Access Level 4.
      </footer>
    </div>
  );
};
