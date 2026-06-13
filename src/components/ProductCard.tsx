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
      <div className="h-72 flex items-center justify-center overflow-hidden relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
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
        <h4 className="font-serif text-xl mb-1 text-brand-text italic font-bold">
          {product.name}
        </h4>
        <p className="text-[10px] text-brand-accent line-clamp-2 mb-4 font-light leading-relaxed">
          {product.description}
        </p>
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
