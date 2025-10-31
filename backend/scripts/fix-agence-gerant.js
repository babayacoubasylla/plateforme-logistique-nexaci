require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Agence = require('../src/models/Agence');

async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/logistics_db');
    console.log('Connecté à MongoDB');

    // 1. Lister tous les utilisateurs pour vérification
    const users = await User.find();
    console.log('Utilisateurs disponibles:', users.map(u => u.email));

    // 2. Trouver l'utilisateur Aminata
    const user = await User.findOne({ email: 'gerant@logistique.ci' });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    console.log('Utilisateur trouvé:', user.email);

    // 2. Trouver l'agence
    const agence = await Agence.findOne();
    if (!agence) {
      throw new Error('Aucune agence trouvée');
    }
    console.log('Agence trouvée:', agence.nom);

    // 3. Mettre à jour l'utilisateur
    user.role = 'gerant';
    user.profile = user.profile || {};
    user.profile.agence = agence._id;
    await user.save();
    console.log('Utilisateur mis à jour');

    // 4. Mettre à jour l'agence
    agence.gerant = user._id;
    await agence.save();
    console.log('Agence mise à jour');

    // 5. Vérifier les changements
    const updatedUser = await User.findOne({ email: 'gerant@logistique.ci' }).populate('profile.agence');
    console.log('\nVérification finale:');
    console.log('Utilisateur:', {
      nom: updatedUser.nom,
      prenom: updatedUser.prenom,
      email: updatedUser.email,
      role: updatedUser.role,
      agence: updatedUser.profile.agence ? updatedUser.profile.agence.nom : null
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Déconnexion de MongoDB');
  }
}

main();