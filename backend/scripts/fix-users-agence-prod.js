require('dotenv').config();
const mongoose = require('mongoose');

// Connection avec MongoDB Atlas (production)
const MONGO_URI = 'mongodb+srv://babayacoubasylla5:nexacidata05@nexacidata.rkqyy.mongodb.net/nexaci?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connecté'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

const User = require('../src/models/User');
const Agence = require('../src/models/Agence');

async function corrigerUsersExistants() {
  try {
    console.log('\n═══════════════════════════════════════');
    console.log('🔧 CORRECTION DES USERS EXISTANTS');
    console.log('═══════════════════════════════════════\n');
    
    // 1. Récupérer l'agence par défaut
    const agenceParDefaut = await Agence.findOne().sort({ createdAt: 1 });
    
    if (!agenceParDefaut) {
      console.log('❌ AUCUNE AGENCE TROUVÉE! Créez une agence d\'abord.');
      process.exit(1);
    }
    
    console.log(`🏢 Agence par défaut: ${agenceParDefaut.nom} (${agenceParDefaut.ville})\n`);
    
    // 2. Trouver tous les users SANS agence (sauf admin/super_admin)
    const usersSansAgence = await User.find({
      $or: [
        { 'profile.agence': null },
        { 'profile.agence': { $exists: false } },
        { profile: { $exists: false } }
      ],
      role: { $nin: ['admin', 'super_admin'] }
    });
    
    console.log(`👥 Users sans agence trouvés: ${usersSansAgence.length}\n`);
    
    if (usersSansAgence.length === 0) {
      console.log('✅ Tous les users ont déjà une agence!\n');
      process.exit(0);
    }
    
    // 3. Corriger chaque user
    for (const user of usersSansAgence) {
      console.log(`🔧 Correction: ${user.email} (${user.role})`);
      
      if (!user.profile) {
        user.profile = {};
      }
      user.profile.agence = agenceParDefaut._id;
      
      await user.save();
      console.log(`   ✅ Agence assignée: ${agenceParDefaut.nom}`);
    }
    
    console.log(`\n✅ ${usersSansAgence.length} user(s) corrigé(s)!`);
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
}

corrigerUsersExistants();
