const axios = require('axios');

const API_URL = 'https://nexaci-backend.onrender.com';

async function testLogin(identifier, password) {
  try {
    console.log(`\n🔍 Testing login: ${identifier}`);
    const body = { email: identifier, password };
    
    const resp = await axios.post(`${API_URL}/api/auth/login`, body, { 
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const user = resp.data?.data?.user || resp.data?.user;
    console.log(`✅ LOGIN SUCCESS: ${identifier}`);
    console.log(`   Role: ${user?.role}`);
    console.log(`   Email: ${user?.email}`);
    console.log(`   Téléphone: ${user?.telephone}`);
    console.log(`   Token reçu: ${resp.data?.data?.token ? 'OUI' : 'NON'}`);
    return true;
  } catch (e) {
    console.log(`❌ LOGIN FAILED: ${identifier}`);
    console.log(`   Status: ${e.response?.status || 'NO_RESPONSE'}`);
    console.log(`   Message: ${e.response?.data?.message || e.message}`);
    if (e.response?.data) {
      console.log(`   Full response:`, JSON.stringify(e.response.data, null, 2));
    }
    return false;
  }
}

(async () => {
  console.log('🚀 Testing production API:', API_URL);
  
  // Test health first
  try {
    const health = await axios.get(`${API_URL}/health`, { timeout: 10000 });
    console.log('✅ Backend is UP:', health.data);
  } catch (e) {
    console.log('❌ Backend health check failed:', e.message);
  }

  await testLogin('client1@example.com', 'client123');
  await testLogin('livreur1@example.com', 'livreur123');
  await testLogin('0101010101', 'client123');
  await testLogin('0700000001', 'livreur123');
})();
