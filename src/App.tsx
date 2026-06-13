/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { motion, AnimatePresence } from "motion/react";
import { Flower2, Heart, Search, User, ExternalLink, Loader2 } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";
import { handleFirestoreError, OperationType } from "./lib/firebase-utils";
import { Product } from "./types";

import { ProductCard } from "./components/ProductCard";

function MainApp() {
  const [view, setView] = useState<'home' | 'catalog' | 'testimoni' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Filtered products for catalog
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All Collections' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Best seller products for home
  const bestSellers = products.filter(p => p.isBestSeller);

  // Fetch products
  useEffect(() => {
    const path = 'products';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productData);
      setLoadingProducts(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
    return unsubscribe;
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Flower2 size={48} className="text-brand-primary/20" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-brand-secondary font-bold">Paradise Bucket</span>
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    if (!user) {
      return <AdminLogin onBack={() => setView('home')} />;
    }
    return <AdminDashboard onLogout={() => setView('home')} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-6 md:px-12 py-8 border-b border-brand-border bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex flex-col cursor-pointer" onClick={() => setView('home')}>
          <h1 className="text-3xl font-serif tracking-tight leading-none italic font-bold text-brand-primary">
            Paradise Bucket
          </h1>
          <span className="text-[10px] uppercase tracking-[0.2em] mt-1 text-brand-secondary font-medium">
            Artisan Floral Curators
          </span>
        </div>
        <nav className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-semibold">
          <button 
            onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`transition-colors ${view === 'home' ? 'text-brand-primary border-b border-brand-primary' : 'text-brand-secondary hover:text-brand-primary'}`}
          >
            Best Seller
          </button>
          <button 
            onClick={() => { setView('catalog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`transition-colors ${view === 'catalog' ? 'text-brand-primary border-b border-brand-primary' : 'text-brand-secondary hover:text-brand-primary'}`}
          >
            Catalog
          </button>
          <button 
            onClick={() => { setView('testimoni'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            className={`transition-colors ${view === 'testimoni' ? 'text-brand-primary border-b border-brand-primary' : 'text-brand-secondary hover:text-brand-primary'}`}
          >
            Testimoni
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'text-brand-primary bg-brand-bg' : 'text-brand-secondary hover:text-brand-primary'}`}
          >
            <Search size={18} />
          </button>
          <button onClick={() => setView('admin')} className="p-2 bg-brand-bg rounded-full border border-brand-border text-brand-primary hover:bg-white transition-colors">
            <User size={18} />
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
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-secondary opacity-50" size={16} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Cari buket bunga impian Anda..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (view !== 'catalog') setView('catalog');
                  }}
                  className="w-full pl-12 pr-4 py-3 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'home' ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            {/* Hero Section */}
            <section className="px-6 md:px-12 py-16 md:py-24 border-b border-brand-border bg-white overflow-hidden">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] uppercase tracking-[0.3em] text-brand-secondary font-bold block"
                  >
                    Exquisite Arrangements
                  </motion.span>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-serif text-brand-text leading-[1.1] tracking-tight"
                  >
                    Momen Berharga dalam <span className="italic text-brand-primary">Setiap Kelopak</span>.
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-brand-accent max-w-lg leading-relaxed font-light mx-auto md:mx-0"
                  >
                    Kurasi terbaik dari koleksi Paradise Bucket, didesain untuk menyentuh hati dan memperindah suasana.
                  </motion.p>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex gap-4 pt-4 justify-center md:justify-start"
                  >
                    <button onClick={() => setView('catalog')} className="px-8 py-4 bg-brand-primary text-white text-xs uppercase tracking-widest font-bold rounded-sm hover:scale-[1.02] transition-all">
                      Shop the Catalog
                    </button>
                  </motion.div>
                </div>
                <div className="flex-1 w-full max-w-md aspect-square bg-[#EAE8E4] rounded-t-full flex items-center justify-center p-12 border border-brand-border mx-auto">
                   <Flower2 size={120} className="text-brand-primary opacity-20" />
                </div>
              </div>
            </section>

            {/* Best Sellers Section */}
            <section className="px-6 md:px-12 py-20 max-w-7xl mx-auto w-full">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-serif text-brand-text italic font-bold">Best Seller Collections</h2>
                <p className="text-sm text-brand-secondary mt-2 tracking-widest uppercase font-light">Kurasi Produk Favorit Pelanggan Kami</p>
                <div className="w-12 h-[1px] bg-brand-primary mx-auto mt-6"></div>
              </div>

              {loadingProducts ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="animate-spin text-brand-primary opacity-20" size={40} />
                </div>
              ) : bestSellers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {bestSellers.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 opacity-40 italic font-serif">
                   <p>Belum ada produk Best Seller saat ini.</p>
                   <button onClick={() => setView('catalog')} className="mt-4 text-[10px] uppercase font-bold tracking-widest text-brand-primary border-b border-brand-primary">Lihat Katalog Lengkap</button>
                </div>
              )}
            </section>
          </motion.div>
        ) : view === 'catalog' ? (
          <motion.div
            key="catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row flex-1"
          >
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-brand-border p-8 md:p-12 flex flex-col gap-10 bg-white/30 backdrop-blur-sm">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.15em] text-brand-secondary mb-6 font-bold">Categories</h3>
                <ul className="flex flex-row lg:flex-col flex-wrap gap-4 lg:gap-5 text-sm">
                  <li 
                    onClick={() => setSelectedCategory('All Collections')}
                    className={`flex items-center gap-3 font-semibold cursor-pointer transition-colors ${selectedCategory === 'All Collections' ? 'text-brand-primary' : 'text-brand-accent hover:text-brand-primary'}`}
                  >
                    {selectedCategory === 'All Collections' && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>}
                    All Collections
                  </li>
                  {['Hand Bouquet', 'Box Bouquet', 'Round Bouquet', 'Standing Flower', 'Money Bouquet'].map((cat) => (
                    <li 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`cursor-pointer transition-colors font-medium flex items-center gap-3 ${selectedCategory === cat ? 'text-brand-primary font-bold' : 'text-brand-accent hover:text-brand-primary'}`}
                    >
                      {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-brand-primary"></div>}
                      {cat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 lg:mt-auto p-6 bg-white border border-brand-border rounded-lg italic text-center lg:text-left">
                <p className="text-xs leading-relaxed text-brand-accent font-light">
                  "Flowers are the music of the ground. From earth's lips spoken without sound."
                </p>
              </div>
            </aside>

            {/* Product Grid Area */}
            <main className="flex-1 p-8 md:p-12 flex flex-col min-h-[500px] max-w-6xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-10 text-center sm:text-left">
                <div>
                  <h2 className="text-3xl font-serif text-brand-text tracking-tight italic font-bold">Signature Collections</h2>
                  <p className="text-sm text-brand-secondary mt-1">Jelajahi seluruh karya buket bunga kami</p>
                </div>
                <div className="text-[10px] text-brand-secondary border-b border-brand-border pb-0.5 hover:text-brand-primary hover:border-brand-primary transition-all cursor-pointer font-bold uppercase tracking-[0.2em] mx-auto sm:mx-0">
                  {filteredProducts.length} Items
                </div>
              </div>

              {loadingProducts ? (
                 <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="animate-spin text-brand-primary opacity-20" size={40} />
                 </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center py-20">
                  <Flower2 size={48} className="mb-4" />
                  <p className="text-sm font-serif italic">Belum ada koleksi yang tersedia untuk kategori ini.</p>
                </div>
              )}
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="testimoni"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center flex-1 py-20 px-6"
          >
            <div className="max-w-3xl w-full text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-serif text-brand-text italic font-bold">Apa Kata Mereka?</h2>
                <p className="text-brand-secondary text-sm uppercase tracking-[0.2em] font-medium">Testimoni Pelanggan Paradise Bucket</p>
                <div className="w-16 h-[1px] bg-brand-primary mx-auto mt-6"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left mt-12">
                {[
                  { name: "Siti Rahma", text: "Buketnya cantik sekali, bunganya segar dan pengirimannya tepat waktu. Sangat merekomendasikan!" },
                  { name: "Budi Santoso", text: "Pelayanan Paradise Bucket sangat ramah. Custom bouquet-nya persis seperti yang saya bayangkan." },
                  { name: "Lestari", text: "Kualitas premium dengan harga yang terjangkau. Sudah langganan setiap ada acara spesial." },
                  { name: "Andi Wijaya", text: "Box bouquet-nya mewah banget. Istri saya suka sekali kejutannya. Terima kasih!" }
                ].map((testi, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-white border border-brand-border rounded-sm shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-brand-accent italic text-sm leading-relaxed mb-4">"{testi.text}"</p>
                    <p className="text-brand-primary font-bold text-[10px] uppercase tracking-widest">— {testi.name}</p>
                  </motion.div>
                ))}
              </div>
              
              <div className="pt-12 opacity-40">
                 <Flower2 size={32} className="mx-auto text-brand-primary" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marketplaces Footer */}
      <footer className="px-6 md:px-12 py-10 bg-white border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <span className="text-[10px] uppercase tracking-widest text-brand-secondary font-bold">Available On:</span>
          <div className="flex gap-8 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer font-bold text-xs tracking-tight">
            <span className="hover:text-[#25D366] transition-colors">WhatsApp</span>
            <span className="hover:text-[#EE4D2D] transition-colors">Shopee</span>
            <span className="hover:text-[#03AC0E] transition-colors">Tokopedia</span>
          </div>
        </div>
        <div className="flex gap-4 items-center bg-brand-bg px-4 py-2 rounded-full border border-brand-border">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-brand-secondary font-medium tracking-wide">Store Online • Orders processed in 24h</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

