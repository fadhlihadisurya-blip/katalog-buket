export type Category = 'Hand Bouquet' | 'Box Bouquet' | 'Round Bouquet' | 'Standing Flower';

export interface MarketplaceLinks {
  whatsapp: string;
  shopee: string;
  tokopedia: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: Category;
  description: string;
  marketplaceLinks: MarketplaceLinks;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  adminEmail: string;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE';
  targetId: string;
  targetName: string;
  timestamp: Date;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin';
}
