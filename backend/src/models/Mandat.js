// backend/src/models/Mandat.js
const mongoose = require('mongoose');

const mandatSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type_document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DocumentType',
    required: true
  },
  administration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Administration',
    required: true
  },
  // Informations pour le document
  informations_document: {
    nom_complet: {
      type: String,
      required: true
    },
    date_naissance: Date,
    lieu_naissance: String,
    nom_pere: String,
    nom_mere: String,
    // Autres champs selon le type de document
    donnees_specifiques: mongoose.Schema.Types.Mixed
  },
  // Documents uploadés
  documents: [{
    type_document: String, // 'cni', 'procuration', 'photo', etc.
    nom_fichier: String,
    url: String,
    date_upload: {
      type: Date,
      default: Date.now
    }
  }],
  // Tarification
  tarif: {
    frais_administratifs: Number,
    frais_service: Number,
    frais_livraison: Number,
    total: Number
  },
  // Statut et suivi
  statut: {
    type: String,
    enum: [
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
    ],
    default: 'en_attente'
  },
  // --- CORRECTION ICI ---
  // Paiement
  paiement: {
    methode: {
      type: String,
      enum: ['cash', 'orange_money', 'mtn_money', 'wave', 'moov_money', 'especes'], // Ajout de 'cash'
      required: true
    },
    statut: {
      type: String,
      enum: ['en_attente', 'paye', 'echec', 'rembourse'],
      default: 'en_attente'
    },
    transaction_id: String,
    date_paiement: Date
  },
  // --- FIN CORRECTION ---
  // Livraison
  livraison: {
    adresse: String,
    ville: String,
    telephone: String,
    instructions: String
  },
  // Historique
  historique: [{
    statut: String,
    description: String,
    date: {
      type: Date,
      default: Date.now
    },
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: mongoose.Schema.Types.Mixed
  }],
  // Dates importantes
  date_depot: Date,
  date_obtention_prevue: Date,
  date_obtention_reelle: Date,
  date_livraison_prevue: Date,
  date_livraison_reelle: Date,
  // Assignation
  coursier_assigné: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes_internes: String
}, {
  timestamps: true
});

// ==================== MIDDLEWARE CORRIGÉ ====================

// Génération de référence AVANT validation
mandatSchema.pre('validate', async function(next) {
  if (this.isNew && !this.reference) {
    try {
      console.log('🔧 Generating reference for new mandat...');
      
      const date = new Date();
      const year = date.getFullYear();
      
      let count;
      try {
        count = await mongoose.model('Mandat').countDocuments();
        console.log(`📊 Current mandat count: ${count}`);
      } catch (error) {
        console.log('⚠️  Count failed, using fallback');
        count = 0;
      }
      
      this.reference = `MAND-${year}-${(count + 1).toString().padStart(6, '0')}`;
      console.log(`✅ Reference generated: ${this.reference}`);
      
    } catch (error) {
      console.error('❌ Reference generation error:', error);
      // Fallback avec timestamp
      this.reference = `MAND-${new Date().getFullYear()}-${Date.now()}`;
    }
  }
  next();
});

// Historique APRÈS validation
mandatSchema.pre('save', function(next) {
  if (this.isNew) {
    // S'assurer que l'historique existe
    if (!this.historique) {
      this.historique = [];
    }
    
    this.historique.push({
      statut: this.statut,
      description: 'Mandat créé',
      date: new Date()
    });
    
    console.log(`📝 Added initial history for mandat: ${this.reference}`);
  }
  next();
});

// ==================== MÉTHODES ====================

// Méthode pour mettre à jour le statut avec historique
mandatSchema.methods.updateStatus = function(newStatut, description, utilisateurId) {
  this.statut = newStatut;
  this.historique.push({
    statut: newStatut,
    description: description,
    date: new Date(),
    utilisateur: utilisateurId
  });
};

// Méthode pour ajouter un document
mandatSchema.methods.addDocument = function(type, nomFichier, url) {
  this.documents.push({
    type_document: type,
    nom_fichier: nomFichier,
    url: url,
    date_upload: new Date()
  });
};

// Méthode pour calculer le délai restant
mandatSchema.methods.getDelaiRestant = function() {
  if (!this.date_obtention_prevue) return null;
  
  const maintenant = new Date();
  const delaiMs = this.date_obtention_prevue - maintenant;
  return Math.ceil(delaiMs / (1000 * 60 * 60 * 24)); // Jours restants
};

// ==================== INDEX ====================

mandatSchema.index({ reference: 1 });
mandatSchema.index({ client: 1 });
mandatSchema.index({ statut: 1 });
mandatSchema.index({ createdAt: -1 });
mandatSchema.index({ 'livraison.ville': 1 });

// ==================== VIRTUELS ====================

// Virtuel pour le statut lisible
mandatSchema.virtual('statut_lisible').get(function() {
  const statuts = {
    'en_attente': 'En attente',
    'documents_verifies': 'Documents vérifiés',
    'procuration_signee': 'Procuration signée',
    'depose_administration': 'Déposé à l\'administration',
    'en_traitement': 'En traitement',
    'document_obtenu': 'Document obtenu',
    'en_livraison': 'En livraison',
    'livre': 'Livré',
    'annule': 'Annulé',
    'echec': 'Échec'
  };
  return statuts[this.statut] || this.statut;
});

// Virtuel pour le total des frais
mandatSchema.virtual('total_frais').get(function() {
  if (this.tarif && this.tarif.total) {
    return this.tarif.total;
  }
  return (this.tarif?.frais_administratifs || 0) + 
         (this.tarif?.frais_service || 0) + 
         (this.tarif?.frais_livraison || 0);
});

// ==================== CONFIGURATION ====================

// Inclure les virtuels dans les JSON
mandatSchema.set('toJSON', { virtuals: true });
mandatSchema.set('toObject', { virtuals: true });

const Mandat = mongoose.model('Mandat', mandatSchema);

module.exports = Mandat;
