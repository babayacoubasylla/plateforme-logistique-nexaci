const mongoose = require('mongoose');
require('dotenv').config();

const createFreshUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    // Utiliser le modèle User
    const User = require('../src/models/User');

    // Supprimer les anciens utilisateurs
    await User.deleteMany({});
    console.log('🧹 Old users deleted');

    // Créer de nouveaux utilisateurs - les mots de passe seront hashés automatiquement
    const users = await User.create([
      {
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@logistique.ci',
        telephone: '+2250700000000',
        password: 'admin123', // Sera hashé automatiquement
        role: 'super_admin',
        profile: {
          adresse: 'Siège social, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        }
      },
      {
        nom: 'Client',
        prenom: 'Test',
        email: 'client@logistique.ci',
        telephone: '+2250700000001',
        password: 'client123', // Sera hashé automatiquement
        role: 'client',
        profile: {
          adresse: 'Cocody, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        }
      }
    ]);

    console.log('✅ New users created with automatic password hashing');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('===================');
    console.log('Email: client@logistique.ci');
    console.log('Password: client123');
    console.log('\nEmail: admin@logistique.ci');
    console.log('Password: admin123');

    // Vérification
    const userCount = await User.countDocuments();
    console.log(`\n📊 Total users: ${userCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

createFreshUsers();