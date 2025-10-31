/**
 * Utilitaire pour normaliser les références de colis et de mandats
 */

const VALID_PREFIXES = ['CLS-', 'SHP-', 'MND-'];
const CURRENT_YEAR = new Date().getFullYear().toString();

export interface ReferenceType {
  type: 'colis' | 'mandat';
  normalized: string;
  original: string;
}

/**
 * Normalise une référence de colis ou de mandat
 * @param reference La référence à normaliser (ex: SHP-2025-001234, CLS-2025-001234, MND-2025-001234)
 * @returns La référence normalisée
 * @throws {Error} Si le format de la référence est invalide
 */
export const normalizeReference = (reference: string): string => {
  // Nettoyage de base
  const cleanRef = reference.trim().toUpperCase();
  
  // Essayer d'adapter le format si possible
  let formattedRef = cleanRef;
  
  // Si la référence est au format court (ex: SHP-123456)
  if (cleanRef.match(/^(CLS|SHP|MND)-\d{1,6}$/)) {
    const [prefix, number] = cleanRef.split('-');
    formattedRef = `${prefix}-${CURRENT_YEAR}-${number.padStart(6, '0')}`;
  }

  // Vérification finale du format
  if (!formattedRef.match(/^[A-Z]+-\d{4}-\d{6}$/)) {
    throw new Error(`Format de référence invalide. 
Format attendu : XXX-YYYY-NNNNNN
Exemples valides :
- ${VALID_PREFIXES[0]}${CURRENT_YEAR}-000123
- ${VALID_PREFIXES[1]}${CURRENT_YEAR}-000456
- ${VALID_PREFIXES[2]}${CURRENT_YEAR}-000789`);
  }

  // Extraction du préfixe
  const prefix = formattedRef.split('-')[0] + '-';
  
  // Vérification du préfixe
  if (!VALID_PREFIXES.includes(prefix)) {
    throw new Error('Préfixe de référence invalide. Préfixes valides : CLS-, SHP-, MND-');
  }

  // Extraction de l'année
  const year = cleanRef.split('-')[1];
  
  // Vérification de l'année
  if (parseInt(year) < parseInt(CURRENT_YEAR) - 1 || parseInt(year) > parseInt(CURRENT_YEAR) + 1) {
    throw new Error('Année de référence invalide');
  }

  // Normalisation spécifique pour les colis
  if (prefix === 'SHP-') {
    return 'CLS-' + cleanRef.substring(4);
  }

  return cleanRef;
};