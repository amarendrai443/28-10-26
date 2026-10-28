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
}
