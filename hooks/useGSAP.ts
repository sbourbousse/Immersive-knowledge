/**
 * Hook useGSAP
 * Wrapper pour gsap.context avec cleanup automatique
 * Garantit le nettoyage des animations au unmount
 */

import { useEffect, useRef, DependencyList } from 'react';
import { gsap } from './gsap';

// Type pour la fonction de contexte
type ContextFunc = (context: gsap.Context, contextSafe: (func: Function) => Function) => void;

/**
 * Hook personnalisé pour gérer le contexte GSAP
 * 
 * @param callback - Fonction contenant les animations GSAP
 * @param deps - Dépendances pour recréer le contexte
 * @param scopeRef - Référence optionnelle pour le scope (par défaut: document)
 */
export function useGSAP(
  callback: ContextFunc,
  deps: DependencyList = [],
  scopeRef?: React.RefObject<HTMLElement | null>
) {
  const contextRef = useRef<gsap.Context | null>(null);
  
  useEffect(() => {
    // Vérifier côté client
    if (typeof window === 'undefined') return;
    
    // Créer le contexte GSAP
    const scope = scopeRef?.current || undefined;
    contextRef.current = gsap.context((self) => {
      callback(self, (func) => gsap.context(func, scope).add || func);
    }, scope);
    
    // Cleanup au unmount ou changement de dépendances
    return () => {
      if (contextRef.current) {
        contextRef.current.revert();
        contextRef.current = null;
      }
    };
  }, deps);
  
  return contextRef;
}

export default useGSAP;
