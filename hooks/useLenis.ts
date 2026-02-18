/**
 * Hook useLenis
 * Configuration du smooth scroll avec Lenis
 * Synchronisé avec ScrollTrigger pour GSAP
 */

import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { ScrollTrigger } from '@/lib/gsap';

interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  orientation?: 'vertical' | 'horizontal';
  gestureOrientation?: 'vertical' | 'horizontal' | 'both';
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
}

const defaultOptions: LenisOptions = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
};

/**
 * Hook pour initialiser Lenis smooth scroll
 * Gère prefers-reduced-motion automatiquement
 * 
 * @param options - Options de configuration Lenis
 * @returns Instance Lenis et méthodes de contrôle
 */
export function useLenis(options: LenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  
  // Vérifier si l'utilisateur préfère réduire les animations
  const prefersReducedMotion = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
  
  useEffect(() => {
    // Vérifier côté client et préférence utilisateur
    if (typeof window === 'undefined' || prefersReducedMotion()) {
      return;
    }
    
    // Fusionner options par défaut avec options fournies
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Initialiser Lenis
    const lenis = new Lenis(mergedOptions);
    lenisRef.current = lenis;
    
    // Synchroniser avec ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    
    // Fonction d'animation frame
    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    
    // Démarrer la boucle
    rafRef.current = requestAnimationFrame(raf);
    
    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [options, prefersReducedMotion]);
  
  // Méthodes de contrôle exposées
  const scrollTo = useCallback((target: string | number | HTMLElement, options?: { offset?: number; duration?: number }) => {
    lenisRef.current?.scrollTo(target, options);
  }, []);
  
  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);
  
  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);
  
  return {
    lenis: lenisRef.current,
    scrollTo,
    stop,
    start,
  };
}

export default useLenis;
