const axios = require('axios');
const mongoose = require('mongoose');
const { User, Agence } = require('../src/models');

const API_URL = process.env.API_URL || 'https://nexaci-backend.onrender.com';
const MONGODB_URI = process.env.MONGODB_URI;
const AGENCE_ID = process.env.AGENCE_ID || '690598d202b526204c5abc48';

if (!MONGODB_URI) {
  console.error('Please set MONGODB_URI env var');
  process.exit(1);
}

async function registerUser(rolePrefix) {
  const timestamp = Date.now();
  const nom = `${rolePrefix}Nom`;
  const prenom = `${rolePrefix}Prenom${timestamp}`;
  const email = `${rolePrefix.toLowerCase()}.auto.${timestamp}@example.com`;
  const telephone = `07000${Math.floor(Math.random() * 90000) + 10000}`;
  const password = 'Test1234!';

  const resp = await axios.post(`${API_URL}/api/auth/register`, {
    nom,
    prenom,
    email,
    telephone,
    password,
    role: rolePrefix.toLowerCase()
  }, { timeout: 60000 });

  return { resp, email, password, id: resp.data?.data?.user?.id || resp.data?.user?._id };
}

async function login(email, password) {
  const resp = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { timeout: 60000 });
  const token = resp.data?.data?.token || resp.data?.token;
  return token;
}

async function createColis(token, agenceId) {
    const payload = {
    destinataire: {
      nom: 'Client Dest',
      telephone: '0700012345',
      adresse: 'Rue Exemple',
      ville: 'Abidjan'
    },
    details_colis: {
      poids: 1,
      description: 'Test colis'
    },
    paiement: { methode: 'cash', montant: 1000 },
    typeLivraison: 'domicile',
    agenceId: agenceId
  };
  const resp = await axios.post(`${API_URL}/api/colis`, payload, { headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });
  return resp;
}

(async () => {
  try {
    console.log('API_URL=', API_URL);
    console.log('AGENCE_ID=', AGENCE_ID);

    // Register roles
    const client = await registerUser('Client');
    console.log('Client created:', client.email);
    const livreur = await registerUser('Livreur');
    console.log('Livreur created:', livreur.email);
    const admin = await registerUser('Admin');
    console.log('Admin created:', admin.email);
    const gerant = await registerUser('Gerant');
    console.log('Gerant created:', gerant.email);

    // Connect to MongoDB and assign gerant to agence
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const agence = await Agence.findById(AGENCE_ID);
    if (!agence) {
      console.warn('Agence non trouvée:', AGENCE_ID);
    } else {
      agence.gerant = gerant.id || gerant.resp.data?.data?.user?.id || gerant.resp.data?.user?._id;
      await agence.save();
      await User.findByIdAndUpdate(gerant.id, { 'profile.agence': agence._id });
      console.log('Assigned gerant to agence');
    }

    // Login each
    const clientToken = await login(client.email, client.password);
    console.log('Client token length', clientToken.length);
    const livreurToken = await login(livreur.email, livreur.password);
    console.log('Livreur token length', livreurToken.length);
    const adminToken = await login(admin.email, admin.password);
    console.log('Admin token length', adminToken.length);
    const gerantToken = await login(gerant.email, gerant.password);
    console.log('Gerant token length', gerantToken.length);

    // Tests
    const tests = [];

    // Client: create colis
    try {
      const r = await createColis(clientToken, AGENCE_ID);
      console.log('Client create colis status', r.status);
      tests.push({ name: 'client_create_colis', ok: r.status === 201 });
    } catch (e) {
      console.error('client_create_colis error', e.response?.status, e.response?.data);
      tests.push({ name: 'client_create_colis', ok: false, error: e.response?.data || e.message });
    }

    // Client: get my-colis
    try {
      const r = await axios.get(`${API_URL}/api/colis/my-colis`, { headers: { Authorization: `Bearer ${clientToken}` }, timeout: 60000 });
      console.log('client_my_colis', r.status, 'count=', (r.data?.data?.colis || r.data?.colis || []).length);
      tests.push({ name: 'client_my_colis', ok: r.status === 200 });
    } catch (e) {
      console.error('client_my_colis error', e.response?.status, e.response?.data);
      tests.push({ name: 'client_my_colis', ok: false, error: e.response?.data || e.message });
    }

    // Client: attempt admin endpoint
    try {
      const r = await axios.get(`${API_URL}/api/colis/history/all`, { headers: { Authorization: `Bearer ${clientToken}` }, timeout: 60000 });
      console.log('client_admin_history_all', r.status);
      tests.push({ name: 'client_admin_history_all', ok: false, note: 'Should be denied but returned ' + r.status });
    } catch (e) {
      console.log('client_admin_history_all expected error', e.response?.status);
      tests.push({ name: 'client_admin_history_all', ok: e.response?.status === 403 });
    }

    // Livreur: get assigned
    try {
      const r = await axios.get(`${API_URL}/api/colis/assigned`, { headers: { Authorization: `Bearer ${livreurToken}` }, timeout: 60000 });
      console.log('livreur_assigned', r.status);
      tests.push({ name: 'livreur_assigned', ok: r.status === 200 });
    } catch (e) {
      console.error('livreur_assigned error', e.response?.status, e.response?.data);
      tests.push({ name: 'livreur_assigned', ok: false, error: e.response?.data || e.message });
    }

    // Admin: get history all
    try {
      const r = await axios.get(`${API_URL}/api/colis/history/all`, { headers: { Authorization: `Bearer ${adminToken}` }, timeout: 60000 });
      console.log('admin_history_all', r.status);
      tests.push({ name: 'admin_history_all', ok: r.status === 200 });
    } catch (e) {
      console.error('admin_history_all error', e.response?.status, e.response?.data);
      tests.push({ name: 'admin_history_all', ok: false, error: e.response?.data || e.message });
    }

    // Gerant: test agency endpoints
    try {
      const r1 = await axios.get(`${API_URL}/api/colis/agence/${AGENCE_ID}`, { headers: { Authorization: `Bearer ${gerantToken}` }, timeout: 60000 });
      console.log('gerant_colis_agence', r1.status);
      tests.push({ name: 'gerant_colis_agence', ok: r1.status === 200 });
    } catch (e) {
      console.error('gerant_colis_agence error', e.response?.status, e.response?.data);
      tests.push({ name: 'gerant_colis_agence', ok: false, error: e.response?.data || e.message });
    }

    try {
      const r2 = await axios.get(`${API_URL}/api/agences/${AGENCE_ID}/coursiers`, { headers: { Authorization: `Bearer ${gerantToken}` }, timeout: 60000 });
      console.log('gerant_coursiers_agence', r2.status);
      tests.push({ name: 'gerant_coursiers_agence', ok: r2.status === 200 });
    } catch (e) {
      console.error('gerant_coursiers_agence error', e.response?.status, e.response?.data);
      tests.push({ name: 'gerant_coursiers_agence', ok: false, error: e.response?.data || e.message });
    }

    // Summary
    console.log('\n=== TEST SUMMARY ===');
    tests.forEach(t => console.log(t.name, t.ok ? 'OK' : 'FAIL', t.error ? t.error : ''));

    await mongoose.disconnect();
    console.log('Done');
    process.exit(0);
  } catch (e) {
    console.error('run-api-tests-extended error', e.response?.data || e.message || e);
    process.exit(1);
  }
})();
