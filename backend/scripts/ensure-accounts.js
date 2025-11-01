const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../src/models/User');
const { variants, normalizeCI } = require('../src/utils/phone');

// Liste des comptes à garantir (email/telephone facultatif, pass et rôle requis)
const accounts = [
  {
    nom: 'Client', prenom: 'Un', role: 'client',
    email: 'client1@example.com',
    telephone: '0101010101', // sera normalisé
    password: 'client123',
  },
  {
    nom: 'Livreur', prenom: 'Un', role: 'livreur',
    email: 'livreur1@example.com',
    telephone: '0700000001',
    password: 'livreur123',
  },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    for (const acc of accounts) {
      const email = acc.email?.toLowerCase().trim();
      const telNorm = acc.telephone ? normalizeCI(acc.telephone) : undefined;
      const telVars = telNorm ? variants(telNorm) : [];

      const existing = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(telVars.length ? [{ telephone: { $in: telVars } }] : []),
        ]
      }).select('+password');

      if (existing) {
        // Mettre à jour mot de passe, téléphone normalisé et statut actif
        existing.password = acc.password; // sera hashé par pre-save
        if (telNorm) existing.telephone = telNorm;
        if (email) existing.email = email;
        if (!existing.profile) existing.profile = {};
        existing.profile.statut = 'actif';
        await existing.save();
        console.log(`🔁 Updated: ${email || telNorm} [${acc.role}]`);
      } else {
        // Créer le compte
        const created = await User.create({
          nom: acc.nom,
          prenom: acc.prenom,
          email,
          telephone: telNorm,
          password: acc.password,
          role: acc.role,
          profile: { statut: 'actif' },
        });
        console.log(`✅ Created: ${created.email} (${created.telephone}) [${acc.role}]`);
      }
    }

    // Afficher un récapitulatif
    const emails = accounts.map(a => a.email);
    const summary = await User.find({ email: { $in: emails } });
    console.log('\n📋 Summary:');
    summary.forEach(u => console.log(` - ${u.email} | ${u.telephone} | ${u.role} | statut=${u.profile?.statut}`));

    console.log('\n🎉 Accounts ensured successfully.');
  } catch (e) {
    console.error('❌ Error ensuring accounts:', e);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Connection closed');
  }
})();
