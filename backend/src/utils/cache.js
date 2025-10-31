// backend/src/utils/cache.js
const NodeCache = require('node-cache');
const { logger } = require('./logger');

// Cache avec expiration de 5 minutes par défaut
const cache = new NodeCache({ 
  stdTTL: 300,
  checkperiod: 60,
  useClones: false
});

// Préfixes pour les différents types de cache
const CACHE_KEYS = {
  CLIENT_STATS: 'client_stats_',
  ADMIN_STATS: 'admin_stats',
  LIVREUR_STATS: 'livreur_stats_',
  TRACKING: 'tracking_'
};

// Fonction utilitaire pour obtenir une clé de cache complète
const getCacheKey = (prefix, identifier = '') => `${prefix}${identifier}`;

// Fonction pour récupérer des données avec cache
const getCachedData = async (key, fetchFunction) => {
  let data = cache.get(key);
  
  if (data === undefined) {
    try {
      data = await fetchFunction();
      cache.set(key, data);
      logger.debug(`Cache miss et mise à jour pour ${key}`);
    } catch (error) {
      logger.error(`Erreur lors de la récupération des données pour ${key}:`, error);
      throw error;
    }
  } else {
    logger.debug(`Cache hit pour ${key}`);
  }

  return data;
};

// Fonction pour invalider le cache d'un utilisateur
const invalidateUserCache = (userId) => {
  const clientKey = getCacheKey(CACHE_KEYS.CLIENT_STATS, userId);
  const livreurKey = getCacheKey(CACHE_KEYS.LIVREUR_STATS, userId);
  
  cache.del(clientKey);
  cache.del(livreurKey);
  
  logger.debug(`Cache invalidé pour l'utilisateur ${userId}`);
};

// Fonction pour invalider le cache des statistiques admin
const invalidateAdminCache = () => {
  cache.del(CACHE_KEYS.ADMIN_STATS);
  logger.debug('Cache admin invalidé');
};

module.exports = {
  cache,
  CACHE_KEYS,
  getCacheKey,
  getCachedData,
  invalidateUserCache,
  invalidateAdminCache
};