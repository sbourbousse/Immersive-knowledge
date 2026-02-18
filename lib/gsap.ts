/**
 * Configuration GSAP
 * Enregistrement des plugins et paramètres par défaut
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Vérifier si on est côté client
const isClient = typeof window !== 'undefined';

// Enregistrer les plugins uniquement côté client
if (isClient) {
  gsap.registerPlugin(ScrollTrigger);
  
  // Configurations par défaut pour les performances
  gsap.config({
    nullTargetWarn: false,
  });
  
  // Defaults pour toutes les animations
  gsap.defaults({
    ease: 'power2.out',
    duration: 0.6,
  });
}

// Export pour utilisation dans les composants
export { gsap, ScrollTrigger };
export default gsap;
