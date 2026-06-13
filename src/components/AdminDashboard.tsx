import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, Plus, Search, Filter, LayoutGrid, List, Flower2, 
  Edit2, Trash2, ExternalLink, MoreVertical, Loader2, AlertCircle
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, addDoc, 
  updateDoc, deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firebase-utils';
import { Product } from '../types';
import { ProductForm } from './ProductForm';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // UI States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [formLoading, setFormLoading] = useState(false);

  // Fetch Products
  useEffect(() => {
    const path = 'products';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productData);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, path);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSaveProduct = async (formData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setFormLoading(true);
    const path = 'products';
    try {
      if (editingProduct?.id) {
        // Update
        const updatedProduct = {
          ...formData,
          updatedAt: serverTimestamp()
        };
        const productRef = doc(db, path, editingProduct.id);
        await updateDoc(productRef, updatedProduct);
      } else {
        // Create
      const newProduct = {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, path), newProduct);
      }
      setIsFormOpen(false);
      setEditingProduct(undefined);
    } catch (err: any) {
      handleFirestoreError(err, editingProduct?.id ? OperationType.UPDATE : OperationType.CREATE, path, { ...formData, id: editingProduct?.id });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Hapus produk "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      const path = 'products';
      try {
        await deleteDoc(doc(db, path, id));
      } catch (err: any) {
        handleFirestoreError(err, OperationType.DELETE, path, { id, name });
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await logout();
      if (onLogout) onLogout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      {/* Admin Header */}
      <header className="h-20 bg-white border-b border-brand-border px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary">
            <Flower2 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-serif italic font-bold tracking-tight text-brand-text leading-none">Paradise Bucket</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-brand-secondary font-bold mt-1.5">Administrative Suite</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'text-brand-primary bg-brand-bg' : 'text-brand-secondary hover:text-brand-primary'}`}
          >
            <Search size={18} />
          </button>
          
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest leading-none">Authorized Admin</span>
            <span className="text-[9px] text-brand-secondary mt-1">{user?.email}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-brand-secondary hover:text-brand-primary transition-colors text-[10px] font-bold uppercase tracking-widest border-b border-transparent hover:border-brand-primary pb-0.5"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-brand-border overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary opacity-50" size={16} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Cari kreasi, kategori, atau deskripsi..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col p-8 md:p-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-serif text-brand-text tracking-tight italic">Product Atelier</h2>
            <p className="text-sm text-brand-secondary mt-1 tracking-wide font-light">Kelola koleksi buket eksklusif yang ditampilkan di katalog publik Anda.</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingProduct(undefined);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-3 px-6 py-4 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm hover:scale-[1.02] transition-all shadow-xl shadow-brand-primary/20"
          >
            <Plus size={16} />
            Add New Creation
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between mb-10 shadow-sm">
          <div className="flex items-center gap-4 w-full justify-between">
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center gap-2 px-6 py-3 border border-brand-border rounded-xl text-[10px] font-bold text-brand-secondary hover:bg-brand-bg transition-all uppercase tracking-widest">
                <Filter size={14} />
                Refine
              </button>
            </div>
            
            <div className="flex bg-brand-bg p-1 rounded-xl border border-brand-border">
              <button className="p-2 bg-white shadow-sm rounded-lg text-brand-primary">
                <LayoutGrid size={16} />
              </button>
              <button className="p-2 text-brand-secondary hover:text-brand-primary transition-colors">
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-brand-primary" size={32} />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
            <AlertCircle className="text-red-400 mb-4" size={48} />
            <p className="text-brand-text font-serif italic mb-2">{error}</p>
            <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-widest text-brand-primary border-b border-brand-primary">Coba Lagi</button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <motion.div 
                layout
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white border border-brand-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500"
              >
                {/* Product Image */}
                <div className="aspect-[4/5] bg-brand-bg overflow-hidden relative">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[9px] uppercase tracking-[0.15em] font-bold text-brand-primary rounded-full shadow-sm border border-brand-primary/10">
                      {product.category}
                    </span>
                    {product.isBestSeller && (
                      <span className="px-3 py-1 bg-brand-primary text-white text-[9px] uppercase tracking-[0.15em] font-bold rounded-full shadow-lg border border-brand-primary/10">
                        Best Seller
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                        setIsFormOpen(true);
                      }}
                      className="p-2.5 bg-white/90 backdrop-blur-md text-brand-text hover:text-brand-primary rounded-full shadow-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id!, product.name)}
                      className="p-2.5 bg-white/90 backdrop-blur-md text-brand-text hover:text-red-500 rounded-full shadow-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-serif italic font-bold text-brand-text tracking-tight group-hover:text-brand-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-xl font-serif text-brand-text/80 mb-4">
                    IDR {product.price.toLocaleString('id-ID')}
                  </p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-brand-border text-brand-secondary">
                    <div className="flex gap-3">
                      {product.marketplaceLinks.shopee && <ExternalLink size={14} className="hover:text-brand-primary cursor-pointer transition-colors" />}
                      {product.marketplaceLinks.tokopedia && <ExternalLink size={14} className="hover:text-brand-primary cursor-pointer transition-colors" />}
                      {product.marketplaceLinks.whatsapp && <ExternalLink size={14} className="hover:text-brand-primary cursor-pointer transition-colors" />}
                    </div>
                    <span className="ml-auto text-[9px] uppercase tracking-widest font-bold opacity-40">
                      Modified {new Date(product.updatedAt?.seconds * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 border-2 border-dashed border-brand-border rounded-3xl flex flex-col items-center justify-center py-32 text-center bg-white/50">
            <div className="w-20 h-20 bg-white border border-brand-border rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Flower2 size={40} className="text-brand-border" />
            </div>
            <h3 className="text-xl font-serif text-brand-text italic font-bold mb-2">No creations found</h3>
            <p className="text-sm text-brand-secondary max-w-xs mx-auto font-light leading-relaxed mb-10">
              {searchQuery ? `Tidak ada hasil untuk "${searchQuery}"` : 'Katalog masih kosong. Mulai dengan menambahkan produk buket bunga pertama Anda.'}
            </p>
            <button 
              onClick={() => {
                setEditingProduct(undefined);
                setIsFormOpen(true);
              }}
              className="text-brand-primary border-b border-brand-primary pb-1 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-brand-text hover:border-brand-text transition-all"
            >
              Curate Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <ProductForm 
            product={editingProduct}
            loading={formLoading}
            onSave={handleSaveProduct}
            onClose={() => {
              setIsFormOpen(false);
              setEditingProduct(undefined);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
