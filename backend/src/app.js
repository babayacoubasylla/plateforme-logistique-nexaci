// plateforme-logistique/backend/src/app.js
const express = require('express');
const cors = require('cors'); // Assurez-vous d'avoir installé cors: npm install cors
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const colisRoutes = require('./routes/colisRoutes');
const mandatRoutes = require('./routes/mandatRoutes');
const statsRoutes = require('./routes/statsRoutes');
const agenceRoutes = require('./routes/agenceRoutes'); // Si tu utilises ce fichier

const app = express();

// Connexion à la base de données
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    await checkInitialData();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

// Vérification des données initiales
const checkInitialData = async () => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();

    console.log(`👥 Users in database: ${userCount}`);

    if (userCount === 0) {
      console.log('📝 No users found. Ready to create initial data.');
    }
  } catch (error) {
    console.log('ℹ️  Models not loaded yet, continuing startup...');
  }
};

// Connexion immédiate
connectDB();

// Middlewares globaux
app.use(helmet());
// --- CONFIGURATION CORS MISE À JOUR ---
// Autoriser les requêtes depuis localhost:5173 (dev Vite) et d'autres IPs/réseaux locaux
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite dev server par défaut
    'http://127.0.0.1:5173',  // Alternative pour localhost
    // Ajoute ici l'IP de ton ordinateur si tu veux tester depuis un autre appareil
    // Par exemple, si ton IP locale est 192.168.1.15, ajoute:
    // 'http://192.168.1.15:5173',
    // Ou utilise une expression régulière pour autoriser tout appareil sur le réseau local
    /^http:\/\/192\.168\.(\d+)\.(\d+):5173$/, // Exemple pour 192.168.x.x
    /^http:\/\/10\.(\d+)\.(\d+)\.(\d+):5173$/, // Exemple pour 10.x.x.x
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.(\d+)\.(\d+):5173$/, // Exemple pour 172.16.x.x - 172.31.x.x
    // N'oublie pas d'ajouter l'IP spécifique de ton autre ordinateur si nécessaire
  ],
  credentials: true, // Si tu envoies des cookies ou des headers d'authentification (JWT)
  optionsSuccessStatus: 200 // Certains anciens navigateurs (IE11, divers SmartTVs) bloquent sur 204
};

app.use(cors(corsOptions));
// --- FIN CONFIGURATION CORS ---
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers uploadés statiquement
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging personnalisé
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== ROUTES DE L'APPLICATION ====================

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes utilisateurs
app.use('/api/users', userRoutes);

// Routes colis
app.use('/api/colis', colisRoutes);

// Routes mandats
app.use('/api/mandats', mandatRoutes);

// Routes statistiques et tableaux de bord
app.use('/api/stats', statsRoutes);

// Routes agences
app.use('/api/agences', agenceRoutes); // Si tu utilises ce fichier

// Routes de base
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 Plateforme Logistique API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API test endpoint working correctly',
    data: {
      service: 'Plateforme Logistique & Mandat Administratif',
      phase: 'Development MVP',
      country: 'Côte d\'Ivoire',
      features: [
        'Authentication Multi-Rôles',
        'Gestion Colis & Tracking',
        'Gestion Mandats Administratifs',
        'Tableaux de Bord & Statistiques',
        'Paiements Mobile Money',
        'Upload de Documents'
      ],
      user_types: ['client', 'livreur', 'gerant', 'admin', 'super_admin']
    }
  });
});

app.get('/api/users/demo', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: [
        { id: 1, name: 'Client Demo', type: 'client', phone: '+2250700000001' },
        { id: 2, name: 'Livreur Demo', type: 'livreur', phone: '+2250700000002' }
      ]
    }
  });
});

app.get('/api/colis/demo', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      colis: [
        {
          id: 1,
          reference: 'CLS-2025-001',
          statut: 'en_attente',
          expediteur: 'Client A',
          destinataire: 'Client B',
          prix: 2500
        },
        {
          id: 2,
          reference: 'CLS-2025-002',
          statut: 'en_cours',
          expediteur: 'Client C',
          destinataire: 'Client D',
          prix: 3500
        }
      ]
    }
  });
});

// ==================== GESTION DES ERREURS ====================

// Gestion des routes non trouvées
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    suggestedRoutes: [
      'GET /api/health',
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/users',
      'PATCH /api/users/update-me',
      'POST /api/colis',
      'GET /api/colis/my-colis',
      'GET /api/colis/track/:reference',
      'GET /api/mandats/document-types',
      'GET /api/mandats/administrations',
      'POST /api/mandats',
      'GET /api/mandats/my-mandats',
      'GET /api/mandats/track/:reference',
      'PATCH /api/mandats/:id/documents',
      'GET /api/mandats (admin)',
      'PATCH /api/mandats/:id/status (admin)',
      'PATCH /api/mandats/:id/assign (admin)',
      'GET /api/stats/client - Statistiques client',
      'GET /api/stats/livreur - Statistiques livreur',
      'GET /api/stats/admin - Statistiques admin',
      'GET /api/stats/period - Statistiques par période'
    ],
    documentation: 'https://github.com/votre-repo/documentation  '
  });
});

// Gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('🚨 Error:', error);

  // Erreur de validation MongoDB
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: Object.values(error.errors).map(e => e.message)
    });
  }

  // Erreur de duplication MongoDB
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      status: 'error',
      message: `${field} existe déjà`
    });
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }

  // Erreur JWT expiré
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expiré'
    });
  }

  // Erreur Multer (upload)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'Fichier trop volumineux. Taille maximale: 5MB'
    });
  }

  // Erreur générale
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack
    })
  });
});

// ==================== SERVIR LE FRONTEND EN PRODUCTION ====================
// --- CONFIGURATION POUR PRODUCTION ---
if (process.env.NODE_ENV === 'production') {
  // Servir les fichiers statiques du build du frontend
  // Assure-toi que le chemin vers 'dist' est correct par rapport à ton structure de dossiers
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // Toute requête non-API renvoie vers index.html du frontend (pour le routing client-side)
  // Express 5.x: use regex instead of '*'
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
  });
}
// --- FIN CONFIGURATION POUR PRODUCTION ---

// ==================== LANCEMENT DU SERVEUR ====================

// --- MODIFICATION CRUCIALE : ÉCOUTER SUR TOUTES LES INTERFACES ---
// Utiliser '0.0.0.0' permet au serveur d'être accessible depuis d'autres appareils du réseau
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000;

app.listen(PORT, HOST, () => {
  const networkInterfaces = require('os').networkInterfaces();
  const addresses = [];
  Object.keys(networkInterfaces).forEach(interfaceName => {
    networkInterfaces[interfaceName].filter(iface => !iface.internal && iface.family === 'IPv4')
      .forEach(iface => addresses.push(iface.address));
  });

  console.log('='.repeat(70));
  console.log('🚀 PLATEFORME LOGISTIQUE & MANDAT ADMINISTRATIF - API SERVER');
  console.log('='.repeat(70));
  console.log(`✅ Server running on ALL NETWORK INTERFACES (${HOST}), port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique'}`);
  console.log('='.repeat(70));
  console.log('🔗 HEALTH & TEST:');
  console.log('   GET  /api/health          - Status du serveur');
  console.log('   GET  /api/test            - Test de l\'API');
  console.log('='.repeat(70));
  console.log('🔐 AUTHENTIFICATION:');
  console.log('   POST /api/auth/register   - Inscription');
  console.log('   POST /api/auth/login      - Connexion');
  console.log('   GET  /api/auth/me         - Profil utilisateur');
  console.log('='.repeat(70));
  console.log('👥 UTILISATEURS:');
  console.log('   GET  /api/users           - Liste users (admin)');
  console.log('   PATCH /api/users/update-me - Modifier son profil');
  console.log('='.repeat(70));
  console.log('📦 GESTION DES COLIS:');
  console.log('   POST /api/colis           - Créer un colis');
  console.log('   GET  /api/colis/my-colis  - Mes colis');
  console.log('   GET  /api/colis/track/:ref - Suivi colis (public)');
  console.log('='.repeat(70));
  console.log('🏢 MANDATS ADMINISTRATIFS:');
  console.log('   GET  /api/mandats/document-types - Types de documents');
  console.log('   GET  /api/mandats/administrations - Administrations');
  console.log('   POST /api/mandats          - Créer un mandat');
  console.log('   GET  /api/mandats/my-mandats - Mes mandats');
  console.log('   GET  /api/mandats/track/:ref - Suivi mandat (public)');
  console.log('   PATCH /api/mandats/:id/documents - Upload documents');
  console.log('   GET  /api/mandats          - Tous mandats (admin)');
  console.log('   PATCH /api/mandats/:id/status - Modifier statut (admin)');
  console.log('   PATCH /api/mandats/:id/assign - Assigner coursier (admin)');
  console.log('='.repeat(70));
  console.log('📊 TABLEAUX DE BORD & STATISTIQUES:');
  console.log('   GET  /api/stats/client     - Dashboard client');
  console.log('   GET  /api/stats/livreur    - Dashboard livreur');
  console.log('   GET  /api/stats/admin      - Dashboard admin');
  console.log('   GET  /api/stats/period     - Stats par période');
  console.log('='.repeat(70));
  console.log('🎯 FONCTIONNALITÉS OPÉRATIONNELLES:');
  console.log('   ✅ Authentification JWT');
  console.log('   ✅ Gestion utilisateurs multi-rôles');
  console.log('   ✅ Système complet de colis');
  console.log('   ✅ Système complet de mandats administratifs');
  console.log('   ✅ Tableaux de bord & statistiques');
  console.log('   ✅ Upload de documents sécurisé');
  console.log('   ✅ Suivi public des commandes');
  console.log('='.repeat(70));
  console.log('🔜 PROCHAINES FONCTIONNALITÉS:');
  console.log('   • Paiements Mobile Money');
  console.log('   • Notifications SMS/WhatsApp');
  console.log('   • Application mobile');
  console.log('   • Géolocalisation en temps réel');
  console.log('='.repeat(70));
  
  if (addresses.length > 0) {
    console.log('🌐 ADRESSES RÉSEAU LOCALES POUR LE TEST:');
    addresses.forEach(addr => {
      console.log(`   http://${addr}:${PORT}`);
    });
    console.log('(Remplacez par l\'IP réelle de cet ordinateur sur votre réseau)');
    console.log('='.repeat(70));
  }
});

module.exports = app;
