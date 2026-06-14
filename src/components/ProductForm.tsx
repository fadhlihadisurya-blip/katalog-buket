import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { X, Loader2, Save, Image as ImageIcon, Link as LinkIcon, Info, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { validateProductImage } from '../utils/validation';
import { compressImage } from '../utils/image-compression';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onClose, loading }) => {
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    price: 0,
    category: 'Hand Bouquet',
    description: '',
    imageUrl: '',
    isBestSeller: false,
    marketplaceLinks: {
      shopee: '',
      tokopedia: '',
      whatsapp: ''
    }
  });

  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        isBestSeller: !!product.isBestSeller,
        marketplaceLinks: {
          shopee: product.marketplaceLinks?.shopee || '',
          tokopedia: product.marketplaceLinks?.tokopedia || '',
          whatsapp: product.marketplaceLinks?.whatsapp || ''
        }
      });
      setPreviewUrl(product.imageUrl);
      // Automatically detect if the stored image is base64
      if (product.imageUrl && product.imageUrl.startsWith('data:image/')) {
        setImageInputMode('upload');
      } else {
        setImageInputMode('url');
      }
    }
  }, [product]);

  const processSelectedFile = async (file: File) => {
    console.log(`[DIAGNOSTICS] Selected image file: ${file.name}, size: ${Math.round(file.size / 1024)} KB, type: ${file.type}`);
    const validation = validateProductImage(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    try {
      setUploading(true);
      // Run high-efficiency compression targeting safe size
      const compressed = await compressImage(file, 500, 500, 0.5);
      const sizeInKB = Math.round((compressed.length * 3) / 4 / 1024);
      console.log(`[DIAGNOSTICS] Image compressed successfully. Base64 length: ${compressed.length} characters. Estimated Firestore payload weight: ${sizeInKB} KB`);
      
      setSelectedFile(file);
      setPreviewUrl(compressed);
      setFormData(prev => ({ ...prev, imageUrl: compressed }));
    } catch (err: any) {
      console.error('[DIAGNOSTICS] Error compressing image:', err);
      alert(`Gagal memproses gambar: ${err.message || err}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleUrlChange = (urlStr: string) => {
    setFormData(prev => ({ ...prev, imageUrl: urlStr }));
    setPreviewUrl(urlStr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Nama produk tidak boleh kosong.');
      return;
    }

    if (!formData.imageUrl.trim()) {
      alert(imageInputMode === 'url' ? 'Harap masukkan URL foto produk.' : 'Harap pilih atau drag-and-drop sebuah foto produk.');
      return;
    }

    setUploading(true);
    console.log('[DIAGNOSTICS] Submitting product form. Saved payload size of imageUrl:', Math.round((formData.imageUrl.length * 3) / 4 / 1024), 'KB');

    try {
      await onSave({ 
        ...formData, 
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl.trim()
      });
    } catch (err: any) {
      console.error('Full Error Object:', err);
      let errorMsg = 'Gagal menyimpan produk.';
      
      try {
        // Handle specific Firestore/Auth errors
        const errStr = err.message || '';
        
        if (errStr.includes('quota exceeded') || errStr.includes('resource exhausted')) {
          errorMsg = 'Kapasitas penyimpanan penuh atau ukuran file terlalu besar untuk database.';
        } else if (errStr.includes('permission-denied') || errStr.includes('unauthorized')) {
          errorMsg = 'Anda tidak memiliki izin (Permission Denied). Pastikan domain Vercel Anda sudah ditambahkan ke "Authorized domains" di Firebase Console.';
        } else if (errStr.includes('Unexpected token') || errStr.includes('format yang salah')) {
          errorMsg = 'Terjadi kesalahan komunikasi dengan server (Vercel/Firebase). Harap periksa apakah API Keys di Vercel Settings sudah sesuai.';
        }
        
        // Try to parse JSON error from handleFirestoreError if available
        if (errStr.startsWith('{')) {
          const errObj = JSON.parse(errStr);
          errorMsg = errObj.error || errorMsg;
        }
      } catch (parseErr) {
        console.error('Error parsing error message:', parseErr);
        errorMsg = err.message || errorMsg;
      }
      
      alert(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const categories = ['Hand Bouquet', 'Box Bouquet', 'Round Bouquet', 'Standing Flower', 'Money Bouquet', 'Thumbelina Bouquet'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm" 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="px-8 py-6 border-b border-brand-border flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-serif text-brand-text italic font-bold">
              {product ? 'Edit Produk' : 'Tambah Produk Baru'}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold mt-1">
              Paradisebuket Catalog Management
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-brand-bg rounded-full transition-colors text-brand-secondary"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {/* Basic Info Section */}
      <div className="space-y-6">
            <div className="flex items-center gap-2 text-brand-primary mb-2">
              <Info size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Informasi Produk</span>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl mb-4">
              <input 
                type="checkbox" 
                id="isBestSeller"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                className="w-4 h-4 rounded border-brand-primary text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="isBestSeller" className="text-xs font-bold text-brand-primary uppercase tracking-widest cursor-pointer">
                Tandai sebagai Best Seller
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">Nama Produk</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm"
                  placeholder="Contoh: Eternal Rose Bouquet"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">Kategori</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">Harga (IDR)</label>
                <input 
                  type="number" 
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm"
                  placeholder="0"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">
                    Foto Produk
                  </label>
                  <div className="flex bg-brand-bg rounded-lg p-0.5 border border-brand-border text-[9px] font-bold uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        imageInputMode === 'url'
                          ? 'bg-white text-brand-primary shadow-sm'
                          : 'text-brand-secondary hover:text-brand-primary'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <LinkIcon size={10} /> Link URL
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-3 py-1.5 rounded-md transition-all ${
                        imageInputMode === 'upload'
                          ? 'bg-white text-brand-primary shadow-sm'
                          : 'text-brand-secondary hover:text-brand-primary'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <Upload size={10} /> Upload File
                      </span>
                    </button>
                  </div>
                </div>

                {/* Preview Image if exists */}
                {previewUrl && (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-brand-bg border border-brand-border group">
                    <img
                      src={previewUrl}
                      alt="Preview Produk"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("[DIAGNOSTICS] Error loading preview image. Source starting with:", previewUrl.substring(0, 50));
                        e.currentTarget.style.display = 'none';
                      }}
                      onLoad={(e) => {
                        e.currentTarget.style.display = 'block';
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-2 flex items-center justify-between text-white text-[9px] font-mono">
                      <span>Preview</span>
                      <span>
                        {previewUrl.startsWith('data:image/') 
                          ? `Compressed (Base64: ${Math.round((previewUrl.length * 3) / 4 / 1024)} KB)` 
                          : 'External URL Link'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Input Fields based on Input Mode */}
                {imageInputMode === 'url' ? (
                  <div className="space-y-2">
                    <input
                      type="url"
                      required={imageInputMode === 'url'}
                      value={formData.imageUrl.startsWith('data:image/') ? '' : formData.imageUrl}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm"
                      placeholder="https://imgur.com/your-image.jpg"
                    />
                    <div className="flex items-start gap-2 px-1">
                      <ImageIcon size={12} className="text-brand-secondary mt-0.5" />
                      <p className="text-[9px] text-brand-secondary leading-relaxed">
                        Gunakan link images dari hosting eksternal seperti Imgur, PostIMG, atau Cloudinary untuk performa loading secepat kilat.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div 
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-brand-border rounded-xl hover:border-brand-primary/50 hover:bg-brand-primary/5 transition-all cursor-pointer group relative"
                    >
                      <label className="w-full h-full flex flex-col items-center gap-2 cursor-pointer">
                        <Upload size={20} className="text-brand-secondary group-hover:text-brand-primary transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary group-hover:text-brand-primary text-center">
                          {selectedFile ? selectedFile.name : 'Seret & Lepaskan atau Klik untuk Pilih Foto'}
                        </span>
                        <span className="text-[8px] text-brand-secondary/60 text-center">
                          JPG, JPEG, PNG, GIF (Maks 600KB - Dikompres otomatis di disk/client)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                    </div>
                    {formData.imageUrl.startsWith('data:image/') && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl('');
                            setFormData(prev => ({ ...prev, imageUrl: '' }));
                          }}
                          className="text-[9px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                        >
                          Hapus Foto Terpilih
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">Deskripsi</label>
              <textarea 
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm resize-none"
                placeholder="Jelaskan detail buket bunga ini..."
              />
            </div>
          </div>

          {/* Marketplace Links Section */}
          <div className="space-y-6 pt-4 border-t border-brand-border">
            <div className="flex items-center gap-2 text-brand-primary mb-2">
              <LinkIcon size={16} />
              <span className="text-[10px] uppercase tracking-widest font-bold">Link Marketplace</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">Shopee URL</label>
                <input 
                  type="url" 
                  value={formData.marketplaceLinks.shopee}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    marketplaceLinks: { ...formData.marketplaceLinks, shopee: e.target.value } 
                  })}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm"
                  placeholder="https://shopee.co.id/..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">Tokopedia URL</label>
                <input 
                  type="url" 
                  value={formData.marketplaceLinks.tokopedia}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    marketplaceLinks: { ...formData.marketplaceLinks, tokopedia: e.target.value } 
                  })}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm"
                  placeholder="https://tokopedia.com/..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-brand-secondary px-1">WhatsApp/Direct URL</label>
                <input 
                  type="url" 
                  value={formData.marketplaceLinks.whatsapp}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    marketplaceLinks: { ...formData.marketplaceLinks, whatsapp: e.target.value } 
                  })}
                  className="w-full px-4 py-3 bg-brand-bg border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-sm"
                  placeholder="https://wa.me/..."
                />
              </div>
            </div>
          </div>
        </form>

        <div className="px-8 py-6 border-t border-brand-border bg-brand-bg/50 flex gap-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-brand-border text-brand-text text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-brand-border transition-all"
          >
            Batal
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading || uploading}
            className="flex-[2] py-3 bg-brand-primary text-white text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-brand-text transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || uploading ? <Loader2 size={16} className="animate-spin" /> : (
              <>
                <Save size={16} />
                {product ? 'Simpan Perubahan' : 'Terbitkan Produk'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
