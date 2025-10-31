const express = require('express');
const {
  getClientStats,
  getAdminStats,
  getLivreurStats,
  getStatsByPeriod
} = require('../controllers/statsController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// Route pour les statistiques temporelles
router.get('/period', getStatsByPeriod);

// Route pour les statistiques client (tous les utilisateurs authentifiés)
router.get('/client', getClientStats);

// Route pour les statistiques livreur (livreurs seulement)
router.get('/livreur', restrictTo('livreur'), getLivreurStats);

// Route pour les statistiques admin (admin seulement)
router.get('/admin', restrictTo('admin', 'super_admin'), getAdminStats);

module.exports = router;