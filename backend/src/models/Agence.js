const mongoose = require('mongoose');

const agenceSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de l\'agence est obligatoire'],
    trim: true
  },
  code: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  adresse: {
    type: String,
    required: true
  },
  ville: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  email: String,
  localisation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  gerant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  statut: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  horaires: {
    lundi: { ouverture: String, fermeture: String },
    mardi: { ouverture: String, fermeture: String },
    // ... jusqu'à dimanche
  },
  capacite_stock: {
    type: Number,
    default: 100 // nombre max de colis stockables
  }
}, {
  timestamps: true
});

agenceSchema.index({ localisation: '2dsphere' });

module.exports = mongoose.model('Agence', agenceSchema);