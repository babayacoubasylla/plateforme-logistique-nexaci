// backend/src/controllers/agenceController.js
const Agence = require('../models/Agence');
const { User, Colis, Mandat } = require('../models');

// Récupérer toutes les agences actives
exports.getAgences = async (req, res) => {
  try {
    const agences = await Agence.find({ statut: 'active' })
      .populate('gerant', 'nom prenom email telephone')
      .select('-__v');
      
    res.status(200).json({
      status: 'success',
      results: agences.length,
      data: { agences }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Récupérer une agence par son ID
exports.getAgenceById = async (req, res) => {
  try {
    const agence = await Agence.findById(req.params.id)
      .populate('gerant', 'nom prenom email telephone');
      
    if (!agence) {
      return res.status(404).json({
        status: 'error',
        message: 'Agence non trouvée'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { agence }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Créer une nouvelle agence
exports.createAgence = async (req, res) => {
  try {
    // Vérification des champs requis
    const { nom, code, adresse, ville, telephone, email, gerant } = req.body;
    
    console.log('Données reçues:', req.body);
    
    const champsManquants = [];
    if (!nom) champsManquants.push('nom');
    if (!code) champsManquants.push('code');
    if (!adresse) champsManquants.push('adresse');
    if (!ville) champsManquants.push('ville');
    if (!telephone) champsManquants.push('telephone');
    if (!gerant) champsManquants.push('gerant');
    
    if (champsManquants.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Champs obligatoires manquants : ${champsManquants.join(', ')}`,
        details: {
          missingFields: champsManquants,
          receivedData: req.body
        }
      });
    }

    const newAgence = await Agence.create({
      nom,
      code,
      adresse,
      ville,
      telephone,
      email,
      gerant,
      statut: 'active',
      localisation: req.body.localisation || {
        type: 'Point',
        coordinates: [0, 0] // coordonnées par défaut
      }
    });

    // Mettre à jour le profil du gérant avec l'ID de l'agence
    const User = require('../models/User');
    await User.findByIdAndUpdate(gerant, {
      'profile.agence': newAgence._id
    });

    const populatedAgence = await Agence.findById(newAgence._id)
      .populate('gerant', 'nom prenom email telephone');

    res.status(201).json({
      status: 'success',
      data: { agence: populatedAgence }
    });
  } catch (error) {
    console.error('Erreur création agence:', error);
    res.status(400).json({ 
      status: 'error', 
      message: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
};

// Mettre à jour une agence
exports.updateAgence = async (req, res) => {
  try {
    const oldAgence = await Agence.findById(req.params.id);
    if (!oldAgence) {
      return res.status(404).json({
        status: 'error',
        message: 'Agence non trouvée'
      });
    }

    const agence = await Agence.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('gerant', 'nom prenom email telephone');

    // Si le gérant a changé, mettre à jour les profils des gérants
    if (req.body.gerant && oldAgence.gerant.toString() !== req.body.gerant) {
      const User = require('../models/User');
      // Retirer l'agence de l'ancien gérant
      await User.findByIdAndUpdate(oldAgence.gerant, {
        'profile.agence': null
      });
      // Ajouter l'agence au nouveau gérant
      await User.findByIdAndUpdate(req.body.gerant, {
        'profile.agence': agence._id
      });
    }

    res.status(200).json({
      status: 'success',
      data: { agence }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Supprimer une agence
exports.deleteAgence = async (req, res) => {
  try {
    const agence = await Agence.findById(req.params.id);
    if (!agence) {
      return res.status(404).json({
        status: 'error',
        message: 'Agence non trouvée'
      });
    }

    // Retirer l'agence du profil du gérant
    const User = require('../models/User');
    await User.findByIdAndUpdate(agence.gerant, {
      'profile.agence': null
    });

    // Supprimer l'agence
    await Agence.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Rechercher des agences par ville
exports.searchAgencesByCity = async (req, res) => {
  try {
    const { ville } = req.query;
    const agences = await Agence.find({
      ville: new RegExp(ville, 'i'),
      statut: 'active'
    }).populate('gerant', 'nom prenom email telephone');

    res.status(200).json({
      status: 'success',
      results: agences.length,
      data: { agences }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Trouver les agences les plus proches
exports.findNearestAgences = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance en mètres, défaut 10km

    const agences = await Agence.find({
      statut: 'active',
      localisation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('gerant', 'nom prenom email telephone');

    res.status(200).json({
      status: 'success',
      results: agences.length,
      data: { agences }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Vérifier la disponibilité d'une agence
exports.checkAgenceAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    const agence = await Agence.findById(id);
    if (!agence) {
      return res.status(404).json({
        status: 'error',
        message: 'Agence non trouvée'
      });
    }

    // Logique pour vérifier la disponibilité
    // Par exemple, vérifier la capacité de stockage actuelle, les horaires, etc.
    const requestDate = date ? new Date(date) : new Date();
    const jour = requestDate.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    
    // Vérifier si l'agence est ouverte ce jour-là
    if (!agence.horaires || !agence.horaires[jour]) {
      return res.status(200).json({
        available: false,
        message: 'Agence fermée ce jour'
      });
    }

    // TODO: Ajouter plus de logique de vérification si nécessaire
    // Par exemple, vérifier la capacité de stockage actuelle

    res.status(200).json({
      status: 'success',
      data: {
        available: true,
        nextAvailableSlot: requestDate
      }
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Lister les coursiers (livreurs) d'une agence donnée
exports.getCoursiersByAgence = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) Valider l'agence
    const agence = await Agence.findById(id);
    if (!agence) {
      return res.status(404).json({ status: 'error', message: 'Agence non trouvée' });
    }

    // 2) Autorisations: admin/super_admin ou gérant de l'agence
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
    const isGerantOfAgence = req.user.role === 'gerant' && agence.gerant.toString() === req.user.id.toString();
    if (!isAdmin && !isGerantOfAgence) {
      return res.status(403).json({ status: 'error', message: 'Accès refusé.' });
    }

    // 3) Récupérer les utilisateurs avec rôle livreur affectés à cette agence
    const livreurs = await User.find({
      role: 'livreur',
      'profile.agence': id
    }).select('_id nom prenom email telephone profile.statut');

    // 4) Calculer les charges (assignations en cours)
    // NB: Colis ne contient pas encore un champ 'livreur' dans le modèle — on compte seulement les mandats assignés
    const couriersWithCharges = await Promise.all(livreurs.map(async (u) => {
      const mandatCount = await Mandat.countDocuments({
        coursier_assigné: u._id,
        statut: { $nin: ['livre', 'annule', 'echec'] }
      });

      return {
        _id: u._id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: u.telephone,
        status: u.profile?.statut === 'actif' ? 'active' : 'inactive',
        charges: mandatCount
      };
    }));

    res.status(200).json({
      status: 'success',
      results: couriersWithCharges.length,
      data: couriersWithCharges
    });
  } catch (error) {
    console.error('❌ getCoursiersByAgence error:', error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur' });
  }
};