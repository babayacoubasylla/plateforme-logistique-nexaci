const mongoose = require('mongoose');
require('dotenv').config();

// Connexion simple
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return false;
  }
};

// Définition directe du schéma User
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'livreur', 'gerant', 'admin', 'super_admin'], default: 'client' },
  profile: {
    adresse: String,
    ville: String,
    statut: { type: String, default: 'actif' }
  }
}, { timestamps: true });

// Création du modèle
const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  const connected = await connectDB();
  if (!connected) return;

  try {
    // Nettoyer les utilisateurs existants
    await User.deleteMany({});
    console.log('🧹 Old users deleted');

    // Créer les utilisateurs de test
    const users = [
      {
        nom: 'Admin',
        prenom: 'Super',
        email: 'superadmin@logistique.ci',
        telephone: '+2250700000000',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/eoOM3lKskvP7sW9JO', // admin123
        role: 'super_admin',
        profile: { adresse: 'Siège social, Abidjan', ville: 'Abidjan' }
      },
      {
        nom: 'Diallo',
        prenom: 'Fatou', 
        email: 'client@logistique.ci',
        telephone: '+2250700000004',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/eoOM3lKskvP7sW9JO', // client123
        role: 'client',
        profile: { adresse: 'Cocody, Abidjan', ville: 'Abidjan' }
      },
      {
        nom: 'Koné',
        prenom: 'Moussa',
        email: 'livreur@logistique.ci',
        telephone: '+2250700000003',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/eoOM3lKskvP7sW9JO', // livreur123
        role: 'livreur',
        profile: { adresse: 'Yopougon, Abidjan', ville: 'Abidjan' }
      }
    ];

    // Insérer les utilisateurs
    await User.insertMany(users);
    console.log('✅ Test users created');

    // Vérifier
    const userCount = await User.countDocuments();
    console.log(`📊 Total users: ${userCount}`);

    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('===================');
    console.log('Email: client@logistique.ci');
    console.log('Password: client123');
    console.log('\nEmail: superadmin@logistique.ci'); 
    console.log('Password: admin123');
    console.log('\n🚀 Ready to test!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

// Exécuter
seedUsers();