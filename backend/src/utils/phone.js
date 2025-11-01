// backend/src/utils/phone.js
// Utilitaires de normalisation et de recherche pour les numéros de téléphone ivoiriens

/**
 * Nettoie un numéro: retire tous les espaces, tirets et points.
 */
function clean(raw) {
  if (!raw) return '';
  return String(raw).replace(/[\s\-.]/g, '').trim();
}

/**
 * Extrait les 10 derniers chiffres (numéro local) s'ils existent.
 */
function last10Digits(v) {
  const digits = (v || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Normalise un numéro ivoirien en format E.164 minimal: +225XXXXXXXXXX
 * - Accepte: 07XXXXXXXX, 0700000000, 22507XXXXXXXX, +22507XXXXXXXX
 */
function normalizeCI(raw) {
  const c = clean(raw);
  const local = last10Digits(c);
  if (!local || local.length !== 10) return c; // si doute, renvoyer nettoyé pour éviter de casser
  return `+225${local}`;
}

/**
 * Génère un ensemble de variantes plausibles pour la recherche en base.
 * Permet de matcher même si le stockage a des formats différents.
 */
function variants(raw) {
  const c = clean(raw);
  if (!c) return [];

  const v = new Set();
  const local = last10Digits(c);
  const withPlus = normalizeCI(c);

  // Variantes usuelles
  v.add(c);
  if (local) v.add(local);
  if (withPlus) v.add(withPlus);
  // Sans +, avec 225
  if (withPlus.startsWith('+225')) v.add(withPlus.replace('+225', '225'));
  // Ajout d'un éventuel 0 devant les 9 derniers chiffres (certaines saisies locales)
  if (local && local.length === 10) {
    const maybeLeadingZero = local.startsWith('0') ? local : `0${local.slice(-9)}`;
    v.add(maybeLeadingZero);
  }

  return Array.from(v);
}

module.exports = {
  clean,
  normalizeCI,
  variants,
};
