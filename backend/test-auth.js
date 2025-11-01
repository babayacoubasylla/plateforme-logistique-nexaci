const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB\n');

    const tests = [
      // Comptes garantis
      { identifier: 'client1@example.com', password: 'client123' },
      { identifier: 'livreur1@example.com', password: 'livreur123' },
      { identifier: '0101010101', password: 'client123' },
      { identifier: '0700000001', password: 'livreur123' },
      { identifier: '+2250101010101', password: 'client123' },
      { identifier: '+2250700000001', password: 'livreur123' },

      // Comptes web seedés (supposés Passw0rd!)
      { identifier: 'admin.web@example.com', password: 'Passw0rd!' },
      { identifier: 'test.user.web@example.com', password: 'Passw0rd!' },
      { identifier: 'livreur.test@example.com', password: 'Passw0rd!' },
      { identifier: 'gerant.test@example.com', password: 'Passw0rd!' },
    ];

    for (const t of tests) {
      const isEmail = t.identifier.includes('@');
      const query = isEmail 
        ? { email: t.identifier.toLowerCase().trim() }
        : { $or: [
            { telephone: t.identifier },
            { telephone: `+225${t.identifier}` },
            { telephone: t.identifier.startsWith('+225') ? t.identifier : `+225${t.identifier}` },
          ]};

      const user = await User.findOne(query).select('+password');
      
      if (!user) {
        console.log(`❌ User not found: ${t.identifier}`);
        continue;
      }

      const isMatch = await user.correctPassword(t.password, user.password);
      const status = isMatch ? '✅ OK' : '❌ FAIL';
      console.log(`${status} ${t.identifier} (${user.email}) → password match=${isMatch}, statut=${user.profile?.statut}`);
    }

    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  } catch (e) {
    console.error('❌ Error:', e);
    process.exit(1);
  }
})();