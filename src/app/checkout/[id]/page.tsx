'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Reservation, ReservationStatus } from '@/types';
import Navbar from '@/components/Navbar';
import { 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowLeft, 
  Package, 
  MapPin, 
  ShieldCheck,
  ShoppingBag,
  Zap,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const response = await fetch(`/api/reservations/${id}`);
        if (!response.ok) throw new Error('Reservation not found');
        const data = await response.json();
        setReservation(data);
        
        // Calculate initial time left
        const expiresAt = new Date(data.expiresAt).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));
      } catch (err) {
        console.error(err);
        setError('Could not load reservation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  useEffect(() => {
    if (!reservation || reservation.status !== ReservationStatus.PENDING || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Refresh reservation status when time runs out
          fetch(`/api/reservations/${id}`).then(res => res.json()).then(setReservation);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reservation, timeLeft, id]);

  const handleConfirm = async () => {
    setActionLoading('confirm');
    setError(null);
    try {
      const response = await fetch(`/api/reservations/${id}/confirm`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to confirm purchase');
        if (response.status === 410) {
          setReservation({ ...reservation!, status: ReservationStatus.RELEASED });
        }
      } else {
        setReservation(data);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRelease = async () => {
    setActionLoading('release');
    setError(null);
    try {
      const response = await fetch(`/api/reservations/${id}/release`, {
        method: 'POST',
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to cancel reservation');
      } else {
        setReservation(data);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-32">
          <div className="space-y-8">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Card className="overflow-hidden border-none shadow-2xl">
              <Skeleton className="h-24 w-full" />
              <div className="p-8 space-y-6">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-48" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-48" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full rounded-2xl" />
                <div className="flex gap-4">
                  <Skeleton className="h-14 flex-1 rounded-2xl" />
                  <Skeleton className="h-14 flex-1 rounded-2xl" />
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (error && !reservation) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] text-center"
          >
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Something went wrong</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-medium leading-relaxed">{error}</p>
            <Button asChild variant="premium" size="lg">
              <Link href="/">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Products
              </Link>
            </Button>
          </motion.div>
        </main>
      </div>
    );
  }

  const isPending = reservation?.status === ReservationStatus.PENDING;
  const isConfirmed = reservation?.status === ReservationStatus.CONFIRMED;
  const isReleased = reservation?.status === ReservationStatus.RELEASED;
  const isUrgent = isPending && timeLeft < 60;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 selection:bg-blue-100 dark:selection:bg-blue-900">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-6 py-24 md:py-32 relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
          <div className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[120px] opacity-20 transition-colors duration-1000",
            isConfirmed ? "bg-green-500" : isReleased ? "bg-zinc-500" : isUrgent ? "bg-red-500" : "bg-blue-500"
          )} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-10 transition-colors font-bold group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Return to Store
          </Link>

          <Card className="relative overflow-hidden border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
            {isConfirmed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
              >
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ 
                      y: [0, 400], 
                      opacity: [0, 1, 0],
                      x: (i - 10) * 20 
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2, 
                      repeat: Infinity,
                      delay: Math.random() * 2 
                    }}
                    className="w-2 h-2 rounded-full bg-blue-500/50"
                  />
                ))}
              </motion.div>
            )}
            {/* Status Banner */}
            <div className={cn(
              "p-8 border-b transition-colors duration-500",
              isConfirmed ? "bg-green-500/10 border-green-500/20" : 
              isReleased ? "bg-zinc-500/10 border-zinc-500/20" : 
              isUrgent ? "bg-red-500/10 border-red-500/20" : 
              "bg-blue-500/10 border-blue-500/20"
            )}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-500",
                    isConfirmed ? "bg-green-600 text-white" : 
                    isReleased ? "bg-zinc-600 text-white" : 
                    isUrgent ? "bg-red-600 text-white animate-pulse" : 
                    "bg-blue-600 text-white"
                  )}>
                    {isConfirmed ? <CheckCircle2 className="h-6 w-6" /> : 
                     isReleased ? <XCircle className="h-6 w-6" /> : 
                     <Clock className="h-6 w-6" />}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                      {isConfirmed ? 'Order Secured' : 
                       isReleased ? 'Reservation Expired' : 
                       'Confirm Reservation'}
                    </h1>
                    <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-0.5">
                      {isConfirmed ? 'Transaction Successful' : 
                       isReleased ? 'Items Released' : 
                       'Limited Time Hold'}
                    </p>
                  </div>
                </div>

                {isPending && (
                  <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                      "text-3xl md:text-4xl font-black font-mono tracking-tighter transition-colors duration-500",
                      isUrgent ? "text-red-600" : "text-zinc-900 dark:text-white"
                    )}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="w-32 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: `${(timeLeft / 600) * 100}%` }}
                        className={cn(
                          "h-full transition-colors duration-500",
                          isUrgent ? "bg-red-600" : "bg-blue-600"
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="p-8 md:p-12 space-y-12">
              {/* Product Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Package className="h-3 w-3" />
                    Product Details
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                      {reservation?.product?.name}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2 leading-relaxed">
                      {reservation?.product?.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-zinc-400 font-black uppercase tracking-[0.2em] text-[10px]">
                    <MapPin className="h-3 w-3" />
                    Warehouse Location
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {reservation?.warehouse?.name}
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                      {reservation?.warehouse?.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-[2rem] p-8 border border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Order Quantity</p>
                    <p className="text-3xl font-black text-zinc-900 dark:text-white">
                      {reservation?.quantity} <span className="text-lg font-medium text-zinc-500">Units</span>
                    </p>
                  </div>
                  <Badge variant="premium" className="px-6 py-2 rounded-xl text-xs">
                    Reserved
                  </Badge>
                </div>
              </div>

              {/* Error Alert */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isPending ? (
                  <>
                    <Button
                      onClick={handleConfirm}
                      disabled={!!actionLoading || timeLeft <= 0}
                      variant="premium"
                      size="lg"
                      className="flex-1 rounded-2xl h-16 group relative overflow-hidden"
                    >
                      {actionLoading === 'confirm' ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Secure Items
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      )}
                    </Button>
                    <Button
                      onClick={handleRelease}
                      disabled={!!actionLoading}
                      variant="outline"
                      size="lg"
                      className="flex-1 rounded-2xl h-16 border-2 font-bold"
                    >
                      {actionLoading === 'release' ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        'Cancel Order'
                      )}
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="premium" size="lg" className="w-full rounded-2xl h-16">
                    <Link href="/">
                      Return to Store
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-0 flex flex-col items-center gap-6">
              <div className="w-full h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Secure Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Instant Fulfillment</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Premium Quality</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Reservation ID: {id}
              </p>
            </CardFooter>
          </Card>

          {isPending && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center text-zinc-500 text-xs font-medium leading-relaxed max-w-md mx-auto"
            >
              Your items are protected by our atomic reservation system. Complete your purchase within the 10-minute window to guarantee availability.
            </motion.p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
