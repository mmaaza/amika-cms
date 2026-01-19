export interface OrderItem {
  id: number;
  documentId: string;
  quantity: number;
  priceAtOrder: number;
  size?: string;
  product?: {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    material?: string;
    images?: Array<{
      url: string;
    }>;
  };
}

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  paymentMethod: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  shippingAddress: string;
  shippingCity: string;
  shippingProvince: string;
  shippingZip: string;
  shippingCountry: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  order_items?: OrderItem[];
  users_permissions_user?: {
    id: number;
    username: string;
    email: string;
  };
}
