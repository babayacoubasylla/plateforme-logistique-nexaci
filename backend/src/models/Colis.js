// backend/src/models/Colis.js
const mongoose = require('mongoose');

const colisSchema = new mongoose.Schema({
  reference: { type: String, unique: true, required: true },
  expediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destinataire: {
    nom: String,
    telephone: String,
    email: String,
    adresse: String,
    ville: String,
    localisation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: [Number],
      repères: String
    }
  },
  pointRelais: { type: mongoose.Schema.Types.ObjectId, ref: 'Agence' },
  typeLivraison: { type: String, enum: ['domicile', 'point_relais'], default: 'domicile' },
  details_colis: {
    poids: { type: Number, required: true, min: 0.1 },
    dimensions: { longueur: Number, largeur: Number, hauteur: Number },
    description: String,
    valeur_declaree: Number,
    type: { type: String, enum: ['document', 'paquet', 'fragile', 'alimentaire', 'autre'], default: 'paquet' }
  },
  tarif: {
    frais_transport: Number,
    frais_assurance: { type: Number, default: 0 },
    taxe: { type: Number, default: 0 },
    total: Number
  },
  // Livreur assigné (optionnel)
  livreur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  statut: {
    type: String,
    enum: ['en_attente','en_preparation','pris_en_charge','en_transit','en_livraison','livre','echec_livraison','annule'],
    default: 'en_attente'
  },
  // --- CORRECTION ICI ---
  paiement: {
    methode: { type: String, enum: ['cash', 'orange_money','mtn_money','wave','moov_money','especes'], required: true }, // Ajout de 'cash'
    statut: { type: String, enum: ['en_attente','paye','echec','rembourse'], default: 'en_attente' },
    transaction_id: String,
    date_paiement: Date
  },
  photos: [{
    url: String,
    nom_fichier: String,
    date_upload: { type: Date, default: Date.now }
  }],
  // --- FIN CORRECTION ---
  historique: [{
    statut: String,
    description: String,
    date: { type: Date, default: Date.now },
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

colisSchema.pre('validate', async function(next) {
  if (this.isNew && !this.reference) {
    try {
      const year = new Date().getFullYear();
      const count = await mongoose.model('Colis').countDocuments();
      this.reference = `CLS-${year}-${(count + 1).toString().padStart(6, '0')}`;
    } catch (error) {
      this.reference = `CLS-${new Date().getFullYear()}-${Date.now()}`;
    }
  }
  next();
});

colisSchema.pre('save', function(next) {
  if (this.isNew) {
    this.historique.push({ statut: this.statut, description: 'Colis créé', date: new Date() });
  }
  next();
});

module.exports = mongoose.model('Colis', colisSchema);
