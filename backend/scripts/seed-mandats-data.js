const mongoose = require('mongoose');
require('dotenv').config();

const seedMandatsData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/plateforme-logistique');
    console.log('✅ Connected to MongoDB');

    const DocumentType = require('../src/models/DocumentType');
    const Administration = require('../src/models/Administration');

    // Nettoyer les anciennes données
    await DocumentType.deleteMany({});
    await Administration.deleteMany({});
    console.log('🧹 Old data cleaned');

    // Types de documents
    const documentTypes = await DocumentType.insertMany([
      {
        nom: 'Extrait de naissance',
        description: 'Copie intégrale ou extrait d\'acte de naissance',
        administration: 'mairie',
        delai_moyen: 7,
        frais_administratifs: 1000,
        documents_requis: ['CNI', 'Procuration']
      },
      {
        nom: 'Casier judiciaire',
        description: 'Bulletin n°3 du casier judiciaire',
        administration: 'tribunal',
        delai_moyen: 15,
        frais_administratifs: 2000,
        documents_requis: ['CNI', 'Procuration', 'Photo identité']
      },
      {
        nom: 'Certificat de nationalité ivoirienne',
        description: 'Certificat de nationalité',
        administration: 'tribunal',
        delai_moyen: 30,
        frais_administratifs: 5000,
        documents_requis: ['CNI', 'Extrait de naissance', 'Procuration']
      },
      {
        nom: 'Acte de mariage',
        description: 'Copie intégrale d\'acte de mariage',
        administration: 'mairie',
        delai_moyen: 7,
        frais_administratifs: 1500,
        documents_requis: ['CNI', 'Procuration']
      }
    ]);
    console.log('📄 Document types created:', documentTypes.length);

    // Administrations (Mairies d'Abidjan)
    const administrations = await Administration.insertMany([
      {
        nom: 'Mairie du Plateau',
        type: 'mairie',
        adresse: 'Avenue Chardy, Plateau',
        ville: 'Abidjan',
        telephone: '+2252720001001',
        email: 'mairie.plateau@abidjan.ci',
        horaires: '7h30 - 15h30',
        jours_ouverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
        localisation: {
          type: 'Point',
          coordinates: [-4.0080, 5.3204]
        },
        contact_responsable: {
          nom: 'M. Koné',
          telephone: '+2250700001001'
        }
      },
      {
        nom: 'Mairie de Cocody',
        type: 'mairie',
        adresse: 'Boulevard de France, Cocody',
        ville: 'Abidjan',
        telephone: '+2252720001002',
        email: 'mairie.cocody@abidjan.ci',
        horaires: '7h30 - 15h30',
        jours_ouverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
        localisation: {
          type: 'Point',
          coordinates: [-3.9890, 5.3593]
        },
        contact_responsable: {
          nom: 'Mme Traoré',
          telephone: '+2250700001002'
        }
      },
      {
        nom: 'Tribunal de Première Instance d\'Abidjan',
        type: 'tribunal',
        adresse: 'Plateau, Abidjan',
        ville: 'Abidjan',
        telephone: '+2252720002001',
        horaires: '8h00 - 16h00',
        jours_ouverture: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'],
        localisation: {
          type: 'Point',
          coordinates: [-4.0150, 5.3250]
        }
      }
    ]);
    console.log('🏢 Administrations created:', administrations.length);

    console.log('\n🎉 MANDATS DATA SEEDED SUCCESSFULLY!');
    console.log('==================================');
    console.log('Available document types:');
    documentTypes.forEach(doc => {
      console.log(`   - ${doc.nom} (${doc.frais_administratifs} FCFA)`);
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📦 Connection closed');
  }
};

seedMandatsData();