const mongoose = require('mongoose');
require('dotenv').config();

const createGerantWithAgence = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    const User = require('../src/models/User');
    const Agence = require('../src/models/Agence');

    // Trouver l'agence existante
    const agence = await Agence.findOne();
    if (!agence) {
      console.error('❌ Agence non trouvée');
      process.exit(1);
    }

    console.log('📍 Agence trouvée:', agence.nom, '(ID:', agence._id.toString(), ')');

    // Supprimer l'ancien gérant test si existe
    await User.deleteOne({ email: 'gerant.test@example.com' });
    console.log('🧹 Ancien gérant supprimé');

    // Créer le nouveau gérant avec agence
    const gerant = await User.create({
      nom: 'Gérant',
      prenom: 'Test',
      email: 'gerant.test@example.com',
      telephone: '0700000012',
      password: 'Passw0rd!',
      role: 'gerant',
      profile: {
        adresse: 'Angré Val d\'oise, Abidjan',
        ville: 'Abidjan',
        statut: 'actif',
        agence: agence._id.toString() // Assigner l'ID de l'agence
      }
    });

    // Mettre à jour l'agence avec le gérant
    agence.gerant = gerant._id;
    await agence.save();

    console.log('✅ Gérant créé avec succès');
    console.log('\n🔑 IDENTIFIANTS GÉRANT:');
    console.log('===================');
    console.log('Email: gerant.test@example.com');
    console.log('Mot de passe: Passw0rd!');
    console.log('Téléphone: 0700000012');
    console.log('Agence assignée:', agence.nom);
    console.log('Agence ID:', agence._id.toString());

    // Vérifier que l'agence est bien dans le profil
    const verif = await User.findById(gerant._id);
    console.log('\n✅ Vérification profile.agence:', verif.profile.agence);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

createGerantWithAgence();
