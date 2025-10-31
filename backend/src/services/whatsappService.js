// backend/src/services/whatsappService.js
const axios = require('axios');
const { logger } = require('../utils/logger');

/**
 * Service d'envoi de notifications WhatsApp
 * 
 * OPTIONS DE CONFIGURATION:
 * 
 * 1. TWILIO WhatsApp API (Recommandé - Production)
 *    - Créer un compte sur https://www.twilio.com/
 *    - Activer WhatsApp Business API
 *    - Variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
 * 
 * 2. WhatsApp Business API (Meta)
 *    - Pour les grandes entreprises
 *    - Variables: WHATSAPP_BUSINESS_ACCOUNT_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_ID
 * 
 * 3. API Locale (CallR, Orange API Côte d'Ivoire)
 *    - Adapter selon le fournisseur local
 * 
 * 4. Mode Test (Développement)
 *    - Logs seulement, pas d'envoi réel
 */

class WhatsAppService {
  constructor() {
    this.provider = process.env.WHATSAPP_PROVIDER || 'test'; // 'twilio', 'meta', 'local', 'test'
    this.enabled = process.env.WHATSAPP_ENABLED === 'true';
    
    // Configuration Twilio
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886
    
    // Configuration Meta WhatsApp Business
    this.whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;
    this.whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    
    // Configuration locale (Orange API, CallR, etc.)
    this.localApiUrl = process.env.LOCAL_WHATSAPP_API_URL;
    this.localApiKey = process.env.LOCAL_WHATSAPP_API_KEY;
  }

  /**
   * Formater le numéro de téléphone au format international
   * @param {string} phone - Numéro de téléphone (ex: "0700000001", "+2250700000001", "68727493")
   * @returns {string} - Numéro formaté (ex: "+22568727493")
   */
  formatPhoneNumber(phone) {
    if (!phone) return null;
    
    // Nettoyer le numéro (enlever espaces et caractères spéciaux sauf +)
    let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Si commence par +225, retourner tel quel (déjà au bon format)
    if (cleaned.startsWith('+225')) {
      return cleaned;
    }
    
    // Si commence par 225 (sans +), ajouter le +
    if (cleaned.startsWith('225')) {
      return '+' + cleaned;
    }
    
    // Si commence par 0 (numéro local ivoirien 10 chiffres), enlever le 0 et ajouter +225
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '+225' + cleaned.substring(1);
    }
    
    // Si c'est un numéro local à 8 chiffres (sans le 0), ajouter +225
    if (cleaned.length === 8 && !cleaned.startsWith('+')) {
      return '+225' + cleaned;
    }
    
    // Par défaut, ajouter +225 si pas de préfixe
    if (!cleaned.startsWith('+')) {
      return '+225' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Envoyer un message WhatsApp via Twilio
   */
  async sendViaTwilio(to, message) {
    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;
      
      const formattedTo = `whatsapp:${to}`;
      const from = this.twilioWhatsAppNumber;
      
      const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
      
      const response = await axios.post(
        twilioUrl,
        new URLSearchParams({
          From: from,
          To: formattedTo,
          Body: message
        }),
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      logger.info(`✅ WhatsApp envoyé via Twilio à ${to}: ${response.data.sid}`);
      return { success: true, messageId: response.data.sid, provider: 'twilio' };
    } catch (error) {
      logger.error(`❌ Erreur Twilio WhatsApp: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envoyer un message WhatsApp via Meta Business API
   */
  async sendViaMeta(to, message) {
    try {
      const url = `https://graph.facebook.com/v18.0/${this.whatsappPhoneId}/messages`;
      
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: to.replace('+', ''),
          type: 'text',
          text: {
            body: message
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.whatsappAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info(`✅ WhatsApp envoyé via Meta à ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id, provider: 'meta' };
    } catch (error) {
      logger.error(`❌ Erreur Meta WhatsApp: ${error.message}`);
      throw error;
    }
  }

  /**
   * Envoyer via API locale (à adapter selon le fournisseur)
   */
  async sendViaLocal(to, message) {
    try {
      // Adapter cette partie selon votre fournisseur local
      // Exemple pour une API générique
      const response = await axios.post(
        this.localApiUrl,
        {
          phone: to,
          message: message
        },
        {
          headers: {
            'Authorization': `Bearer ${this.localApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info(`✅ WhatsApp envoyé via API locale à ${to}`);
      return { success: true, messageId: response.data.id, provider: 'local' };
    } catch (error) {
      logger.error(`❌ Erreur API locale WhatsApp: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mode test - Log seulement
   */
  async sendViaTest(to, message) {
    logger.info(`📱 [TEST MODE] WhatsApp à ${to}:`);
    logger.info(`   Message: ${message}`);
    console.log('\n📱 ========== WHATSAPP (TEST) ==========');
    console.log(`À: ${to}`);
    console.log(`Message: ${message}`);
    console.log('========================================\n');
    return { success: true, messageId: 'test-' + Date.now(), provider: 'test' };
  }

  /**
   * Méthode principale d'envoi
   * @param {string} to - Numéro de téléphone du destinataire
   * @param {string} message - Contenu du message
   * @returns {Promise<Object>} - Résultat de l'envoi
   */
  async send(to, message) {
    try {
      // Vérifier si le service est activé
      if (!this.enabled) {
        logger.info(`⚠️ WhatsApp désactivé, message non envoyé à ${to}`);
        return { success: false, reason: 'Service désactivé' };
      }

      // Formater le numéro
      const formattedTo = this.formatPhoneNumber(to);
      if (!formattedTo) {
        logger.warn(`⚠️ Numéro de téléphone invalide: ${to}`);
        return { success: false, reason: 'Numéro invalide' };
      }

      // Envoyer selon le provider
      switch (this.provider) {
        case 'twilio':
          if (!this.twilioAccountSid || !this.twilioAuthToken) {
            logger.warn('⚠️ Configuration Twilio manquante');
            return this.sendViaTest(formattedTo, message);
          }
          return await this.sendViaTwilio(formattedTo, message);
        
        case 'meta':
          if (!this.whatsappPhoneId || !this.whatsappAccessToken) {
            logger.warn('⚠️ Configuration Meta manquante');
            return this.sendViaTest(formattedTo, message);
          }
          return await this.sendViaMeta(formattedTo, message);
        
        case 'local':
          if (!this.localApiUrl || !this.localApiKey) {
            logger.warn('⚠️ Configuration API locale manquante');
            return this.sendViaTest(formattedTo, message);
          }
          return await this.sendViaLocal(formattedTo, message);
        
        case 'test':
        default:
          return await this.sendViaTest(formattedTo, message);
      }
    } catch (error) {
      logger.error(`❌ Erreur envoi WhatsApp: ${error.message}`);
      // Ne pas faire échouer l'opération principale si l'envoi échoue
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer un message avec template
   * @param {string} to - Numéro de téléphone
   * @param {string} templateName - Nom du template
   * @param {Object} variables - Variables du template
   */
  async sendTemplate(to, templateName, variables = {}) {
    const templates = {
      // Colis créé
      colis_created: `🎉 Votre colis a été créé !

📦 Référence: {reference}
💰 Montant: {montant} FCFA
📍 Destination: {destination}

Suivez votre colis sur: {tracking_url}

Merci de nous faire confiance ! 🚚`,

      // Colis assigné au livreur
      colis_assigned: `📦 Nouvelle mission !

Référence: {reference}
📍 Livraison: {adresse}
👤 Client: {client_nom} - {client_phone}
💰 Montant: {montant} FCFA

Bonne livraison ! 🚴‍♂️`,

      // Colis en livraison
      colis_en_livraison: `🚚 Votre colis est en cours de livraison !

📦 Référence: {reference}
👤 Livreur: {livreur_nom} - {livreur_phone}

Il devrait arriver bientôt ! ⏰`,

      // Colis livré
      colis_delivered: `✅ Votre colis a été livré !

📦 Référence: {reference}
✓ Livré le: {date_livraison}

Merci pour votre confiance ! 🙏`,

      // Mandat créé
      mandat_created: `🏛️ Votre demande de mandat a été créée !

📋 Référence: {reference}
📄 Document: {type_document}
🏢 Administration: {administration}
💰 Montant: {montant} FCFA

Nous vous tiendrons informé de l'avancement. ⏳`,

      // Mandat en traitement
      mandat_en_traitement: `⚙️ Votre mandat est en cours de traitement

📋 Référence: {reference}
📄 Document: {type_document}
📅 Date prévue: {date_prevue}

Nous travaillons dessus ! 💼`,

      // Mandat document obtenu
      mandat_document_obtenu: `✅ Votre document a été obtenu !

📋 Référence: {reference}
📄 Document: {type_document}
🚚 Livraison en cours

Le coursier va bientôt vous livrer ! 🎉`,

      // Mandat livré
      mandat_delivered: `✅ Votre document a été livré !

📋 Référence: {reference}
✓ Livré le: {date_livraison}

Merci de nous avoir fait confiance ! 🙏`
    };

    const template = templates[templateName];
    if (!template) {
      logger.warn(`⚠️ Template WhatsApp inconnu: ${templateName}`);
      return { success: false, reason: 'Template inconnu' };
    }

    // Remplacer les variables dans le template
    let message = template;
    Object.keys(variables).forEach(key => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), variables[key] || '');
    });

    return await this.send(to, message);
  }
}

// Exporter une instance singleton
module.exports = new WhatsAppService();
