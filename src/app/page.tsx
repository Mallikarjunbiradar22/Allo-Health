'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { Loader2, RefreshCw, Sparkles, ShoppingBag, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch products: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error('Fetch error detail:', err);
      setError(`Could not load products: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-blue-100 dark:selection:bg-blue-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-40 overflow-hidden noise-bg">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-500/10 rounded-full blur-[140px] animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 relative">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 mb-8"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                v2.0 Now Live
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-7xl md:text-9xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.85] mb-8"
            >
              Inventory <br />
              <span className="text-blue-600 italic">Redefined.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl mb-12"
            >
              The gold standard for high-concurrency e-commerce. Atomic reservations, multi-warehouse sync, and sub-millisecond precision.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" variant="premium" className="rounded-2xl group h-16 px-10 shadow-2xl shadow-blue-500/20" asChild>
                <Link href="#products">
                  Explore Products
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-2xl border-2 font-black h-16 px-10 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all" asChild>
                <Link href="/warehouses">
                  Global Network
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">
            Trusted by industry leaders worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
            {['Stripe', 'Vercel', 'Linear', 'Shopify', 'Apple'].map((brand) => (
              <span key={brand} className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                {brand.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>
      
      {/* Product Listing Section */}
      <section id="products" className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <ShoppingBag className="h-3 w-3" />
              Catalog
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter">
              Featured <span className="text-blue-600">Drops.</span>
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">
              Handpicked premium hardware. All items are backed by our 10-minute atomic reservation guarantee.
            </p>
          </div>
          
          <Button 
            variant="glass"
            onClick={fetchProducts}
            disabled={loading}
            className="group rounded-2xl h-14 px-8 border-2"
          >
            <RefreshCw className={cn("mr-3 h-5 w-5 transition-transform group-hover:rotate-180", loading && "animate-spin")} />
            Refresh Inventory
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-2/3 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-4/5 rounded-lg" />
                </div>
                <div className="space-y-3 pt-4">
                  <Skeleton className="h-16 w-full rounded-2xl" />
                  <Skeleton className="h-16 w-full rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto p-12 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] text-center"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Connection Required</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">{error}</p>
            <Button 
              onClick={fetchProducts}
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest text-xs"
            >
              Try Again
            </Button>
          </motion.div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <ShoppingBag className="h-16 w-16 text-zinc-300 mx-auto mb-6" />
            <p className="text-zinc-500 font-bold text-xl">The vault is currently empty.</p>
            <p className="text-zinc-400 text-sm mt-2">New arrivals landing soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-32 bg-zinc-50 dark:bg-zinc-900/20 border-y border-zinc-100 dark:border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Atomic Safety",
                desc: "Our SQL-level locks prevent double-booking even at 10k requests per second.",
                icon: ShieldCheck,
                color: "text-blue-600",
                bg: "bg-blue-500/10"
              },
              {
                title: "Smart TTL",
                desc: "10-minute reservation windows with automatic lazy-cleanup for stale carts.",
                icon: Zap,
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                title: "Global Mesh",
                desc: "Real-time synchronization across multi-regional warehouse clusters.",
                icon: Globe,
                color: "text-teal-500",
                bg: "bg-teal-500/10"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:shadow-premium transition-all"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", feature.bg)}>
                  <feature.icon className={cn("h-7 w-7", feature.color)} />
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="text-white h-6 w-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
                  ALLO<span className="text-blue-600">.</span>
                </span>
              </Link>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm leading-relaxed">
                Empowering modern retail with sub-millisecond inventory precision and atomic fulfillment guarantees.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer" />
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Infrastructure</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Multi-Warehouse</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">API Docs</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Security</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Customers</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Support</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
              &copy; 2026 Allo Engineering. All rights reserved.
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Status</Link>
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-zinc-900 dark:hover:text-white transition-colors">System</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
