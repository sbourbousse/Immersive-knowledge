/**
 * Schémas Zod pour la validation des données
 * Force l'IA à renvoyer un JSON strictement identique au modèle
 */

import { z } from 'zod';

/**
 * Schéma de validation pour un Atome de Fait
 */
export const FactSchema = z.object({
  id: z.string().uuid().describe('Identifiant unique universel du fait'),
  
  timestamp: z.number()
    .int()
    .positive()
    .describe('Valeur temporelle Unix pour le positionnement sur l\'axe X'),
  
  dateLabel: z.string()
    .min(1, 'Le libellé de date ne peut pas être vide')
    .describe('Libellé lisible de la date (ex: "Janvier 2024")'),
  
  title: z.string()
    .min(1, 'Le titre ne peut pas être vide')
    .max(200, 'Le titre ne doit pas dépasser 200 caractères')
    .describe('Titre concis de l\'événement'),
  
  content: z.string()
    .min(1, 'Le contenu ne peut pas être vide')
    .describe('Description détaillée enrichie en Markdown'),
  
  categories: z.array(z.string())
    .min(1, 'Au moins une catégorie est requise')
    .describe('Tags pour le filtrage et le code couleur'),
  
  source: z.object({
    name: z.string().min(1, 'Le nom de la source est requis'),
    url: z.string().url('L\'URL doit être valide'),
    reliabilityScore: z.number()
      .min(0)
      .max(1)
      .describe('Score de fiabilité entre 0 et 1'),
    accessedAt: z.string()
      .datetime('La date doit être au format ISO 8601'),
  }).describe('Métadonnées de la source'),
  
  metadata: z.object({
    importance: z.enum(['low', 'medium', 'high'])
      .describe('Importance relative'),
    threadId: z.string()
      .min(1, 'L\'ID de thread est requis')
      .describe('ID de fil pour l\'orchestration narrative'),
    verificationStatus: z.enum(['pending', 'confirmed', 'disputed'])
      .describe('Statut de vérification'),
    crossReferences: z.array(z.string().uuid())
      .optional()
      .describe('IDs de faits liés/corrélés'),
  }).describe('Métadonnées additionnelles'),
});

/**
 * Type inféré du schéma Fact
 */
export type ValidatedFact = z.infer<typeof FactSchema>;

/**
 * Schéma pour une Timeline Lane (mode comparaison)
 */
export const TimelineLaneSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Doit être une couleur hex valide'),
  facts: z.array(FactSchema),
});

/**
 * Schéma pour la création de faits (sans ID généré)
 */
export const FactInputSchema = FactSchema.omit({ id: true }).extend({
  // L'ID sera généré automatiquement
});

/**
 * Schéma pour la recherche/filtrage de faits
 */
export const FactQuerySchema = z.object({
  startDate: z.number().int().optional()
    .describe('Timestamp de début'),
  endDate: z.number().int().optional()
    .describe('Timestamp de fin'),
  categories: z.array(z.string()).optional()
    .describe('Filtrer par catégories'),
  importance: z.enum(['low', 'medium', 'high']).optional()
    .describe('Filtrer par importance'),
  verificationStatus: z.enum(['pending', 'confirmed', 'disputed']).optional()
    .describe('Filtrer par statut de vérification'),
  threadId: z.string().optional()
    .describe('Filtrer par thread'),
});

/**
 * Fonction utilitaire pour valider un fait
 * @param data - Données brutes à valider
 * @returns Résultat de validation avec données ou erreurs
 */
export function validateFact(data: unknown): { 
  success: true; 
  data: ValidatedFact;
} | { 
  success: false; 
  errors: z.ZodError;
} {
  const result = FactSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Fonction pour formater les erreurs Zod en message lisible
 */
export function formatZodErrors(error: z.ZodError): string {
  return error.errors
    .map(err => `- ${err.path.join('.')}: ${err.message}`)
    .join('\n');
}

/**
 * Schéma pour le rapport de validation
 */
export const ValidationReportSchema = z.object({
  projectId: z.string(),
  timestamp: z.string().datetime(),
  facts: z.object({
    total: z.number().int().nonnegative(),
    validated: z.number().int().nonnegative(),
    rejected: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
  }),
  code: z.object({
    components: z.number().int().nonnegative(),
    tests: z.number().int().nonnegative(),
    passed: z.boolean(),
  }),
  issues: z.array(z.object({
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    message: z.string(),
    component: z.string().optional(),
  })),
  approved: z.boolean(),
});
