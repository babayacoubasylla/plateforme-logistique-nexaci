const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication API...\n');

    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', healthResponse.data.message, '\n');

    // Test 2: Client login
    console.log('2. Testing client login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'client@logistique.ci',
      password: 'client123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Client login successful');
    console.log('   User:', loginResponse.data.data.user.prenom, loginResponse.data.data.user.nom);
    console.log('   Role:', loginResponse.data.data.user.role);
    console.log('   Token received:', token ? 'YES' : 'NO', '\n');

    // Test 3: Get profile with token
    console.log('3. Testing protected route (get profile)...');
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ Profile access successful');
    console.log('   Email:', profileResponse.data.data.user.email, '\n');

    console.log('🎉 ALL AUTH TESTS PASSED!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message);
    } else {
      console.error('   Error:', error.message);
    }
  }
}

testAuth();