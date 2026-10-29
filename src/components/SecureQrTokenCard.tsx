import React, { useState, useMemo } from 'react';
import { ShieldCheck, Share2, Printer, CheckCircle, AlertTriangle, Lock, EyeOff, Calendar, Clock, Tag, Sparkles } from 'lucide-react';
import { SecureHealthToken } from '../types/secureToken';
import { generateQrMatrix, generatePrivacyWhatsAppMessage, resolveDepartment, getDepartmentLabel } from '../utils/secureQrToken';

interface SecureQrTokenCardProps {
  token: SecureHealthToken;
  onOpenScanner?: () => void;
  isStaff?: boolean;
  className?: string;
}

export const SecureQrTokenCard: React.FC<SecureQrTokenCardProps> = ({
  token,
  onOpenScanner,
  isStaff = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const qrMatrix = generateQrMatrix(token.tokenId);
  const matrixSize = qrMatrix.length;

  // Resolve Service Category / Department label
  const categoryLabel = useMemo(() => {
    const dept = token.department || resolveDepartment(token.serviceType, token.serviceTitle);
    return getDepartmentLabel(dept);
  }, [token.department, token.serviceType, token.serviceTitle]);

  // Format exact Date & Time stamp of generation
  const generationTimestamp = useMemo(() => {
    try {
      const d = new Date(token.createdAt);
      if (isNaN(d.getTime())) return token.createdAt;
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return token.createdAt;
    }
  }, [token.createdAt]);

  const handleShareQr = async () => {
    const message = generatePrivacyWhatsAppMessage(token);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Nhealth Secure QR Health Token - ${token.tokenId}`,
          text: message,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
        return;
      } catch {
        // User cancelled or unsupported, fallback to WhatsApp
      }
    }
    handleShareWhatsApp();
  };

  const handleShareWhatsApp = () => {
    const message = generatePrivacyWhatsAppMessage(token);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleCopyPrivacyReceipt = () => {
    const text = generatePrivacyWhatsAppMessage(token);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isRedeemed = token.status === 'redeemed';
  const createdAtMs = new Date(token.createdAt).getTime();
  const isOver72Hours = !isNaN(createdAtMs) && Date.now() - createdAtMs > 72 * 60 * 60 * 1000;
  const isExpired = token.status === 'expired' || isOver72Hours;
  const isPartial =
    !isRedeemed &&
    !isExpired &&
    (token.status === 'partial' || (token.remainingItems && token.remainingItems.length > 0));

  return (
    <div className={`bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 md:p-5 text-white shadow-2xl ${className}`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm tracking-wide text-slate-100 flex items-center gap-1.5">
              Secure QR Health Token
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                3-Day Validity
              </span>
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-400">72-Hour Encrypted Patient Pass</p>
          </div>
        </div>

        {/* Status Badge */}
        {isRedeemed ? (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Fully Redeemed
          </span>
        ) : isExpired ? (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Expired (72h Elapsed)
          </span>
        ) : isPartial ? (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-teal-400" /> Active (Partial Balance)
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Active (72h Valid)
          </span>
        )}
      </div>

      {/* Partial Split Redemption Notice Banner if remaining balance exists */}
      {isPartial && token.remainingItems && token.remainingItems.length > 0 && (
        <div className="mt-2.5 p-2 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-200 text-[10px] leading-tight flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shrink-0" />
          <span>
            <strong>Partial Dispense Retained:</strong> {token.remainingItems.reduce((a, b) => a + b.quantity, 0)} units remain unredeemed. Present this active QR later at any partner pharmacy.
          </span>
        </div>
      )}


      {/* Prominent & Responsive QR Presentation */}
      <div className="my-3 sm:my-3.5 flex flex-col items-center justify-center">
        {/* Category & Timestamp Metadata Display on top of QR code */}
        <div className="w-full max-w-[280px] sm:max-w-sm mb-2.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-md flex items-center justify-between gap-2 text-left">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block truncate">
                Service Category
              </span>
              <span className="text-xs font-black text-teal-300 truncate block">
                {categoryLabel}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
              Generated At
            </span>
            <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-200">
              {generationTimestamp}
            </span>
          </div>
        </div>

        <div className="relative p-2.5 sm:p-3.5 bg-white rounded-2xl shadow-xl flex items-center justify-center border-2 sm:border-3 border-slate-800/80">
          {/* Overlay if redeemed */}
          {isRedeemed && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-3 text-center z-10">
              <Lock className="w-8 h-8 text-rose-400 mb-1" />
              <p className="text-xs font-black text-rose-300 uppercase tracking-wider">Token Expired</p>
              <p className="text-[10px] text-slate-300 mt-0.5 max-w-[150px]">Permanently Invalidated Upon Scan</p>
            </div>
          )}

          {/* SVG QR Code with optimized, crisp scaling */}
          <svg
            viewBox={`0 0 ${matrixSize} ${matrixSize}`}
            className="w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 transition-all duration-200"
            shapeRendering="crispEdges"
            role="img"
            aria-label={`Encrypted One-Time QR Pass: ${token.tokenId}`}
          >
            <rect width={matrixSize} height={matrixSize} fill="#ffffff" />
            {qrMatrix.flatMap((row, r) =>
              row.map((cell, c) =>
                cell ? (
                  <rect
                    key={`qr-${token.tokenId}-${r}-${c}`}
                    x={c}
                    y={r}
                    width="1"
                    height="1"
                    fill="#0f172a"
                  />
                ) : null
              )
            ).filter(Boolean)}
          </svg>
        </div>

        {/* Token Code Display */}
        <div className="mt-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">One-Time Token Identifier</p>
          <div className="mt-0.5 flex items-center justify-center space-x-1.5">
            <code className="text-xs sm:text-sm font-mono font-bold tracking-wider text-emerald-400 bg-slate-800/90 px-2.5 py-0.5 rounded-lg border border-slate-700">
              {token.tokenId}
            </code>
          </div>
          {token.isInsuranceCovered && (
            <p className="mt-1 text-[11px] text-blue-300 flex items-center justify-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
              IRDAI Insurance Pre-Auth: <span className="font-bold text-white">{token.insuranceClaimId || 'CLM-APPROVED'}</span>
            </p>
          )}
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="mb-3 bg-blue-950/40 border border-blue-800/40 rounded-xl p-2.5 flex items-start space-x-2.5">
        <EyeOff className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-[10px] sm:text-[11px] text-slate-300 leading-snug">
          <strong className="text-blue-300 font-semibold block">Zero Plain-Text Privacy Guarantee:</strong>
          This pass contains <span className="text-white underline">ONLY this encrypted QR graphic</span>. No personal diagnosis or contact info is stored in plain text.
        </div>
      </div>

      {/* Action Buttons: Direct Share QR + WhatsApp + Copy Receipt */}
      <div className="space-y-2">
        <button
          onClick={handleShareQr}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm py-2.5 px-3 rounded-xl transition duration-150 shadow-md cursor-pointer active:scale-98"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{shared ? 'QR Receipt Shared!' : 'Direct Share QR Pass'}</span>
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center space-x-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white font-semibold text-xs py-2 px-2.5 rounded-lg transition duration-150 shadow-sm cursor-pointer active:scale-98"
          >
            <Share2 className="w-3 h-3" />
            <span>Send via WhatsApp</span>
          </button>

          <button
            onClick={handleCopyPrivacyReceipt}
            className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 px-2.5 rounded-lg transition duration-150 border border-slate-700 cursor-pointer active:scale-98"
          >
            {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Printer className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy Receipt'}</span>
          </button>
        </div>
      </div>

      {/* Role-Based Authorized Staff Scanner shortcut */}
      {isStaff && onOpenScanner && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>Authorized staff verification:</span>
          <button
            onClick={onOpenScanner}
            className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Scanner &rarr;
          </button>
        </div>
      )}
    </div>
  );
};


