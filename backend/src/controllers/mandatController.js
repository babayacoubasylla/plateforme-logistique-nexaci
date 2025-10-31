const { Mandat, DocumentType, Administration, User } = require('../models');
const multer = require('multer');
const path = require('path');
const PDFService = require('../services/pdfService');
const notificationService = require('../services/notificationService');

// ==================== CONFIGURATION UPLOAD ====================

// Configuration du stockage pour les documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtrage des types de fichiers
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seules les images (JPEG, PNG, GIF) et PDF sont acceptés.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max par fichier
  }
});

// Middleware pour l'upload multiple
exports.uploadMiddleware = upload.fields([
  { name: 'cni', maxCount: 1 },
  { name: 'procuration', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'extrait_naissance', maxCount: 1 },
  { name: 'autre', maxCount: 5 }
]);

// ==================== FONCTIONS DU CONTROLLER ====================

// Récupérer tous les types de documents disponibles
exports.getDocumentTypes = async (req, res) => {
  try {
    const documentTypes = await DocumentType.find({ actif: true });

    res.status(200).json({
      status: 'success',
      results: documentTypes.length,
      data: {
        documentTypes
      }
    });
  } catch (error) {
    console.error('❌ Get document types error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Récupérer les administrations par type
exports.getAdministrations = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { actif: true };
    
    if (type) {
      filter.type = type;
    }

    const administrations = await Administration.find(filter);

    res.status(200).json({
      status: 'success',
      results: administrations.length,
      data: {
        administrations
      }
    });
  } catch (error) {
    console.error('❌ Get administrations error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Créer une nouvelle demande de mandat
exports.createMandat = async (req, res) => {
  try {
    const {
      type_document,
      administration,
      informations_document,
      livraison,
      paiement
    } = req.body;

    console.log('📋 Creating new mandat for user:', req.user.id);

    // Validation des données requises
    if (!type_document || !administration || !informations_document || !livraison) {
      return res.status(400).json({
        status: 'error',
        message: 'Tous les champs obligatoires doivent être remplis.'
      });
    }

    // Vérifier que le type de document existe
    const documentType = await DocumentType.findById(type_document);
    if (!documentType) {
      return res.status(404).json({
        status: 'error',
        message: 'Type de document non trouvé.'
      });
    }

    // Vérifier que l'administration existe
    const admin = await Administration.findById(administration);
    if (!admin) {
      return res.status(404).json({
        status: 'error',
        message: 'Administration non trouvée.'
      });
    }

    // Validation des informations du document
    if (!informations_document.nom_complet) {
      return res.status(400).json({
        status: 'error',
        message: 'Le nom complet est obligatoire.'
      });
    }

    // Validation de la livraison
    if (!livraison.adresse || !livraison.ville || !livraison.telephone) {
      return res.status(400).json({
        status: 'error',
        message: 'Les informations de livraison sont incomplètes.'
      });
    }

    // Calcul des frais
    const fraisService = 2000; // Frais de service fixes
    const fraisLivraison = 1500; // Frais de livraison fixes
    const total = documentType.frais_administratifs + fraisService + fraisLivraison;

    console.log('💰 Calculated fees:', {
      administratifs: documentType.frais_administratifs,
      service: fraisService,
      livraison: fraisLivraison,
      total: total
    });

    // Créer le mandat
    const mandatData = {
      client: req.user.id,
      type_document: type_document,
      administration: administration,
      informations_document,
      livraison,
      tarif: {
        frais_administratifs: documentType.frais_administratifs,
        frais_service: fraisService,
        frais_livraison: fraisLivraison,
        total: total
      },
      paiement: {
        methode: paiement?.methode || 'orange_money',
        statut: 'en_attente'
      }
    };

    const mandat = await Mandat.create(mandatData);

    // Populer les informations pour la réponse
    await mandat.populate('type_document');
    await mandat.populate('administration');
    await mandat.populate('client', 'nom prenom telephone');

    console.log('✅ Mandat created successfully:', mandat.reference);

    // 📱 Envoyer notification WhatsApp au client
    notificationService.notifyMandatCreated(mandat).catch(err =>
      console.error('⚠️ Erreur notification:', err)
    );

    res.status(201).json({
      status: 'success',
      message: 'Demande de mandat créée avec succès.',
      data: {
        mandat
      }
    });
  } catch (error) {
    console.error('❌ Create mandat error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        status: 'error',
        message: 'Erreur de validation',
        errors: errors
      });
    }

    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Récupérer les mandats de l'utilisateur connecté
exports.getMyMandats = async (req, res) => {
  try {
    const mandats = await Mandat.find({ client: req.user.id })
      .populate('type_document')
      .populate('administration')
      .populate('coursier_assigné', 'nom prenom telephone')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${mandats.length} mandats for user ${req.user.id}`);

    res.status(200).json({
      status: 'success',
      results: mandats.length,
      data: {
        mandats
      }
    });
  } catch (error) {
    console.error('❌ Get my mandats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Récupérer un mandat spécifique
exports.getMandat = async (req, res) => {
  try {
    const mandat = await Mandat.findById(req.params.id)
      .populate('type_document')
      .populate('administration')
      .populate('coursier_assigné', 'nom prenom telephone email')
      .populate('client', 'nom prenom email telephone');

    if (!mandat) {
      return res.status(404).json({
        status: 'error',
        message: 'Mandat non trouvé.'
      });
    }

    // Vérifier les permissions
    if (mandat.client._id.toString() !== req.user.id && !['admin', 'super_admin', 'gerant'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas accès à ce mandat.'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        mandat
      }
    });
  } catch (error) {
    console.error('❌ Get mandat error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Suivi public d'un mandat
exports.trackMandat = async (req, res) => {
  try {
    const { reference } = req.params;

    console.log('🔍 Tracking mandat:', reference);

    const mandat = await Mandat.findOne({ reference })
      .populate('type_document', 'nom description delai_moyen')
      .populate('administration', 'nom ville adresse')
      .populate('coursier_assigné', 'nom prenom telephone');

    if (!mandat) {
      return res.status(404).json({
        status: 'error',
        message: 'Mandat non trouvé.'
      });
    }

    // Retourner seulement les informations publiques
    const mandatPublic = {
      reference: mandat.reference,
      type_document: mandat.type_document,
      administration: mandat.administration,
      statut: mandat.statut,
      historique: mandat.historique,
      date_obtention_prevue: mandat.date_obtention_prevue,
      createdAt: mandat.createdAt,
      updatedAt: mandat.updatedAt
    };

    res.status(200).json({
      status: 'success',
      data: {
        mandat: mandatPublic
      }
    });
  } catch (error) {
    console.error('❌ Track mandat error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Upload de documents pour un mandat
exports.uploadDocuments = async (req, res) => {
  try {
    const mandat = await Mandat.findById(req.params.id);
    
    if (!mandat) {
      return res.status(404).json({
        status: 'error',
        message: 'Mandat non trouvé.'
      });
    }

    // Vérifier les permissions
    if (mandat.client.toString() !== req.user.id && !['admin', 'super_admin', 'gerant'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas accès à ce mandat.'
      });
    }

    // Vérifier s'il y a des fichiers
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Aucun fichier uploadé.'
      });
    }

    console.log('📎 Files uploaded:', Object.keys(req.files));

    // Traiter les fichiers uploadés
    const documents = [];
    Object.keys(req.files).forEach(fieldName => {
      req.files[fieldName].forEach(file => {
        documents.push({
          type_document: fieldName,
          nom_fichier: file.originalname,
          url: `/uploads/documents/${file.filename}`,
          date_upload: new Date()
        });
      });
    });

    // Ajouter les documents au mandat
    mandat.documents.push(...documents);
    
    // Mettre à jour le statut si c'est le premier upload
    if (mandat.statut === 'en_attente' && documents.length > 0) {
      mandat.statut = 'documents_verifies';
      mandat.historique.push({
        statut: 'documents_verifies',
        description: `${documents.length} document(s) uploadé(s) - En attente de vérification`,
        date: new Date(),
        utilisateur: req.user.id
      });
    }

    await mandat.save();

    res.status(200).json({
      status: 'success',
      message: `${documents.length} document(s) uploadé(s) avec succès.`,
      data: {
        documents: mandat.documents,
        statut: mandat.statut
      }
    });
  } catch (error) {
    console.error('❌ Upload documents error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mettre à jour le statut d'un mandat (admin seulement)
exports.updateMandatStatus = async (req, res) => {
  try {
    const { statut, description } = req.body;

    const mandat = await Mandat.findById(req.params.id)
      .populate('type_document');

    if (!mandat) {
      return res.status(404).json({
        status: 'error',
        message: 'Mandat non trouvé.'
      });
    }

    // Vérifier que le statut est valide
    const statutsValides = [
      'en_attente',
      'documents_verifies',
      'procuration_signee',
      'depose_administration',
      'en_traitement',
      'document_obtenu',
      'en_livraison',
      'livre',
      'annule',
      'echec'
    ];

    if (!statutsValides.includes(statut)) {
      return res.status(400).json({
        status: 'error',
        message: 'Statut invalide.'
      });
    }

    // Si c'est un livreur, vérifier les droits et limiter les transitions autorisées
    if (req.user && req.user.role === 'livreur') {
      // Le mandat doit être assigné à ce livreur
      if (!mandat.coursier_assigné || mandat.coursier_assigné.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Vous ne pouvez mettre à jour que les mandats qui vous sont assignés.'
        });
      }

      const allowedForLivreur = ['en_livraison', 'livre', 'echec'];
      if (!allowedForLivreur.includes(statut)) {
        return res.status(400).json({
          status: 'error',
          message: 'Statut non autorisé pour le livreur.'
        });
      }

      // Valider transitions simples
      const current = mandat.statut;
      const validTransitions = {
        document_obtenu: ['en_livraison'],
        en_livraison: ['livre', 'echec']
      };

      const nexts = validTransitions[current] || [];
      if (!nexts.includes(statut)) {
        // Autoriser aussi le passage à en_livraison depuis certains statuts amont
        const extraStart = ['documents_verifies', 'procuration_signee', 'depose_administration', 'en_traitement'];
        if (!(statut === 'en_livraison' && extraStart.includes(current))) {
          return res.status(400).json({
            status: 'error',
            message: `Transition non autorisée depuis ${current} vers ${statut}.`
          });
        }
      }
    }

    // Mettre à jour le statut
    const ancienStatut = mandat.statut;
    mandat.statut = statut;
    
    // Ajouter à l'historique
    mandat.historique.push({
      statut: statut,
      description: description || `Statut mis à jour: ${ancienStatut} → ${statut}`,
      date: new Date(),
      utilisateur: req.user.id
    });

    // Gérer les dates automatiques
    const maintenant = new Date();
    if (statut === 'depose_administration' && !mandat.date_depot) {
      mandat.date_depot = maintenant;
      if (mandat.type_document) {
        mandat.date_obtention_prevue = new Date(maintenant.getTime() + mandat.type_document.delai_moyen * 24 * 60 * 60 * 1000);
      }
    }

    if (statut === 'document_obtenu' && !mandat.date_obtention_reelle) {
      mandat.date_obtention_reelle = maintenant;
    }

    if (statut === 'livre' && !mandat.date_livraison_reelle) {
      mandat.date_livraison_reelle = maintenant;
    }

    await mandat.save();
    await mandat.populate('type_document');
    await mandat.populate('administration');
    await mandat.populate('client', 'nom prenom email telephone');
    await mandat.populate('coursier_assigné', 'nom prenom telephone');

    console.log(`✅ Mandat ${mandat.reference} status updated: ${ancienStatut} → ${statut}`);

    // 📱 Notifier le changement de statut
    notificationService.notifyMandatStatusChanged(mandat, statut).catch(err =>
      console.error('⚠️ Erreur notification:', err)
    );

    res.status(200).json({
      status: 'success',
      message: 'Statut du mandat mis à jour.',
      data: {
        mandat
      }
    });
  } catch (error) {
    console.error('❌ Update mandat status error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Assigner un coursier à un mandat
exports.assignCoursier = async (req, res) => {
  try {
    const { coursier_id } = req.body;

    const mandat = await Mandat.findById(req.params.id);
    const coursier = await User.findById(coursier_id);

    if (!mandat) {
      return res.status(404).json({
        status: 'error',
        message: 'Mandat non trouvé.'
      });
    }

    if (!coursier || coursier.role !== 'livreur') {
      return res.status(400).json({
        status: 'error',
        message: 'Coursier non trouvé ou non valide.'
      });
    }

    const ancienCoursier = mandat.coursier_assigné;
    mandat.coursier_assigné = coursier_id;
    
    mandat.historique.push({
      statut: mandat.statut,
      description: `Coursier assigné: ${coursier.prenom} ${coursier.nom} (${coursier.telephone})`,
      date: new Date(),
      utilisateur: req.user.id
    });

    await mandat.save();
    await mandat.populate('coursier_assigné', 'nom prenom telephone email');
    await mandat.populate('type_document');
    await mandat.populate('administration');
    await mandat.populate('client', 'nom prenom telephone');

    console.log(`✅ Coursier assigned to mandat ${mandat.reference}: ${coursier.prenom} ${coursier.nom}`);

    // 📱 Notifier le coursier de sa nouvelle mission
    notificationService.notifyMandatAssigned(mandat, coursier).catch(err =>
      console.error('⚠️ Erreur notification:', err)
    );

    res.status(200).json({
      status: 'success',
      message: 'Coursier assigné avec succès.',
      data: {
        mandat
      }
    });
  } catch (error) {
    console.error('❌ Assign coursier error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Générer et télécharger un reçu PDF pour un mandat
exports.downloadMandatReceipt = async (req, res) => {
  try {
    const mandat = await Mandat.findById(req.params.id)
      .populate('client', 'nom prenom email telephone')
      .populate('type_document')
      .populate('administration');

    if (!mandat) {
      return res.status(404).json({
        status: 'error',
        message: 'Mandat non trouvé.'
      });
    }

    // Vérifier les permissions
    const isOwner = mandat.client._id.toString() === req.user.id;
    const isStaff = ['admin', 'super_admin', 'gerant'].includes(req.user.role);
    const isAssignedLivreur = req.user.role === 'livreur' && mandat.coursier_assigné && mandat.coursier_assigné.toString() === req.user.id;
    if (!isOwner && !isStaff && !isAssignedLivreur) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas accès à ce reçu.'
      });
    }

    console.log(`📄 Generating PDF receipt for mandat: ${mandat.reference}`);

    // Générer le PDF
    const pdfBuffer = await PDFService.generateMandatReceipt(mandat);

    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reçu-mandat-${mandat.reference}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Envoyer le PDF
    res.send(pdfBuffer);

    console.log(`✅ PDF receipt generated for mandat: ${mandat.reference}`);

  } catch (error) {
    console.error('❌ Download mandat receipt error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la génération du reçu.'
    });
  }
};

// Télécharger le reçu PDF d'un mandat par référence
exports.downloadMandatReceiptByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    const mandat = await Mandat.findOne({ reference })
      .populate('client', 'nom prenom email telephone')
      .populate('type_document')
      .populate('administration');

    if (!mandat) {
      return res.status(404).json({
        status: 'error',
        message: 'Mandat non trouvé.'
      });
    }

    // Vérifier les permissions
    const isOwner = mandat.client._id.toString() === req.user.id;
    const isStaff = ['admin', 'super_admin', 'gerant'].includes(req.user.role);
    const isAssignedLivreur = req.user.role === 'livreur' && mandat.coursier_assigné && mandat.coursier_assigné.toString() === req.user.id;
    if (!isOwner && !isStaff && !isAssignedLivreur) {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'avez pas accès à ce reçu.'
      });
    }

    console.log(`📄 Generating PDF receipt for mandat: ${mandat.reference}`);

    // Générer le PDF
    const pdfBuffer = await PDFService.generateMandatReceipt(mandat);

    // Configurer les headers pour le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reçu-mandat-${mandat.reference}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Envoyer le PDF
    res.send(pdfBuffer);

    console.log(`✅ PDF receipt generated for mandat: ${mandat.reference}`);

  } catch (error) {
    console.error('❌ Download mandat receipt by reference error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erreur lors de la génération du reçu.'
    });
  }
};

// Récupérer tous les mandats (admin seulement)
exports.getAllMandats = async (req, res) => {
  try {
    const { statut, client, administration } = req.query;
    const filter = {};

    if (statut) filter.statut = statut;
    if (client) filter.client = client;
    if (administration) filter.administration = administration;

    const mandats = await Mandat.find(filter)
      .populate('type_document')
      .populate('administration')
      .populate('client', 'nom prenom email telephone')
      .populate('coursier_assigné', 'nom prenom telephone')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${mandats.length} mandats with filters:`, filter);

    res.status(200).json({
      status: 'success',
      results: mandats.length,
      data: {
        mandats
      }
    });
  } catch (error) {
    console.error('❌ Get all mandats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Mandats assignés au livreur connecté
exports.getMyAssignedMandats = async (req, res) => {
  try {
    const { statut } = req.query;
    console.log('📋 [getMyAssignedMandats] req.user:', req.user);
    console.log('📋 [getMyAssignedMandats] statut filter:', statut);

    if (!req.user || !req.user.id) {
      return res.status(400).json({ status: 'error', message: 'Utilisateur non authentifié.' });
    }

    if (!['livreur', 'admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Accès refusé.' });
    }

    // Valider l'ObjectId
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ status: 'error', message: 'ID utilisateur invalide.' });
    }

    const filter = { coursier_assigné: new mongoose.Types.ObjectId(req.user.id) };
    if (statut) filter.statut = statut;

    console.log('📋 [getMyAssignedMandats] Filter:', filter);

    const mandats = await Mandat.find(filter)
      .populate('type_document')
      .populate('administration')
      .populate('client', 'nom prenom telephone')
      .sort({ createdAt: -1 });

    console.log(`📋 [getMyAssignedMandats] Found ${mandats.length} mandats`);

    res.status(200).json({
      status: 'success',
      results: mandats.length,
      data: { mandats }
    });
  } catch (error) {
    console.error('❌ Get assigned mandats error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Récupérer l'historique des mandats terminés (livreur)
exports.getMyMandatsHistory = async (req, res) => {
  try {
    const livreurId = req.user.id;

    if (!['livreur', 'admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Accès non autorisé.' });
    }

    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(livreurId)) {
      return res.status(400).json({ status: 'error', message: 'ID utilisateur invalide.' });
    }

    const { statut, date_debut, date_fin } = req.query;

    const match = { 
      coursier_assigné: new mongoose.Types.ObjectId(livreurId),
      statut: { $in: ['livre', 'annule', 'echec'] }
    };

    if (statut) match.statut = statut;

    if (date_debut || date_fin) {
      match.createdAt = {};
      if (date_debut) match.createdAt.$gte = new Date(date_debut);
      if (date_fin) match.createdAt.$lte = new Date(date_fin);
    }

    const mandats = await Mandat.find(match)
      .populate('type_document')
      .populate('administration')
      .populate('client', 'nom prenom telephone')
      .sort({ updatedAt: -1 });

    res.status(200).json({ 
      status: 'success', 
      results: mandats.length, 
      data: { mandats } 
    });
  } catch (error) {
    console.error('❌ Get livreur mandats history error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Récupérer l'historique global des mandats (admin)
exports.getAllMandatsHistory = async (req, res) => {
  try {
    const { statut, livreur, date_debut, date_fin } = req.query;

    const match = { 
      statut: { $in: ['livre', 'annule', 'echec'] }
    };

    if (statut) match.statut = statut;
    if (livreur) match.coursier_assigné = livreur;

    if (date_debut || date_fin) {
      match.createdAt = {};
      if (date_debut) match.createdAt.$gte = new Date(date_debut);
      if (date_fin) match.createdAt.$lte = new Date(date_fin);
    }

    const mandats = await Mandat.find(match)
      .populate('type_document')
      .populate('administration')
      .populate('client', 'nom prenom telephone')
      .populate('coursier_assigné', 'nom prenom telephone')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: mandats.length,
      data: { mandats }
    });
  } catch (error) {
    console.error('❌ Get all mandats history error:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};
