const axios = require('axios');
const mongoose = require('mongoose');
const { User, Agence } = require('../src/models');

(async () => {
  try {
    const API_URL = process.env.API_URL || 'https://nexaci-backend.onrender.com';
    const MONGODB_URI = process.env.MONGODB_URI;
    const AGENCE_ID = process.env.AGENCE_ID || '690598d202b526204c5abc48';

    if (!MONGODB_URI) {
      console.error('MONGODB_URI manquante (export MONGODB_URI=...)');
      process.exit(1);
    }

    console.log('API_URL=', API_URL);
    console.log('AGENCE_ID=', AGENCE_ID);

    // 1) Créer un gérant via l'API
    const timestamp = Date.now();
    const nom = 'GerantTest';
    const prenom = `Auto${timestamp}`;
    const email = `gerant.auto.${timestamp}@example.com`;
    const telephone = `07000${Math.floor(Math.random() * 90000) + 10000}`;
    const password = 'Test1234!';

    console.log('=> Création d\'un gérant via l\'API:', { email, telephone });
    const registerResp = await axios.post(`${API_URL}/api/auth/register`, {
      nom,
      prenom,
      email,
      telephone,
      password,
      role: 'gerant'
    }, { timeout: 60000 });

    console.log('Register response status:', registerResp.status);
    const createdUser = registerResp.data?.data?.user || registerResp.data?.user;
    const token = registerResp.data?.data?.token || registerResp.data?.token;
    if (!createdUser) throw new Error('Utilisateur non retourné par l\'API');
    console.log('Utilisateur créé:', createdUser.id || createdUser._id);

    const gerantId = createdUser.id || createdUser._id;

    // 2) connecter à Mongo et assigner l'agence au gérant (et l'inverse)
  console.log('=> Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Mongo connecté');

    const agence = await Agence.findById(AGENCE_ID);
    if (!agence) {
      console.error('Agence non trouvée:', AGENCE_ID);
    } else {
      agence.gerant = gerantId;
      await agence.save();
      console.log('Agence mise à jour avec gerant:', agence._id.toString(), '->', agence.gerant.toString());

      // Mettre à jour le profil du gérant
      await User.findByIdAndUpdate(gerantId, { 'profile.agence': agence._id });
      console.log('Profile du gérant mis à jour');
    }

    // 3) Login en tant que gérant (via /api/auth/login)
  console.log('=> Login en tant que gérant');
  const loginResp = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { timeout: 60000 });
    const loginToken = loginResp.data?.data?.token || loginResp.data?.token || token;
    console.log('Login status:', loginResp.status, 'token length:', (loginToken || '').length);

    const authHeader = { headers: { Authorization: `Bearer ${loginToken}` } };

    // 4) Tester endpoints
    const endpoints = [
      { method: 'get', url: `/api/colis/agence/${AGENCE_ID}`, name: 'colisByAgence' },
      { method: 'get', url: `/api/agences/${AGENCE_ID}/coursiers`, name: 'coursiersByAgence' },
      { method: 'get', url: `/api/colis/history/agence/${AGENCE_ID}`, name: 'colisHistoryByAgence' },
    ];

    for (const ep of endpoints) {
      try {
        console.log(`-> Appel ${ep.name} (${ep.url})`);
        const r = await axios[ep.method](`${API_URL}${ep.url}`, authHeader);
        console.log(`   ${ep.name} OK status=${r.status}. keys:`, Object.keys(r.data || {}).slice(0,10));
      } catch (err) {
        if (err.response) {
          console.error(`   ${ep.name} ERREUR status=${err.response.status}:`, err.response.data);
        } else {
          console.error(`   ${ep.name} ERREUR:`, err.message);
        }
      }
    }

    console.log('Tous les tests terminés. Déconnexion Mongo...');
    await mongoose.disconnect();
    console.log('Script terminé.');
    process.exit(0);
  } catch (error) {
    console.error('Erreur run-api-tests:', error.response?.data || error.message || error);
    process.exit(1);
  }
})();
