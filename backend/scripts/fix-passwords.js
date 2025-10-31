const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    // Utiliser le modèle User existant
    const User = require('../src/models/User');

    // Liste des utilisateurs à mettre à jour
    const usersToUpdate = [
      {
        email: 'superadmin@logistique.ci',
        newPassword: 'admin123'
      },
      {
        email: 'client@logistique.ci', 
        newPassword: 'client123'
      },
      {
        email: 'livreur@logistique.ci',
        newPassword: 'livreur123'
      }
    ];

    for (const userData of usersToUpdate) {
      // Trouver l'utilisateur
      const user = await User.findOne({ email: userData.email });
      
      if (user) {
        // Mettre à jour le mot de passe (le middleware pre-save le hash automatiquement)
        user.password = userData.newPassword;
        await user.save();
        console.log(`✅ Password updated for: ${user.email}`);
      } else {
        console.log(`❌ User not found: ${userData.email}`);
      }
    }

    console.log('\n🎉 All passwords updated!');
    console.log('🔑 Login credentials:');
    console.log('   superadmin@logistique.ci / admin123');
    console.log('   client@logistique.ci / client123');
    console.log('   livreur@logistique.ci / livreur123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

fixPasswords();