const axios = require('axios');
const API_URL = process.env.API_URL || 'https://nexaci-backend.onrender.com';

async function tryLogin(identifier, password) {
  try {
    const body = identifier.includes('@') ? { email: identifier, password } : { email: identifier, password };
    const resp = await axios.post(`${API_URL}/api/auth/login`, body, { timeout: 60000 });
    const user = resp.data?.data?.user || resp.data?.user;
    console.log(`✅ LOGIN OK: ${identifier} -> role=${user?.role} tel=${user?.telephone}`);
  } catch (e) {
    console.log(`❌ LOGIN FAIL: ${identifier}`, e.response?.status, e.response?.data || e.message);
  }
}

(async () => {
  await tryLogin('client1@example.com', 'client123');
  await tryLogin('livreur1@example.com', 'livreur123');
})();
