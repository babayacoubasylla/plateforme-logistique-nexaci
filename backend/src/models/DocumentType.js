const mongoose = require('mongoose');

const documentTypeSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom du document est obligatoire'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire']
  },
  administration: {
    type: String,
    required: [true, 'L\'administration est obligatoire'],
    enum: ['mairie', 'tribunal', 'prefecture', 'consulat', 'autre']
  },
  delai_moyen: {
    type: Number,
    required: [true, 'Le délai moyen est obligatoire'],
    min: 1
  },
  frais_administratifs: {
    type: Number,
    required: [true, 'Les frais administratifs sont obligatoires'],
    min: 0
  },
  documents_requis: [{
    type: String,
    required: true
  }],
  actif: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DocumentType', documentTypeSchema);