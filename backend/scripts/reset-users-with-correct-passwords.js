const mongoose = require('mongoose');
require('dotenv').config();

const resetUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    const User = require('../src/models/User');

    // Supprimer tous les anciens utilisateurs
    await User.deleteMany({});
    console.log('🧹 All old users deleted');

    // Créer les nouveaux utilisateurs avec les mots de passe documentés
    const users = await User.create([
      {
        nom: 'Admin',
        prenom: 'Web',
        email: 'admin.web@example.com',
        telephone: '0700000010',
        password: 'Passw0rd!',
        role: 'admin',
        profile: {
          adresse: 'Siège social, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        }
      },
      {
        nom: 'Test',
        prenom: 'User',
        email: 'test.user.web@example.com',
        telephone: '0700000009',
        password: 'Passw0rd!',
        role: 'client',
        profile: {
          adresse: 'Cocody, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        }
      },
      {
        nom: 'Livreur',
        prenom: 'Test',
        email: 'livreur.test@example.com',
        telephone: '0700000011',
        password: 'Passw0rd!',
        role: 'livreur',
        profile: {
          adresse: 'Yopougon, Abidjan',
          ville: 'Abidjan',
          statut: 'actif',
          numero_permis: 'CI123456789'
        }
      }
    ]);

    console.log('✅ New users created successfully!');
    console.log('\n🔑 IDENTIFIANTS DE CONNEXION:');
    console.log('='.repeat(60));
    console.log('\n📱 MOBILE CLIENT & WEB CLIENT:');
    console.log('Email: test.user.web@example.com');
    console.log('Téléphone: 0700000009');
    console.log('Mot de passe: Passw0rd!');
    console.log('Rôle: client');
    
    console.log('\n📱 MOBILE LIVREUR:');
    console.log('Email: livreur.test@example.com');
    console.log('Téléphone: 0700000011');
    console.log('Mot de passe: Passw0rd!');
    console.log('Rôle: livreur');
    
    console.log('\n🌐 WEB ADMIN:');
    console.log('Email: admin.web@example.com');
    console.log('Téléphone: 0700000010');
    console.log('Mot de passe: Passw0rd!');
    console.log('Rôle: admin');
    
    console.log('\n' + '='.repeat(60));

    const userCount = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

resetUsers();
