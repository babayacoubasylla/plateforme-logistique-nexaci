const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    
    const User = require('./src/models/User');
    const users = await User.find({});
    
    console.log('📋 Users in database:');
    users.forEach(user => {
      console.log(`   - ${user.prenom} ${user.nom} (${user.email}) - ${user.role}`);
    });
    
    console.log(`\n👤 Total: ${users.length} users`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkUsers();