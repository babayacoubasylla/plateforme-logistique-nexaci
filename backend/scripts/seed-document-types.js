// Script pour créer les types de documents ivoiriens dans la base de données
const mongoose = require('mongoose');
const { DocumentType, Administration } = require('../src/models');

// Configuration de connexion MongoDB - URI de production
const mongoUri = 'mongodb+srv://babayacoubasylla04_db_user:ylkjMrAR6voC8dKL@cluster0.xqscvks.mongodb.net/nexaci?retryWrites=true&w=majority&appName=Cluster0';

async function seedDocumentTypes() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté');

    // Types de documents ivoiriens
    const documentTypes = [
      {
        nom: 'Extrait de naissance',
        description: 'Document officiel de l\'état civil ivoirien',
        administration: 'mairie',
        delai_moyen: 3,
        frais_administratifs: 2500,
        delai_traitement: '2-3 jours',
        documents_requis: ['Copie CNI du demandeur', 'Acte de naissance des parents (si disponible)'],
        actif: true
      },
      {
        nom: 'Acte de naissance',
        description: 'Copie intégrale de l\'acte de naissance',
        administration: 'mairie',
        delai_moyen: 4,
        frais_administratifs: 3500,
        delai_traitement: '3-5 jours',
        documents_requis: ['Copie CNI du demandeur', 'Procuration si tiers'],
        actif: true
      },
      {
        nom: 'Certificat de nationalité',
        description: 'Justificatif de nationalité ivoirienne',
        administration: 'prefecture',
        delai_moyen: 6,
        frais_administratifs: 5000,
        delai_traitement: '5-7 jours',
        documents_requis: ['Extrait de naissance', 'CNI', 'Acte de naissance des parents'],
        actif: true
      },
      {
        nom: 'Acte de mariage',
        description: 'Copie de l\'acte de mariage',
        administration: 'mairie',
        delai_moyen: 4,
        frais_administratifs: 4000,
        delai_traitement: '3-5 jours',
        documents_requis: ['CNI des époux', 'Extrait de naissance des époux'],
        actif: true
      },
      {
        nom: 'Acte de décès',
        description: 'Copie de l\'acte de décès',
        administration: 'mairie',
        delai_moyen: 3,
        frais_administratifs: 3000,
        delai_traitement: '2-4 jours',
        documents_requis: ['CNI du demandeur', 'Justificatif de lien familial'],
        actif: true
      },
      {
        nom: 'Casier judiciaire',
        description: 'Extrait du casier judiciaire',
        administration: 'tribunal',
        delai_moyen: 4,
        frais_administratifs: 2000,
        delai_traitement: '3-5 jours',
        documents_requis: ['CNI originale', 'Demande manuscrite'],
        actif: true
      },
      {
        nom: 'Certificat de résidence',
        description: 'Attestation de domicile',
        administration: 'mairie',
        delai_moyen: 2,
        frais_administratifs: 1500,
        delai_traitement: '1-2 jours',
        documents_requis: ['CNI', 'Justificatif de domicile'],
        actif: true
      },
      {
        nom: 'Légalisation de documents',
        description: 'Légalisation de signatures ou documents',
        administration: 'mairie',
        delai_moyen: 2,
        frais_administratifs: 1000,
        delai_traitement: '1-3 jours',
        documents_requis: ['Document original', 'CNI du signataire'],
        actif: true
      }
    ];

    // Supprimer les anciens types (pour éviter les doublons)
    await DocumentType.deleteMany({});
    console.log('🗑️ Anciens types supprimés');

    // Insérer les nouveaux types
    const createdTypes = await DocumentType.insertMany(documentTypes);
    console.log(`✅ ${createdTypes.length} types de documents créés:`);
    
    createdTypes.forEach((type, index) => {
      console.log(`   ${index + 1}. ${type.nom} - ${type.frais_administratifs} FCFA (${type.delai_traitement})`);
    });

    // Créer quelques administrations ivoiriennes exemple
    const administrations = [
      {
        nom: 'Mairie de Cocody',
        type: 'mairie',
        ville: 'Abidjan',
        telephone: '+225 27 22 44 26 86',
        email: 'contact@mairie-cocody.ci',
        adresse: 'Cocody, Angré 8ème tranche',
        actif: true
      },
      {
        nom: 'Mairie de Plateau',
        type: 'mairie',
        ville: 'Abidjan',
        telephone: '+225 27 20 21 75 45',
        email: 'contact@mairie-plateau.ci',
        adresse: 'Plateau, Boulevard de la République',
        actif: true
      },
      {
        nom: 'Mairie de Yopougon',
        type: 'mairie',
        ville: 'Abidjan',
        telephone: '+225 27 23 45 67 89',
        email: 'contact@mairie-yopougon.ci',
        adresse: 'Yopougon, Sicogi 2000',
        actif: true
      },
      {
        nom: 'Mairie de Bouaké',
        type: 'mairie',
        ville: 'Bouaké',
        telephone: '+225 27 31 63 42 18',
        email: 'contact@mairie-bouake.ci',
        adresse: 'Bouaké Centre',
        actif: true
      },
      {
        nom: 'Tribunal de Première Instance d\'Abidjan',
        type: 'tribunal',
        ville: 'Abidjan',
        telephone: '+225 27 20 32 85 47',
        email: 'contact@tribunal-abidjan.ci',
        adresse: 'Plateau, Avenue Chardy',
        actif: true
      },
      {
        nom: 'Préfecture d\'Abidjan',
        type: 'prefecture',
        ville: 'Abidjan',
        telephone: '+225 27 20 21 10 10',
        email: 'contact@prefecture-abidjan.ci',
        adresse: 'Plateau, Boulevard de la République',
        actif: true
      }
    ];

    // Supprimer les anciennes administrations
    await Administration.deleteMany({});
    console.log('🗑️ Anciennes administrations supprimées');

    // Insérer les nouvelles administrations
    const createdAdmins = await Administration.insertMany(administrations);
    console.log(`✅ ${createdAdmins.length} administrations créées:`);
    
    createdAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.nom} - ${admin.ville} (${admin.region})`);
    });

    console.log('\n🎉 Base de données peuplée avec succès!');
    console.log('\n📱 L\'app mobile peut maintenant récupérer les types de documents et administrations.');

  } catch (error) {
    console.error('❌ Erreur lors du peuplement:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnexion MongoDB');
  }
}

// Exécuter le script
seedDocumentTypes();