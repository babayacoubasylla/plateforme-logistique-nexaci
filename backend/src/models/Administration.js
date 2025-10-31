const mongoose = require('mongoose');

const administrationSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom de l\'administration est obligatoire'],
    unique: true
  },
  type: {
    type: String,
    required: [true, 'Le type est obligatoire'],
    enum: ['mairie', 'tribunal', 'prefecture', 'consulat', 'autre']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est obligatoire']
  },
  ville: {
    type: String,
    required: [true, 'La ville est obligatoire']
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est obligatoire']
  },
  email: String,
  horaires: String,
  jours_ouverture: [{
    type: String,
    enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  }],
  localisation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  contact_responsable: {
    nom: String,
    telephone: String,
    email: String
  },
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

administrationSchema.index({ localisation: '2dsphere' });

module.exports = mongoose.model('Administration', administrationSchema);