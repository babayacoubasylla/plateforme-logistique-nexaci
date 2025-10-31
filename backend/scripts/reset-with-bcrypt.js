const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const resetWithBcrypt = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    // Supprimer tous les utilisateurs existants
    await mongoose.connection.db.collection('users').deleteMany({});
    console.log('🧹 Old users deleted');

    // Hasher les mots de passe
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const hashedClientPassword = await bcrypt.hash('client123', 12);
    const hashedLivreurPassword = await bcrypt.hash('livreur123', 12);

    // Insérer les nouveaux utilisateurs avec mots de passe hashés
    await mongoose.connection.db.collection('users').insertMany([
      {
        nom: 'Admin',
        prenom: 'Super',
        email: 'superadmin@logistique.ci',
        telephone: '+2250700000000',
        password: hashedAdminPassword,
        role: 'super_admin',
        profile: {
          adresse: 'Siège social, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        },
        date_creation: new Date(),
        date_modification: new Date()
      },
      {
        nom: 'Diallo',
        prenom: 'Fatou',
        email: 'client@logistique.ci',
        telephone: '+2250700000004',
        password: hashedClientPassword,
        role: 'client',
        profile: {
          adresse: 'Cocody, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        },
        date_creation: new Date(),
        date_modification: new Date()
      },
      {
        nom: 'Koné',
        prenom: 'Moussa',
        email: 'livreur@logistique.ci',
        telephone: '+2250700000003',
        password: hashedLivreurPassword,
        role: 'livreur',
        profile: {
          adresse: 'Yopougon, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        },
        date_creation: new Date(),
        date_modification: new Date()
      }
    ]);

    console.log('✅ Users created with properly hashed passwords');
    console.log('\n🔑 TEST NOW WITH:');
    console.log('   Email: client@logistique.ci');
    console.log('   Password: client123');

    // Vérification
    const userCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`\n📊 Total users: ${userCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

resetWithBcrypt();