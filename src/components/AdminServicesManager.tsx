import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit3 as Edit,
  Check,
  X,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  Layers,
  Activity,
  Stethoscope,
  Video,
  Car,
  Pill,
  CalendarCheck,
  HeartPulse,
  HeartHandshake,
  Award,
  ArrowRight
} from 'lucide-react';
import {
  MarqueeServiceItem,
  getStoredMarqueeServices,
  addMarqueeService,
  updateMarqueeService,
  deleteMarqueeService,
  toggleMarqueeServiceActive,
  resetMarqueeServices,
  MARQUEE_SERVICES_UPDATED_EVENT
} from '../utils/marqueeServicesStorage';

const ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Stethoscope,
  Video,
  Car,
  Pill,
  CalendarCheck,
  HeartPulse,
  HeartHandshake,
  Award,
  Layers,
};

const GRADIENT_PRESETS = [
  { label: 'Deep Blue to Teal', value: 'from-[#002b49] to-[#008080]' },
  { label: 'Navy to Cyan', value: 'from-[#002b49] to-[#0284c7]' },
  { label: 'Slate to Emerald', value: 'from-[#0f172a] to-[#059669]' },
  { label: 'Indigo to Sky', value: 'from-[#003e6b] to-[#0d9488]' },
  { label: 'Teal to Mint', value: 'from-[#0a3d66] to-[#0f766e]' },
  { label: 'Dark Navy to Blue', value: 'from-[#00385e] to-[#0284c7]' },
];

export const AdminServicesManager: React.FC = () => {
  const [services, setServices] = useState<MarqueeServiceItem[]>(getStoredMarqueeServices);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarqueeServiceItem | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDirectUrl, setFormDirectUrl] = useState('');
  const [formPageUrl, setFormPageUrl] = useState('');
  const [formIconName, setFormIconName] = useState('Activity');
  const [formGradient, setFormGradient] = useState('from-[#002b49] to-[#008080]');
  const [formAspectRatio, setFormAspectRatio] = useState('3:2');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState<MarqueeServiceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const handleSync = () => setServices(getStoredMarqueeServices());
    window.addEventListener(MARQUEE_SERVICES_UPDATED_EVENT, handleSync);
    return () => window.removeEventListener(MARQUEE_SERVICES_UPDATED_EVENT, handleSync);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormTagline('');
    setFormDescription('');
    setFormCategory('Specialized Care');
    setFormDirectUrl('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80');
    setFormPageUrl('');
    setFormIconName('Activity');
    setFormGradient('from-[#002b49] to-[#008080]');
    setFormAspectRatio('3:2');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MarqueeServiceItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormTagline(item.tagline);
    setFormDescription(item.description || item.tagline);
    setFormCategory(item.category);
    setFormDirectUrl(item.directUrl);
    setFormPageUrl(item.pageUrl || '');
    setFormIconName(item.iconName || 'Activity');
    setFormGradient(item.gradient || 'from-[#002b49] to-[#008080]');
    setFormAspectRatio(item.aspectRatio || '3:2');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setUploadError('Image size exceeds 3MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormDirectUrl(reader.result as string);
      showToast('✓ Image uploaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDirectUrl.trim()) {
      setUploadError('Please provide both a service title and an image.');
      return;
    }

    if (editingItem) {
      updateMarqueeService(editingItem.id, {
        name: formName.trim(),
        tagline: formTagline.trim() || 'Comprehensive Healthcare Service',
        description: formDescription.trim() || formTagline.trim(),
        category: formCategory.trim() || 'Specialized',
        directUrl: formDirectUrl.trim(),
        pageUrl: formPageUrl.trim() || undefined,
        iconName: formIconName,
        gradient: formGradient,
        aspectRatio: formAspectRatio,
      });
      showToast(`✓ Updated "${formName}" successfully.`);
    } else {
      addMarqueeService({
        name: formName.trim(),
        tagline: formTagline.trim() || 'Comprehensive Healthcare Service',
        description: formDescription.trim() || formTagline.trim(),
        category: formCategory.trim() || 'Specialized',
        directUrl: formDirectUrl.trim(),
        pageUrl: formPageUrl.trim() || undefined,
        iconName: formIconName,
        gradient: formGradient,
        aspectRatio: formAspectRatio,
        active: true,
      });
      showToast(`✓ Added "${formName}" to Services.`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deletingItem) return;
    deleteMarqueeService(deletingItem.id);
    showToast(`✓ Deleted "${deletingItem.name}".`);
    setDeletingItem(null);
  };

  const handleToggleActive = (id: string, name: string) => {
    toggleMarqueeServiceActive(id);
    showToast(`Toggled visibility for "${name}".`);
  };

  const handleReset = () => {
    if (window.confirm('Reset all healthcare services back to default catalog?')) {
      resetMarqueeServices();
      showToast('Reset services to factory defaults.');
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
                  Comprehensive Services Tab
                </span>
                <span className="text-xs font-mono text-teal-200 font-bold">
                  3:2 Ratio Cards Enforced
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Comprehensive On-Demand Healthcare Services
              </h3>
              <p className="text-xs text-teal-100/80 max-w-xl">
                Add, edit, or delete service cards displayed in the edge-to-edge auto-moving marquee. Changes reflect instantly on the live portal.
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
              <span>+ Add New Service</span>
            </button>
          </div>
        </div>

        {/* Live Preview Strip (3:2 Cards) */}
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-teal-200">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Homepage Preview Strip (Strict 3:2 Ratio)
            </span>
            <span className="text-[11px] text-teal-300/70">
              {services.filter((s) => s.active !== false).length} Active Services
            </span>
          </div>

          <div className="overflow-x-auto pb-2 flex gap-3 scrollbar-thin">
            {services
              .filter((s) => s.active !== false)
              .map((item) => {
                const IconComponent = (item.iconName && ICON_MAP[item.iconName]) || Activity;
                return (
                  <div
                    key={item.id}
                    style={{ aspectRatio: '3 / 2' }}
                    className="w-56 shrink-0 aspect-[3/2] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col relative group"
                  >
                    <div className="h-[52%] w-full bg-slate-900 relative overflow-hidden">
                      <img
                        src={item.directUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#002b49]/90 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex-1 p-2 bg-white flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-extrabold text-[#002b49] truncate leading-tight">
                          {item.name}
                        </div>
                        <div className="text-[9.5px] text-slate-500 truncate leading-tight mt-0.5">
                          {item.tagline}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[9px] font-bold text-teal-700 flex items-center gap-1">
                          <IconComponent className="w-2.5 h-2.5" />
                          <span>3:2 Ratio</span>
                        </span>
                        <span className="text-[9px] font-bold text-[#008080] flex items-center">
                          Book &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Services Grid & Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#002b49]">
              All Services ({services.length})
            </h4>
            <p className="text-xs text-slate-500">
              Manage live visibility, edit descriptions, change icons, or delete entries.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            {services.filter((s) => s.active !== false).length} Active / {services.length} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Card (3:2 Preview)</th>
                <th className="py-3 px-4">Service Details</th>
                <th className="py-3 px-4">Category &amp; Icon</th>
                <th className="py-3 px-4">Destination Link</th>
                <th className="py-3 px-4 text-center">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((item) => {
                const IconComponent = (item.iconName && ICON_MAP[item.iconName]) || Activity;
                const isActive = item.active !== false;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3 px-4">
                      <div
                        style={{ aspectRatio: '3 / 2' }}
                        className="w-24 aspect-[3/2] rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs relative"
                      >
                        <img
                          src={item.directUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <span className="absolute bottom-1 right-1 text-[8px] font-bold bg-black/70 text-white px-1 rounded">
                          3:2
                        </span>
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-sm text-[#002b49]">{item.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{item.tagline}</div>
                      {item.description && item.description !== item.tagline && (
                        <div className="text-slate-400 text-[10px] mt-0.5 line-clamp-1">{item.description}</div>
                      )}
                    </td>

                    {/* Category & Icon */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-[#002b49] block">{item.category}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{item.iconName || 'Activity'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Destination Link */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span>{item.pageUrl ? 'Custom Link' : 'Instant Booking Modal'}</span>
                      </span>
                    </td>

                    {/* Visibility */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id, item.name)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{isActive ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Service Card"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Service Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  {editingItem ? 'Edit Service Card (3:2)' : 'Add New Service Card (3:2)'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              {/* Service Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Service Title / Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Physiotherapy & Rehabilitation"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              {/* Category & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Category Tag *
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Therapy, Nursing, Diagnostics"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tagline (Short Headline) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Home Rehabilitation & Mobility Care"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Detailed Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief description of the service and patient care scope..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              {/* 3:2 Aspect Ratio Setting */}
              <div className="p-3 bg-teal-50/80 rounded-xl border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-950 block">Aspect Ratio Enforced</span>
                  <span className="text-[10px] text-teal-700">Strict 3:2 card aspect ratio across all screen sizes</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-200 text-teal-900 border border-teal-300">
                  3:2 Ratio (1.5:1)
                </span>
              </div>

              {/* Image Input & File Upload with 3:2 Live Preview */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Card Banner Image (Direct URL or Upload File) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formDirectUrl}
                    onChange={(e) => setFormDirectUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                </div>

                {/* 3:2 Preview Box */}
                {formDirectUrl && (
                  <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <div
                      style={{ aspectRatio: '3 / 2' }}
                      className="w-24 aspect-[3/2] rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shrink-0"
                    >
                      <img
                        src={formDirectUrl}
                        alt="3:2 Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[11px] text-slate-600">
                      <span className="font-bold text-[#002b49] block">3:2 Aspect Ratio Crop Verified</span>
                      <span>The image will automatically adapt to the 3:2 service card container.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Icon Selector & Gradient Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Select Icon
                  </label>
                  <select
                    value={formIconName}
                    onChange={(e) => setFormIconName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  >
                    {Object.keys(ICON_MAP).map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Gradient Style
                  </label>
                  <select
                    value={formGradient}
                    onChange={(e) => setFormGradient(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                  >
                    {GRADIENT_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Link */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Target Link / Service Booking Action
                </label>
                <input
                  type="text"
                  value={formPageUrl}
                  onChange={(e) => setFormPageUrl(e.target.value)}
                  placeholder="Leave blank for instant booking modal, or enter custom URL/route"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold cursor-pointer shadow-md"
                >
                  {editingItem ? 'Save Changes' : 'Create Service Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-black text-slate-900">
                Delete Service Card?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>"{deletingItem.name}"</strong>? This will remove it from the homepage marquee immediately.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
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
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
