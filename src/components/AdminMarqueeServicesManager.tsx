import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  X,
  Layers,
  ArrowRight,
  ExternalLink,
  Activity,
  Car,
  Video,
  HeartHandshake,
  HeartPulse,
  Award,
  Pill,
  CalendarCheck,
  Stethoscope,
  Image as ImageIcon,
} from 'lucide-react';
import {
  MarqueeServiceItem,
  getStoredMarqueeServices,
  addMarqueeService,
  updateMarqueeService,
  deleteMarqueeService,
  toggleMarqueeServiceActive,
  resetMarqueeServices,
  MARQUEE_SERVICES_UPDATED_EVENT,
} from '../utils/marqueeServicesStorage';

const ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Car,
  Video,
  HeartHandshake,
  HeartPulse,
  Award,
  Pill,
  CalendarCheck,
  Layers,
  Stethoscope,
};

export const AdminMarqueeServicesManager: React.FC = () => {
  const [services, setServices] = useState<MarqueeServiceItem[]>(getStoredMarqueeServices);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarqueeServiceItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MarqueeServiceItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDirectUrl, setFormDirectUrl] = useState('');
  const [formLocalFile, setFormLocalFile] = useState('');
  const [formPageUrl, setFormPageUrl] = useState('');
  const [formIconName, setFormIconName] = useState('Activity');
  const [formGradient, setFormGradient] = useState('from-[#002b49] to-[#008080]');

  useEffect(() => {
    const handleUpdate = () => setServices(getStoredMarqueeServices());
    window.addEventListener(MARQUEE_SERVICES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(MARQUEE_SERVICES_UPDATED_EVENT, handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormTagline('');
    setFormCategory('General Care');
    setFormDirectUrl('');
    setFormLocalFile('');
    setFormPageUrl('');
    setFormIconName('Activity');
    setFormGradient('from-[#002b49] to-[#008080]');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MarqueeServiceItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormTagline(item.tagline);
    setFormCategory(item.category);
    setFormDirectUrl(item.directUrl);
    setFormLocalFile(item.localFile || '');
    setFormPageUrl(item.pageUrl || '');
    setFormIconName(item.iconName || 'Activity');
    setFormGradient(item.gradient || 'from-[#002b49] to-[#008080]');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDirectUrl.trim()) {
      alert('Please provide at least a service name and an image URL.');
      return;
    }

    if (editingItem) {
      updateMarqueeService(editingItem.id, {
        name: formName.trim(),
        tagline: formTagline.trim() || 'Comprehensive Healthcare Service',
        category: formCategory.trim() || 'Specialized',
        directUrl: formDirectUrl.trim(),
        localFile: formLocalFile.trim() || undefined,
        pageUrl: formPageUrl.trim() || undefined,
        iconName: formIconName,
        gradient: formGradient,
      });
      showToast(`Updated "${formName}" successfully.`);
    } else {
      addMarqueeService({
        name: formName.trim(),
        tagline: formTagline.trim() || 'Comprehensive Healthcare Service',
        category: formCategory.trim() || 'Specialized',
        directUrl: formDirectUrl.trim(),
        localFile: formLocalFile.trim() || undefined,
        pageUrl: formPageUrl.trim() || undefined,
        iconName: formIconName,
        gradient: formGradient,
        active: true,
      });
      showToast(`Added "${formName}" to marquee.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMarqueeService(deletingItem.id);
    showToast(`Deleted "${deletingItem.name}".`);
    setDeletingItem(null);
  };

  const handleToggleActive = (id: string, name: string) => {
    toggleMarqueeServiceActive(id);
    showToast(`Toggled visibility for "${name}".`);
  };

  const handleReset = () => {
    if (window.confirm('Reset all marquee services back to default catalog?')) {
      resetMarqueeServices();
      showToast('Reset marquee services to defaults.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002b49] text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-teal-400 flex items-center gap-2 text-xs font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-teal-300" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Controls Card */}
      <div className="bg-gradient-to-r from-[#00172b] via-[#02213a] to-[#002b49] text-white p-5 sm:p-6 rounded-3xl border border-teal-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30 shadow-inner">
              <Sparkles className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-400/30">
                  Edge-to-Edge Hero Marquee
                </span>
                <span className="text-xs font-mono text-teal-200 font-bold">
                  3:2 Aspect Ratio Cards
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Comprehensive On-Demand Healthcare Services
              </h3>
              <p className="text-xs text-teal-100/80 max-w-xl">
                Manage the continuous auto-moving marquee cards displayed across the homepage. Items scroll smoothly edge-to-edge in a balanced 3:2 format.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              title="Reset to original default catalog"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add New Service Card</span>
            </button>
          </div>
        </div>

        {/* Live Preview Strip (3:2 Cards) */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-200">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Marquee Preview (Strict 3:2 Ratio)</span>
            </span>
            <span className="font-mono text-[11px] text-slate-300">
              {services.filter((s) => s.active).length} Active / {services.length} Total
            </span>
          </div>

          <div className="w-full overflow-x-auto scrollbar-none py-2 select-none">
            <div className="w-max flex gap-3">
              {services.filter((s) => s.active).map((item) => {
                const IconComp = ICON_MAP[item.iconName || 'Activity'] || Activity;
                return (
                  <div
                    key={item.id}
                    style={{ aspectRatio: '3 / 2' }}
                    className="w-[200px] sm:w-[220px] aspect-[3/2] shrink-0 bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between text-slate-900 shadow-sm overflow-hidden"
                  >
                    <div className="relative w-full h-[52%] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img
                        src={item.directUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (item.localFile) e.currentTarget.src = item.localFile;
                        }}
                      />
                      <span className="absolute top-1 left-1 bg-[#002b49]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-[#002b49] line-clamp-1">{item.name}</h5>
                      <p className="text-[9px] text-slate-500 line-clamp-1">{item.tagline}</p>
                    </div>
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-[#008080]">3:2 Balanced</span>
                      <span className="text-[9px] text-slate-400 font-mono">Live</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid & Management List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h4 className="text-base font-black text-[#002b49]">
              Configured Marquee Service Cards ({services.length})
            </h4>
            <p className="text-xs text-slate-500">
              Edit text, change images, toggle visibility, or delete tabs. Changes sync immediately to the homepage marquee.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((item) => {
            const IconComp = ICON_MAP[item.iconName || 'Activity'] || Activity;
            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all p-3.5 flex flex-col justify-between gap-3 ${
                  item.active
                    ? 'bg-slate-50/70 border-slate-200 hover:border-teal-400 hover:shadow-md'
                    : 'bg-slate-100/60 border-dashed border-slate-300 opacity-60'
                }`}
              >
                {/* Visual Header with 3:2 preview thumbnail */}
                <div className="flex gap-3">
                  <div
                    style={{ aspectRatio: '3 / 2' }}
                    className="w-28 aspect-[3/2] rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200 relative"
                  >
                    <img
                      src={item.directUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        if (item.localFile) e.currentTarget.src = item.localFile;
                      }}
                    />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1 rounded">
                      3:2
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      {item.active ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Visible
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    <h5 className="font-black text-sm text-[#002b49] truncate mt-1">{item.name}</h5>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{item.tagline}</p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item.id, item.name)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    {item.active ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                        <span>Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Show</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg bg-teal-50 hover:bg-[#008080] text-[#008080] hover:text-white transition-all cursor-pointer"
                      title="Edit Service Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition-all cursor-pointer"
                      title="Delete Service Card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-lg font-black text-[#002b49]">
                {editingItem ? 'Edit Service Card' : 'Add New Marquee Service Card'}
              </h4>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Title / Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Specialized Geriatric Care"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subtitle / Tagline *</label>
                <input
                  type="text"
                  required
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Personalized at-home clinical support & vitals tracking"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Tag</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Nursing / Therapy"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Icon Type</label>
                  <select
                    value={formIconName}
                    onChange={(e) => setFormIconName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white font-semibold"
                  >
                    {Object.keys(ICON_MAP).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Direct Image URL * (3:2 balanced)</label>
                <input
                  type="url"
                  required
                  value={formDirectUrl}
                  onChange={(e) => setFormDirectUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or https://i.ibb.co/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Local Asset Fallback (Optional)</label>
                <input
                  type="text"
                  value={formLocalFile}
                  onChange={(e) => setFormLocalFile(e.target.value)}
                  placeholder="/physiotherapy.png or relative asset path"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gradient Theme</label>
                <select
                  value={formGradient}
                  onChange={(e) => setFormGradient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008080] bg-white font-semibold"
                >
                  <option value="from-[#002b49] to-[#008080]">Navy to Teal</option>
                  <option value="from-[#003e6b] to-[#0d9488]">Ocean to Emerald</option>
                  <option value="from-[#0a3d66] to-[#0f766e]">Deep Blue to Mint</option>
                  <option value="from-[#0f172a] to-[#008080]">Midnight to Teal</option>
                  <option value="from-[#1e293b] to-[#0d9488]">Slate to Jade</option>
                  <option value="from-[#002b49] to-[#0284c7]">Navy to Sky Blue</option>
                  <option value="from-[#002b49] to-[#10b981]">Navy to Green</option>
                </select>
              </div>

              {/* Live Card Preview */}
              {formDirectUrl && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                    Live 3:2 Card Preview
                  </span>
                  <div
                    style={{ aspectRatio: '3 / 2' }}
                    className="w-full max-w-[240px] mx-auto aspect-[3/2] bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between text-slate-900 shadow-sm overflow-hidden"
                  >
                    <div className="relative w-full h-[52%] rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img
                        src={formDirectUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (formLocalFile) e.currentTarget.src = formLocalFile;
                        }}
                      />
                      <span className="absolute top-1 left-1 bg-[#002b49]/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                        {formCategory || 'Category'}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-black text-xs text-[#002b49] truncate">{formName || 'Service Name'}</h5>
                      <p className="text-[9px] text-slate-500 truncate">{formTagline || 'Tagline description'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#008080] to-emerald-600 hover:from-[#006666] hover:to-emerald-700 text-white font-black shadow-md cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Add Service Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900">Delete Service Card?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <strong>"{deletingItem.name}"</strong>? It will no longer appear in the edge-to-edge marquee.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer"
              >
                Delete Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
