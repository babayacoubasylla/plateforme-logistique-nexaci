const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const User = require('../src/models/User');
const Agence = require('../src/models/Agence');

const seedData = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    // Nettoyer la base de données
    await User.deleteMany({});
    await Agence.deleteMany({});
    console.log('🧹 Database cleaned');

    // Créer d'abord le gérant temporaire
    const tempGerant = await User.create({
      nom: 'Traore',
      prenom: 'Aminata',
      email: 'gerant@logistique.ci',
      telephone: '+2250700000002',
      password: 'gerant123',
      role: 'gerant',
      profile: {
        adresse: 'Plateau, Abidjan',
        ville: 'Abidjan',
        statut: 'actif'
      }
    });

    // Créer une agence principale
    const agenceAbidjan = await Agence.create({
      nom: 'Agence Abidjan Plateau',
      code: 'ABJ001',
      adresse: 'Avenue Chardy, Plateau, Abidjan',
      ville: 'Abidjan',
      telephone: '+2252720000001',
      email: 'agence.abidjan@logistique.ci',
      localisation: {
        type: 'Point',
        coordinates: [-4.0080, 5.3204]
      },
      gerant: tempGerant._id,
      capacite_stock: 5000
    });

    console.log('🏢 Agence principale créée');

    // Créer les autres utilisateurs
    const users = [
      {
        nom: 'Admin',
        prenom: 'Super',
        email: 'superadmin@test.com',
        telephone: '+2250700000000',
        password: 'password123',
        role: 'super_admin',
        profile: {
          adresse: 'Siège social, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        }
      },
      {
        nom: 'Kouassi',
        prenom: 'Jean',
        email: 'admin@logistique.ci',
        telephone: '+2250700000001',
        password: 'admin123',
        role: 'admin',
        profile: {
          adresse: 'Plateau, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        }
      },
      {
        nom: 'Koné',
        prenom: 'Moussa',
        email: 'livreur@logistique.ci',
        telephone: '+2250700000003',
        password: 'livreur123',
        role: 'livreur',
        profile: {
          adresse: 'Yopougon, Abidjan',
          ville: 'Abidjan',
          agence: agenceAbidjan._id,
          numero_permis: 'PERMIS12345',
          statut: 'actif',
          solde: 0
        }
      },
      {
        nom: 'Diallo',
        prenom: 'Fatou',
        email: 'client@logistique.ci',
        telephone: '+2250700000004',
        password: 'client123',
        role: 'client',
        profile: {
          adresse: 'Cocody, Abidjan',
          ville: 'Abidjan',
          statut: 'actif'
        }
      }
    ];

    // Créer tous les autres utilisateurs
    for (const userData of users) {
      await User.create(userData);
    }

    // Mettre à jour le gérant avec l'agence
    tempGerant.profile.agence = agenceAbidjan._id;
    await tempGerant.save();

    console.log('👥 Utilisateurs de test créés:');
    console.log(`   - Super Admin: superadmin@logistique.ci (+2250700000000)`);
    console.log(`   - Admin: admin@logistique.ci`);
    console.log(`   - Gérant: gerant@logistique.ci`);
    console.log(`   - Livreur: livreur@logistique.ci`);
    console.log(`   - Client: client@logistique.ci`);
    console.log('');
    console.log('🔑 Mots de passe: admin123 / gerant123 / livreur123 / client123');
    console.log('');
    console.log('✅ Données initiales créées avec succès!');

    // Vérification
    const userCount = await User.countDocuments();
    console.log(`📊 Total users in database: ${userCount}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Exécuter le script
seedData();