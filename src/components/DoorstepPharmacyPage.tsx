import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  Pill,
  Sparkles,
  HeartPulse,
  Flame,
  Sun,
  Activity,
  ShieldAlert,
  X,
  Truck,
  Check,
  Package,
  Bike,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  Download,
  Phone,
  Tag,
  Gift,
  Wallet,
  Bell,
  Copy,
  Share2,
  Percent,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Coins,
} from 'lucide-react';
import {
  PHARMACY_CATEGORIES,
  TRENDING_MEDICINES,
  PHARMACY_COUPONS,
  INITIAL_REFERRAL_LOGS,
  INITIAL_PHARMACY_NOTIFICATIONS,
} from '../data/pharmacyData';
import {
  MedicineProduct,
  PharmacyCartItem,
  PrescriptionOrder,
  PharmacyOrder,
  PaymentMethod,
  PharmacyDeliveryStatus,
  PharmacyCoupon,
  ReferralRewardLog,
  PharmacyNotificationItem,
} from '../types/pharmacy';
import {
  getStoredPharmacyOrders,
  savePharmacyOrder,
  generatePharmacyInvoicePDF,
} from '../utils/pharmacyStorage';
import { InsuranceClaimSection } from './InsuranceClaimSection';
import { InsurancePaymentOption, InsuranceClaimDetails } from '../types/insurance';
import { SecureHealthToken } from '../types/secureToken';
import { createOneTimeSecureToken, findTokenById } from '../utils/secureQrToken';
import { SecureQrTokenCard } from './SecureQrTokenCard';
import { AuthorizedPharmacyScannerModal } from './AuthorizedPharmacyScannerModal';
import { ScanLine } from 'lucide-react';

interface DoorstepPharmacyPageProps {
  onBackToHome: () => void;
  onOpenBookingModal?: (serviceName: string) => void;
  isLoggedIn?: boolean;
  onPromptLogin?: () => void;
}

const DELIVERY_STEPS: { status: PharmacyDeliveryStatus; title: string; desc: string }[] = [
  { status: 'Order Placed', title: 'Order Confirmed', desc: 'Prescription & items verified' },
  { status: 'Packing', title: 'Packed at Hub', desc: 'Temperature-safe cold box packing' },
  { status: 'Dispatched', title: 'Dispatched', desc: 'Handed to express rider' },
  { status: 'Out for Delivery', title: 'Out for Delivery', desc: 'Rider is on the way to your door' },
  { status: 'Delivered', title: 'Delivered', desc: 'Medicines handed over safely' },
];

export const DoorstepPharmacyPage: React.FC<DoorstepPharmacyPageProps> = ({
  onBackToHome,
  onOpenBookingModal,
  isLoggedIn = false,
  onPromptLogin,
}) => {
  // Navigation View: 'catalog' | 'deals' | 'wallet' | 'orders'
  const [activeView, setActiveView] = useState<'catalog' | 'deals' | 'wallet' | 'orders'>('catalog');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<PharmacyCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedQrToken, setSelectedQrToken] = useState<SecureHealthToken | null>(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannerPrefilledTokenId, setScannerPrefilledTokenId] = useState('');

  // Notifications State
  const [notifications, setNotifications] = useState<PharmacyNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('nhealth_pharmacy_notifications');
      return saved ? JSON.parse(saved) : INITIAL_PHARMACY_NOTIFICATIONS;
    } catch {
      return INITIAL_PHARMACY_NOTIFICATIONS;
    }
  });
  const [selectedNotifFilter, setSelectedNotifFilter] = useState<'all' | 'unread' | 'refill' | 'dispatch'>('all');

  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<PharmacyCoupon | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Referral & Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('nhealth_pharmacy_wallet_balance');
      return saved ? Number(saved) : 350;
    } catch {
      return 350;
    }
  });
  const [carePoints, setCarePoints] = useState<number>(700);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const referralCode = 'NH-CARE-8820';
  const referralLink = `https://nhealth.in/rx/ref/${referralCode}`;

  // Orders State
  const [orders, setOrders] = useState<PharmacyOrder[]>(() => getStoredPharmacyOrders());
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string>(() => {
    const list = getStoredPharmacyOrders();
    const active = list.find((o) => o.deliveryStatus !== 'Delivered');
    return active ? active.id : (list[0]?.id || '');
  });

  // Checkout Form State
  const [checkoutPatientName, setCheckoutPatientName] = useState('Ramesh Kumar');
  const [checkoutPhone, setCheckoutPhone] = useState('+91 98765 43210');
  const [checkoutAddress, setCheckoutAddress] = useState('Flat 402, Sai Residency, Road No. 12, Banjara Hills, Hyderabad');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('UPI');
  const [upiOption, setUpiOption] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('gpay');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutPaymentOption, setCheckoutPaymentOption] = useState<InsurancePaymentOption>('pay_now');
  const [checkoutInsuranceClaim, setCheckoutInsuranceClaim] = useState<InsuranceClaimDetails | null>(null);

  // Prescription Form state
  const [rxPatientName, setRxPatientName] = useState('');
  const [rxPatientPhone, setRxPatientPhone] = useState('');
  const [rxAddress, setRxAddress] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [rxSuccessOrder, setRxSuccessOrder] = useState<PrescriptionOrder | null>(null);
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);
  const [rxPaymentOption, setRxPaymentOption] = useState<InsurancePaymentOption>('pay_now');
  const [rxInsuranceClaim, setRxInsuranceClaim] = useState<InsuranceClaimDetails | null>(null);

  // Save notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nhealth_pharmacy_notifications', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Save wallet balance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nhealth_pharmacy_wallet_balance', walletBalance.toString());
    } catch {}
  }, [walletBalance]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Active tracking order
  const trackingOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedTrackingOrderId) || orders[0];
  }, [orders, selectedTrackingOrderId]);

  // Filter products by query and category
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TRENDING_MEDICINES.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'all' || prod.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        prod.name.toLowerCase().includes(q) ||
        prod.genericName.toLowerCase().includes(q) ||
        prod.manufacturer.toLowerCase().includes(q) ||
        prod.indications.toLowerCase().includes(q) ||
        prod.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, selectedCategory]);

  // Cart operations
  const addToCart = (product: MedicineProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PharmacyCartItem[]
    );
  };

  const getProductCartQty = (productId: string) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalCartItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );

  // Check if current user is an authorized partner/pharmacy staff (never guest or patient)
  const isAuthorizedStaff = useMemo(() => {
    try {
      const savedUser = localStorage.getItem('nhealth_user');
      if (!savedUser) return false;
      const user = JSON.parse(savedUser);
      const role = String(user?.role || user?.accountType || '').toLowerCase();
      return (
        (role.includes('partner') ||
          role.includes('pharmacy') ||
          role.includes('staff') ||
          role.includes('admin') ||
          role.includes('vendor')) &&
        !role.includes('patient')
      );
    } catch {
      return false;
    }
  }, []);

  // Insurance Claim Restrictions: prevent stacking benefits
  useEffect(() => {
    if (checkoutPaymentOption === 'claim_insurance') {
      setAppliedCoupon(null);
      setUseWalletBalance(false);
      setCouponInput('');
      setCouponFeedback(null);
    }
  }, [checkoutPaymentOption]);

  // Coupon Discount Calculation - Automatically 0 if Claim with Insurance
  const couponDiscount = useMemo(() => {
    if (checkoutPaymentOption === 'claim_insurance') return 0;
    if (!appliedCoupon) return 0;
    if (cartSubtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.discountType === 'percent') {
      const calculated = (cartSubtotal * appliedCoupon.value) / 100;
      return appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
    }
    if (appliedCoupon.discountType === 'flat') {
      return appliedCoupon.value;
    }
    return 0; // free shipping handled below
  }, [appliedCoupon, cartSubtotal, checkoutPaymentOption]);

  // Delivery fee calculation
  const rawDeliveryFee = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 49;
  const isFreeShipCoupon = checkoutPaymentOption !== 'claim_insurance' && appliedCoupon?.discountType === 'free_shipping';
  const deliveryFee = isFreeShipCoupon ? 0 : rawDeliveryFee;

  // Wallet deduction calculation (max up to min(walletBalance, 150)) - Automatically 0 if Claim with Insurance
  const maxWalletUsable = Math.min(walletBalance, 150);
  const walletDeduction = (checkoutPaymentOption !== 'claim_insurance' && useWalletBalance)
    ? Math.min(maxWalletUsable, Math.max(0, cartSubtotal + deliveryFee - couponDiscount))
    : 0;

  const grandTotal = Math.max(0, cartSubtotal + deliveryFee - couponDiscount - walletDeduction);

  // Apply Coupon Handler
  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code' });
      return;
    }
    const matched = PHARMACY_COUPONS.find((c) => c.code === code);
    if (!matched) {
      setCouponFeedback({ type: 'error', message: 'Invalid promo code. Check active deals.' });
      return;
    }
    if (cartSubtotal < matched.minOrder) {
      setCouponFeedback({
        type: 'error',
        message: `Min cart value for ${matched.code} is ₹${matched.minOrder}. Add ₹${matched.minOrder - cartSubtotal} more.`,
      });
      return;
    }
    setAppliedCoupon(matched);
    setCouponFeedback({ type: 'success', message: `🎉 Coupon ${matched.code} applied successfully!` });
    setCouponInput(matched.code);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponFeedback(null);
    setCouponInput('');
  };

  // Copy helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Handle Checkout & Order Placement
  const handleCompleteOrder = () => {
    if (!checkoutPatientName.trim() || !checkoutPhone.trim() || !checkoutAddress.trim()) {
      alert('Please fill in recipient name, mobile number, and delivery address.');
      return;
    }
    setIsPlacingOrder(true);
    setTimeout(() => {
      const isCashlessClaim = checkoutPaymentOption === 'claim_insurance' && checkoutInsuranceClaim !== null;
      const randomOrderSuffix = Math.floor(1000 + Math.random() * 9000);
      const newOrder: PharmacyOrder = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        orderNumber: isCashlessClaim ? `NH-INS-${randomOrderSuffix}` : `NH-PHARM-2026-${randomOrderSuffix}`,
        date: 'Just now',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        subtotal: cartSubtotal,
        deliveryFee,
        discount: Math.round(couponDiscount),
        walletUsed: isCashlessClaim ? 0 : walletDeduction,
        grandTotal: isCashlessClaim ? 0 : Math.round(grandTotal),
        patientName: checkoutPatientName,
        patientPhone: checkoutPhone,
        deliveryAddress: checkoutAddress,
        paymentMethod: isCashlessClaim ? 'UPI' : selectedPaymentMethod,
        paymentStatus: isCashlessClaim ? 'Paid' : (selectedPaymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid'),
        deliveryStatus: 'Order Placed',
        deliveryPartnerName: 'Ravi Teja (Rider ID: NH-504)',
        deliveryPartnerPhone: '+91 94401 23456',
        deliveryOtp: `${Math.floor(1000 + Math.random() * 9000)}`,
        etaMinutes: 25,
        invoiceNumber: isCashlessClaim ? `INV-INS-${checkoutInsuranceClaim.claimId}` : `INV-NH-2026-${randomOrderSuffix}`,
        temperaturePreserved: true,
      };

      // Generate strictly One-Time Use Secure QR Token
      const secureToken = createOneTimeSecureToken(
        newOrder.orderNumber,
        'pharmacy_order',
        `Doorstep Pharmacy Order #${newOrder.orderNumber}`,
        {
          patientName: newOrder.patientName,
          patientPhone: newOrder.patientPhone,
          deliveryAddress: newOrder.deliveryAddress,
          items: newOrder.items.map((it) => ({
            name: it.product.name,
            quantity: it.quantity,
            price: it.product.price,
          })),
          totalAmount: newOrder.grandTotal,
          insuranceClaimId: checkoutInsuranceClaim?.claimId,
          insuranceCompany: checkoutInsuranceClaim?.insuranceCompany,
        },
        isCashlessClaim,
        checkoutInsuranceClaim?.claimId
      );
      newOrder.secureTokenId = secureToken.tokenId;

      // Deduct wallet if used (when not full cashless claim)
      if (!isCashlessClaim && walletDeduction > 0) {
        setWalletBalance((prev) => Math.max(0, prev - walletDeduction));
      }

      // Add push notification for dispatch with secure token note
      const newNotif: PharmacyNotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'dispatch',
        title: isCashlessClaim ? `Cashless Claim Approved: Order #${newOrder.orderNumber}` : `Order #${newOrder.orderNumber} Confirmed`,
        message: isCashlessClaim
          ? `Pre-auth Claim ${checkoutInsuranceClaim?.claimId} approved by ${checkoutInsuranceClaim?.insuranceCompany}. Zero payment gateway charge. Secure QR Pass ${secureToken.tokenId} issued.`
          : `Your medicine order of ${newOrder.items.length} items has been confirmed. Secure QR Pass ${secureToken.tokenId} ready for delivery verification.`,
        timestamp: 'Just now',
        isRead: false,
        actionLabel: 'Track Delivery',
        actionTarget: 'orders',
      };
      setNotifications((prev) => [newNotif, ...prev]);

      const updated = savePharmacyOrder(newOrder);
      setOrders(updated);
      setSelectedTrackingOrderId(newOrder.id);
      setSelectedQrToken(secureToken);
      setScannerPrefilledTokenId(secureToken.tokenId);
      setCart([]);
      setAppliedCoupon(null);
      setUseWalletBalance(false);
      setCheckoutInsuranceClaim(null);
      setCheckoutPaymentOption('pay_now');
      setIsPlacingOrder(false);
      setIsCheckoutModalOpen(false);
      setIsCartOpen(false);
      setActiveView('orders');
    }, 900);
  };

  // Step advancement simulation
  const advanceDeliveryStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const statusFlow: PharmacyDeliveryStatus[] = [
            'Order Placed',
            'Packing',
            'Dispatched',
            'Out for Delivery',
            'Delivered',
          ];
          const currIdx = statusFlow.indexOf(ord.deliveryStatus);
          if (currIdx < statusFlow.length - 1) {
            const nextStatus = statusFlow[currIdx + 1];
            const updated = {
              ...ord,
              deliveryStatus: nextStatus,
              etaMinutes: nextStatus === 'Delivered' ? 0 : Math.max(5, (ord.etaMinutes || 20) - 7),
              paymentStatus: nextStatus === 'Delivered' && ord.paymentMethod === 'Cash on Delivery' ? 'Paid' as const : ord.paymentStatus,
            };

            // Add notification on delivery update
            const updateNotif: PharmacyNotificationItem = {
              id: `notif-${Date.now()}`,
              type: nextStatus === 'Delivered' ? 'refill' : 'dispatch',
              title: `Order Status: ${nextStatus}`,
              message: `Order #${ord.orderNumber} is now ${nextStatus}. ${nextStatus === 'Delivered' ? 'Medicines safely handed over.' : 'Insulated transit in progress.'}`,
              timestamp: 'Just now',
              isRead: false,
              actionLabel: 'View Order',
              actionTarget: 'orders',
            };
            setNotifications((prevN) => [updateNotif, ...prevN]);

            return updated;
          }
        }
        return ord;
      })
    );
  };

  // Prescription submit
  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxPatientName.trim() || !rxPatientPhone.trim() || !selectedFileName) {
      alert('Please provide patient name, contact number, and select a prescription file.');
      return;
    }
    if (rxPaymentOption === 'claim_insurance' && !rxInsuranceClaim) {
      alert('Please complete the insurance OTP verification to approve your cashless prescription claim.');
      return;
    }
    setIsSubmittingRx(true);
    setTimeout(() => {
      const order: PrescriptionOrder = {
        id: rxInsuranceClaim ? `RX-INS-${rxInsuranceClaim.claimId}` : `RX-${Date.now().toString().slice(-6)}`,
        patientName: rxPatientName,
        patientPhone: rxPatientPhone,
        deliveryAddress: rxAddress || 'Doorstep Delivery Address',
        deliveryNotes: rxInsuranceClaim
          ? `[Cashless Insurance Claim: ${rxInsuranceClaim.claimId} (${rxInsuranceClaim.insuranceCompany}) - Policy ${rxInsuranceClaim.policyNumber}]. Instructions: ${rxNotes || 'Dispense approved generic equivalent'}`
          : rxNotes,
        fileName: selectedFileName,
        uploadDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: rxInsuranceClaim ? 'Approved' : 'Received',
      };

      const secureToken = createOneTimeSecureToken(
        order.id,
        'prescription_order',
        `Prescription Dispensation (${order.id})`,
        {
          patientName: order.patientName,
          patientPhone: order.patientPhone,
          deliveryAddress: order.deliveryAddress,
          prescriptionName: order.fileName,
          totalAmount: 0,
          notes: order.deliveryNotes,
          insuranceClaimId: rxInsuranceClaim?.claimId,
          insuranceCompany: rxInsuranceClaim?.insuranceCompany,
        },
        !!rxInsuranceClaim,
        rxInsuranceClaim?.claimId
      );
      order.secureTokenId = secureToken.tokenId;
      setScannerPrefilledTokenId(secureToken.tokenId);

      setRxSuccessOrder(order);
      setIsSubmittingRx(false);
    }, 700);
  };

  const resetRxForm = () => {
    setRxPatientName('');
    setRxPatientPhone('');
    setRxAddress('');
    setRxNotes('');
    setSelectedFileName(null);
    setRxSuccessOrder(null);
    setRxInsuranceClaim(null);
    setRxPaymentOption('pay_now');
    setIsUploadModalOpen(false);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-4 h-4 text-indigo-500" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      case 'Sun':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-cyan-500" />;
      default:
        return <Pill className="w-4 h-4 text-[#008080]" />;
    }
  };

  const getStepIndex = (status: PharmacyDeliveryStatus) => {
    return DELIVERY_STEPS.findIndex((s) => s.status === status);
  };

  // Filtered notifications
  const displayedNotifications = useMemo(() => {
    if (selectedNotifFilter === 'unread') return notifications.filter((n) => !n.isRead);
    if (selectedNotifFilter === 'refill') return notifications.filter((n) => n.type === 'refill');
    if (selectedNotifFilter === 'dispatch') return notifications.filter((n) => n.type === 'dispatch');
    return notifications;
  }, [notifications, selectedNotifFilter]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP CORPORATE DARK BLUE HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#002b49] text-white shadow-md border-b border-[#003e6b]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#001d31] hover:bg-[#003e6b] text-teal-300 text-xs sm:text-sm font-semibold transition-all border border-teal-500/20 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </button>
            <div className="h-5 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300">
                <Pill className="w-5 h-5 text-teal-300" />
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Doorstep Pharmacy</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium border border-teal-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    Express 2–4 Hr Delivery
                  </span>
                </h1>
                <p className="text-[11px] text-slate-300 hidden md:block">
                  100% Genuine Medicines · Temperature-Controlled Transport · Pharmacist Verified
                </p>
              </div>
            </div>
          </div>

          {/* Right Header Navigation Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 4 Main View Switcher Tabs */}
            <div className="flex items-center bg-[#001d31] p-1 rounded-xl border border-teal-500/20 text-xs">
              <button
                onClick={() => setActiveView('catalog')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeView === 'catalog'
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Medicines
              </button>
              <button
                onClick={() => setActiveView('deals')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeView === 'deals'
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xs:inline">Deals</span>
              </button>
              <button
                onClick={() => setActiveView('wallet')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeView === 'wallet'
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-teal-300" />
                <span className="hidden xs:inline">Rewards</span>
              </button>
              <button
                onClick={() => setActiveView('orders')}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeView === 'orders'
                    ? 'bg-[#008080] text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Orders</span>
                {orders.some((o) => o.deliveryStatus !== 'Delivered') && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>

            {/* Notification Inbox Bell Button */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-lg bg-[#001d31] hover:bg-[#003e6b] text-white border border-teal-500/20 transition-all active:scale-95 cursor-pointer"
              aria-label="View Pharmacy Notifications"
              title="Pharmacy Alerts & Reminders"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-teal-300" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#002b49] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Partner / Staff QR Scanner Button - strictly restricted to authorized Partner / Pharmacy Staff */}
            {isAuthorizedStaff && (
              <button
                onClick={() => setIsScannerModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Authorized Pharmacy Staff QR Scanner & Invalidation Terminal"
              >
                <ScanLine className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Staff Scanner</span>
              </button>
            )}

            {/* Upload Rx Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#008080] hover:bg-[#006666] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Rx</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg bg-[#001d31] hover:bg-[#003e6b] text-white border border-teal-500/20 transition-all active:scale-95 cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5 text-teal-300" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#002b49] animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* VIEW 1: CATALOG & MEDICINES (Search, categories, products)                */}
      {/* ========================================================================= */}
      {activeView === 'catalog' && (
        <>
          {/* PROMOTIONAL TICKER / BANNER STRIP */}
          <div className="bg-gradient-to-r from-amber-500 via-teal-600 to-[#002b49] text-white px-3.5 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            onClick={() => setActiveView('deals')}
          >
            <Tag className="w-3.5 h-3.5 animate-bounce" />
            <span>⚡ Special Patient Offer: Apply code <span className="bg-white/20 px-2 py-0.5 rounded text-yellow-200">FIRSTCARE25</span> for Flat 25% Off + Free Delivery!</span>
            <span className="underline hidden sm:inline ml-1 font-semibold">View All Offers &rarr;</span>
          </div>

          {/* HERO BANNER & SEARCH */}
          <section className="bg-gradient-to-b from-[#002b49] to-[#001d31] text-white px-3.5 sm:px-6 lg:px-8 pt-6 pb-8 border-b border-slate-800">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>NABL & ISO Certified Pharmacy Distribution Network</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Order Prescribed Medicines & Healthcare Essentials
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
                Search genuine pharmaceuticals, chronic refills, and wellness products with doorstep delivery directly from licensed partner pharmacies.
              </p>

              {/* Instant Search Bar */}
              <div className="relative max-w-2xl mx-auto mt-4">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search medicines, generic names (e.g. Dolo, Metformin, Pan-D, BP Monitor)..."
                    className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base rounded-xl bg-white text-slate-900 placeholder:text-slate-400 shadow-xl border border-slate-200 focus:outline-none focus:ring-3 focus:ring-teal-400/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div className="mt-2 text-left text-xs text-teal-300 font-medium">
                    Showing results for "{searchQuery}" ({filteredProducts.length} items found)
                  </div>
                )}
              </div>
            </div>

            {/* 3 Quick Features */}
            <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Clock className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">2–4 Hour Express Delivery</p>
                  <p className="text-[11px] text-slate-300">Fast doorstep drop with live tracking</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">100% Genuine Medicines</p>
                  <p className="text-[11px] text-slate-300">Batch verified with valid tamper seals</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <Truck className="w-5 h-5 text-teal-400 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Free Delivery Over ₹499</p>
                  <p className="text-[11px] text-slate-300">Savings on all chronic monthly refills</p>
                </div>
              </div>
            </div>
          </section>

          {/* MAIN CATALOG BODY */}
          <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
            {/* Quick Prescription Upload Card Callout */}
            <div className="bg-gradient-to-r from-teal-900/30 via-[#002b49] to-slate-900 border border-teal-500/30 rounded-2xl p-4 sm:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-teal-500/20 text-teal-300 shrink-0">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">Have a Doctor's Prescription?</h3>
                  <p className="text-xs sm:text-sm text-slate-300">
                    Upload your Rx and our licensed pharmacists will dispense, pack, and dispatch your required dosage.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload & Get Medicines</span>
              </button>
            </div>

            {/* Category Horizontal Filter Chips */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#002b49] uppercase tracking-wider">
                  Browse Categories
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {filteredProducts.length} items available
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {PHARMACY_CATEGORIES.map((cat, catIdx) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={`rx-cat-${cat.id}-${catIdx}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-[#002b49] text-white border-[#002b49] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-500/40 hover:bg-slate-50'
                      }`}
                    >
                      {getCategoryIcon(cat.icon)}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Catalog Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No products found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  We couldn't find matches for "{searchQuery}". Try searching for generic medicine names or upload your prescription.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-50 text-[#008080] border border-teal-200 hover:bg-teal-100 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((prod, pIdx) => {
                  const qty = getProductCartQty(prod.id);
                  return (
                    <div
                      key={`rx-prod-${prod.id}-${pIdx}`}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-teal-500/50 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                    >
                      {/* Image & Badges */}
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          loading="lazy"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {prod.requiresPrescription ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                              Rx Required
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                              OTC / Direct
                            </span>
                          )}
                        </div>
                        {prod.discountPercent > 0 && (
                          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-600 text-white shadow-xs">
                            {prod.discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
                        <p className="text-[11px] font-semibold text-teal-700 tracking-wide uppercase">
                          {prod.manufacturer}
                        </p>
                        <h4 className="text-sm sm:text-base font-bold text-[#002b49] line-clamp-1 mt-0.5">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {prod.genericName}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Pack: <span className="text-slate-600 font-medium">{prod.packSize}</span>
                        </p>

                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base sm:text-lg font-black text-[#002b49]">
                                ₹{prod.price}
                              </span>
                              {prod.mrp > prod.price && (
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{prod.mrp}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Add to cart / Quantity buttons */}
                          {qty === 0 ? (
                            <button
                              onClick={() => addToCart(prod)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#002b49] hover:bg-[#008080] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200">
                              <button
                                onClick={() => updateQuantity(prod.id, -1)}
                                className="w-6 h-6 rounded-lg bg-white text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-[#002b49] px-1.5 min-w-[20px] text-center">
                                {qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(prod.id, 1)}
                                className="w-6 h-6 rounded-lg bg-[#002b49] text-white flex items-center justify-center hover:bg-[#008080] transition-colors shadow-2xs cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: OFFERS, DEALS & COUPONS                                           */}
      {/* ========================================================================= */}
      {activeView === 'deals' && (
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#002b49] flex items-center gap-2">
              <Tag className="w-6 h-6 text-amber-500" />
              <span>Active Pharmacy Offers & Promo Codes</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Apply valid medical coupons for instant discounts on prescriptions, chronic refills, and health devices.
            </p>
          </div>

          {/* Coupons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PHARMACY_COUPONS.map((coupon, cIdx) => {
              const isApplied = appliedCoupon?.code === coupon.code;
              const isCopied = copiedCoupon === coupon.code;

              return (
                <div
                  key={`rx-coupon-${coupon.code}-${cIdx}`}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm flex flex-col justify-between ${
                    isApplied ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/20' : 'border-slate-200 hover:border-teal-400'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                        {coupon.badge}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {coupon.expiresIn}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#002b49]">{coupon.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{coupon.description}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Minimum Order Value: <span className="font-bold text-slate-700">₹{coupon.minOrder}</span>
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-lg border-2 border-dashed border-teal-600 bg-teal-50/70 font-mono font-black text-sm text-[#002b49]">
                        {coupon.code}
                      </div>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                        title="Copy code"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        handleApplyCoupon(coupon.code);
                        if (cart.length > 0) {
                          setIsCheckoutModalOpen(true);
                        } else {
                          setActiveView('catalog');
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#002b49] hover:bg-[#008080] text-white shadow-xs'
                      }`}
                    >
                      {isApplied ? 'Applied to Cart ✓' : 'Apply & Order'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chronic Refill Banner */}
          <div className="bg-gradient-to-r from-[#002b49] via-[#003e6b] to-teal-900 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Automatic Monthly Refills
              </span>
              <h3 className="text-xl font-black">Save Up to ₹1,200 Every Month on Chronic Medicines</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Set up recurring doorstep delivery for your family's BP, Diabetes, and Heart medicines. Enjoy guaranteed stock reservation and free express shipping.
              </p>
            </div>
            <button
              onClick={() => setActiveView('catalog')}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs sm:text-sm whitespace-nowrap cursor-pointer shadow-lg"
            >
              Browse Chronic Care
            </button>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: REFERRAL REWARDS WALLET                                           */}
      {/* ========================================================================= */}
      {activeView === 'wallet' && (
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#002b49] flex items-center gap-2">
              <Gift className="w-6 h-6 text-teal-600" />
              <span>Nhealth Care Rewards & Referral Wallet</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Invite friends and family to doorstep healthcare. Earn ₹150 wallet credits on every successful medicine order.
            </p>
          </div>

          {/* Wallet Balance Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#002b49] to-[#001d31] text-white shadow-md flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-teal-300 uppercase tracking-wider">Available Wallet Cash</p>
                <h3 className="text-3xl sm:text-4xl font-black mt-2 text-white">₹{walletBalance}</h3>
                <p className="text-[11px] text-slate-300 mt-1">Can be used to pay for medicine orders instantly.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold">100% Usable on Checkout</span>
                <span className="text-slate-400">1 Credit = ₹1.00</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CarePoints Balance</p>
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black mt-2 text-[#002b49]">{carePoints} Pts</h3>
                <p className="text-[11px] text-slate-500 mt-1">Auto-converts to ₹{carePoints / 2} wallet cash upon checkout.</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600 font-medium">
                Earn 10 points for every ₹100 spent on pharmaceuticals.
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">Referral Earning Rate</p>
                <h3 className="text-2xl font-black mt-2 text-teal-950">Give ₹250 · Get ₹150</h3>
                <p className="text-[11px] text-teal-700 mt-1">
                  Friend receives flat 25% discount, you get ₹150 credited to wallet on delivery!
                </p>
              </div>
              <button
                onClick={() => {
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! Use my Nhealth healthcare invite to get 25% off on genuine medicines and doctor home visits. Click here: ${referralLink}`)}`, '_blank');
                }}
                className="mt-6 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Invite on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Shareable Link Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-[#002b49]">Your Unique Referral Link & Code</h3>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full bg-slate-50 rounded-2xl border border-slate-200 p-3 flex items-center justify-between text-xs sm:text-sm font-mono text-slate-700">
                <span className="truncate">{referralLink}</span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-bold ml-2 shrink-0">
                  {referralCode}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyReferral}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-[#002b49] hover:bg-[#003e6b] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Nhealth Doorstep Pharmacy',
                        text: 'Get 25% off on genuine medicines at home with Nhealth!',
                        url: referralLink,
                      }).catch(() => {});
                    } else {
                      handleCopyReferral();
                    }
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>
          </div>

          {/* Referral Earnings History Log */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#002b49]">Referral Activity & Earnings History</h3>
              <span className="text-xs text-slate-500 font-semibold">3 Referrals Active</span>
            </div>

            <div className="space-y-3">
              {INITIAL_REFERRAL_LOGS.map((log, lIdx) => (
                <div
                  key={`rx-log-${log.id}-${lIdx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/10 text-[#008080] font-bold text-sm flex items-center justify-center">
                      {log.friendName[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#002b49]">{log.friendName}</p>
                      <p className="text-[11px] text-slate-500">{log.activity} · {log.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-700">+₹{log.cashEarned}</span>
                      <p className="text-[10px] text-slate-400 font-semibold">+{log.points} Points</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: ORDERS, RAPIDO LIVE TRACKING & TAX INVOICES                       */}
      {/* ========================================================================= */}
      {activeView === 'orders' && (
        <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002b49] flex items-center gap-2">
                <span>Orders & Live Delivery Tracking</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-300">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time express medicine dispatch monitoring and instant tax invoice receipts.
              </p>
            </div>
            <button
              onClick={() => setActiveView('catalog')}
              className="px-4 py-2 rounded-xl bg-[#002b49] text-white font-bold text-xs sm:text-sm hover:bg-[#008080] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Order More Medicines</span>
            </button>
          </div>

          {/* 1. RAPIDO-STYLE LIVE VISUAL PROGRESS TRACKER */}
          {trackingOrder && (
            <section className="bg-white rounded-3xl border border-slate-200 shadow-md p-5 sm:p-7 space-y-6">
              {/* Tracker Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-[#008080] flex items-center justify-center font-bold shrink-0">
                    <Bike className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-base sm:text-lg text-[#002b49]">
                        Order #{trackingOrder.orderNumber}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
                        {trackingOrder.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Placed on {trackingOrder.date} at {trackingOrder.time} · {trackingOrder.items.length} Medicines
                    </p>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => advanceDeliveryStatus(trackingOrder.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Simulate step advance for demo"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Advance Status</span>
                  </button>

                  <button
                    onClick={() => generatePharmacyInvoicePDF(trackingOrder)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#002b49] hover:bg-[#003e6b] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-300" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              </div>

              {/* Progress Flow (Rapido Style Horizontal Steps) */}
              <div className="py-2">
                <div className="relative">
                  {/* Background Track Line */}
                  <div className="absolute top-5 left-6 right-6 h-1.5 bg-slate-100 rounded-full hidden sm:block -z-0" />
                  {/* Active Filled Line */}
                  <div
                    className="absolute top-5 left-6 h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-700 hidden sm:block -z-0"
                    style={{
                      width: `${(getStepIndex(trackingOrder.deliveryStatus) / (DELIVERY_STEPS.length - 1)) * 92}%`,
                    }}
                  />

                  {/* 5 Steps Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                    {DELIVERY_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(trackingOrder.deliveryStatus);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div
                          key={`rx-step-${step.status}-${idx}`}
                          className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2 sm:p-0 rounded-xl transition-all ${
                            isCurrent ? 'bg-teal-50/50 sm:bg-transparent' : ''
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                              isCompleted
                                ? 'bg-gradient-to-tr from-[#008080] to-emerald-500 text-white shadow-md shadow-teal-500/20'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            } ${isCurrent ? 'ring-4 ring-teal-400/30 scale-105' : ''}`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 stroke-[2.5]" />
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>

                          <div className="flex-1 sm:flex-initial">
                            <p
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? 'text-[#002b49]'
                                  : isCompleted
                                  ? 'text-teal-800'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step.title}
                            </p>
                            <p className="text-[11px] text-slate-500 sm:max-w-[130px] sm:mx-auto">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Rider & Delivery Live Details Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#002b49] to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 w-full md:w-auto">
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-lg border border-teal-400/30 shrink-0">
                    🏍️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-extrabold text-sm sm:text-base">
                        {trackingOrder.deliveryPartnerName || 'Nhealth Express Rider'}
                      </p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-400/20 text-teal-300 border border-teal-400/30">
                        Live Tracking
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                      <span>Delivery Box: 4°C–24°C Monitored</span>
                      <span>·</span>
                      <span className="text-teal-300 font-bold">
                        {trackingOrder.deliveryStatus === 'Delivered'
                          ? 'Delivered Successfully'
                          : `ETA: ~${trackingOrder.etaMinutes || 15} Mins`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  {trackingOrder.deliveryOtp && trackingOrder.deliveryStatus !== 'Delivered' && (
                    <div className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">
                        Delivery OTP
                      </p>
                      <p className="text-base font-black text-teal-300 tracking-widest">
                        {trackingOrder.deliveryOtp}
                      </p>
                    </div>
                  )}

                  {trackingOrder.deliveryPartnerPhone && (
                    <a
                      href={`tel:${trackingOrder.deliveryPartnerPhone}`}
                      className="px-4 py-2 rounded-xl bg-[#008080] hover:bg-[#006666] text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Rider</span>
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* 2. ORDER HISTORY & TRANSACTION LOG */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#002b49] flex items-center justify-between">
              <span>All Order Transactions & Receipts</span>
              <span className="text-xs text-slate-500 font-medium">Click order to track live</span>
            </h3>

            <div className="space-y-3">
              {orders.map((order, oIdx) => {
                const isSelected = order.id === selectedTrackingOrderId;

                return (
                  <div
                    key={`rx-order-${order.id}-${oIdx}`}
                    onClick={() => setSelectedTrackingOrderId(order.id)}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md'
                        : 'border-slate-200 hover:border-teal-400/40 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[#002b49] text-sm sm:text-base">
                            {order.orderNumber}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">
                            {order.date} at {order.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Recipient: <span className="font-semibold text-slate-700">{order.patientName}</span> ({order.patientPhone})
                        </p>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : order.paymentStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          Payment: {order.paymentStatus} ({order.paymentMethod})
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            order.deliveryStatus === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-teal-50 text-teal-800 border border-teal-300'
                          }`}
                        >
                          {order.deliveryStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="py-3 text-xs space-y-1.5">
                      <div className="font-semibold text-slate-700">Dispensed Medicines:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={`rx-item-${order.id}-${item.product?.id || idx}-${idx}`}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                          >
                            <span className="font-medium text-slate-800 truncate mr-2">
                              {item.product.name} (x{item.quantity})
                            </span>
                            <span className="font-bold text-teal-800 shrink-0">
                              ₹{item.product.price * item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Footer: Amount and Download Invoice */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500">Total Paid: </span>
                        <span className="text-base font-black text-[#002b49]">
                          ₹{order.grandTotal}
                        </span>
                        {order.discount > 0 && (
                          <span className="ml-2 text-rose-600 font-semibold">(Coupon -₹{order.discount})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            let tok = order.secureTokenId ? findTokenById(order.secureTokenId) : null;
                            if (!tok) {
                              tok = createOneTimeSecureToken(
                                order.orderNumber,
                                'pharmacy_order',
                                `Doorstep Pharmacy Order #${order.orderNumber}`,
                                {
                                  patientName: order.patientName,
                                  patientPhone: order.patientPhone,
                                  deliveryAddress: order.deliveryAddress,
                                  items: order.items.map((it) => ({
                                    name: it.product.name,
                                    quantity: it.quantity,
                                    price: it.product.price,
                                  })),
                                  totalAmount: order.grandTotal,
                                }
                              );
                            }
                            setSelectedQrToken(tok);
                            setScannerPrefilledTokenId(tok.tokenId);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#008080] font-bold transition-all flex items-center gap-1.5 border border-teal-200 cursor-pointer text-xs"
                          title="View One-Time Encrypted QR Pass"
                        >
                          <QrCode className="w-3.5 h-3.5 text-[#008080]" />
                          <span>Secure QR Pass</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePharmacyInvoicePDF(order);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#002b49] text-slate-700 hover:text-white font-bold transition-all flex items-center gap-1.5 border border-slate-200 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-teal-600" />
                          <span>PDF Invoice</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 5. STICKY CART FOOTER BAR (WHEN CART HAS ITEMS)                           */}
      {/* ========================================================================= */}
      {totalCartItems > 0 && !isCartOpen && !isCheckoutModalOpen && (
        <div className="sticky bottom-0 z-30 bg-[#002b49] text-white p-3.5 sm:p-4 border-t border-[#003e6b] shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>{totalCartItems} {totalCartItems === 1 ? 'item' : 'items'} in Cart</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-teal-300 font-extrabold">₹{cartSubtotal}</span>
                </p>
                <p className="text-[11px] text-slate-300 hidden sm:block">
                  {cartSubtotal >= 499
                    ? '🎉 Free Doorstep Delivery unlocked'
                    : `Add ₹${499 - cartSubtotal} more for Free Delivery`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SHOPPING CART SIDE DRAWER (WITH COUPON INTEGRATION)                    */}
      {/* ========================================================================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-4 bg-[#002b49] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-base">Your Pharmacy Cart</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <ShoppingCart className="w-12 h-12 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">Your cart is empty</p>
                  <p className="text-xs text-slate-400">Add medicines or upload a prescription to get started.</p>
                </div>
              ) : (
                cart.map(({ product, quantity }, cIdx) => (
                  <div
                    key={`rx-cart-${product.id}-${cIdx}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#002b49] truncate">{product.name}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{product.genericName}</p>
                      <p className="text-xs font-black text-teal-700 mt-1">₹{product.price * quantity}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white rounded-lg p-1 border border-slate-200">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="w-5 h-5 rounded text-slate-600 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-5 h-5 rounded bg-[#002b49] text-white flex items-center justify-center hover:bg-[#008080] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Breakdown, Coupon Box & Checkout Trigger */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                {/* Coupon Input Box */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter Promo Code (e.g. FIRSTCARE25)"
                      className="flex-1 px-3 py-1.5 text-xs uppercase font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={removeCoupon}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200 hover:bg-rose-100 cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplyCoupon()}
                        className="px-3 py-1.5 rounded-lg bg-[#002b49] text-white font-bold text-xs hover:bg-[#008080] cursor-pointer"
                      >
                        Apply
                      </button>
                    )}
                  </div>

                  {couponFeedback && (
                    <p className={`text-[11px] font-semibold ${couponFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {couponFeedback.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>Items Total ({totalCartItems})</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doorstep Express Delivery</span>
                    <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                  </div>

                  {appliedCoupon && couponDiscount > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>- ₹{couponDiscount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-[#002b49] pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                  className="w-full py-3 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Proceed to Payment (₹{grandTotal})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PAYMENT INTEGRATION UI & CHECKOUT MODAL (WITH WALLET & COUPONS)       */}
      {/* ========================================================================= */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#002b49] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Secure Payment & Checkout</h3>
                  <p className="text-[11px] text-slate-300">Bank-Grade 256-Bit SSL Encrypted Healthcare Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Recipient Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  1. Delivery Recipient Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Patient Full Name</label>
                    <input
                      type="text"
                      value={checkoutPatientName}
                      onChange={(e) => setCheckoutPatientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Mobile Contact</label>
                    <input
                      type="text"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-600 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Wallet & Rewards Section: Disabled & Hidden when Claim with Insurance is selected */}
              {checkoutPaymentOption === 'claim_insurance' ? (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">IRDAI Cashless Insurance Mode Active</span>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      To prevent stacking benefits, promotional coupons, discount codes, and wallet points redemption are automatically disabled for cashless insurance claims.
                    </p>
                  </div>
                </div>
              ) : (
                walletBalance > 0 && (
                  <div className="p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id="applyWalletCheck"
                        checked={useWalletBalance}
                        onChange={(e) => setUseWalletBalance(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                      />
                      <label htmlFor="applyWalletCheck" className="cursor-pointer">
                        <span className="font-extrabold text-[#002b49]">Use Nhealth Care Wallet</span>
                        <p className="text-[11px] text-teal-800">
                          Available Balance: ₹{walletBalance} · Apply up to ₹{maxWalletUsable} off
                        </p>
                      </label>
                    </div>
                    {useWalletBalance && (
                      <span className="text-emerald-700 font-black text-sm">- ₹{walletDeduction}</span>
                    )}
                  </div>
                )
              )}

              {/* Insurance & Payment Choice */}
              <InsuranceClaimSection
                selectedOption={checkoutPaymentOption}
                isLoggedIn={isLoggedIn}
                onPromptLogin={onPromptLogin}
                onChangeOption={(opt) => {
                  setCheckoutPaymentOption(opt);
                  if (opt === 'pay_now') {
                    setCheckoutInsuranceClaim(null);
                  }
                }}
                onClaimConfirmed={(claim) => {
                  setCheckoutInsuranceClaim(claim);
                }}
                patientPhone={checkoutPhone}
                serviceTitle="Doorstep Pharmacy Medicines"
                amount={grandTotal}
              />

              {/* Payment Method Selectors - Only shown if Pay Now is selected */}
              {checkoutPaymentOption === 'pay_now' && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Choose Payment Gateway
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* UPI */}
                    <label
                      onClick={() => setSelectedPaymentMethod('UPI')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'UPI'
                          ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === 'UPI'}
                        onChange={() => setSelectedPaymentMethod('UPI')}
                        className="mt-0.5 text-teal-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-teal-700" />
                          <span className="font-bold text-xs text-slate-900">UPI Instant</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          GPay, PhonePe, Paytm, QR Code
                        </p>
                      </div>
                    </label>

                    {/* Cards */}
                    <label
                      onClick={() => setSelectedPaymentMethod('Cards')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'Cards'
                          ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === 'Cards'}
                        onChange={() => setSelectedPaymentMethod('Cards')}
                        className="mt-0.5 text-teal-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-teal-700" />
                          <span className="font-bold text-xs text-slate-900">Credit / Debit Cards</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Visa, Mastercard, RuPay
                        </p>
                      </div>
                    </label>

                    {/* Net Banking */}
                    <label
                      onClick={() => setSelectedPaymentMethod('Net Banking')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'Net Banking'
                          ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === 'Net Banking'}
                        onChange={() => setSelectedPaymentMethod('Net Banking')}
                        className="mt-0.5 text-teal-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-teal-700" />
                          <span className="font-bold text-xs text-slate-900">Net Banking</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          All Indian Major Banks
                        </p>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label
                      onClick={() => setSelectedPaymentMethod('Cash on Delivery')}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedPaymentMethod === 'Cash on Delivery'
                          ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-500/20'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPaymentMethod === 'Cash on Delivery'}
                        onChange={() => setSelectedPaymentMethod('Cash on Delivery')}
                        className="mt-0.5 text-teal-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-teal-700" />
                          <span className="font-bold text-xs text-slate-900">Cash / Pay on Delivery</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pay cash or QR at doorstep
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Sub-selector detail for UPI */}
                  {selectedPaymentMethod === 'UPI' && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-around">
                      <button
                        type="button"
                        onClick={() => setUpiOption('gpay')}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                          upiOption === 'gpay' ? 'bg-[#002b49] text-white' : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        Google Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiOption('phonepe')}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                          upiOption === 'phonepe' ? 'bg-[#002b49] text-white' : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        PhonePe
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiOption('paytm')}
                        className={`px-3 py-1.5 rounded-lg font-bold cursor-pointer ${
                          upiOption === 'paytm' ? 'bg-[#002b49] text-white' : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        Paytm UPI
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Order Final Summary */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Medicines Subtotal ({totalCartItems} items)</span>
                  <span className="font-semibold text-slate-800">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Doorstep Temperature Box Delivery</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>- ₹{couponDiscount}</span>
                  </div>
                )}

                {walletDeduction > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Care Wallet Credit</span>
                    <span>- ₹{walletDeduction}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-[#002b49] pt-2 border-t border-slate-200">
                  <span>Payable Amount</span>
                  <span className={checkoutPaymentOption === 'claim_insurance' && checkoutInsuranceClaim ? 'text-emerald-700 font-extrabold' : 'text-teal-700'}>
                    {checkoutPaymentOption === 'claim_insurance' && checkoutInsuranceClaim ? (
                      <span className="flex items-center gap-1.5">
                        <span className="line-through text-slate-400 font-normal text-xs">₹{grandTotal}</span>
                        <span>₹0 (Cashless Pre-Auth)</span>
                      </span>
                    ) : (
                      `₹${grandTotal}`
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPlacingOrder || (checkoutPaymentOption === 'claim_insurance' && !checkoutInsuranceClaim)}
                  onClick={handleCompleteOrder}
                  className="flex-2 py-3 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isPlacingOrder
                      ? 'Processing...'
                      : checkoutPaymentOption === 'claim_insurance'
                      ? checkoutInsuranceClaim
                        ? 'Confirm Cashless Order (₹0 Due)'
                        : 'Verify Insurance OTP Above'
                      : `Pay & Confirm ₹${grandTotal}`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. DEDICATED PHARMACY NOTIFICATIONS MODAL / INBOX                         */}
      {/* ========================================================================= */}
      {isNotificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-[#002b49] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Pharmacy Notifications</h3>
                  <p className="text-[11px] text-slate-300">Refill reminders, dispatches, and exclusive deals</p>
                </div>
              </div>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Pills & Actions */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setSelectedNotifFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedNotifFilter === 'all' ? 'bg-[#002b49] text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setSelectedNotifFilter('unread')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedNotifFilter === 'unread' ? 'bg-[#002b49] text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setSelectedNotifFilter('refill')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedNotifFilter === 'refill' ? 'bg-[#002b49] text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Refills
                </button>
                <button
                  onClick={() => setSelectedNotifFilter('dispatch')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedNotifFilter === 'dispatch' ? 'bg-[#002b49] text-white' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Dispatches
                </button>
              </div>

              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-bold text-teal-700 hover:underline shrink-0 cursor-pointer"
              >
                Mark Read
              </button>
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {displayedNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No notifications in this filter</p>
                </div>
              ) : (
                displayedNotifications.map((n, nIdx) => (
                  <div
                    key={`rx-notif-${n.id}-${nIdx}`}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      n.isRead ? 'bg-white border-slate-200' : 'bg-teal-50/40 border-teal-300 ring-1 ring-teal-400/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {n.type === 'refill' && <Pill className="w-4 h-4 text-rose-500 shrink-0" />}
                        {n.type === 'dispatch' && <Bike className="w-4 h-4 text-teal-600 shrink-0" />}
                        {n.type === 'deal' && <Tag className="w-4 h-4 text-amber-500 shrink-0" />}
                        {n.type === 'wallet' && <Gift className="w-4 h-4 text-emerald-600 shrink-0" />}
                        <h4 className="text-xs font-extrabold text-[#002b49]">{n.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{n.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                    {n.actionLabel && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={() => {
                            setIsNotificationsOpen(false);
                            if (n.actionTarget) {
                              setActiveView(n.actionTarget);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-[#002b49] hover:bg-[#008080] text-white text-[11px] font-bold cursor-pointer"
                        >
                          {n.actionLabel} &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                onClick={clearAllNotifications}
                className="text-[11px] text-slate-500 hover:text-rose-600 cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. PRESCRIPTION UPLOAD MODAL                                              */}
      {/* ========================================================================= */}
      {isUploadModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) resetRxForm();
          }}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto cursor-pointer"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200 cursor-default relative"
          >
            {/* Modal Header */}
            <div className="bg-[#002b49] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Upload Prescription</h3>
                  <p className="text-[11px] text-teal-200/80">Our pharmacists will dispense accurate medicines</p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetRxForm}
                className="p-2 rounded-full text-white/90 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/20 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400"
                title="Close upload popup (or click outside)"
                aria-label="Close prescription upload dialog"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            {rxSuccessOrder ? (
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-[#002b49]">Prescription Received!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Reference Order ID: <span className="font-bold text-teal-700">{rxSuccessOrder.id}</span>
                </p>
                <div className="p-3.5 bg-slate-50 rounded-xl text-left text-xs space-y-1.5 border border-slate-200">
                  <p><span className="font-semibold text-slate-700">Patient:</span> {rxSuccessOrder.patientName}</p>
                  <p><span className="font-semibold text-slate-700">Phone:</span> {rxSuccessOrder.patientPhone}</p>
                  <p><span className="font-semibold text-slate-700">Prescription File:</span> {rxSuccessOrder.fileName}</p>
                  <p><span className="font-semibold text-slate-700">Status:</span> Verification in Progress</p>
                </div>

                {/* Show Secure Token Quick Launcher */}
                {rxSuccessOrder.secureTokenId && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const tok = rxSuccessOrder.secureTokenId ? findTokenById(rxSuccessOrder.secureTokenId) : null;
                        if (tok) setSelectedQrToken(tok);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View One-Time Encrypted QR Pass & WhatsApp Receipt</span>
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">
                  A registered Nhealth pharmacist is reviewing your prescription and will verify your encrypted QR token upon dispatch.
                </p>
                <button
                  onClick={resetRxForm}
                  className="w-full py-2.5 rounded-xl bg-[#002b49] text-white font-bold text-xs sm:text-sm hover:bg-[#003e6b] cursor-pointer"
                >
                  Close & Continue Browsing
                </button>
              </div>
            ) : (
              <form onSubmit={handlePrescriptionSubmit} className="p-4 sm:p-6 space-y-4">
                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Prescription Document / Photo *
                  </label>
                  <label className="border-2 border-dashed border-teal-500/40 hover:border-teal-600 bg-teal-50/30 hover:bg-teal-50/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center">
                    <UploadCloud className="w-8 h-8 text-[#008080] mb-2" />
                    <span className="text-xs font-semibold text-slate-800">
                      {selectedFileName ? selectedFileName : 'Tap to browse or drop Rx image/PDF'}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Supports JPG, PNG, PDF up to 10MB
                    </span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFileName(file.name);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={rxPatientName}
                      onChange={(e) => setRxPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={rxPatientPhone}
                      onChange={(e) => setRxPatientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={rxAddress}
                    onChange={(e) => setRxAddress(e.target.value)}
                    placeholder="House/Flat number, Street, Landmark, Pin code"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Doctor's Instructions or Brand Preference (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={rxNotes}
                    onChange={(e) => setRxNotes(e.target.value)}
                    placeholder="e.g. Please supply 30 days quantity, generic equivalents acceptable..."
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Insurance Claim Option for Prescription Upload */}
                <InsuranceClaimSection
                  selectedOption={rxPaymentOption}
                  isLoggedIn={isLoggedIn}
                  onPromptLogin={onPromptLogin}
                  onChangeOption={(opt) => {
                    setRxPaymentOption(opt);
                    if (opt === 'pay_now') {
                      setRxInsuranceClaim(null);
                    }
                  }}
                  onClaimConfirmed={(claim) => {
                    setRxInsuranceClaim(claim);
                  }}
                  patientPhone={rxPatientPhone}
                  serviceTitle="Prescription Medicines Dispensation"
                />

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] border border-teal-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Only valid prescriptions from registered medical practitioners are processed.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={resetRxForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRx || (rxPaymentOption === 'claim_insurance' && !rxInsuranceClaim)}
                    className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingRx
                      ? 'Submitting...'
                      : rxPaymentOption === 'claim_insurance'
                      ? rxInsuranceClaim
                        ? 'Confirm Cashless Prescription Order'
                        : 'Verify Insurance OTP to Proceed'
                      : 'Upload & Place Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. ONE-TIME USE SECURE QR PASS & WHATSAPP RECEIPT MODAL                  */}
      {/* ========================================================================= */}
      {selectedQrToken && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedQrToken(null);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-5 overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full my-auto max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 cursor-default scrollbar-thin rounded-2xl sm:rounded-3xl shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedQrToken(null)}
              className="absolute top-3 right-3 z-30 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-xl border border-slate-600 cursor-pointer transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-400"
              aria-label="Close Secure QR Pass"
              title="Close pass (or click outside)"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <SecureQrTokenCard
              token={selectedQrToken}
              isStaff={isAuthorizedStaff}
              onOpenScanner={
                isAuthorizedStaff
                  ? () => {
                      const id = selectedQrToken.tokenId;
                      setSelectedQrToken(null);
                      setScannerPrefilledTokenId(id);
                      setIsScannerModalOpen(true);
                    }
                  : undefined
              }
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. AUTHORIZED PARTNER PHARMACY SCANNER & ONE-TIME INVALIDATION TERMINAL */}
      {/* ========================================================================= */}
      {isAuthorizedStaff && (
        <AuthorizedPharmacyScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          prefilledTokenId={scannerPrefilledTokenId}
        />
      )}
    </div>
  );
};
