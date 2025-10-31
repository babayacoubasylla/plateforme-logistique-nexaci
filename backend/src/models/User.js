const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Informations de base
  nom: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Veuillez fournir un email valide']
  },
  telephone: {
    type: String,
    required: [true, 'Le numéro de téléphone est obligatoire'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^(225|\+225)?[0-9]{8,10}$/.test(v);
      },
      message: 'Veuillez fournir un numéro de téléphone ivoirien valide'
    }
  },
  
  // Authentification
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [6, 'Le mot de passe doit avoir au moins 6 caractères'],
    select: false
  },
  
  // Rôle et permissions
  role: {
    type: String,
    enum: ['client', 'livreur', 'gerant', 'admin', 'super_admin'],
    default: 'client'
  },
  
  // Profil spécifique selon le rôle
  profile: {
    adresse: String,
    ville: String,
    date_naissance: Date,
    cin: String,
    numero_permis: String,
    agence: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Agence' 
    },
    statut: {
      type: String,
      enum: ['actif', 'inactif', 'suspendu'],
      default: 'actif'
    },
    solde: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: { 
    createdAt: 'date_creation', 
    updatedAt: 'date_modification' 
  }
});

// Middleware pour hacher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode pour vérifier le mot de passe
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Méthode pour vérifier si le mot de passe a changé après émission du JWT
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.date_modification) {
    const changedTimestamp = parseInt(this.date_modification.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Méthode pour obtenir le nom complet
userSchema.methods.getFullName = function() {
  return `${this.prenom} ${this.nom}`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;