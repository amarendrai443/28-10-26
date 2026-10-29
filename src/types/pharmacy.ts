export interface PharmacyCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
}

export interface MedicineProduct {
  id: string;
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Gel/Cream' | 'Medical Device';
  packSize: string;
  mrp: number;
  price: number;
  discountPercent: number;
  requiresPrescription: boolean;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  tags: string[];
  indications: string;
}

export interface PharmacyCartItem {
  product: MedicineProduct;
  quantity: number;
}

export interface PrescriptionOrder {
  id: string;
  patientName: string;
  patientPhone: string;
  deliveryAddress: string;
  deliveryNotes?: string;
  fileName: string;
  fileDataUrl?: string;
  uploadDate: string;
  status: 'Received' | 'Verifying by Pharmacist' | 'Approved' | 'Out for Delivery';
  secureTokenId?: string;
}

export type PharmacyDeliveryStatus =
  | 'Order Placed'
  | 'Packing'
  | 'Dispatched'
  | 'Out for Delivery'
  | 'Delivered';

export type PaymentMethod =
  | 'UPI'
  | 'Cards'
  | 'Net Banking'
  | 'Cash on Delivery';

export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';

export interface PharmacyOrder {
  id: string;
  orderNumber: string;
  date: string;
  time: string;
  items: PharmacyCartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  walletUsed?: number;
  grandTotal: number;
  patientName: string;
  patientPhone: string;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryStatus: PharmacyDeliveryStatus;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryOtp?: string;
  etaMinutes?: number;
  invoiceNumber: string;
  temperaturePreserved: boolean;
  secureTokenId?: string;
}

export interface PharmacyCoupon {
  code: string;
  title: string;
  description: string;
  discountType: 'percent' | 'flat' | 'free_shipping';
  value: number;
  minOrder: number;
  maxDiscount?: number;
  badge: string;
  expiresIn: string;
}

export interface ReferralRewardLog {
  id: string;
  friendName: string;
  activity: string;
  points: number;
  cashEarned: number;
  date: string;
  status: 'Credited' | 'Pending';
}

export interface PharmacyNotificationItem {
  id: string;
  type: 'dispatch' | 'refill' | 'deal' | 'wallet';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionTarget?: 'catalog' | 'orders' | 'wallet';
}
