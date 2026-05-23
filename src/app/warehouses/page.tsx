'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { 
  Warehouse as WarehouseIcon, 
  MapPin, 
  Package, 
  TrendingUp, 
  ShieldCheck,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface Warehouse {
  id: string;
  name: string;
  location: string;
  _count?: {
    stocks: number;
  };
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('/api/warehouses');
        if (!response.ok) throw new Error('Failed to fetch warehouses');
        const data = await response.json();
        setWarehouses(data);
      } catch (err) {
        console.error(err);
        setError('Could not load warehouse data.');
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-blue-100 dark:selection:bg-blue-900 noise-bg">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-32 md:py-48">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                Network Status: Operational
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-zinc-900 dark:text-white tracking-tighter leading-[0.85]">
              Global <br />
              <span className="text-blue-600 italic">Warehouses.</span>
            </h1>
            <p className="text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl leading-relaxed">
              Our distributed network of fulfillment centers ensures your orders are processed with lightning speed and precision.
            </p>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-[2.5rem]" />
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
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Network Error</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">{error}</p>
            <Button onClick={() => window.location.reload()} variant="premium" size="lg">
              Try Again
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {warehouses.map((warehouse, index) => (
              <motion.div
                key={warehouse.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group h-full overflow-hidden border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-premium-hover transition-all duration-500 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                  <CardHeader className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <WarehouseIcon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mb-2">
                      {warehouse.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                      <MapPin className="h-3 w-3" />
                      {warehouse.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <Package className="h-4 w-4 text-blue-600 mb-2" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active SKUs</p>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">{warehouse._count?.stocks || 0}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                        <TrendingUp className="h-4 w-4 text-green-600 mb-2" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Efficiency</p>
                        <p className="text-xl font-black text-zinc-900 dark:text-white">99.8%</p>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full rounded-2xl border-2 font-bold group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-zinc-900 transition-all">
                      Manage Inventory
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
