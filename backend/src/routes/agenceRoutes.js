// backend/src/routes/agenceRoutes.js
const express = require('express');
const { 
  getAgences,
  getAgenceById,
  createAgence,
  updateAgence,
  deleteAgence,
  searchAgencesByCity,
  findNearestAgences,
  checkAgenceAvailability,
  getCoursiersByAgence
} = require('../controllers/agenceController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Routes publiques (pas besoin d'être connecté)
router.get('/search', searchAgencesByCity);
router.get('/nearest', findNearestAgences);

// Routes protégées (nécessite d'être connecté)
router.use(protect);

router.get('/', getAgences);
router.get('/:id', getAgenceById);
router.get('/:id/availability', checkAgenceAvailability);
router.get('/:id/coursiers', getCoursiersByAgence);

// Routes réservées aux administrateurs
router.use(restrictTo('admin', 'super_admin'));

router.post('/', createAgence);
router.patch('/:id', updateAgence);
router.delete('/:id', deleteAgence);

module.exports = router;