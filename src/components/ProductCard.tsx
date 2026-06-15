import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ZoomIn } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsLightboxOpen(false);
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isLightboxOpen]);

  return (
    <>
      <motion.div 
        key={product.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white border border-brand-border rounded-sm overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500 h-full"
      >
        <div 
          id={`product-image-container-${product.id}`}
          onClick={() => setIsLightboxOpen(true)}
          className="h-72 flex items-center justify-center overflow-hidden relative bg-brand-bg cursor-zoom-in group/image"
        >
          <img 
            id={`product-image-${product.id}`}
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover/image:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop'; // Elegant floral placeholder
              target.onerror = null;
            }}
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-white/95 text-brand-primary rounded-full p-3 shadow-lg transform translate-y-2 group-hover/image:translate-y-0 transition-transform duration-300">
              <ZoomIn size={18} />
            </div>
          </div>
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

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            id={`lightbox-backdrop-${product.id}`}
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-brand-bg/95 backdrop-blur-md cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close button top-right */}
            <button
              id={`lightbox-close-${product.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="absolute top-6 right-6 z-[210] p-3 text-brand-secondary hover:text-brand-primary hover:bg-white/50 rounded-full transition-all bg-white/30 backdrop-blur-sm border border-brand-border/40 shadow-sm outline-none"
              aria-label="Tutup"
            >
              <X size={20} />
            </button>

            {/* Img Card */}
            <motion.div
              id={`lightbox-card-${product.id}`}
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center justify-center cursor-default bg-white border border-brand-border rounded-xl shadow-2xl overflow-hidden p-3"
            >
              <div className="relative w-full h-full overflow-hidden flex items-center justify-center max-h-[70vh] bg-brand-bg rounded-lg">
                <img
                  id={`lightbox-image-${product.id}`}
                  src={product.imageUrl}
                  alt={product.name}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop';
                    target.onerror = null;
                  }}
                />
              </div>

              {/* Product Info Block */}
              <div className="w-full pt-4 pb-2 px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-brand-border mt-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    {product.category}
                  </span>
                  <h3 className="text-lg font-calibri italic font-black text-brand-text leading-tight">{product.name}</h3>
                </div>
                <div className="flex flex-col md:items-end justify-center">
                  <span className="text-emerald-600 font-bold text-lg">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  {product.isBestSeller && (
                    <span className="mt-1 inline-block self-start md:self-end px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-amber-500 text-white rounded">
                      Best Seller
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
