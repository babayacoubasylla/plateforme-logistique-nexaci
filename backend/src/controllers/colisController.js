// backend/src/controllers/colisController.js
const mongoose = require('mongoose');
const { Colis, User, Agence } = require('../models');
const PDFService = require('../services/pdfService');
const notificationService = require('../services/notificationService');
const multer = require('multer');
const path = require('path');

// ==================== UPLOAD PHOTO COLIS ====================
const colisStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/colis/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const colisFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seules les images (JPEG, PNG, GIF) sont acceptées.'), false);
  }
};

const uploadColis = multer({
  storage: colisStorage,
  fileFilter: colisFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

exports.uploadColisPhotoMiddleware = uploadColis.single('photo');

// Créer un nouveau colis
exports.createColis = async (req, res) => {
  try {
    const { 
      destinataire, 
      details_colis, 
      paiement,
      typeLivraison = 'domicile',
      agenceId
    } = req.body;

    console.log('📦 ========== CRÉATION DE COLIS ==========');
    console.log('📦 User ID:', req.user.id);
    console.log('📦 Type de livraison:', typeLivraison);
    console.log('📦 Données reçues:', JSON.stringify(req.body, null, 2));
    console.log('📦 Destinataire:', JSON.stringify(destinataire, null, 2));
    console.log('📦 Détails colis:', JSON.stringify(details_colis, null, 2));
    console.log('📦 Paiement:', JSON.stringify(paiement, null, 2));
    console.log('📦 =========================================');

    if (typeLivraison === 'domicile') {
      if (!destinataire || !destinataire.nom || !destinataire.telephone || !destinataire.adresse || !destinataire.ville) {
        return res.status(400).json({
          status: 'error',
          message: 'Les informations du destinataire sont incomplètes pour la livraison à domicile.'
        });
      }
    }
    
    // Pour le point relais, vérifier au minimum nom et téléphone pour les notifications
    if (typeLivraison === 'point_relais') {
      if (!destinataire || !destinataire.nom || !destinataire.telephone) {
        return res.status(400).json({
          status: 'error',
          message: 'Le nom et le téléphone du destinataire sont requis pour les notifications.'
        });
      }
    }

    if (!details_colis || !details_colis.poids) {
      return res.status(400).json({
        status: 'error',
        message: 'Le poids du colis est requis.'
      });
    }

    if (!paiement || !paiement.methode) {
      return res.status(400).json({
        status: 'error',
        message: 'La méthode de paiement est requise.'
      });
    }

    let pointRelais = null;
    if (typeLivraison === 'point_relais') {
      if (!agenceId) {
        return res.status(400).json({
          status: 'error',
          message: 'L\'agence est requise pour le retrait en point relais.'
        });
      }
      const agence = await Agence.findById(agenceId);
      if (!agence) {
        return res.status(404).json({
          status: 'error',
          message: 'Agence non trouvée.'
        });
      }
      pointRelais = agenceId;
    }

    // Récupérer l'utilisateur complet pour obtenir son agence
    const expediteur = await User.findById(req.user.id).select('profile.agence');
    const agenceExpéditeur = expediteur?.profile?.agence || null;
    
    console.log('🏢 Agence de l\'expéditeur:', agenceExpéditeur);

    const fraisTransport = calculatePrice(details_colis.poids);
    const total = fraisTransport;

    const colisData = {
      expediteur: req.user.id,
      agence: agenceExpéditeur, // ✅ Assigner l'agence de l'expéditeur
      destinataire: destinataire,
      pointRelais,
      typeLivraison,
      details_colis,
      tarif: {
        frais_transport: fraisTransport,
        total: total
      },
      paiement
    };

    const colis = await Colis.create(colisData);
    await colis.populate('expediteur', 'nom prenom email telephone');
    if (pointRelais) {
      await colis.populate('pointRelais', 'nom adresse ville');
    }

    console.log('✅ Colis created successfully:', colis.reference);

    // 📱 Envoyer notification WhatsApp au client
    notificationService.notifyColisCreated(colis).catch(err => 
      console.error('⚠️ Erreur notification:', err)
    );

    res.status(201).json({
      status: 'success',
      message: 'Colis créé avec succès.',
      data: {
        colis
      }
    });
  } catch (error) {
    console.error('❌ Create colis error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        status: 'error',
        message: 'Erreur de validation',
        errors: errors
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Une référence de colis identique existe déjà.'
      });
    }
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Assigner un livreur à un colis
exports.assignLivreur = async (req, res) => {
  try {
    const { id } = req.params;
    const { coursier_id } = req.body;

    if (!coursier_id) {
      return res.status(400).json({ status: 'error', message: 'ID du coursier requis.' });
    }

    const colis = await Colis.findById(id).populate('pointRelais', 'gerant nom');
    if (!colis) {
      return res.status(404).json({ status: 'error', message: 'Colis non trouvé.' });
    }

    // Permissions: admin/super_admin ou gérant de l'agence point relais
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    let isGerantOfAgence = false;
    if (req.user.role === 'gerant' && colis.pointRelais) {
      // On doit récupérer l'agence pour confirmer le gerant
      const agence = await Agence.findById(colis.pointRelais);
      if (agence) {
        isGerantOfAgence = agence.gerant.toString() === req.user.id.toString();
      }
    }

    if (!isAdmin && !isGerantOfAgence) {
      return res.status(403).json({ status: 'error', message: 'Accès refusé.' });
    }

    // Valider le coursier
    const coursier = await User.findById(coursier_id);
    if (!coursier || coursier.role !== 'livreur') {
      return res.status(400).json({ status: 'error', message: 'Coursier invalide.' });
    }

    // Assigner
    const ancienLivreur = colis.livreur;
    colis.livreur = coursier_id;
    colis.historique.push({
      statut: colis.statut,
      description: `Livreur assigné${ancienLivreur ? ' (remplacement)' : ''}: ${coursier.prenom || ''} ${coursier.nom}`.trim(),
      utilisateur: req.user.id,
      date: new Date()
    });
    await colis.save();

    await colis.populate('livreur', 'nom prenom telephone email');
    await colis.populate('expediteur', 'nom prenom telephone');
    await colis.populate('pointRelais', 'nom adresse ville');

    // 📱 Notifier le livreur de sa nouvelle mission
    notificationService.notifyColisAssigned(colis, coursier).catch(err =>
      console.error('⚠️ Erreur notification:', err)
    );

    res.status(200).json({
      status: 'success',
      message: 'Livreur assigné avec succès.',
      data: { colis }
    });
  } catch (error) {
    console.error('❌ Assign livreur error:', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
  }
};

// Récupérer tous les colis de l'utilisateur connecté
exports.getMyColis = async (req, res) => {
  try {
    const colis = await Colis.find({ expediteur: req.user.id })
      .populate('expediteur', 'nom prenom email telephone')
      .populate('pointRelais', 'nom adresse ville')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: colis.length,
      data: {
        colis
      }
    });
  } catch (error) {
    console.error('❌ Get my colis error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Récupérer un colis spécifique
exports.getColis = async (req, res) => {
  try {
    const colis = await Colis.findById(req.params.id)
      .populate('expediteur', 'nom prenom email telephone')
      .populate('pointRelais', 'nom adresse ville');

    if (!colis) {
      return res.status(404).json({
        status: 'error',
        message: 'Colis non trouvé.'
      });
    }

    if (colis.expediteur._id.toString() !== req.user.id && !['admin', 'super_admin', 'gerant', 'livreur'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas accès à ce colis.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        colis
      }
    });
  } catch (error) {
    console.error('❌ Get colis error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour le statut d'un colis
exports.updateColisStatus = async (req, res) => {
  try {
    const { statut } = req.body;
    const colis = await Colis.findById(req.params.id);

    if (!colis) {
      return res.status(404).json({
        status: 'error',
        message: 'Colis non trouvé.'
      });
    }

    if (!['admin', 'super_admin', 'gerant', 'livreur'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas la permission de modifier le statut d\'un colis.'
      });
    }

    colis.statut = statut;
    colis.historique.push({
      statut: statut,
      description: `Statut mis à jour par ${req.user.role}`,
      utilisateur: req.user.id,
      date: new Date()
    });
    
    await colis.save();
    await colis.populate('expediteur', 'nom prenom telephone');
    await colis.populate('livreur', 'nom prenom telephone');
    await colis.populate('pointRelais', 'nom adresse ville');

    // 📱 Notifier le changement de statut
    notificationService.notifyColisStatusChanged(colis, statut).catch(err =>
      console.error('⚠️ Erreur notification:', err)
    );

    res.status(200).json({
      status: 'success',
      message: 'Statut du colis mis à jour.',
      data: {
        colis
      }
    });
  } catch (error) {
    console.error('❌ Update colis status error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Télécharger un reçu PDF de colis par référence
exports.downloadReceiptByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    const colis = await Colis.findOne({ reference })
      .populate('expediteur', 'nom prenom email telephone')
      .populate('pointRelais', 'nom adresse ville');

    if (!colis) {
      return res.status(404).json({
        status: 'error',
        message: 'Colis non trouvé.'
      });
    }

    // Vérifier les permissions
    const isOwner = colis.expediteur._id.toString() === req.user.id;
    const isStaff = ['admin', 'super_admin', 'gerant'].includes(req.user.role);
    const isAssignedLivreur = req.user.role === 'livreur' && colis.livreur && colis.livreur.toString() === req.user.id;
    if (!isOwner && !isStaff && !isAssignedLivreur) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas accès à ce reçu.'
      });
    }

    console.log(`📄 Generating PDF receipt for colis: ${colis.reference}`);

    // Générer le PDF
    const pdfBuffer = await PDFService.generateColisReceipt(colis);

    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reçu-colis-${colis.reference}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Envoyer le PDF
    res.send(pdfBuffer);

    console.log(`✅ PDF receipt generated for colis: ${colis.reference}`);

  } catch (error) {
    console.error('❌ Download colis receipt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la génération du reçu.'
    });
  }
};

// Récupérer tous les colis (admin seulement)
exports.getAllColis = async (req, res) => {
  try {
    let filter = {};
    
    // ✅ Si gérant, ne montrer que les colis de son agence
    if (req.user.role === 'gerant') {
      const gerant = await User.findById(req.user.id).select('profile.agence');
      const agenceId = gerant?.profile?.agence;
      
      if (!agenceId) {
        return res.status(403).json({
          status: 'error',
          message: 'Gérant non assigné à une agence'
        });
      }
      
      filter.agence = agenceId;
      console.log('🏢 Filtrage colis pour agence:', agenceId);
    }
    
    const colis = await Colis.find(filter)
      .populate('expediteur', 'nom prenom email telephone')
      .populate('agence', 'nom ville')
      .populate('pointRelais', 'nom adresse ville')
      .sort({ createdAt: -1 });

    console.log(`📦 Colis trouvés pour ${req.user.role}:`, colis.length);

    res.status(200).json({
      status: 'success',
      results: colis.length,
      data: {
        colis
      }
    });
  } catch (error) {
    console.error('❌ Get all colis error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Colis assignés au livreur connecté
exports.getMyAssignedColis = async (req, res) => {
  try {
    const livreurId = req.user.id;

    if (!['livreur', 'admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Accès non autorisé.' });
    }

    const { statut } = req.query; // optionnel pour filtrer
    const match = { livreur: livreurId };
    if (statut) match.statut = statut;

    const colis = await Colis.find(match)
      .populate('expediteur', 'nom prenom telephone')
      .populate('pointRelais', 'nom adresse ville')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', results: colis.length, data: { colis } });
  } catch (error) {
    console.error('❌ Get my assigned colis error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Suivi d'un colis par référence (publique)
exports.trackColis = async (req, res) => {
  try {
    let { reference } = req.params;
    const referenceValidator = require('../utils/referenceValidator');
    const { cache, CACHE_KEYS, getCacheKey } = require('../utils/cache');
    const { logger } = require('../utils/logger');

    logger.info(`🔍 Demande de suivi pour la référence: ${reference}`);

    // Valider et normaliser la référence
    const validationResult = referenceValidator.validateAndNormalize(reference, 'colis');
    if (!validationResult.isValid) {
      return res.status(400).json({
        status: 'error',
        message: validationResult.error
      });
    }

    const normalizedReference = validationResult.normalizedReference;
    logger.debug(`Référence normalisée: ${normalizedReference}`);

    // Vérifier le cache
    const cacheKey = getCacheKey(CACHE_KEYS.TRACKING, normalizedReference);
    let colis = cache.get(cacheKey);

    if (!colis) {
      logger.debug(`Cache miss pour ${normalizedReference}, recherche en base de données`);
      colis = await Colis.findOne({ reference: normalizedReference })
        .populate('expediteur', 'nom prenom email telephone')
        .populate('pointRelais', 'nom adresse ville');

      if (colis) {
        // Mettre en cache pour 5 minutes
        cache.set(cacheKey, colis, 300);
        logger.debug(`Colis mis en cache: ${normalizedReference}`);
      }
    } else {
      logger.debug(`Cache hit pour ${normalizedReference}`);
    }

    if (!colis) {
      return res.status(404).json({
        status: 'error',
        message: 'Colis non trouvé. Veuillez vérifier la référence.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        colis
      }
    });
  } catch (error) {
    console.error('❌ Track colis error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Obtenir les colis d'une agence spécifique (sécurisé)
exports.getColisByAgence = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'ID d\'agence invalide.' });
    }

    const agence = await Agence.findById(id);
    if (!agence) {
      return res.status(404).json({ status: 'error', message: 'Agence non trouvée.' });
    }

    // 🔒 Vérification : seul le gérant de l'agence (via profile.agence) ou un admin peut accéder
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super_admin'
    ) {
      // Vérifier que le gérant appartient bien à cette agence
      const userAgenceId = req.user.profile?.agence?.toString();
      if (userAgenceId !== id) {
        return res.status(403).json({
          status: 'error',
          message: 'Vous n\'êtes pas autorisé à accéder à cette agence.'
        });
      }
    }

    // Filtrer par le champ "agence" (agence de gestion) et non "pointRelais"
    const colis = await Colis.find({
      agence: id,
      statut: { $in: ['en_attente', 'pris_en_charge', 'en_livraison'] }
    })
    .populate('expediteur', 'nom prenom telephone')
    .populate('livreur', 'nom prenom telephone')
    .populate('pointRelais', 'nom adresse ville')
    .populate('agence', 'nom adresse ville')
    .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: colis.length,
      data: {
        colis
      }
    });

  } catch (error) {
    console.error('❌ getColisByAgence:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur serveur.'
    });
  }
};

// Générer et télécharger un reçu PDF pour un colis
exports.downloadColisReceipt = async (req, res) => {
  try {
    const colis = await Colis.findById(req.params.id)
      .populate('expediteur', 'nom prenom email telephone')
      .populate('pointRelais', 'nom adresse ville');

    if (!colis) {
      return res.status(404).json({
        status: 'error',
        message: 'Colis non trouvé.'
      });
    }

    // Vérifier les permissions
    const isOwner = colis.expediteur._id.toString() === req.user.id;
    const isStaff = ['admin', 'super_admin', 'gerant'].includes(req.user.role);
    const isAssignedLivreur = req.user.role === 'livreur' && colis.livreur && colis.livreur.toString() === req.user.id;
    if (!isOwner && !isStaff && !isAssignedLivreur) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas accès à ce reçu.'
      });
    }

    console.log(`📄 Generating PDF receipt for colis: ${colis.reference}`);

    // Générer le PDF
    const pdfBuffer = await PDFService.generateColisReceipt(colis);

    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reçu-colis-${colis.reference}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Envoyer le PDF
    res.send(pdfBuffer);

    console.log(`✅ PDF receipt generated for colis: ${colis.reference}`);

  } catch (error) {
    console.error('❌ Download colis receipt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la génération du reçu.'
    });
  }
};

// Récupérer l'historique des colis terminés (livreur)
exports.getMyColisHistory = async (req, res) => {
  try {
    const livreurId = req.user.id;

    if (!['livreur', 'admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Accès non autorisé.' });
    }

    const { statut, date_debut, date_fin } = req.query;

    // Filtrer par statuts terminés
    const match = { 
      livreur: livreurId,
      statut: { $in: ['livre', 'echec_livraison', 'annule'] }
    };

    if (statut) match.statut = statut;

    // Filtres de date
    if (date_debut || date_fin) {
      match.createdAt = {};
      if (date_debut) match.createdAt.$gte = new Date(date_debut);
      if (date_fin) match.createdAt.$lte = new Date(date_fin);
    }

    const colis = await Colis.find(match)
      .populate('expediteur', 'nom prenom telephone')
      .populate('pointRelais', 'nom adresse ville')
      .sort({ updatedAt: -1 });

    res.status(200).json({ 
      status: 'success', 
      results: colis.length, 
      data: { colis } 
    });
  } catch (error) {
    console.error('❌ Get livreur history error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Récupérer l'historique des colis d'une agence (gérant)
exports.getColisHistoryByAgence = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: 'error', message: 'ID d\'agence invalide.' });
    }

    const agence = await Agence.findById(id);
    if (!agence) {
      return res.status(404).json({ status: 'error', message: 'Agence non trouvée.' });
    }

    // Vérifier permissions
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'super_admin' &&
      req.user.id.toString() !== agence.gerant.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à accéder à cette agence.'
      });
    }

    const { statut, livreur, date_debut, date_fin } = req.query;

    const match = { 
      pointRelais: id,
      statut: { $in: ['livre', 'echec_livraison', 'annule'] }
    };

    if (statut) match.statut = statut;
    if (livreur) match.livreur = livreur;

    if (date_debut || date_fin) {
      match.createdAt = {};
      if (date_debut) match.createdAt.$gte = new Date(date_debut);
      if (date_fin) match.createdAt.$lte = new Date(date_fin);
    }

    const colis = await Colis.find(match)
      .populate('expediteur', 'nom prenom telephone')
      .populate('livreur', 'nom prenom telephone')
      .populate('pointRelais', 'nom adresse ville')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: colis.length,
      data: { colis }
    });

  } catch (error) {
    console.error('❌ Get agence history error:', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur.' });
  }
};

// Récupérer l'historique global des colis (admin)
exports.getAllColisHistory = async (req, res) => {
  try {
    const { statut, agence, livreur, date_debut, date_fin } = req.query;

    const match = { 
      statut: { $in: ['livre', 'echec_livraison', 'annule'] }
    };

    if (statut) match.statut = statut;
    if (agence) match.pointRelais = agence;
    if (livreur) match.livreur = livreur;

    if (date_debut || date_fin) {
      match.createdAt = {};
      if (date_debut) match.createdAt.$gte = new Date(date_debut);
      if (date_fin) match.createdAt.$lte = new Date(date_fin);
    }

    const colis = await Colis.find(match)
      .populate('expediteur', 'nom prenom telephone')
      .populate('livreur', 'nom prenom telephone')
      .populate('pointRelais', 'nom adresse ville')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: colis.length,
      data: { colis }
    });
  } catch (error) {
    console.error('❌ Get all history error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Upload d'une photo de colis
exports.uploadColisPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const colis = await Colis.findById(id).populate('expediteur', 'nom prenom');

    if (!colis) {
      return res.status(404).json({ status: 'error', message: 'Colis non trouvé.' });
    }

    const isOwner = colis.expediteur && colis.expediteur._id && colis.expediteur._id.toString() === req.user.id;
    const isStaff = ['admin', 'super_admin', 'gerant'].includes(req.user.role);
    const isAssignedLivreur = req.user.role === 'livreur' && colis.livreur && colis.livreur.toString() === req.user.id;
    if (!isOwner && !isStaff && !isAssignedLivreur) {
      return res.status(403).json({ status: 'error', message: 'Accès refusé.' });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'Aucun fichier reçu.' });
    }

    const doc = {
      url: `/uploads/colis/${req.file.filename}`,
      nom_fichier: req.file.originalname,
      date_upload: new Date()
    };

    if (!Array.isArray(colis.photos)) colis.photos = [];
    colis.photos.push(doc);

    colis.historique.push({
      statut: colis.statut,
      description: 'Photo de colis uploadée',
      date: new Date(),
      utilisateur: req.user.id
    });

    await colis.save();

    res.status(200).json({ status: 'success', message: 'Photo uploadée.', data: { photos: colis.photos } });
  } catch (error) {
    console.error('❌ Upload colis photo error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Fonction de calcul de prix
function calculatePrice(poids) {
  if (poids <= 1) return 1500;
  if (poids <= 3) return 2500;
  if (poids <= 5) return 3500;
  if (poids <= 10) return 5000;
  return 5000 + (poids - 10) * 500;
}
