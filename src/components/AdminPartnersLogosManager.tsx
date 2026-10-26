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
  ExternalLink,
  RotateCcw,
  Eye,
  EyeOff,
  Building2
} from 'lucide-react';
import {
  PartnerLogoItem,
  getStoredPartnerLogos,
  saveStoredPartnerLogos,
  addPartnerLogo,
  updatePartnerLogo,
  deletePartnerLogo,
  resetPartnerLogos,
} from '../utils/partnerLogosStorage';

export const AdminPartnersLogosManager: React.FC = () => {
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogoItem[]>(getStoredPartnerLogos);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Logo Modal state
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleLogosSync = () => setPartnerLogos(getStoredPartnerLogos());
    window.addEventListener('nhealth_partner_logos_updated', handleLogosSync);
    return () => {
      window.removeEventListener('nhealth_partner_logos_updated', handleLogosSync);
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
    reader.readAsDataURL(file);
  };

  const handleOpenAddLogo = () => {
    setEditingLogoId(null);
    setLogoForm({
      name: '',
      src: '',
      websiteUrl: '',
      active: true,
      order: partnerLogos.length + 1,
    });
    setLogoPreview('');
    setLogoUploadError(null);
    setIsLogoModalOpen(true);
  };

  const handleOpenEditLogo = (item: PartnerLogoItem) => {
    setEditingLogoId(item.id);
    setLogoForm({
      name: item.name,
      src: item.src,
      websiteUrl: item.websiteUrl || '',
      active: item.active,
      order: item.order,
    });
    setLogoPreview(item.src);
    setLogoUploadError(null);
    setIsLogoModalOpen(true);
  };

  const handleSaveLogo = () => {
    if (!logoForm.name?.trim()) {
      setLogoUploadError('Please enter a partner institution or brand name.');
      return;
    }
    if (!logoForm.src?.trim()) {
      setLogoUploadError('Please provide a logo image URL or upload an image file.');
      return;
    }

    if (editingLogoId) {
      updatePartnerLogo(editingLogoId, {
        name: logoForm.name.trim(),
        src: logoForm.src.trim(),
        websiteUrl: logoForm.websiteUrl?.trim() || undefined,
        active: logoForm.active ?? true,
        order: logoForm.order || 1,
      });
      showToast(`✓ Partner "${logoForm.name}" updated successfully.`);
    } else {
      addPartnerLogo({
        name: logoForm.name.trim(),
        src: logoForm.src.trim(),
        websiteUrl: logoForm.websiteUrl?.trim() || undefined,
        active: logoForm.active ?? true,
        order: partnerLogos.length + 1,
      });
      showToast(`✓ Partner "${logoForm.name}" added to marquee strip.`);
    }

    setIsLogoModalOpen(false);
  };

  const handleToggleLogoActive = (logo: PartnerLogoItem) => {
    updatePartnerLogo(logo.id, { active: !logo.active });
    showToast(`Partner "${logo.name}" is now ${!logo.active ? 'Live' : 'Hidden'}.`);
  };

  const handleConfirmDeleteLogo = () => {
    if (!deletingLogo) return;
    deletePartnerLogo(deletingLogo.id);
    showToast(`✓ Partner "${deletingLogo.name}" deleted from marquee.`);
    setDeletingLogo(null);
  };

  const handleMoveLogoOrder = (logoId: string, direction: 'up' | 'down') => {
    const sorted = [...partnerLogos].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((l) => l.id === logoId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const temp = sorted[idx];
    sorted[idx] = sorted[targetIdx];
    sorted[targetIdx] = temp;

    const reordered = sorted.map((item, index) => ({ ...item, order: index + 1 }));
    saveStoredPartnerLogos(reordered);
    setPartnerLogos(reordered);
    showToast('✓ Partner marquee display order updated.');
  };

  const handleResetLogos = () => {
    if (window.confirm('Reset partner logos back to system defaults (Thyrocare, Lupin, etc.)?')) {
      const def = resetPartnerLogos();
      setPartnerLogos(def);
      showToast('✓ Partner logos reset to system defaults.');
    }
  };

  const activeLogos = partnerLogos.filter((l) => l.active);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002b49] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-teal-400 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Card */}
      <div className="bg-gradient-to-r from-teal-950 via-[#002b49] to-[#00172b] text-white p-5 sm:p-6 rounded-3xl border border-teal-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30 shadow-inner">
              <Building2 className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Partners Management Tab
                </span>
                <span className="text-xs font-mono text-teal-200 font-bold">
                  Edge-to-Edge Continuous Strip
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Our Healthcare &amp; Diagnostic Partners
              </h3>
              <p className="text-xs text-teal-100/80 max-w-xl">
                Add, edit, or delete partner brand logos and name boards scrolling edge-to-edge across the homepage with zero margin clipping or fog effects.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetLogos}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              title="Reset to default partners (Thyrocare, Lupin, etc.)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddLogo}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>+ Add New Partner</span>
            </button>
          </div>
        </div>

        {/* Live Partner Board Marquee Preview (Edge-to-edge without fog) */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-200">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Ticker Preview (Edge-to-Edge Clean Display)
            </span>
            <span className="text-[11px] text-teal-300/70">
              {activeLogos.length} Active Partners
            </span>
          </div>

          <div className="w-full overflow-hidden py-2 bg-slate-900/60 rounded-2xl border border-teal-500/20">
            <div className="flex gap-4 items-center overflow-x-auto pb-1 px-3">
              {(activeLogos.length > 0 ? activeLogos : partnerLogos).map((logo, idx) => (
                <div
                  key={`${logo.id}-${idx}`}
                  className="flex items-center justify-center h-20 sm:h-24 px-6 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-10 sm:h-12 w-auto object-contain max-w-[140px]"
                    onError={(e) => {
                      if (logo.fallback) e.currentTarget.src = logo.fallback;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partners List & CRUD Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#002b49]">
              Partner Network Entries ({partnerLogos.length})
            </h4>
            <p className="text-xs text-slate-500">
              Control logo uploads, brand names, ordering, and active visibility on the homepage strip.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            {activeLogos.length} Live in Strip
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Order</th>
                <th className="py-3 px-4">Partner Logo</th>
                <th className="py-3 px-4">Brand / Institution Name</th>
                <th className="py-3 px-4">Website Link</th>
                <th className="py-3 px-4 text-center">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partnerLogos
                .sort((a, b) => a.order - b.order)
                .map((logo, index) => (
                  <tr key={logo.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveLogoOrder(logo.id, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs text-slate-700">
                          {logo.order}
                        </span>
                        <button
                          type="button"
                          disabled={index === partnerLogos.length - 1}
                          onClick={() => handleMoveLogoOrder(logo.id, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Logo Board */}
                    <td className="py-3 px-4">
                      <div className="h-14 w-28 bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-center shadow-2xs">
                        <img
                          src={logo.src}
                          alt={logo.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            if (logo.fallback) e.currentTarget.src = logo.fallback;
                          }}
                        />
                      </div>
                    </td>

                    {/* Brand Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-sm text-[#002b49]">{logo.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {logo.id}</div>
                    </td>

                    {/* Website Link */}
                    <td className="py-3 px-4">
                      {logo.websiteUrl ? (
                        <a
                          href={logo.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#008080] hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <span>{logo.websiteUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Visibility */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleLogoActive(logo)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors cursor-pointer ${
                          logo.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {logo.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{logo.active ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLogo(logo)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Partner"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingLogo(logo)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT LOGO MODAL */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  {editingLogoId ? 'Edit Partner Logo' : 'Add New Partner Logo'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsLogoModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {logoUploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {logoUploadError}
              </div>
            )}

            <div className="space-y-4 text-xs font-semibold">
              {/* Partner Name */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Partner / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={logoForm.name || ''}
                  onChange={(e) => setLogoForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Thyrocare, Lupin Diagnostics, Dr. Lal PathLabs"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              {/* Logo URL / File Upload */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Logo Image (Direct URL or Upload File) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={logoForm.src || ''}
                    onChange={(e) => {
                      setLogoForm((prev) => ({ ...prev, src: e.target.value }));
                      setLogoPreview(e.target.value);
                    }}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {logoPreview && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div className="h-16 w-32 bg-white rounded-lg border border-slate-200 p-2 flex items-center justify-center shrink-0">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-bold text-[#002b49] block">Board Preview</span>
                      <span>Displays on white board in continuous scrolling ticker.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Partner Website URL (Optional)
                </label>
                <input
                  type="url"
                  value={logoForm.websiteUrl || ''}
                  onChange={(e) => setLogoForm((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                  placeholder="https://www.example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              {/* Visibility Active Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="font-bold text-slate-800 block">Active Status</span>
                  <span className="text-[11px] text-slate-500">Show this partner logo in live ticker strip</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoForm((prev) => ({ ...prev, active: !prev.active }))}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    logoForm.active ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                      logoForm.active ? 'left-6.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsLogoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLogo}
                  className="px-5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold cursor-pointer shadow-md"
                >
                  {editingLogoId ? 'Save Partner Logo' : 'Add Partner Logo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingLogo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-black text-slate-900">
                Delete Partner Logo?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>"{deletingLogo.name}"</strong>? It will immediately disappear from the homepage marquee ticker.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingLogo(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLogo}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Delete Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
