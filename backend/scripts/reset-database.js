// backend/scripts/reset-database.js
const mongoose = require('mongoose');
require('dotenv').config();

// Enregistrement manuel des modèles
require('../src/models/User');
require('../src/models/Agence');
require('../src/models/Colis');
require('../src/models/DocumentType');
require('../src/models/Administration');

const resetDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    // Nettoyer toutes les collections
    console.log('🧹 Cleaning database...');
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
      console.log(`   ✅ Cleared collection: ${collection.collectionName}`);
    }

    // === CRÉER UN GÉRANT TEMPORAIRE (pour satisfaire la validation de l'agence) ===
    const User = mongoose.model('User');
    const gerantTemp = await User.create({
      nom: 'Gérant',
      prenom: 'Temporaire',
      email: 'temp@logistique.ci',
      telephone: '+2250700000099',
      password: 'temp123',
      role: 'gerant',
      profile: {
        adresse: 'Plateau, Abidjan',
        ville: 'Abidjan',
        statut: 'actif'
      }
    });
    console.log('   ✅ Gérant temporaire créé');

    // === CRÉER L'AGENCE PRINCIPALE (avec les champs obligatoires) ===
    const Agence = mongoose.model('Agence');
    const agenceAbidjan = await Agence.create({
      nom: 'Agence Abidjan Plateau',
      code: 'AG001', // ✅ OBLIGATOIRE
      adresse: 'Avenue Chardy, Plateau, Abidjan',
      ville: 'Abidjan',
      telephone: '+2252720000001',
      email: 'agence.abidjan@logistique.ci',
      gérant: gerantTemp._id, // ✅ OBLIGATOIRE
      statut: 'active',
      capacite_stock: 5000,
      localisation: {
        type: 'Point',
        coordinates: [-4.0080, 5.3204]
      }
    });
    console.log('   ✅ Agency created:', agenceAbidjan.nom);

    // === CRÉER LES UTILISATEURS DÉFINITIFS ===
    const usersData = [
      {
        nom: 'Admin',
        prenom: 'Super',
        email: 'superadmin@logistique.ci',
        telephone: '+2250700000000',
        password: 'admin123',
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
        nom: 'Traore',
        prenom: 'Aminata',
        email: 'gerant@logistique.ci',
        telephone: '+2250700000002',
        password: 'gerant123',
        role: 'gerant',
        profile: {
          adresse: 'Plateau, Abidjan',
          ville: 'Abidjan',
          agence: agenceAbidjan._id,
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

    const users = [];
    for (const userData of usersData) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`   ✅ User created: ${user.prenom} ${user.nom} (${user.email})`);
    }

    // === METTRE À JOUR LE GÉRANT TEMPORAIRE → GÉRANT DÉFINITIF ===
    const gerantDefinitif = users.find(u => u.email === 'gerant@logistique.ci');
    agenceAbidjan.gérant = gerantDefinitif._id;
    await agenceAbidjan.save();
    
    // Mettre à jour le profil du gérant avec l'agence
    gerantDefinitif.profile.agence = agenceAbidjan._id;
    await gerantDefinitif.save();
    
    // Supprimer le gérant temporaire
    await User.findByIdAndDelete(gerantTemp._id);
    console.log('   ✅ Gérant temporaire supprimé, agence mise à jour');

    // === CRÉER LES DONNÉES DE BASE (DocumentType, Administration) ===
    const DocumentType = mongoose.model('DocumentType');
    await DocumentType.create({
      nom: 'Extrait de naissance',
      description: 'Document officiel attestant de la naissance',
      administration: 'mairie',
      delai_moyen: 5,
      frais_administratifs: 3000,
      documents_requis: ['cni', 'procuration'],
      actif: true
    });

    const Administration = mongoose.model('Administration');
    await Administration.create({
      nom: 'Mairie du Plateau',
      type: 'mairie',
      adresse: 'Avenue Chardy, Plateau',
      ville: 'Abidjan',
      telephone: '225272020202',
      email: 'mairie.plateau@abidjan.net',
      actif: true
    });
    console.log('   ✅ Données de base créées');

    // === RÉSUMÉ ===
    const userCount = await User.countDocuments();
    const agenceCount = await Agence.countDocuments();
    
    console.log('\n🎉 DATABASE RESET COMPLETE!');
    console.log('========================');
    console.log(`📊 Users: ${userCount}`);
    console.log(`🏢 Agencies: ${agenceCount}`);
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('===================');
    console.log('Super Admin: superadmin@logistique.ci / admin123');
    console.log('Admin: admin@logistique.ci / admin123');
    console.log('Gérant: gerant@logistique.ci / gerant123');
    console.log('Livreur: livreur@logistique.ci / livreur123');
    console.log('Client: client@logistique.ci / client123');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    console.error('Stack:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Database connection closed');
  }
};

resetDatabase();