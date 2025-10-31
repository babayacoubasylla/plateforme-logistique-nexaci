const { MongoClient } = require('mongodb');
require('dotenv').config();

const emergencyReset = async () => {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('plateforme-logistique');
    
    // Supprimer toute la base
    await db.dropDatabase();
    console.log('✅ Database dropped');
    
    console.log('🎉 Emergency reset complete!');
    console.log('Now run: npm run db:seed');
    
  } catch (error) {
    console.error('❌ Emergency reset failed:', error);
  } finally {
    await client.close();
  }
};

emergencyReset();