// backend/scripts/seed-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const connectDB = require('../src/config/db');
const { User, Colis, Mandat, Agence, DocumentType, Administration } = require('../src/models');

const seedData = async () => {
  try {
    await connectDB();

    // === 1. VIDER LES COLLECTIONS ===
    await User.deleteMany();
    await Agence.deleteMany();
    await DocumentType.deleteMany();
    await Administration.deleteMany();
    console.log('🧹 Base de données vidée');

    // === 2. CRÉER LES TYPES DE DOCUMENTS ===
    const extraitNaissance = await DocumentType.create({
      nom: 'Extrait de naissance',
      description: 'Document officiel attestant de la naissance',
      administration: 'mairie',
      delai_moyen: 5,
      frais_administratifs: 3000,
      documents_requis: ['cni', 'procuration']
    });
    console.log('📄 Type de document créé');

    // === 3. CRÉER LES ADMINISTRATIONS ===
    const mairieAbidjan = await Administration.create({
      nom: 'Mairie du Plateau',
      type: 'mairie',
      adresse: 'Avenue Chardy, Plateau',
      ville: 'Abidjan',
      telephone: '225272020202',
      email: 'mairie.plateau@abidjan.net',
      horaires: '8h-16h',
      jours_ouverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    });
    console.log('🏛️ Administration créée');

    // === 4. CRÉER UN UTILISATEUR GÉRANT ===
    const gerant = await User.create({
      prenom: 'Marc',
      nom: 'Kouassi',
      email: 'gerant@logimandat.ci',
      telephone: '0700000006',
      password: 'gerant123',
      role: 'gerant',
      profile: {
        statut: 'actif',
        solde: 0
      }
    });
    console.log('👤 Gérant créé');

    // === 5. CRÉER L'AGENCE ===
    const agence = await Agence.create({
      nom: 'Agence Plateau',
      code: 'AG001', // ✅ Obligatoire
      adresse: 'Rue 2, Plateau',
      ville: 'Abidjan',
      telephone: '0700000005',
      email: 'plateau@logimandat.ci',
      gérant: gerant._id, // ✅ Obligatoire
      statut: 'active',
      capacite_stock: 100,
      localisation: {
        type: 'Point',
        coordinates: [-3.989, 5.345]
      }
    });
    console.log('🏢 Agence créée');

    // === 6. METTRE À JOUR LE PROFIL DU GÉRANT ===
    gerant.profile.agence = agence._id;
    await gerant.save();
    console.log('🔄 Profil gérant mis à jour');

    // === 7. CRÉER D'AUTRES UTILISATEURS ===
    await User.create({
      prenom: 'Admin',
      nom: 'Super',
      email: 'admin@logimandat.ci',
      telephone: '0700000000',
      password: 'admin123',
      role: 'admin'
    });

    await User.create({
      prenom: 'Jean',
      nom: 'Doe',
      email: 'jean.doe@example.com',
      telephone: '0700000001',
      password: 'client123',
      role: 'client'
    });

    await User.create({
      prenom: 'Client',
      nom: 'Test',
      email: 'client@logistique.ci',
      telephone: '0700000002',
      password: 'client123',
      role: 'client'
    });

    await User.create({
      prenom: 'Livreur',
      nom: 'Demo',
      email: 'livreur@test.com',
      telephone: '0700000003',
      password: 'livreur123',
      role: 'livreur'
    });

    console.log('👥 Utilisateurs créés');

    console.log('\n✅ Seed terminé avec succès !');
    console.log('   - Agence : Agence Plateau (AG001)');
    console.log('   - Gérant : gerant@logimandat.ci / gerant123');
    console.log('   - Admin : admin@logimandat.ci / admin123');
    console.log('   - Client : jean.doe@example.com / client123');
    console.log('   - Livreur : livreur@test.com / livreur123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();