// src/controllers/dashboardController.js
const mongoose = require('mongoose');
const { Colis, Mandat, User } = require('../models');

// ==================== TABLEAU DE BORD CLIENT ====================
exports.getClientDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📊 Loading client dashboard for user: ${userId}`);

    // Récupérer les statistiques de base
    const colisStats = await Colis.aggregate([
      { $match: { expediteur: mongoose.Types.ObjectId(userId) } },
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

    const mandatsStats = await Mandat.aggregate([
      { $match: { client: mongoose.Types.ObjectId(userId) } },
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

    // Widgets supplémentaires
    const [prochainesLivraisons, alertesClient, depensesMensuelles, derniersColis, derniersMandats] = await Promise.all([
      getProchainesLivraisons(userId),
      getAlertesClient(userId),
      getDepensesMensuelles(userId),
      Colis.find({ expediteur: userId })
        .populate('expediteur', 'nom prenom')
        .sort({ createdAt: -1 })
        .limit(5),
      Mandat.find({ client: userId })
        .populate('type_document')
        .populate('administration')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const dashboard = {
      resume: {
        total_commandes: (colisStats[0]?.total || 0) + (mandatsStats[0]?.total || 0),
        total_depenses: (colisStats[0]?.depenses_total || 0) + (mandatsStats[0]?.depenses_total || 0),
        en_cours: (colisStats[0]?.en_cours || 0) + (mandatsStats[0]?.en_cours || 0),
        taux_success: calculateTauxSuccess(colisStats[0], mandatsStats[0])
      },
      stats_detaillees: {
        colis: colisStats[0] || { total: 0, en_attente: 0, en_cours: 0, livres: 0, depenses_total: 0 },
        mandats: mandatsStats[0] || { total: 0, en_attente: 0, en_cours: 0, completes: 0, depenses_total: 0 }
      },
      widgets: {
        prochaines_livraisons: prochainesLivraisons,
        alertes: alertesClient,
        depenses_mensuelles: depensesMensuelles
      },
      derniers_elements: {
        colis: derniersColis,
        mandats: derniersMandats
      }
    };

    res.status(200).json({
      status: 'success',
      data: dashboard
    });
  } catch (error) {
    console.error('❌ Client dashboard error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==================== TABLEAU DE BORD ADMIN ====================
exports.getAdminDashboard = async (req, res) => {
  try {
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Accès non autorisé'
      });
    }

    console.log('📈 Loading admin dashboard');

    const [colisStats, mandatsStats, usersStats, activiteRecent, performance, indicateurs, alertes] = await Promise.all([
      // Stats colis
      Colis.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            revenus_total: { $sum: '$tarif.total' },
            moyenne_prix: { $avg: '$tarif.total' }
          }
        }
      ]),
      // Stats mandats
      Mandat.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            revenus_total: { $sum: '$tarif.total' },
            moyenne_prix: { $avg: '$tarif.total' }
          }
        }
      ]),
      // Stats utilisateurs
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      // Activité récente
      Colis.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
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
      ]),
      // Performance
      getPerformanceMetrics(),
      // Indicateurs clés
      getIndicateursCles(),
      // Alertes admin
      getAlertesAdmin()
    ]);

    const dashboard = {
      resume: {
        total_commandes: (colisStats[0]?.total || 0) + (mandatsStats[0]?.total || 0),
        total_utilisateurs: usersStats.reduce((sum, item) => sum + item.count, 0),
        revenus_mensuels: (colisStats[0]?.revenus_total || 0) + (mandatsStats[0]?.revenus_total || 0),
        taux_croissance: calculateTauxCroissance(activiteRecent)
      },
      performance,
      indicateurs,
      alertes,
      activite_recente: activiteRecent,
      repartition: {
        utilisateurs: usersStats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        revenus: {
          colis: colisStats[0]?.revenus_total || 0,
          mandats: mandatsStats[0]?.revenus_total || 0
        }
      }
    };

    res.status(200).json({
      status: 'success',
      data: { dashboard }
    });
  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==================== TABLEAU DE BORD LIVREUR ====================
exports.getLivreurDashboard = async (req, res) => {
  try {
    const livreurId = req.user.id;

    if (req.user.role !== 'livreur') {
      return res.status(403).json({
        status: 'error',
        message: 'Accès réservé aux livreurs'
      });
    }

    console.log(`🚚 Loading livreur dashboard for: ${livreurId}`);

    const [colisStats, mandatsStats, missionsJour, performance, zones, revenusJour, alertes] = await Promise.all([
      // Stats colis
      Colis.aggregate([
        { $match: { livreur: mongoose.Types.ObjectId(livreurId) } },
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
      ]),
      // Stats mandats
      Mandat.aggregate([
        { $match: { coursier_assigné: mongoose.Types.ObjectId(livreurId) } },
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
      ]),
      // Missions du jour
      getMissionsDuJour(livreurId),
      // Performance
      getPerformanceLivreur(livreurId),
      // Zones de livraison
      getZonesLivraison(livreurId),
      // Revenus du jour
      getRevenusDuJour(livreurId),
      // Alertes livreur
      getAlertesLivreur(livreurId)
    ]);

    const dashboard = {
      resume: {
        missions_du_jour: missionsJour.total,
        en_cours: (colisStats[0]?.en_cours || 0) + (mandatsStats[0]?.en_cours || 0),
        revenus_jour: revenusJour,
        total_livraisons: (colisStats[0]?.livres || 0) + (mandatsStats[0]?.livres || 0)
      },
      missions: missionsJour,
      performance,
      zones,
      alertes,
      stats: {
        colis: colisStats[0] || { total: 0, livres: 0, en_cours: 0, revenus_total: 0 },
        mandats: mandatsStats[0] || { total: 0, livres: 0, en_cours: 0, revenus_total: 0 }
      }
    };

    res.status(200).json({
      status: 'success',
      data: { dashboard }
    });
  } catch (error) {
    console.error('❌ Livreur dashboard error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// ==================== FONCTIONS UTILITAIRES ====================

// Fonctions pour le client
async function getProchainesLivraisons(userId) {
  const aujourdhui = new Date();
  return await Colis.find({
    expediteur: userId,
    statut: { $in: ['en_livraison', 'en_transit'] },
    date_livraison_estimee: { $gte: aujourdhui }
  })
  .populate('livreur', 'nom prenom telephone')
  .sort({ date_livraison_estimee: 1 })
  .limit(5);
}

async function getAlertesClient(userId) {
  const colisEnRetard = await Colis.countDocuments({
    expediteur: userId,
    statut: { $in: ['en_livraison', 'en_transit'] },
    date_livraison_estimee: { $lt: new Date() }
  });

  const mandatsAttention = await Mandat.countDocuments({
    client: userId,
    statut: { $in: ['documents_verifies', 'procuration_signee'] },
    createdAt: { $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
  });

  return {
    colis_retard: colisEnRetard,
    mandats_attention: mandatsAttention,
    total: colisEnRetard + mandatsAttention
  };
}

async function getDepensesMensuelles(userId) {
  const debutMois = new Date();
  debutMois.setDate(1);
  debutMois.setHours(0, 0, 0, 0);

  const result = await Colis.aggregate([
    {
      $match: {
        expediteur: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: debutMois }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$tarif.total' },
        moyenne: { $avg: '$tarif.total' }
      }
    }
  ]);

  return result[0] || { total: 0, moyenne: 0 };
}

// Fonctions pour l'admin
async function getPerformanceMetrics() {
  const trenteJours = new Date();
  trenteJours.setDate(trenteJours.getDate() - 30);

  const [colisStats, mandatsStats] = await Promise.all([
    Colis.aggregate([
      { $match: { createdAt: { $gte: trenteJours } } },
      {
        $group: {
          _id: null,
          taux_livraison: {
            $avg: {
              $cond: [{ $eq: ['$statut', 'livre'] }, 1, 0]
            }
          }
        }
      }
    ]),
    Mandat.aggregate([
      { $match: { createdAt: { $gte: trenteJours } } },
      {
        $group: {
          _id: null,
          taux_completion: {
            $avg: {
              $cond: [{ $eq: ['$statut', 'livre'] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  return {
    taux_livraison_colis: ((colisStats[0]?.taux_livraison || 0) * 100).toFixed(1),
    taux_completion_mandats: ((mandatsStats[0]?.taux_completion || 0) * 100).toFixed(1)
  };
}

async function getIndicateursCles() {
  const aujourdhui = new Date();
  const hier = new Date(aujourdhui);
  hier.setDate(hier.getDate() - 1);

  const [
    colisAujourdhui,
    colisHier,
    revenusAujourdhui,
    revenusHier
  ] = await Promise.all([
    Colis.countDocuments({ createdAt: { $gte: new Date().setHours(0,0,0,0) } }),
    Colis.countDocuments({ 
      createdAt: { 
        $gte: new Date(hier).setHours(0,0,0,0),
        $lt: new Date().setHours(0,0,0,0)
      } 
    }),
    Colis.aggregate([
      { $match: { createdAt: { $gte: new Date().setHours(0,0,0,0) } } },
      { $group: { _id: null, total: { $sum: '$tarif.total' } } }
    ]),
    Colis.aggregate([
      { 
        $match: { 
          createdAt: { 
            $gte: new Date(hier).setHours(0,0,0,0),
            $lt: new Date().setHours(0,0,0,0)
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$tarif.total' } } }
    ])
  ]);

  const croissanceColis = colisHier > 0 ? 
    ((colisAujourdhui - colisHier) / colisHier * 100).toFixed(1) : 0;
  
  const croissanceRevenus = revenusHier[0]?.total > 0 ? 
    ((revenusAujourdhui[0]?.total - revenusHier[0]?.total) / revenusHier[0]?.total * 100).toFixed(1) : 0;

  return {
    colis_aujourdhui: colisAujourdhui,
    croissance_colis: croissanceColis,
    revenus_aujourdhui: revenusAujourdhui[0]?.total || 0,
    croissance_revenus: croissanceRevenus
  };
}

async function getAlertesAdmin() {
  const colisProblemes = await Colis.countDocuments({
    statut: { $in: ['en_retard', 'probleme'] }
  });

  const mandatsBloques = await Mandat.countDocuments({
    statut: 'en_attente_documents',
    createdAt: { $lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
  });

  const livreursInactifs = await User.countDocuments({
    role: 'livreur',
    lastActivity: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });

  return {
    colis_problemes: colisProblemes,
    mandats_bloques: mandatsBloques,
    livreurs_inactifs: livreursInactifs,
    total: colisProblemes + mandatsBloques + livreursInactifs
  };
}

// Fonctions pour le livreur
async function getMissionsDuJour(livreurId) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  const [colis, mandats] = await Promise.all([
    Colis.find({
      livreur: livreurId,
      $or: [
        { createdAt: { $gte: aujourdhui } },
        { statut: { $in: ['pris_en_charge', 'en_transit', 'en_livraison'] } }
      ]
    })
    .populate('expediteur', 'nom prenom telephone adresse'),
    
    Mandat.find({
      coursier_assigné: livreurId,
      $or: [
        { createdAt: { $gte: aujourdhui } },
        { statut: { $in: ['en_livraison', 'document_obtenu'] } }
      ]
    })
    .populate('client', 'nom prenom telephone adresse')
    .populate('type_document')
  ]);

  return {
    colis,
    mandats,
    total: colis.length + mandats.length
  };
}

async function getPerformanceLivreur(livreurId) {
  const trenteJours = new Date();
  trenteJours.setDate(trenteJours.getDate() - 30);

  const stats = await Colis.aggregate([
    {
      $match: {
        livreur: mongoose.Types.ObjectId(livreurId),
        createdAt: { $gte: trenteJours }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        livres: {
          $sum: { $cond: [{ $eq: ['$statut', 'livre'] }, 1, 0] }
        },
        revenus: { $sum: '$tarif.frais_livraison' }
      }
    }
  ]);

  const result = stats[0] || { total: 0, livres: 0, revenus: 0 };
  
  return {
    taux_livraison: result.total > 0 ? (result.livres / result.total * 100).toFixed(1) : 0,
    revenus_mensuels: result.revenus,
    efficacite: result.total > 0 ? (result.livres / result.total * 100).toFixed(1) : 0
  };
}

async function getZonesLivraison(livreurId) {
  return await Colis.aggregate([
    {
      $match: {
        livreur: mongoose.Types.ObjectId(livreurId),
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: '$ville_destination',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);
}

async function getRevenusDuJour(livreurId) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  const result = await Colis.aggregate([
    {
      $match: {
        livreur: mongoose.Types.ObjectId(livreurId),
        createdAt: { $gte: aujourdhui }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$tarif.frais_livraison' }
      }
    }
  ]);

  return result[0]?.total || 0;
}

async function getAlertesLivreur(livreurId) {
  const colisUrgents = await Colis.countDocuments({
    livreur: livreurId,
    statut: 'en_retard'
  });

  const mandatsUrgents = await Mandat.countDocuments({
    coursier_assigné: livreurId,
    echeance: { $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
  });

  return {
    colis_urgents: colisUrgents,
    mandats_urgents: mandatsUrgents,
    total: colisUrgents + mandatsUrgents
  };
}

// Fonctions de calcul
function calculateTauxSuccess(colisStats, mandatsStats) {
  const totalColis = colisStats?.total || 0;
  const totalMandats = mandatsStats?.total || 0;
  const totalSuccess = (colisStats?.livres || 0) + (mandatsStats?.completes || 0);
  const totalCommandes = totalColis + totalMandats;

  if (totalCommandes === 0) return 0;
  return ((totalSuccess / totalCommandes) * 100).toFixed(1);
}

function calculateTauxCroissance(activiteRecent) {
  if (activiteRecent.length < 2) return 0;
  
  const recent = activiteRecent[activiteRecent.length - 1];
  const precedent = activiteRecent[activiteRecent.length - 2];
  
  if (!precedent || precedent.revenus === 0) return 0;
  
  return (((recent.revenus - precedent.revenus) / precedent.revenus) * 100).toFixed(1);
}