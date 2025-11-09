/**
 * SCRIPT D'URGENCE - CRÉER DES LIVREURS RAPIDEMENT
 * Exécuter: node backend/scripts/create-livreurs-urgence.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Connection MongoDB Atlas
const MONGO_URI = 'mongodb+srv://babayacoubasylla04_db_user:ylkjMrAR6voC8dKL@cluster0.xqscvks.mongodb.net/nexaci?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

const User = require('../src/models/User');
const Agence = require('../src/models/Agence');

async function creerLivreurs() {
  try {
    console.log('\n═══════════════════════════════════════');
    console.log('🚀 CRÉATION RAPIDE DE LIVREURS');
    console.log('═══════════════════════════════════════\n');

    // 1. Récupérer la première agence
    const agence = await Agence.findOne().sort({ createdAt: 1 });
    if (!agence) {
      console.log('❌ AUCUNE AGENCE TROUVÉE! Créez une agence d\'abord.');
      process.exit(1);
    }

    console.log(`🏢 Agence: ${agence.nom} (${agence.ville})`);
    console.log(`   ID: ${agence._id}\n`);

    // 2. Liste des livreurs à créer
    const livreursData = [
      {
        nom: 'Kouassi',
        prenom: 'Yao',
        email: 'yao.kouassi@nexaci.com',
        telephone: '+2250701234567',
        password: 'Livreur123'
      },
      {
        nom: 'Diallo',
        prenom: 'Mamadou',
        email: 'mamadou.diallo@nexaci.com',
        telephone: '+2250702345678',
        password: 'Livreur123'
      },
      {
        nom: 'Bamba',
        prenom: 'Seydou',
        email: 'seydou.bamba@nexaci.com',
        telephone: '+2250703456789',
        password: 'Livreur123'
      }
    ];

    console.log(`📝 Création de ${livreursData.length} livreurs...\n`);

    let created = 0;
    let skipped = 0;

    for (const data of livreursData) {
      // Vérifier si existe déjà
      const existing = await User.findOne({ email: data.email });
      if (existing) {
        console.log(`⚠️  ${data.prenom} ${data.nom} existe déjà (${data.email})`);
        skipped++;
        continue;
      }

      // Créer le livreur
      const livreur = await User.create({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        password: data.password,
        role: 'livreur',
        profile: {
          agence: agence._id,
          statut: 'actif'
        }
      });

      console.log(`✅ ${livreur.prenom} ${livreur.nom} créé!`);
      console.log(`   Email: ${livreur.email}`);
      console.log(`   Téléphone: ${livreur.telephone}`);
      console.log(`   Mot de passe: ${data.password}`);
      console.log(`   Agence: ${agence.nom}`);
      console.log(`   ID: ${livreur._id}\n`);
      created++;
    }

    console.log('═══════════════════════════════════════');
    console.log(`📊 RÉSUMÉ:`);
    console.log(`   ✅ ${created} livreur(s) créé(s)`);
    console.log(`   ⚠️  ${skipped} livreur(s) existant(s)`);
    console.log('═══════════════════════════════════════\n');

    console.log('📋 IDENTIFIANTS DES LIVREURS:\n');
    const allLivreurs = await User.find({ role: 'livreur' })
      .populate('profile.agence', 'nom ville')
      .select('nom prenom email telephone profile.agence profile.statut');
    
    allLivreurs.forEach((l, index) => {
      console.log(`${index + 1}. ${l.prenom} ${l.nom}`);
      console.log(`   📧 Email: ${l.email}`);
      console.log(`   📱 Téléphone: ${l.telephone}`);
      console.log(`   🔑 Mot de passe: Livreur123 (par défaut)`);
      console.log(`   🏢 Agence: ${l.profile?.agence?.nom || 'Non assignée'}`);
      console.log(`   📊 Statut: ${l.profile?.statut || 'N/A'}`);
      console.log('');
    });

    console.log('✅ SCRIPT TERMINÉ!\n');
    console.log('📌 PROCHAINES ÉTAPES:');
    console.log('   1. Actualiser le dashboard gérant (F5)');
    console.log('   2. Ouvrir un colis');
    console.log('   3. Cliquer "Assigner un livreur"');
    console.log('   4. Les livreurs doivent apparaître dans la liste\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
}

creerLivreurs();
