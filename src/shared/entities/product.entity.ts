/**
 * Product Entity
 * Core domain model for Product
 */

export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface Progress {
  id: number;
  productId: number;
  percentage: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}