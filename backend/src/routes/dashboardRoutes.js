// src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middlewares/auth');

// Routes pour les différents tableaux de bord
router.get('/client', auth, dashboardController.getClientDashboard);
router.get('/admin', auth, dashboardController.getAdminDashboard);
router.get('/livreur', auth, dashboardController.getLivreurDashboard);

module.exports = router;