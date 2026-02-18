import { validateFact, formatZodErrors, FactSchema } from '@/schemas/factSchema';
import { Fact } from '@/types';

/**
 * Charge et valide les faits depuis les fichiers JSON
 * @returns Tableau de faits validés
 */
export async function loadFacts(): Promise<Fact[]> {
  try {
    // En environnement Node/build, on pourrait charger depuis le filesystem
    // Pour le client, les faits sont importés directement
    const { demoFacts } = await import('./data');
    
    // Validation de tous les faits
    const validatedFacts: Fact[] = [];
    
    for (const fact of demoFacts) {
      const result = validateFact(fact);
      
      if (result.success) {
        validatedFacts.push(result.data);
      } else {
        console.warn(`Fact validation failed for ${fact.id}:`, formatZodErrors(result.errors));
      }
    }
    
    return validatedFacts;
  } catch (error) {
    console.error('Error loading facts:', error);
    return [];
  }
}

/**
 * Sauvegarde un fait (côté serveur uniquement)
 */
export async function saveFact(fact: Fact): Promise<boolean> {
  // Validation
  const result = validateFact(fact);
  
  if (!result.success) {
    console.error('Invalid fact:', formatZodErrors(result.errors));
    return false;
  }
  
  // En production, ceci sauvegarderait dans une base de données
  // ou un système de fichiers côté serveur
  console.log('Saving fact:', fact.id);
  return true;
}
