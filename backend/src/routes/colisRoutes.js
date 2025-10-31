// backend/src/routes/colisRoutes.js
const express = require('express');
const {
  createColis,
  getMyColis,
  getColis,
  updateColisStatus,
  getAllColis,
  trackColis,
  getColisByAgence,
  downloadColisReceipt,
  downloadReceiptByReference,
  assignLivreur,
  getMyColisHistory,
  getColisHistoryByAgence,
  getAllColisHistory
} = require('../controllers/colisController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Routes publiques
router.get('/track/:reference', trackColis);

// Routes protégées
router.use(protect);

// Routes client
router.post('/', createColis);
router.get('/my-colis', getMyColis);
// Colis assignés au livreur connecté
router.get('/assigned', restrictTo('livreur', 'admin', 'super_admin'), require('../controllers/colisController').getMyAssignedColis);
// Historique des colis terminés pour le livreur
router.get('/history/my', restrictTo('livreur', 'admin', 'super_admin'), getMyColisHistory);
// Télécharger reçu PDF par référence (client connecté)
router.get('/receipt/ref/:reference', downloadReceiptByReference);
// Routes pour tous les utilisateurs authentifiés
router.get('/:id', getColis);
router.get('/:id/receipt', downloadColisReceipt);
// Upload photo du colis
router.patch('/:id/photo', require('../controllers/colisController').uploadColisPhotoMiddleware, require('../controllers/colisController').uploadColisPhoto);

// Routes pour le personnel (admin, gérant, livreur)
router.patch('/:id/status', restrictTo('admin', 'super_admin', 'gerant', 'livreur'), updateColisStatus);
// Assigner un livreur à un colis (admin/super_admin/gerant)
router.patch('/:id/assign', restrictTo('admin', 'super_admin', 'gerant'), assignLivreur);

// Route pour obtenir les colis par agence (accessible aux gérants et admins)
router.get('/agence/:id', restrictTo('admin', 'super_admin', 'gerant'), getColisByAgence);

// Historique des colis par agence
router.get('/history/agence/:id', restrictTo('admin', 'super_admin', 'gerant'), getColisHistoryByAgence);

// Historique global (admin seulement)
router.get('/history/all', restrictTo('admin', 'super_admin'), getAllColisHistory);

// Route pour obtenir tous les colis (accessible aux gérants pour leur agence et aux admins pour toutes les agences)
router.get('/', async (req, res, next) => {
  if (req.user.role === 'gerant') {
    if (!req.user.profile.agence) {
      return res.status(403).json({
        status: 'error',
        message: 'Gérant sans agence associée'
      });
    }
    // Rediriger vers getColisByAgence avec l'ID de l'agence du gérant
    req.params.id = req.user.profile.agence.toString();
    return getColisByAgence(req, res, next);
  }
  // Pour les admins, continuer vers getAllColis
  if (['admin', 'super_admin'].includes(req.user.role)) {
    return getAllColis(req, res, next);
  }
  // Refuser l'accès aux autres rôles
  return res.status(403).json({
    status: 'error',
    message: 'Accès non autorisé'
  });
});

module.exports = router;