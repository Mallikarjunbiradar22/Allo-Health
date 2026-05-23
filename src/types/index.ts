export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
}

export interface Stock {
  id: string;
  productId: string;
  warehouseId: string;
  total: number;
  reserved: number;
  available: number;
  warehouse: Warehouse;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  imageUrl: string | null;
  stocks: Stock[];
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  RELEASED = 'RELEASED',
}

export interface Reservation {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: string;
  product?: Product;
  warehouse?: Warehouse;
}
