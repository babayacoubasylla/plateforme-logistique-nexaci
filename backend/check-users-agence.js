require('dotenv').config();
const mongoose = require('mongoose');

// Connection
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

const User = require('./src/models/User');
const Colis = require('./src/models/Colis');
const Agence = require('./src/models/Agence');

async function checkData() {
  try {
    console.log('\n🔍 VÉRIFICATION DES DONNÉES:\n');
    
    // 1. Vérifier les agences
    const agences = await Agence.find();
    console.log('📍 AGENCES:');
    agences.forEach(a => console.log(`  - ${a.nom} (${a.ville}) - ID: ${a._id}`));
    
    // 2. Vérifier les users et leurs agences
    const users = await User.find().select('nom prenom email role profile.agence');
    console.log('\n👥 USERS:');
    for (const u of users) {
      const agenceInfo = u.profile?.agence 
        ? agences.find(a => a._id.toString() === u.profile.agence.toString())?.nom || `ID: ${u.profile.agence}`
        : '❌ AUCUNE';
      console.log(`  - ${u.email} (${u.role}) - Agence: ${agenceInfo}`);
    }
    
    // 3. Vérifier les colis
    const colis = await Colis.find()
      .populate('expediteur', 'email')
      .populate('agence', 'nom')
      .select('reference expediteur agence statut');
    console.log('\n📦 COLIS:');
    if (colis.length === 0) {
      console.log('  ⚠️ AUCUN COLIS TROUVÉ!');
    } else {
      colis.forEach(c => console.log(`  - ${c.reference} - Exp: ${c.expediteur?.email || 'N/A'} - Agence: ${c.agence?.nom || '❌ AUCUNE'} - Statut: ${c.statut}`));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkData();
