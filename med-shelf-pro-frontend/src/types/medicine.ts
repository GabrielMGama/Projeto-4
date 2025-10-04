export interface Medicine {
  id: string;
  name: string;
  stock: number;
  price: number;
  expiryDate: string;
  category?: string;
  description?: string;
}

export interface MedicineFormData {
  name: string;
  stock: number;
  price: number;
  expiryDate: string;
  category?: string;
  description?: string;
}