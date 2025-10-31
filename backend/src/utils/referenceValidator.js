// backend/src/utils/referenceValidator.js
const { logger, logReferenceTracking } = require('./logger');

class ReferenceValidator {
  constructor() {
    this.currentYear = new Date().getFullYear();
    this.validPrefixes = ['CLS-', 'SHP-', 'MND-'];
    this.referenceRegex = /^(CLS|SHP|MND)-(\d{4})-(\d{6})$/;
  }

  /**
   * Valide et normalise une référence
   * @param {string} reference - La référence à valider
   * @param {string} type - Le type de référence ('colis' ou 'mandat')
   * @returns {Object} - Résultat de la validation avec la référence normalisée
   */
  validateAndNormalize(reference, type = 'colis') {
    const result = {
      isValid: false,
      normalizedReference: null,
      error: null
    };

    try {
      // Nettoyage de base
      const cleanRef = reference.trim().toUpperCase();
      
      // Test du format
      const matches = cleanRef.match(this.referenceRegex);
      if (!matches) {
        throw new Error('Format de référence invalide');
      }

      const [, prefix, year, number] = matches;
      
      // Validation de l'année
      const yearNum = parseInt(year);
      if (!this.isValidYear(yearNum)) {
        throw new Error(`Année invalide. Doit être entre ${this.currentYear - 1} et ${this.currentYear + 1}`);
      }

      // Validation du préfixe selon le type
      if (!this.isValidPrefix(prefix, type)) {
        throw new Error(`Préfixe invalide pour un ${type}`);
      }

      // Normalisation (conversion SHP- en CLS- si nécessaire)
      let normalizedRef = cleanRef;
      if (prefix === 'SHP') {
        normalizedRef = `CLS-${year}-${number}`;
      }

      // Log du succès
      logReferenceTracking(reference, normalizedRef, 'validation', true);

      result.isValid = true;
      result.normalizedReference = normalizedRef;

    } catch (error) {
      // Log de l'échec
      logReferenceTracking(reference, null, 'validation', false);
      
      result.error = error.message;
    }

    return result;
  }

  /**
   * Vérifie si l'année est valide
   * @param {number} year - L'année à vérifier
   * @returns {boolean}
   */
  isValidYear(year) {
    return year >= this.currentYear - 1 && year <= this.currentYear + 1;
  }

  /**
   * Vérifie si le préfixe est valide pour le type donné
   * @param {string} prefix - Le préfixe à vérifier
   * @param {string} type - Le type de référence ('colis' ou 'mandat')
   * @returns {boolean}
   */
  isValidPrefix(prefix, type) {
    if (type === 'colis') {
      return ['CLS', 'SHP'].includes(prefix);
    }
    if (type === 'mandat') {
      return prefix === 'MND';
    }
    return false;
  }
}

module.exports = new ReferenceValidator();