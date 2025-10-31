// backend/src/services/notificationService.js
const whatsappService = require('./whatsappService');
const { logger } = require('../utils/logger');

/**
 * Service central de gestion des notifications
 * Gère l'envoi de notifications via différents canaux (WhatsApp, SMS, Email)
 */
class NotificationService {
  constructor() {
    this.enableWhatsApp = process.env.WHATSAPP_ENABLED === 'true';
    this.enableSMS = process.env.SMS_ENABLED === 'true';
    this.enableEmail = process.env.EMAIL_ENABLED === 'true';
  }

  /**
   * Notifier la création d'un colis
   */
  async notifyColisCreated(colis) {
    try {
      const destinataire = colis.destinataire;
      if (!destinataire || !destinataire.telephone) {
        logger.warn('⚠️ Destinataire sans numéro de téléphone');
        return;
      }
      const destination = colis.typeLivraison === 'domicile'
        ? `${destinataire.ville}`
        : `Point relais: ${colis.pointRelais?.nom || 'N/A'}`;
      await whatsappService.sendTemplate(destinataire.telephone, 'colis_created', {
        reference: colis.reference,
        montant: colis.tarif.total,
        destination: destination,
        tracking_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tracking?ref=${colis.reference}`
      });
    } catch (error) {
      logger.error(`❌ Erreur notification colis créé: ${error.message}`);
    }
  }

  /**
   * Notifier l'assignation d'un livreur à un colis
   */
  async notifyColisAssigned(colis, livreur) {
    try {
      if (!livreur || !livreur.telephone) {
        logger.warn('⚠️ Livreur sans numéro de téléphone');
        return;
      }

      const adresse = colis.typeLivraison === 'domicile'
        ? `${colis.destinataire.adresse}, ${colis.destinataire.ville}`
        : `Point relais: ${colis.pointRelais?.nom || 'N/A'}`;

      const clientNom = colis.expediteur 
        ? `${colis.expediteur.prenom || ''} ${colis.expediteur.nom || ''}`
        : 'Client';

      await whatsappService.sendTemplate(livreur.telephone, 'colis_assigned', {
        reference: colis.reference,
        adresse: adresse,
        client_nom: clientNom,
        client_phone: colis.expediteur?.telephone || 'N/A',
        montant: colis.tarif.total
      });
    } catch (error) {
      logger.error(`❌ Erreur notification assignation: ${error.message}`);
    }
  }

  /**
   * Notifier le changement de statut d'un colis
   */
  async notifyColisStatusChanged(colis, newStatus) {
    try {
      const destinataire = colis.destinataire;
      // Notifier selon le statut
      switch (newStatus) {
        case 'en_livraison':
          if (destinataire && destinataire.telephone && colis.livreur) {
            await whatsappService.sendTemplate(destinataire.telephone, 'colis_en_livraison', {
              reference: colis.reference,
              livreur_nom: `${colis.livreur.prenom || ''} ${colis.livreur.nom || ''}`,
              livreur_phone: colis.livreur.telephone || 'N/A',
              tracking_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tracking?ref=${colis.reference}`
            });
          }
          break;

        case 'livre':
          if (destinataire && destinataire.telephone) {
            await whatsappService.sendTemplate(destinataire.telephone, 'colis_delivered', {
              reference: colis.reference,
              date_livraison: new Date().toLocaleDateString('fr-FR'),
              tracking_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/tracking?ref=${colis.reference}`
            });
          }
          break;

        case 'echec_livraison':
          if (destinataire && destinataire.telephone) {
            await whatsappService.send(
              destinataire.telephone,
              `⚠️ Échec de livraison pour votre colis ${colis.reference}.\n\nNous allons réessayer. Pour plus d'infos, contactez-nous.\nSuivi: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/tracking?ref=${colis.reference}`
            );
          }
          break;
      }
    } catch (error) {
      logger.error(`❌ Erreur notification changement statut: ${error.message}`);
    }
  }

  /**
   * Notifier la création d'un mandat
   */
  async notifyMandatCreated(mandat) {
    try {
      const client = mandat.client;
      if (!client || !client.telephone) {
        logger.warn('⚠️ Client sans numéro de téléphone');
        return;
      }

      await whatsappService.sendTemplate(client.telephone, 'mandat_created', {
        reference: mandat.reference,
        type_document: mandat.type_document?.nom || 'N/A',
        administration: mandat.administration?.nom || 'N/A',
        montant: mandat.tarif.total
      });
    } catch (error) {
      logger.error(`❌ Erreur notification mandat créé: ${error.message}`);
    }
  }

  /**
   * Notifier l'assignation d'un coursier à un mandat
   */
  async notifyMandatAssigned(mandat, coursier) {
    try {
      if (!coursier || !coursier.telephone) {
        logger.warn('⚠️ Coursier sans numéro de téléphone');
        return;
      }

      const clientNom = mandat.client 
        ? `${mandat.client.prenom || ''} ${mandat.client.nom || ''}`
        : 'Client';

      await whatsappService.send(
        coursier.telephone,
        `📋 Nouveau mandat assigné !\n\nRéférence: ${mandat.reference}\n📄 Document: ${mandat.type_document?.nom || 'N/A'}\n🏢 Administration: ${mandat.administration?.nom || 'N/A'}\n👤 Client: ${clientNom} - ${mandat.client?.telephone || 'N/A'}\n📍 Livraison: ${mandat.livraison?.adresse || 'N/A'}, ${mandat.livraison?.ville || 'N/A'}\n\nBonne mission ! 🚴‍♂️`
      );
    } catch (error) {
      logger.error(`❌ Erreur notification assignation mandat: ${error.message}`);
    }
  }

  /**
   * Notifier le changement de statut d'un mandat
   */
  async notifyMandatStatusChanged(mandat, newStatus) {
    try {
      const client = mandat.client;
      
      switch (newStatus) {
        case 'en_traitement':
          if (client && client.telephone) {
            const datePrevue = mandat.date_obtention_prevue 
              ? new Date(mandat.date_obtention_prevue).toLocaleDateString('fr-FR')
              : 'À déterminer';
            
            await whatsappService.sendTemplate(client.telephone, 'mandat_en_traitement', {
              reference: mandat.reference,
              type_document: mandat.type_document?.nom || 'N/A',
              date_prevue: datePrevue
            });
          }
          break;

        case 'document_obtenu':
          if (client && client.telephone) {
            await whatsappService.sendTemplate(client.telephone, 'mandat_document_obtenu', {
              reference: mandat.reference,
              type_document: mandat.type_document?.nom || 'N/A'
            });
          }
          break;

        case 'en_livraison':
          if (client && client.telephone && mandat.coursier_assigné) {
            await whatsappService.send(
              client.telephone,
              `🚚 Votre document est en cours de livraison !\n\n📋 Référence: ${mandat.reference}\n👤 Coursier: ${mandat.coursier_assigné.prenom || ''} ${mandat.coursier_assigné.nom || ''} - ${mandat.coursier_assigné.telephone || 'N/A'}\n\nIl devrait arriver bientôt ! ⏰`
            );
          }
          break;

        case 'livre':
          if (client && client.telephone) {
            await whatsappService.sendTemplate(client.telephone, 'mandat_delivered', {
              reference: mandat.reference,
              date_livraison: new Date().toLocaleDateString('fr-FR')
            });
          }
          break;

        case 'echec':
          if (client && client.telephone) {
            await whatsappService.send(
              client.telephone,
              `⚠️ Échec pour votre mandat ${mandat.reference}.\n\nContactez-nous pour plus d'informations.`
            );
          }
          break;
      }
    } catch (error) {
      logger.error(`❌ Erreur notification changement statut mandat: ${error.message}`);
    }
  }

  /**
   * Envoyer une notification personnalisée
   */
  async sendCustomNotification(phone, message) {
    try {
      if (this.enableWhatsApp) {
        return await whatsappService.send(phone, message);
      }
      logger.info(`ℹ️ Notifications désactivées - Message non envoyé à ${phone}`);
      return { success: false, reason: 'Notifications désactivées' };
    } catch (error) {
      logger.error(`❌ Erreur notification personnalisée: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService();
