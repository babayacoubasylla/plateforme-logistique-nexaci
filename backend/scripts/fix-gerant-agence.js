// backend/scripts/fix-gerant-agence.js
// Force l'assignation du gérant à l'agence (et réciproquement)
const mongoose = require('mongoose');
const { User, Agence } = require('../src/models');

const GERANT_ID = '690605f4d9050cc39e00b928'; // id du gérant
const AGENCE_ID = '690598d202b526204c5abc48'; // id de l'agence

async function main() {

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Erreur : la variable d\'environnement MONGODB_URI n\'est pas définie.');
    process.exit(1);
  }
  await mongoose.connect(uri);

  // 1. Mettre à jour le champ gerant de l'agence
  const agence = await Agence.findByIdAndUpdate(
    AGENCE_ID,
    { gerant: GERANT_ID },
    { new: true }
  );
  if (!agence) {
    console.error('Agence non trouvée');
    process.exit(1);
  }
  // 2. Mettre à jour le profil du gérant
  await User.findByIdAndUpdate(
    GERANT_ID,
    { 'profile.agence': AGENCE_ID },
    { new: true }
  );
  console.log('Assignation corrigée :', { agence: agence._id, gerant: agence.gerant });
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
