'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Warehouse, Package, Sparkles, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Store', href: '/', icon: Package },
    { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled 
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 py-3 shadow-glass" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-active:scale-95 transition-all duration-300">
              <Sparkles className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-zinc-900 dark:text-white">
              ALLO<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100/50 dark:bg-zinc-800/30 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-700/30 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={cn(
                    "relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                    isActive 
                      ? "text-zinc-900 dark:text-white" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white dark:bg-zinc-800 shadow-sm rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <ShoppingBag className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-zinc-950" />
            </Button>
            
            <Button variant="premium" className="hidden sm:flex rounded-xl font-bold group">
              <LayoutDashboard className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              Console
            </Button>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 overflow-hidden md:hidden shadow-2xl"
          >
            <div className="flex flex-col gap-2 p-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-all",
                    pathname === link.href 
                      ? "bg-blue-600 text-white" 
                      : "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}
              <Button variant="premium" size="lg" className="w-full mt-4 rounded-2xl h-14">
                Launch Console
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
