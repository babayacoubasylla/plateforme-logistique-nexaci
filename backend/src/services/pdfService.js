const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Service de génération de reçus PDF
class PDFService {
  // Générer un reçu pour un colis
  static async generateColisReceipt(colis) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // En-tête
        doc.fontSize(20).text('REÇU DE COLIS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('Plateforme Logistique', { align: 'center' });
        doc.text('Service de livraison de colis', { align: 'center' });
        doc.moveDown(2);

        // Informations du colis
        doc.fontSize(14).text('Informations du colis', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Référence: ${colis.reference}`);
        doc.text(`Date de création: ${colis.createdAt.toLocaleDateString('fr-FR')}`);
        doc.text(`Statut: ${this.getStatusLabel(colis.statut)}`);
        doc.moveDown();

        // Expéditeur
        doc.fontSize(12).text('Expéditeur:', { underline: true });
        doc.fontSize(10);
        doc.text(`${colis.expediteur.nom} ${colis.expediteur.prenom}`);
        doc.text(`${colis.expediteur.email}`);
        doc.text(`${colis.expediteur.telephone}`);
        doc.moveDown();

        // Type de livraison et destination
        doc.fontSize(12).text('Livraison:', { underline: true });
        doc.fontSize(10);
        if (colis.typeLivraison === 'point_relais' && colis.pointRelais) {
          doc.text('Type: Retrait en point relais');
          doc.text(`Point relais: ${colis.pointRelais.nom}`);
          doc.text(`Adresse: ${colis.pointRelais.adresse}, ${colis.pointRelais.ville}`);
          if (colis.pointRelais.telephone) {
            doc.text(`Téléphone: ${colis.pointRelais.telephone}`);
          }
        } else if (colis.destinataire) {
          doc.text('Type: Livraison à domicile');
          doc.text(`Destinataire: ${colis.destinataire.nom}`);
          doc.text(`Adresse: ${colis.destinataire.adresse}`);
          doc.text(`Ville: ${colis.destinataire.ville}`);
          doc.text(`Téléphone: ${colis.destinataire.telephone}`);
        }
        doc.moveDown();

        // Détails du colis
        doc.fontSize(12).text('Détails du colis:', { underline: true });
        doc.fontSize(10);
        doc.text(`Poids: ${colis.details_colis.poids} kg`);
        if (colis.details_colis.description) {
          doc.text(`Description: ${colis.details_colis.description}`);
        }
        doc.moveDown();

        // Tarification
        doc.fontSize(12).text('Tarification:', { underline: true });
        doc.fontSize(10);
        doc.text(`Frais de transport: ${colis.tarif.frais_transport} XOF`);
        if (colis.tarif.frais_assurance) {
          doc.text(`Frais d'assurance: ${colis.tarif.frais_assurance} XOF`);
        }
        doc.text(`Total: ${colis.tarif.total} XOF`, { bold: true });
        doc.moveDown();

        // Méthode de paiement
        doc.fontSize(12).text('Paiement:', { underline: true });
        doc.fontSize(10);
        doc.text(`Méthode: ${this.getPaymentMethodLabel(colis.paiement.methode)}`);
        doc.text(`Statut: ${this.getPaymentStatusLabel(colis.paiement.statut)}`);
        doc.moveDown(2);

        // Pied de page
        doc.fontSize(8).text('Ce reçu est généré automatiquement par le système.', { align: 'center' });
        doc.text('Conservez-le pour votre suivi.', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Générer un reçu pour un mandat
  static async generateMandatReceipt(mandat) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // En-tête
        doc.fontSize(20).text('REÇU DE MANDAT ADMINISTRATIF', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text('Plateforme Logistique', { align: 'center' });
        doc.text('Service de mandats administratifs', { align: 'center' });
        doc.moveDown(2);

        // Informations du mandat
        doc.fontSize(14).text('Informations du mandat', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);
        doc.text(`Référence: ${mandat.reference}`);
        doc.text(`Date de création: ${mandat.createdAt.toLocaleDateString('fr-FR')}`);
        doc.text(`Statut: ${this.getMandatStatusLabel(mandat.statut)}`);
        doc.moveDown();

        // Client
        doc.fontSize(12).text('Client:', { underline: true });
        doc.fontSize(10);
        doc.text(`${mandat.client.nom} ${mandat.client.prenom}`);
        doc.text(`${mandat.client.email}`);
        doc.text(`${mandat.client.telephone}`);
        doc.moveDown();

        // Type de document et administration
        doc.fontSize(12).text('Document demandé:', { underline: true });
        doc.fontSize(10);
        doc.text(`Type: ${mandat.type_document.nom}`);
        doc.text(`Administration: ${mandat.administration.nom} - ${mandat.administration.ville}`);
        doc.moveDown();

        // Informations du document
        doc.fontSize(12).text('Informations du document:', { underline: true });
        doc.fontSize(10);
        doc.text(`Nom complet: ${mandat.informations_document.nom_complet}`);
        if (mandat.informations_document.date_naissance) {
          doc.text(`Date de naissance: ${new Date(mandat.informations_document.date_naissance).toLocaleDateString('fr-FR')}`);
        }
        if (mandat.informations_document.lieu_naissance) {
          doc.text(`Lieu de naissance: ${mandat.informations_document.lieu_naissance}`);
        }
        doc.moveDown();

        // Livraison
        doc.fontSize(12).text('Livraison:', { underline: true });
        doc.fontSize(10);
        doc.text(`Adresse: ${mandat.livraison.adresse}`);
        doc.text(`Ville: ${mandat.livraison.ville}`);
        doc.text(`Téléphone: ${mandat.livraison.telephone}`);
        doc.moveDown();

        // Tarification
        doc.fontSize(12).text('Tarification:', { underline: true });
        doc.fontSize(10);
        doc.text(`Frais administratifs: ${mandat.tarif.frais_administratifs} XOF`);
        doc.text(`Frais de service: ${mandat.tarif.frais_service} XOF`);
        doc.text(`Frais de livraison: ${mandat.tarif.frais_livraison} XOF`);
        doc.text(`Total: ${mandat.tarif.total} XOF`, { bold: true });
        doc.moveDown();

        // Méthode de paiement
        doc.fontSize(12).text('Paiement:', { underline: true });
        doc.fontSize(10);
        doc.text(`Méthode: ${this.getPaymentMethodLabel(mandat.paiement.methode)}`);
        doc.text(`Statut: ${this.getPaymentStatusLabel(mandat.paiement.statut)}`);
        doc.moveDown(2);

        // Pied de page
        doc.fontSize(8).text('Ce reçu est généré automatiquement par le système.', { align: 'center' });
        doc.text('Conservez-le pour votre suivi.', { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Labels pour les statuts
  static getStatusLabel(statut) {
    const labels = {
      'en_attente': 'En attente',
      'en_preparation': 'En préparation',
      'pris_en_charge': 'Pris en charge',
      'en_transit': 'En transit',
      'en_livraison': 'En livraison',
      'livre': 'Livré',
      'echec_livraison': 'Échec de livraison',
      'annule': 'Annulé'
    };
    return labels[statut] || statut;
  }

  static getMandatStatusLabel(statut) {
    const labels = {
      'en_attente': 'En attente',
      'documents_verifies': 'Documents vérifiés',
      'procuration_signee': 'Procuration signée',
      'depose_administration': 'Déposé à l\'administration',
      'en_traitement': 'En traitement',
      'document_obtenu': 'Document obtenu',
      'en_livraison': 'En livraison',
      'livre': 'Livré',
      'annule': 'Annulé',
      'echec': 'Échec'
    };
    return labels[statut] || statut;
  }

  static getPaymentMethodLabel(methode) {
    const labels = {
      'orange_money': 'Orange Money',
      'mtn_money': 'MTN Money',
      'wave': 'Wave',
      'moov_money': 'Moov Money',
      'especes': 'Espèces'
    };
    return labels[methode] || methode;
  }

  static getPaymentStatusLabel(statut) {
    const labels = {
      'en_attente': 'En attente',
      'paye': 'Payé',
      'echec': 'Échec',
      'rembourse': 'Remboursé'
    };
    return labels[statut] || statut;
  }
}

module.exports = PDFService;
