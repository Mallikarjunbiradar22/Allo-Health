'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, Stock } from '@/types';
import { Package, MapPin, Loader2, ArrowRight, ShoppingCart, Zap } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  const handleReserve = async (stock: Stock) => {
    setLoading(stock.id);
    setError(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          productId: product.id,
          warehouseId: stock.warehouseId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('Insufficient stock in this warehouse.');
        } else {
          setError(data.error || 'Something went wrong');
        }
        return;
      }

      router.push(`/checkout/${data.id}`);
    } catch (err) {
      console.error(err);
      setError('Failed to create reservation.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card className="group overflow-hidden flex flex-col h-full border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-premium-hover transition-all duration-500 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
          {product.imageUrl && !imgError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setImgError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-16 w-16 text-zinc-200 dark:text-zinc-800" />
            </div>
          )}
          
          {/* Overlay for SKU */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Badge variant="premium" className="bg-zinc-900/90 dark:bg-black/90 backdrop-blur-md border-white/10 text-[10px] px-3">
              {product.sku}
            </Badge>
            {Math.random() > 0.5 && (
              <Badge className="bg-blue-600 border-none text-[10px] px-3">
                New Arrival
              </Badge>
            )}
          </div>

          {/* Quick Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="text-white text-[10px] font-black uppercase tracking-widest">
              Available in {product.stocks.length} Locations
            </p>
          </div>
        </div>

        <CardContent className="p-8 flex flex-col flex-grow">
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {product.name}
              </h3>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed line-clamp-2 font-medium">
              {product.description}
            </p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="grid gap-2">
              {product.stocks.map((stock) => (
                <div 
                  key={stock.id} 
                  className="group/item flex items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:bg-white dark:hover:bg-zinc-800/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-700">
                      <MapPin className="h-4 w-4 text-blue-600 group-hover/item:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{stock.warehouse.name}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                        {stock.available > 0 ? `${stock.available} Left` : "Out of Stock"}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant={stock.available > 0 ? "premium" : "outline"}
                    size="sm"
                    onClick={() => handleReserve(stock)}
                    disabled={stock.available <= 0 || !!loading}
                    className="rounded-xl h-8 px-4 text-[10px] font-black uppercase tracking-widest shadow-none hover:shadow-lg transition-all"
                  >
                    {loading === stock.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      'Reserve'
                    )}
                  </Button>
                </div>
              ))}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
