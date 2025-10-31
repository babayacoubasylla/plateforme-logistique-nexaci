const mongoose = require('mongoose');
require('dotenv').config();

// Charger les modèles
require('../src/models/User');
require('../src/models/Agence');

const verifyData = async () => {
  try {
    console.log('🔍 Verifying database data...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');

    const User = mongoose.model('User');
    const Agence = mongoose.model('Agence');

    // Vérifier les agences
    const agencies = await Agence.find();
    console.log('\n🏢 AGENCIES:');
    agencies.forEach(agence => {
      console.log(`   - ${agence.nom} (${agence.ville})`);
    });

    // Vérifier les utilisateurs
    const users = await User.find();
    console.log('\n👥 USERS:');
    users.forEach(user => {
      console.log(`   - ${user.prenom} ${user.nom} (${user.email}) - ${user.role}`);
    });

    console.log('\n📊 SUMMARY:');
    console.log(`   Agencies: ${agencies.length}`);
    console.log(`   Users: ${users.length}`);

    // Test de connexion pour un utilisateur
    console.log('\n🧪 TESTING AUTHENTICATION:');
    const testUser = await User.findOne({ email: 'client@logistique.ci' }).select('+password');
    if (testUser) {
      console.log(`   ✅ User found: ${testUser.email}`);
      console.log(`   ✅ Password hash exists: ${testUser.password ? 'YES' : 'NO'}`);
      console.log(`   ✅ User active: ${testUser.profile.statut === 'actif' ? 'YES' : 'NO'}`);
    } else {
      console.log('   ❌ Test user not found');
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Verification complete');
  }
};

verifyData();