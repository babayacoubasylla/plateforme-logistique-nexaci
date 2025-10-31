const mongoose = require('mongoose');
const { Colis, Mandat, User } = require('../models');

// ==================== STATISTIQUES CLIENT ====================

// Statistiques pour le client connecté
exports.getClientStats = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { cache, CACHE_KEYS, getCacheKey, getCachedData } = require('../utils/cache');
    const { logger } = require('../utils/logger');
    
    logger.info(`📊 [DEBUG] req.user:`, req.user);
    logger.info(`📊 [DEBUG] userId:`, userId);

    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'ID utilisateur manquant'
      });
    }

    logger.info(`📊 Demande de statistiques pour l'utilisateur: ${userId}`);
    
    // Définir la clé de cache unique pour cet utilisateur
    const cacheKey = getCacheKey(CACHE_KEYS.CLIENT_STATS, userId);

    // Statistiques des colis
    logger.info(`📊 [DEBUG] Conversion de l'ID en ObjectId...`);
    const expediteurId = new mongoose.Types.ObjectId(userId);
    logger.info(`📊 [DEBUG] ID converti:`, expediteurId);

    const colisStats = await Colis.aggregate([
      { $match: { expediteur: expediteurId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          en_attente: {
            $sum: { $cond: [{ $eq: ['$statut', 'en_attente'] }, 1, 0] }
          },
          en_cours: {
            $sum: {
              $cond: [
                { $in: ['$statut', ['en_preparation', 'pris_en_charge', 'en_transit', 'en_livraison']] },
                1, 0
              ]
            }
          },
          livres: {
            $sum: { $cond: [{ $eq: ['$statut', 'livre'] }, 1, 0] }
          },
          depenses_total: { $sum: '$tarif.total' }
        }
      }
    ]);

    // Statistiques des mandats
    const mandatsStats = await Mandat.aggregate([
      { $match: { client: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          en_attente: {
            $sum: { $cond: [{ $eq: ['$statut', 'en_attente'] }, 1, 0] }
          },
          en_cours: {
            $sum: {
              $cond: [
                { $in: ['$statut', ['documents_verifies', 'procuration_signee', 'depose_administration', 'en_traitement', 'en_livraison']] },
                1, 0
              ]
            }
          },
          completes: {
            $sum: { $cond: [{ $eq: ['$statut', 'livre'] }, 1, 0] }
          },
          depenses_total: { $sum: '$tarif.total' }
        }
      }
    ]);

    // Derniers colis et mandats
    const derniersColis = await Colis.find({ expediteur: userId })
      .populate('expediteur', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(5);

    const derniersMandats = await Mandat.find({ client: userId })
      .populate('type_document')
      .populate('administration')
      .sort({ createdAt: -1 })
      .limit(5);

    // Récupérer les stats depuis le cache ou les calculer
    const stats = await getCachedData(cacheKey, async () => {
      const calculatedStats = {
        colis: colisStats[0] || { total: 0, en_attente: 0, en_cours: 0, livres: 0, depenses_total: 0 },
        mandats: mandatsStats[0] || { total: 0, en_attente: 0, en_cours: 0, completes: 0, depenses_total: 0 },
        derniers_colis: derniersColis,
        derniers_mandats: derniersMandats,
        resume: {
          total_commandes: (colisStats[0]?.total || 0) + (mandatsStats[0]?.total || 0),
          total_depenses: (colisStats[0]?.depenses_total || 0) + (mandatsStats[0]?.depenses_total || 0),
          en_cours: (colisStats[0]?.en_cours || 0) + (mandatsStats[0]?.en_cours || 0),
          taux_success: calculateTauxSuccess(colisStats[0], mandatsStats[0])
        }
      };
      logger.debug(`Stats calculées pour l'utilisateur ${userId}`);
      return calculatedStats;
    });

    logger.info(`✅ Stats récupérées pour l'utilisateur ${userId}`);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('❌ Get client stats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==================== STATISTIQUES ADMIN ====================

// Statistiques globales pour l'admin
exports.getAdminStats = async (req, res) => {
  try {
    console.log('📈 Getting admin stats');

    // Vérifier les permissions admin
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Accès non autorisé. Admin seulement.'
      });
    }

    // Statistiques globales colis
    const colisStats = await Colis.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          par_statut: {
            $push: {
              statut: '$statut',
              count: 1
            }
          },
          revenus_total: { $sum: '$tarif.total' },
          moyenne_prix: { $avg: '$tarif.total' }
        }
      },
      {
        $project: {
          total: 1,
          revenus_total: 1,
          moyenne_prix: 1,
          statuts: {
            $arrayToObject: {
              $map: {
                input: '$par_statut',
                as: 'item',
                in: {
                  k: '$$item.statut',
                  v: '$$item.count'
                }
              }
            }
          }
        }
      }
    ]);

    // Statistiques globales mandats
    const mandatsStats = await Mandat.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          par_statut: {
            $push: {
              statut: '$statut',
              count: 1
            }
          },
          revenus_total: { $sum: '$tarif.total' },
          moyenne_prix: { $avg: '$tarif.total' },
          par_type_document: {
            $push: {
              type_document: '$type_document',
              count: 1
            }
          }
        }
      }
    ]);

    // Statistiques utilisateurs
    const usersStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Activité récente (7 derniers jours)
    const septJours = new Date();
    septJours.setDate(septJours.getDate() - 7);

    const activiteRecent = await Colis.aggregate([
      {
        $match: {
          createdAt: { $gte: septJours }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          colis: { $sum: 1 },
          revenus: { $sum: '$tarif.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = {
      global: {
        colis: colisStats[0] || { total: 0, revenus_total: 0, moyenne_prix: 0, statuts: {} },
        mandats: mandatsStats[0] || { total: 0, revenus_total: 0, moyenne_prix: 0 },
        utilisateurs: usersStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        revenus_totaux: (colisStats[0]?.revenus_total || 0) + (mandatsStats[0]?.revenus_total || 0)
      },
      activite_recente: activiteRecent,
      resume: {
        total_commandes: (colisStats[0]?.total || 0) + (mandatsStats[0]?.total || 0),
        total_utilisateurs: usersStats.reduce((sum, item) => sum + item.count, 0),
        revenus_mensuels: (colisStats[0]?.revenus_total || 0) + (mandatsStats[0]?.revenus_total || 0),
        taux_croissance: calculateTauxCroissance(activiteRecent)
      }
    };

    console.log('✅ Admin stats retrieved');

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('❌ Get admin stats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==================== STATISTIQUES LIVREUR ====================

// Statistiques pour le livreur connecté
exports.getLivreurStats = async (req, res) => {
  try {
    const livreurId = req.user.id;

    console.log(`🚚 Getting livreur stats for: ${livreurId}`);

    // Vérifier que l'utilisateur est un livreur
    if (req.user.role !== 'livreur') {
      return res.status(403).json({
        status: 'error',
        message: 'Accès réservé aux livreurs.'
      });
    }

    // Valider l'ID
    if (!mongoose.Types.ObjectId.isValid(livreurId)) {
      return res.status(400).json({ status: 'error', message: 'ID livreur invalide' });
    }
    const livreurObjectId = new mongoose.Types.ObjectId(livreurId);

    // Colis assignés au livreur
    const colisStats = await Colis.aggregate([
      { $match: { livreur: livreurObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          livres: {
            $sum: { $cond: [{ $eq: ['$statut', 'livre'] }, 1, 0] }
          },
          en_cours: {
            $sum: {
              $cond: [
                { $in: ['$statut', ['pris_en_charge', 'en_transit', 'en_livraison']] },
                1, 0
              ]
            }
          },
          revenus_total: { $sum: '$tarif.frais_livraison' }
        }
      }
    ]);

    // Mandats assignés au livreur
    const mandatsStats = await Mandat.aggregate([
      { $match: { coursier_assigné: livreurObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          livres: {
            $sum: { $cond: [{ $eq: ['$statut', 'livre'] }, 1, 0] }
          },
          en_cours: {
            $sum: {
              $cond: [
                { $in: ['$statut', ['en_livraison', 'document_obtenu']] },
                1, 0
              ]
            }
          },
          revenus_total: { $sum: '$tarif.frais_livraison' }
        }
      }
    ]);

    // Missions du jour
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    const missionsDuJour = await Colis.find({
      livreur: livreurObjectId,
      createdAt: { $gte: aujourdhui },
      statut: { $in: ['pris_en_charge', 'en_transit', 'en_livraison'] }
    }).populate('expediteur', 'nom prenom telephone');

    const missionsMandatsDuJour = await Mandat.find({
      coursier_assigné: livreurObjectId,
      createdAt: { $gte: aujourdhui },
      statut: { $in: ['en_livraison'] }
    }).populate('client', 'nom prenom telephone')
      .populate('type_document');

    const colisAgg = colisStats[0] || { total: 0, livres: 0, en_cours: 0, revenus_total: 0 };
    const mandatsAgg = mandatsStats[0] || { total: 0, livres: 0, en_cours: 0, revenus_total: 0 };

    const totalLivraisons = (colisAgg?.livres || 0);
    const totalColis = (colisAgg?.total || 0);
    const taux = totalColis > 0 ? ((totalLivraisons / totalColis) * 100).toFixed(1) : '0';

    const stats = {
      colis: colisAgg,
      mandats: mandatsAgg,
      missions_du_jour: {
        colis: missionsDuJour,
        mandats: missionsMandatsDuJour,
        total: missionsDuJour.length + missionsMandatsDuJour.length
      },
      performance: {
        taux_livraison: taux,
        revenus_mensuels: (colisAgg?.revenus_total || 0) + (mandatsAgg?.revenus_total || 0),
        efficacite: calculateEfficaciteLivreur(colisAgg, mandatsAgg)
      }
    };

    console.log(`✅ Livreur stats retrieved for ${livreurId}`);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('❌ Get livreur stats error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==================== STATISTIQUES TEMPORELLES ====================

// Statistiques par période (journalières, mensuelles)
exports.getStatsByPeriod = async (req, res) => {
  try {
    const { periode, type } = req.query; // 'jour', 'semaine', 'mois'
    const userId = req.user.id;

    let matchStage = {};
    let groupFormat = '';

    // Définir la période et le format de regroupement
    switch (periode) {
      case 'jour':
        groupFormat = '%Y-%m-%d';
        break;
      case 'semaine':
        groupFormat = '%Y-%U';
        break;
      case 'mois':
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    // Filtrer par type (colis ou mandats) et utilisateur si client
    if (['client', 'livreur'].includes(req.user.role)) {
      if (type === 'colis') {
        matchStage.expediteur = mongoose.Types.ObjectId(userId);
      } else if (type === 'mandats') {
        matchStage.client = mongoose.Types.ObjectId(userId);
      }
    }

    const Model = type === 'mandats' ? Mandat : Colis;

    const stats = await Model.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          revenus: { $sum: '$tarif.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        periode,
        type,
        stats
      }
    });
  } catch (error) {
    console.error('❌ Get stats by period error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==================== FONCTIONS UTILITAIRES ====================

// Calculer le taux de succès
function calculateTauxSuccess(colisStats, mandatsStats) {
  const totalColis = colisStats?.total || 0;
  const totalMandats = mandatsStats?.total || 0;
  const totalSuccess = (colisStats?.livres || 0) + (mandatsStats?.completes || 0);
  const totalCommandes = totalColis + totalMandats;

  if (totalCommandes === 0) return 0;
  return ((totalSuccess / totalCommandes) * 100).toFixed(1);
}

// Calculer le taux de croissance
function calculateTauxCroissance(activiteRecent) {
  if (activiteRecent.length < 2) return 0;
  
  const recent = activiteRecent[activiteRecent.length - 1];
  const precedent = activiteRecent[activiteRecent.length - 2];
  
  if (!precedent || precedent.revenus === 0) return 0;
  
  return (((recent.revenus - precedent.revenus) / precedent.revenus) * 100).toFixed(1);
}

// Calculer l'efficacité du livreur
function calculateEfficaciteLivreur(colisStats, mandatsStats) {
  const totalLivraisons = (colisStats?.livres || 0) + (mandatsStats?.livres || 0);
  const totalCommandes = (colisStats?.total || 0) + (mandatsStats?.total || 0);
  
  if (totalCommandes === 0) return 0;
  return ((totalLivraisons / totalCommandes) * 100).toFixed(1);
}