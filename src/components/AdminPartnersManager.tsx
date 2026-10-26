import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit3 as Edit,
  ArrowUp,
  ArrowDown,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  Sparkles,
  Award,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  PartnerLogoItem,
  AccreditationItem,
  getStoredPartnerLogos,
  saveStoredPartnerLogos,
  addPartnerLogo,
  updatePartnerLogo,
  deletePartnerLogo,
  getStoredAccreditations,
  saveStoredAccreditations,
  addAccreditation,
  updateAccreditation,
  deleteAccreditation,
  moveAccreditationOrder,
  INITIAL_PARTNER_LOGOS,
  INITIAL_ACCREDITATIONS,
} from '../utils/partnerLogosStorage';

export const AdminPartnersManager: React.FC = () => {
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogoItem[]>(getStoredPartnerLogos);
  const [accreditations, setAccreditations] = useState<AccreditationItem[]>(getStoredAccreditations);
  const [activeSubTab, setActiveSubTab] = useState<'logos' | 'accreditations'>('logos');

  // Partner Logo Modal state
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [editingLogoId, setEditingLogoId] = useState<string | null>(null);
  const [logoForm, setLogoForm] = useState<Partial<PartnerLogoItem>>({
    name: '',
    src: '',
    websiteUrl: '',
    active: true,
    order: 1,
  });
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [deletingLogo, setDeletingLogo] = useState<PartnerLogoItem | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Accreditation Modal / inline state
  const [newAccreditationName, setNewAccreditationName] = useState('');
  const [editingAccreditation, setEditingAccreditation] = useState<AccreditationItem | null>(null);
  const [editAccreditationName, setEditAccreditationName] = useState('');
  const [deletingAccreditation, setDeletingAccreditation] = useState<AccreditationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleLogosSync = () => setPartnerLogos(getStoredPartnerLogos());
    const handleAccredSync = () => setAccreditations(getStoredAccreditations());
    window.addEventListener('nhealth_partner_logos_updated', handleLogosSync);
    window.addEventListener('nhealth_accreditations_updated', handleAccredSync);
    return () => {
      window.removeEventListener('nhealth_partner_logos_updated', handleLogosSync);
      window.removeEventListener('nhealth_accreditations_updated', handleAccredSync);
    };
  }, []);

  // File upload for partner logo
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setLogoUploadError('File size exceeds 3MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoPreview(result);
      setLogoForm((prev) => ({ ...prev, src: result }));
      showToast('✓ Partner logo image uploaded successfully.');
    };
    reader.onerror = () => setLogoUploadError('Failed to read image file.');
    reader.readAsDataURL(file);
  };

  const handleOpenAddLogo = () => {
    setEditingLogoId(null);
    setLogoForm({
      name: '',
      src: '',
      websiteUrl: '',
      order: partnerLogos.length + 1,
      active: true,
    });
    setLogoPreview('');
    setLogoUploadError(null);
    setIsLogoModalOpen(true);
  };

  const handleOpenEditLogo = (logo: PartnerLogoItem) => {
    setEditingLogoId(logo.id);
    setLogoForm({ ...logo });
    setLogoPreview(logo.src);
    setLogoUploadError(null);
    setIsLogoModalOpen(true);
  };

  const handleSaveLogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoForm.name?.trim()) {
      setLogoUploadError('Please enter the partner name.');
      return;
    }
    if (!logoForm.src?.trim()) {
      setLogoUploadError('Please provide an image URL or upload an image file.');
      return;
    }

    if (editingLogoId) {
      updatePartnerLogo(editingLogoId, {
        name: logoForm.name.trim(),
        src: logoForm.src.trim(),
        websiteUrl: logoForm.websiteUrl?.trim() || '',
        order: Number(logoForm.order) || 1,
        active: logoForm.active !== undefined ? logoForm.active : true,
      });
      showToast(`✓ Partner "${logoForm.name}" updated successfully.`);
    } else {
      addPartnerLogo({
        name: logoForm.name.trim(),
        src: logoForm.src.trim(),
        websiteUrl: logoForm.websiteUrl?.trim() || '',
        order: Number(logoForm.order) || partnerLogos.length + 1,
        active: logoForm.active !== undefined ? logoForm.active : true,
      });
      showToast(`✓ Partner "${logoForm.name}" added to showcase.`);
    }
    setIsLogoModalOpen(false);
  };

  const handleDeleteLogoConfirm = () => {
    if (!deletingLogo) return;
    deletePartnerLogo(deletingLogo.id);
    showToast(`✓ Partner "${deletingLogo.name}" deleted.`);
    setDeletingLogo(null);
  };

  const handleToggleLogoActive = (logo: PartnerLogoItem) => {
    updatePartnerLogo(logo.id, { active: !logo.active });
    showToast(`Partner "${logo.name}" is now ${!logo.active ? 'Visible' : 'Hidden'}.`);
  };

  // Accreditation handlers
  const handleAddAccreditation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccreditationName.trim()) return;
    addAccreditation(newAccreditationName.trim());
    showToast(`✓ Accreditation "${newAccreditationName.trim()}" added.`);
    setNewAccreditationName('');
  };

  const handleSaveEditAccreditation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccreditation || !editAccreditationName.trim()) return;
    updateAccreditation(editingAccreditation.id, { name: editAccreditationName.trim() });
    showToast(`✓ Accreditation updated to "${editAccreditationName.trim()}".`);
    setEditingAccreditation(null);
    setEditAccreditationName('');
  };

  const handleDeleteAccreditationConfirm = () => {
    if (!deletingAccreditation) return;
    deleteAccreditation(deletingAccreditation.id);
    showToast(`✓ Accreditation "${deletingAccreditation.name}" deleted.`);
    setDeletingAccreditation(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset partner logos and accreditations to factory defaults?')) {
      saveStoredPartnerLogos(INITIAL_PARTNER_LOGOS);
      saveStoredAccreditations(INITIAL_ACCREDITATIONS);
      showToast('✓ Partner logos & accreditations reset to defaults.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[10000] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-teal-500/50 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Sub-tab Switcher & Actions */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#008080] mb-1">
            <Award className="w-4 h-4" />
            <span>PARTNERS &amp; ACCREDITATIONS MANAGEMENT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002b49]">
            Healthcare Partners &amp; Accreditations Marquee
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage partner logos, upload new laboratory badges, and customize the edge-to-edge dark silver scrolling bar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Restore default partner logos and accreditation list"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          {activeSubTab === 'logos' ? (
            <button
              type="button"
              onClick={handleOpenAddLogo}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-900/15 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Partner Image</span>
            </button>
          ) : (
            <form onSubmit={handleAddAccreditation} className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="e.g. ISO 15189 Certified"
                value={newAccreditationName}
                onChange={(e) => setNewAccreditationName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-56"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#002b49] hover:bg-[#001f35] text-white text-xs font-bold cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('logos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'logos'
              ? 'bg-[#002b49] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Diagnostic Partner Logos ({partnerLogos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('accreditations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeSubTab === 'accreditations'
              ? 'bg-[#002b49] text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Accreditations Marquee Bar ({accreditations.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: PARTNER LOGOS CRUD */}
      {activeSubTab === 'logos' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {partnerLogos.map((logo, index) => (
              <div
                key={logo.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleLogoActive(logo)}
                    className={`inline-flex items-center gap-1 text-[10.5px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      logo.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {logo.active ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                    <span>{logo.active ? 'Active' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Logo Image Preview */}
                <div className="h-28 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-3 mb-3 overflow-hidden">
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                    onError={(e) => {
                      if (logo.fallback) e.currentTarget.src = logo.fallback;
                    }}
                  />
                </div>

                {/* Info */}
                <div className="mb-3">
                  <h4 className="text-sm font-black text-[#002b49] truncate">{logo.name}</h4>
                  {logo.websiteUrl && (
                    <a
                      href={logo.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-teal-600 hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{logo.websiteUrl}</span>
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditLogo(logo)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008080] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingLogo(logo)}
                    className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                    title="Delete partner logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Add Card */}
            <div
              onClick={handleOpenAddLogo}
              className="bg-slate-50 hover:bg-teal-50/50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-teal-400 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#002b49]">Add Partner Logo</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                Upload new laboratory or hospital network brand badge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ACCREDITATIONS MARQUEE BAR MANAGEMENT */}
      {activeSubTab === 'accreditations' && (
        <div className="space-y-6">
          {/* Live Interactive Preview: 10:1 Dark Silver Bar */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-700 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Bar Preview (Strict 10:0.5 Edge-to-Edge Ratio, Dark Silver)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Continuous Left-to-Right Ticker (50% Slower)</span>
            </div>

            {/* 10:0.5 Ratio Dark Silver Container */}
            <div
              style={{ aspectRatio: '10 / 0.5' }}
              className="w-full aspect-[10/0.5] min-h-[30px] sm:min-h-[36px] bg-[#2a2f38] rounded-xl border border-slate-600/60 overflow-hidden flex items-center relative shadow-inner select-none"
            >
              <div className="animate-accreditations-ticker flex items-center whitespace-nowrap text-white font-extrabold tracking-widest text-[10px] sm:text-xs md:text-sm uppercase py-0.5">
                {[...Array(6)].flatMap(() => accreditations.filter((a) => a.active)).map((acc, idx) => (
                  <span key={idx} className="mx-6 sm:mx-10 flex items-center gap-2.5 sm:gap-3 text-slate-100 hover:text-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{acc.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Accreditations List & Ordering */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#002b49]">
                Configured Accreditations &amp; Certificates ({accreditations.length})
              </h3>
              <span className="text-xs text-slate-500">Use arrow buttons to adjust ticker order</span>
            </div>

            <div className="space-y-2.5">
              {accreditations.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-[#002b49] flex items-center gap-2">
                        <span>{item.name}</span>
                        {!item.active && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-200 text-slate-500 font-semibold">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveAccreditationOrder(item.id, 'up')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-600 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={idx === accreditations.length - 1}
                      onClick={() => moveAccreditationOrder(item.id, 'down')}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-600 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Active */}
                    <button
                      type="button"
                      onClick={() => updateAccreditation(item.id, { active: !item.active })}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 cursor-pointer"
                      title={item.active ? 'Hide from ticker' : 'Show on ticker'}
                    >
                      {item.active ? <Eye className="w-3.5 h-3.5 text-teal-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccreditation(item);
                        setEditAccreditationName(item.name);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[#008080] cursor-pointer"
                      title="Edit Name"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setDeletingAccreditation(item)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-red-600 cursor-pointer"
                      title="Delete Accreditation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PARTNER LOGO */}
      {isLogoModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-[#002b49] mb-1">
              {editingLogoId ? 'Edit Partner Logo' : 'Add New Partner Image'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Specify the brand name, upload an image file or provide a direct CDN link.
            </p>

            {logoUploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {logoUploadError}
              </div>
            )}

            <form onSubmit={handleSaveLogo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Partner Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thyrocare, Lupin, Apollo Diagnostics"
                  value={logoForm.name || ''}
                  onChange={(e) => setLogoForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Logo Image (URL or Local File Upload) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://... logo image URL"
                    value={logoForm.src || ''}
                    onChange={(e) => {
                      setLogoForm((prev) => ({ ...prev, src: e.target.value }));
                      setLogoPreview(e.target.value);
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Image Preview Box */}
              {logoPreview && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Preview
                  </span>
                  <div className="h-20 w-full flex items-center justify-center">
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={logoForm.order || 1}
                    onChange={(e) => setLogoForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={logoForm.active ? 'true' : 'false'}
                    onChange={(e) => setLogoForm((prev) => ({ ...prev, active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="true">Active (Show in Ticker)</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website URL <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={logoForm.websiteUrl || ''}
                  onChange={(e) => setLogoForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingLogoId ? 'Save Changes' : 'Add Partner Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE PARTNER LOGO CONFIRM */}
      {deletingLogo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#002b49] mb-1">Delete Partner Logo?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Are you sure you want to delete "{deletingLogo.name}" from the diagnostic partners showcase?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingLogo(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteLogoConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Delete Logo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACCREDITATION NAME */}
      {editingAccreditation && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-[#002b49] mb-1">Edit Accreditation</h3>
            <p className="text-xs text-slate-500 mb-4">Update the accreditation badge display text.</p>
            <form onSubmit={handleSaveEditAccreditation} className="space-y-4">
              <input
                type="text"
                required
                value={editAccreditationName}
                onChange={(e) => setEditAccreditationName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccreditation(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#002b49] hover:bg-[#001f35] text-white text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE ACCREDITATION CONFIRM */}
      {deletingAccreditation && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#002b49] mb-1">Delete Accreditation?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Remove "{deletingAccreditation.name}" from the dark silver marquee bar?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingAccreditation(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccreditationConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
