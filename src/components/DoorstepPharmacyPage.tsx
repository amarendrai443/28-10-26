import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  PHARMACY_CATEGORIES,
  TRENDING_MEDICINES,
} from '../data/pharmacyData';
import { MedicineProduct, PharmacyCartItem, PrescriptionOrder } from '../types/pharmacy';

interface DoorstepPharmacyPageProps {
  onBackToHome: () => void;
  onOpenBookingModal?: (serviceName: string) => void;
}

export const DoorstepPharmacyPage: React.FC<DoorstepPharmacyPageProps> = ({
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<PharmacyCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Prescription Form state
  const [rxPatientName, setRxPatientName] = useState('');
  const [rxPatientPhone, setRxPatientPhone] = useState('');
  const [rxAddress, setRxAddress] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [rxSuccessOrder, setRxSuccessOrder] = useState<PrescriptionOrder | null>(null);
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

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
  const deliveryFee = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 49;

  // Handle Prescription submission
  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxPatientName.trim() || !rxPatientPhone.trim() || !selectedFileName) {
      alert('Please provide patient name, contact number, and select a prescription file.');
      return;
    }
    setIsSubmittingRx(true);
    setTimeout(() => {
      const order: PrescriptionOrder = {
        id: `RX-${Date.now().toString().slice(-6)}`,
        patientName: rxPatientName,
        patientPhone: rxPatientPhone,
        deliveryAddress: rxAddress || 'Doorstep Delivery Address',
        deliveryNotes: rxNotes,
        fileName: selectedFileName,
        uploadDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Received',
      };
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
    setIsUploadModalOpen(false);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. TOP CORPORATE DARK BLUE HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#002b49] text-white shadow-md border-b border-[#003e6b]">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#001d31] hover:bg-[#003e6b] text-teal-300 text-xs sm:text-sm font-semibold transition-all border border-teal-500/20 active:scale-95"
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

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#008080] hover:bg-[#006666] text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden xs:inline">Upload Prescription</span>
              <span className="xs:hidden">Upload Rx</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg bg-[#001d31] hover:bg-[#003e6b] text-white border border-teal-500/20 transition-all active:scale-95"
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

      {/* 2. HERO SEARCH & VALUE PROPOSITION BANNER */}
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

      {/* 3. MAIN CATALOG BODY */}
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
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-2"
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
            {PHARMACY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
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
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-teal-50 text-[#008080] border border-teal-200 hover:bg-teal-100"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((prod) => {
              const qty = getProductCartQty(prod.id);
              return (
                <div
                  key={prod.id}
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
                          className="px-3.5 py-1.5 rounded-xl bg-[#002b49] hover:bg-[#008080] text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200">
                          <button
                            onClick={() => updateQuantity(prod.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#002b49] px-1.5 min-w-[20px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(prod.id, 1)}
                            className="w-6 h-6 rounded-lg bg-[#002b49] text-white flex items-center justify-center hover:bg-[#008080] transition-colors shadow-2xs"
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

      {/* 4. STICKY CART FOOTER BAR (WHEN CART HAS ITEMS) */}
      {totalCartItems > 0 && !isCartOpen && (
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
              className="px-5 py-2.5 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              View Cart & Checkout
            </button>
          </div>
        </div>
      )}

      {/* 5. SHOPPING CART SIDE DRAWER */}
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
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
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
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
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
                        className="w-5 h-5 rounded text-slate-600 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold px-1">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="w-5 h-5 rounded bg-[#002b49] text-white flex items-center justify-center hover:bg-[#008080]"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Breakdown & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Total ({totalCartItems})</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Doorstep Express Delivery</span>
                    <span>{deliveryFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#002b49] pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span>₹{cartSubtotal + deliveryFee}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    alert('Order request placed! Our pharmacy executive will contact you for dispatch confirmation.');
                    setCart([]);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#008080] hover:bg-[#006666] text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  Proceed to Doorstep Delivery
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. PRESCRIPTION UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3.5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#002b49] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Upload Prescription</h3>
                  <p className="text-[11px] text-slate-300">Our pharmacists will dispense accurate medicines</p>
                </div>
              </div>
              <button
                onClick={resetRxForm}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
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
                <p className="text-[11px] text-slate-500">
                  A registered Nhealth pharmacist is reviewing your prescription and will call you within 15 minutes to confirm dosage and delivery slot.
                </p>
                <button
                  onClick={resetRxForm}
                  className="w-full py-2.5 rounded-xl bg-[#002b49] text-white font-bold text-xs sm:text-sm hover:bg-[#003e6b]"
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

                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] border border-teal-200">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Only valid prescriptions from registered medical practitioners are processed.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={resetRxForm}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRx}
                    className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#008080] hover:bg-[#006666] rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSubmittingRx ? 'Submitting...' : 'Upload & Place Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
