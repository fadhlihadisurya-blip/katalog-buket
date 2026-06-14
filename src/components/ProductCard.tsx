import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  return (
    <motion.div 
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-brand-border rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500 h-full"
    >
      <div className="h-72 flex items-center justify-center overflow-hidden relative bg-brand-bg">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop'; // Elegant floral placeholder
            target.onerror = null;
          }}
        />
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[8px] uppercase tracking-widest font-bold text-brand-primary rounded-full shadow-sm">
            {product.category}
          </span>
          {product.isBestSeller && (
            <span className="px-3 py-1 bg-brand-primary text-white text-[8px] uppercase tracking-widest font-bold rounded-full shadow-md">
              Best Seller
            </span>
          )}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <p className="text-xs text-brand-text mb-4 whitespace-pre-wrap leading-relaxed">
          {product.description}
        </p>
        <h4 className="font-calibri text-xl mb-1 text-brand-text italic font-bold">
          {product.name}
        </h4>
        <p className="text-sm font-bold text-brand-primary mb-6">
          Rp {product.price.toLocaleString('id-ID')}
        </p>
        <div className="mt-auto flex gap-3">
          {product.marketplaceLinks.whatsapp ? (
             <a 
              href={product.marketplaceLinks.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-brand-primary text-white text-[10px] py-3 uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-brand-text transition-colors text-center"
            >
              Order via WA
            </a>
          ) : product.marketplaceLinks.shopee || product.marketplaceLinks.tokopedia ? (
            <div className="flex-1 flex gap-2">
               {product.marketplaceLinks.shopee && (
                  <a href={product.marketplaceLinks.shopee} target="_blank" rel="noreferrer" className="flex-1 bg-[#EE4D2D] text-white text-[10px] py-3 uppercase font-bold rounded-sm text-center">Shopee</a>
               )}
               {product.marketplaceLinks.tokopedia && (
                  <a href={product.marketplaceLinks.tokopedia} target="_blank" rel="noreferrer" className="flex-1 bg-[#03AC0E] text-white text-[10px] py-3 uppercase font-bold rounded-sm text-center">TOKPED</a>
               )}
            </div>
          ) : (
            <button className="flex-1 bg-brand-primary text-white text-[10px] py-3 uppercase tracking-[0.2em] font-bold rounded-sm hover:bg-brand-text transition-colors">
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
