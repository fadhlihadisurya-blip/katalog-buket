export interface MarketplaceLinks {
  shopee?: string;
  tokopedia?: string;
  whatsapp?: string;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  category: 'Hand Bouquet' | 'Box Bouquet' | 'Round Bouquet' | 'Standing Flower' | 'Money Bouquet';
  description: string;
  imageUrl: string;
  marketplaceLinks: MarketplaceLinks;
  isBestSeller?: boolean;
  createdAt: any;
  updatedAt: any;
}
