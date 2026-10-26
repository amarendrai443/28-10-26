import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit3 as Edit,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Sparkles,
  Award,
  RotateCcw,
  Eye,
  EyeOff,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import {
  AccreditationItem,
  getStoredAccreditations,
  saveStoredAccreditations,
  addAccreditation,
  updateAccreditation,
  deleteAccreditation,
  moveAccreditationOrder,
  resetAccreditations,
} from '../utils/partnerLogosStorage';

export const AdminAccreditationsManager: React.FC = () => {
  const [accreditations, setAccreditations] = useState<AccreditationItem[]>(getStoredAccreditations);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Inline State
  const [newAccreditationName, setNewAccreditationName] = useState('');
  const [editingAccreditation, setEditingAccreditation] = useState<AccreditationItem | null>(null);
  const [editAccreditationName, setEditAccreditationName] = useState('');
  const [deletingAccreditation, setDeletingAccreditation] = useState<AccreditationItem | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleAccredSync = () => setAccreditations(getStoredAccreditations());
    window.addEventListener('nhealth_accreditations_updated', handleAccredSync);
    return () => {
      window.removeEventListener('nhealth_accreditations_updated', handleAccredSync);
    };
  }, []);

  const handleAddAccreditation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccreditationName.trim()) {
      showToast('Please enter an accreditation title.');
      return;
    }
    const created = addAccreditation(newAccreditationName.trim());
    setNewAccreditationName('');
    showToast(`✓ Added "${created.name}" to Accreditations bar.`);
  };

  const handleStartEdit = (item: AccreditationItem) => {
    setEditingAccreditation(item);
    setEditAccreditationName(item.name);
  };

  const handleSaveEdit = () => {
    if (!editingAccreditation || !editAccreditationName.trim()) return;
    updateAccreditation(editingAccreditation.id, { name: editAccreditationName.trim() });
    showToast(`✓ Updated accreditation to "${editAccreditationName.trim()}".`);
    setEditingAccreditation(null);
  };

  const handleToggleActive = (item: AccreditationItem) => {
    updateAccreditation(item.id, { active: !item.active });
    showToast(`Accreditation "${item.name}" is now ${!item.active ? 'Live' : 'Hidden'}.`);
  };

  const handleMoveOrder = (id: string, direction: 'up' | 'down') => {
    moveAccreditationOrder(id, direction);
    showToast('✓ Accreditation scrolling sequence updated.');
  };

  const handleConfirmDelete = () => {
    if (!deletingAccreditation) return;
    deleteAccreditation(deletingAccreditation.id);
    showToast(`✓ Accreditation "${deletingAccreditation.name}" deleted.`);
    setDeletingAccreditation(null);
  };

  const handleReset = () => {
    if (window.confirm('Reset accreditations back to default (NABL, CAP, NABH)?')) {
      const def = resetAccreditations();
      setAccreditations(def);
      showToast('✓ Accreditations reset to system defaults.');
    }
  };

  const activeBadges = accreditations.filter((a) => a.active);

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
      <div className="bg-gradient-to-r from-slate-900 via-[#1f242c] to-[#2a2f38] text-white p-5 sm:p-6 rounded-3xl border border-slate-600/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-700/60 text-slate-200 flex items-center justify-center shrink-0 border border-slate-500/40 shadow-inner">
              <Award className="w-6 h-6 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full border border-slate-500/40">
                  Accreditations Tab
                </span>
                <span className="text-xs font-mono text-teal-300 font-bold">
                  Dark Silver 10:0.5 Ratio Bar
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                Accreditations Marquee Bar Management
              </h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Add, edit names, rearrange order, or delete clinical accreditation labels scrolling continuously at the bottom edge of the partners section at 50% reduced slow speed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-white/20"
              title="Reset to default accreditations: NABL, CAP, NABH"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Live Dark Silver 10:0.5 Ratio Scrolling Bar Preview (At 50% Reduced Slow Speed) */}
        <div className="pt-3 border-t border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Homepage Preview: Dark Silver Bar (Strict 10:0.5 Ratio, Slow Speed)
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              ratio: 10/0.5 · speed: 50% reduced
            </span>
          </div>

          {/* Strict 10:0.5 Ratio Bar Container */}
          <div
            style={{ aspectRatio: '10 / 0.5' }}
            className="w-full aspect-[10/0.5] min-h-[34px] sm:min-h-[40px] bg-[#2a2f38] rounded-xl border border-slate-600/60 shadow-inner overflow-hidden flex items-center relative select-none"
          >
            <div className="absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#2a2f38] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#2a2f38] to-transparent z-10 pointer-events-none" />

            {/* Continuous Left-to-Right Scrolling Marquee at Slow Speed */}
            <div className="animate-accreditations-ticker flex items-center whitespace-nowrap text-white font-black tracking-widest text-[10px] sm:text-xs uppercase py-0.5">
              {[...Array(6)].flatMap(() => (activeBadges.length > 0 ? activeBadges : accreditations)).map((acc, idx) => (
                <span key={idx} className="mx-6 sm:mx-10 flex items-center gap-2 text-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span>{acc.name}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add New Accreditation Form Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-black text-[#002b49] flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-700" />
          <span>Add New Accreditation Label</span>
        </h4>

        <form onSubmit={handleAddAccreditation} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            required
            value={newAccreditationName}
            onChange={(e) => setNewAccreditationName(e.target.value)}
            placeholder="e.g. ISO 15189 Certified, JCI Accredited, ICMR Approved..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008080]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Accreditation</span>
          </button>
        </form>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 pt-1">
          <span className="font-bold text-slate-600 mr-1">Quick Add Presets:</span>
          {['NABL Accreditations', 'CAP Accreditations', 'NABH Accreditations', 'ISO 9001:2015', 'ICMR Approved', 'JCI Gold Seal'].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setNewAccreditationName(preset)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-[11px] font-bold text-slate-700 transition-colors border border-slate-200 cursor-pointer"
            >
              + {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Accreditations Ordering & CRUD Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#002b49]">
              Active Accreditations Pipeline ({accreditations.length})
            </h4>
            <p className="text-xs text-slate-500">
              Change display sequence, update names, or toggle visibility on the dark silver bar.
            </p>
          </div>
          <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            {activeBadges.length} Live in Scrolling Bar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-20 text-center">Order</th>
                <th className="py-3 px-4">Accreditation Title / Name</th>
                <th className="py-3 px-4">Identifier</th>
                <th className="py-3 px-4 text-center">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accreditations
                .sort((a, b) => a.order - b.order)
                .map((acc, index) => (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(acc.id, 'up')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs text-slate-700 w-5 text-center">
                          {acc.order}
                        </span>
                        <button
                          type="button"
                          disabled={index === accreditations.length - 1}
                          onClick={() => handleMoveOrder(acc.id, 'down')}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Name / Inline Edit */}
                    <td className="py-3 px-4">
                      {editingAccreditation?.id === acc.id ? (
                        <div className="flex items-center gap-2 max-w-md">
                          <input
                            type="text"
                            value={editAccreditationName}
                            onChange={(e) => setEditAccreditationName(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-[#008080] text-xs font-bold text-[#002b49] focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 cursor-pointer"
                            title="Save Name"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAccreditation(null)}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span className="font-bold text-sm text-[#002b49]">{acc.name}</span>
                        </div>
                      )}
                    </td>

                    {/* ID */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {acc.id}
                    </td>

                    {/* Visibility */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(acc)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold border transition-colors cursor-pointer ${
                          acc.active
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {acc.active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{acc.active ? 'Live' : 'Hidden'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(acc)}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit Accreditation"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAccreditation(acc)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Accreditation"
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

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAccreditation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-black text-slate-900">
                Delete Accreditation?
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>"{deletingAccreditation.name}"</strong>? It will immediately stop appearing on the scrolling bar.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAccreditation(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Delete Accreditation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
