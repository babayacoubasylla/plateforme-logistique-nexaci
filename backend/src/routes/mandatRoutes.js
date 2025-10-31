const express = require('express');
const {
  getDocumentTypes,
  getAdministrations,
  createMandat,
  getMyMandats,
  getMandat,
  trackMandat,
  uploadDocuments,
  uploadMiddleware,
  updateMandatStatus,
  assignCoursier,
  getAllMandats,
  downloadMandatReceipt,
  downloadMandatReceiptByReference,
  getMyMandatsHistory,
  getAllMandatsHistory
} = require('../controllers/mandatController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// ==================== ROUTES PUBLIQUES ====================

// Suivi public d'un mandat
router.get('/track/:reference', trackMandat);

// ==================== ROUTES PROTÉGÉES ====================

// Toutes les routes suivantes nécessitent une authentification
router.use(protect);

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/document-types', getDocumentTypes);
router.get('/administrations', getAdministrations);
router.post('/', createMandat);
router.get('/my-mandats', getMyMandats);
// Mandats assignés au livreur connecté (AVANT /:id pour éviter conflit de route)
router.get('/assigned', restrictTo('livreur', 'admin', 'super_admin'), require('../controllers/mandatController').getMyAssignedMandats);
// Historique des mandats terminés pour le livreur
router.get('/history/my', restrictTo('livreur', 'admin', 'super_admin'), getMyMandatsHistory);
// Historique global des mandats (admin seulement)
router.get('/history/all', restrictTo('admin', 'super_admin'), getAllMandatsHistory);
router.get('/:id', getMandat);
router.get('/:id/receipt', downloadMandatReceipt);
router.get('/receipt/ref/:reference', downloadMandatReceiptByReference);
// Mise à jour du statut accessible aux rôles internes y compris livreur
router.patch('/:id/status', restrictTo('admin', 'super_admin', 'gerant', 'livreur'), updateMandatStatus);

// Upload de documents pour un mandat spécifique
router.patch('/:id/documents', uploadMiddleware, uploadDocuments);

// ==================== ROUTES ADMIN ET PERSONNEL ====================

// Routes accessibles seulement au personnel (admin, super_admin, gerant)
router.use(restrictTo('admin', 'super_admin', 'gerant'));

// Récupérer tous les mandats
router.get('/', getAllMandats);

// Mettre à jour le statut d'un mandat (doublon conservé pour compat et permissions admin/gerant)
// Note: la route principale est définie plus haut avec rôles étendus

// Assigner un coursier à un mandat
router.patch('/:id/assign', assignCoursier);

module.exports = router;