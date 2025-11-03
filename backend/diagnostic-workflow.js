require('dotenv').config();
const mongoose = require('mongoose');

// Connection avec MongoDB Atlas (production)
// URL corrigée sans le caractère invalide
const MONGO_URI = 'mongodb+srv://babayacoubasylla5:nexacidata05@nexacidata.rkqyy.mongodb.net/nexaci?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connecté'))
  .catch(err => {
    console.error('❌ Erreur MongoDB:', err);
    process.exit(1);
  });

const User = require('./src/models/User');
const Colis = require('./src/models/Colis');
const Agence = require('./src/models/Agence');
const bcrypt = require('bcryptjs');

async function diagnosticComplet() {
  try {
    console.log('\n═══════════════════════════════════════');
    console.log('🔍 DIAGNOSTIC COMPLET DU WORKFLOW');
    console.log('═══════════════════════════════════════\n');
    
    // 1. Vérifier les agences
    const agences = await Agence.find();
    console.log('📍 AGENCES DISPONIBLES:');
    if (agences.length === 0) {
      console.log('  ❌ AUCUNE AGENCE TROUVÉE!');
      process.exit(1);
    }
    agences.forEach(a => console.log(`  ✓ ${a.nom} (${a.ville}) - ID: ${a._id}`));
    
    const agenceParDefaut = agences[0];
    console.log(`\n🏢 Agence par défaut pour assignation: ${agenceParDefaut.nom}`);
    
    // 2. Vérifier les users
    console.log('\n👥 VÉRIFICATION DES USERS:');
    const users = await User.find();
    console.log(`  Total users: ${users.length}`);
    
    let usersModifies = 0;
    for (const user of users) {
      const hasAgence = user.profile?.agence;
      const agenceInfo = hasAgence 
        ? agences.find(a => a._id.toString() === user.profile.agence.toString())?.nom || 'Agence invalide'
        : '❌ AUCUNE';
      
      console.log(`  - ${user.email} (${user.role}) - Agence: ${agenceInfo}`);
      
      // Assigner l'agence par défaut si manquante
      if (!hasAgence && user.role !== 'admin' && user.role !== 'super_admin') {
        user.profile = user.profile || {};
        user.profile.agence = agenceParDefaut._id;
        await user.save();
        usersModifies++;
        console.log(`    ✅ Agence assignée: ${agenceParDefaut.nom}`);
      }
    }
    
    if (usersModifies > 0) {
      console.log(`\n✅ ${usersModifies} user(s) corrigé(s) avec l'agence par défaut`);
    }
    
    // 3. Vérifier les colis
    console.log('\n📦 VÉRIFICATION DES COLIS:');
    const colis = await Colis.find()
      .populate('expediteur', 'email role')
      .populate('agence', 'nom')
      .sort({ createdAt: -1 });
    
    if (colis.length === 0) {
      console.log('  ⚠️ AUCUN COLIS TROUVÉ DANS LA BASE!');
      console.log('  💡 Créez un colis via l\'app mobile pour tester.');
    } else {
      console.log(`  Total colis: ${colis.length}`);
      let colisModifies = 0;
      
      for (const c of colis) {
        const expediteurEmail = c.expediteur?.email || 'Expéditeur supprimé';
        const agenceNom = c.agence?.nom || '❌ AUCUNE';
        console.log(`  - ${c.reference} - Exp: ${expediteurEmail} - Agence: ${agenceNom} - Statut: ${c.statut}`);
        
        // Corriger les colis sans agence
        if (!c.agence && c.expediteur) {
          const expediteur = await User.findById(c.expediteur._id);
          if (expediteur?.profile?.agence) {
            c.agence = expediteur.profile.agence;
            await c.save();
            colisModifies++;
            console.log(`    ✅ Agence assignée depuis expéditeur`);
          }
        }
      }
      
      if (colisModifies > 0) {
        console.log(`\n✅ ${colisModifies} colis corrigé(s)`);
      }
    }
    
    // 4. Test des identifiants
    console.log('\n🔐 TEST DES IDENTIFIANTS:');
    const testAccounts = [
      { email: 'admin@nexaci.com', password: 'Admin123' },
      { email: 'gerant@nexaci.com', password: 'Gerant123' },
      { email: 'client@nexaci.com', password: 'Client123' },
      { email: 'livreur@nexaci.com', password: 'Livreur123' }
    ];
    
    for (const account of testAccounts) {
      const user = await User.findOne({ email: account.email }).select('+password');
      if (user) {
        const passwordCorrect = await bcrypt.compare(account.password, user.password);
        const status = passwordCorrect ? '✅' : '❌';
        console.log(`  ${status} ${account.email} - Password: ${passwordCorrect ? 'OK' : 'INCORRECT'}`);
        
        if (!passwordCorrect) {
          // Corriger le mot de passe
          user.password = account.password;
          await user.save();
          console.log(`    🔧 Mot de passe réinitialisé à: ${account.password}`);
        }
      } else {
        console.log(`  ❌ ${account.email} - COMPTE INEXISTANT`);
      }
    }
    
    // 5. Résumé
    console.log('\n═══════════════════════════════════════');
    console.log('📊 RÉSUMÉ:');
    console.log(`  - ${agences.length} agence(s)`);
    console.log(`  - ${users.length} user(s)`);
    console.log(`  - ${colis.length} colis`);
    console.log(`  - ${usersModifies} user(s) corrigé(s)`);
    console.log('═══════════════════════════════════════\n');
    
    console.log('✅ DIAGNOSTIC TERMINÉ!\n');
    console.log('📌 PROCHAINES ÉTAPES:');
    console.log('  1. Créer un colis via l\'app mobile client');
    console.log('  2. Vérifier qu\'il apparaît dans le dashboard admin');
    console.log('  3. Vérifier qu\'il apparaît dans le dashboard gérant');
    console.log('  4. Assigner un livreur depuis le dashboard gérant');
    console.log('  5. Vérifier que le livreur voit le colis assigné\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    process.exit(1);
  }
}

diagnosticComplet();
