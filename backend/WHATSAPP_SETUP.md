# Guide de Configuration WhatsApp

Ce document explique comment configurer les notifications WhatsApp pour la plateforme logistique.

## 📱 Options Disponibles

### 1. Mode Test (Par défaut - Développement)
Les messages sont affichés dans les logs console uniquement, aucun envoi réel.

```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=test
```

### 2. Twilio WhatsApp API (Recommandé - Production)

**Avantages:**
- Fiable et éprouvé
- Support technique disponible
- Tarifs compétitifs (~$0.005/message)
- Facile à configurer

**Configuration:**

1. Créer un compte sur https://www.twilio.com/
2. Activer WhatsApp dans la console Twilio
3. Obtenir vos identifiants:
   - Account SID
   - Auth Token
   - WhatsApp Number

4. Configurer dans `.env`:
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Test rapide:**
```bash
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json \
  --data-urlencode "From=whatsapp:+14155238886" \
  --data-urlencode "Body=Test message" \
  --data-urlencode "To=whatsapp:+2250700000000" \
  -u YOUR_SID:YOUR_AUTH_TOKEN
```

### 3. Meta WhatsApp Business API

**Avantages:**
- API officielle de WhatsApp
- Gratuit pour les premiers 1000 messages/mois
- Support des templates avancés

**Configuration:**

1. Créer un compte Meta Business: https://business.facebook.com/
2. Configurer WhatsApp Business: https://developers.facebook.com/docs/whatsapp
3. Obtenir:
   - Phone Number ID
   - Access Token

4. Configurer dans `.env`:
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=meta
WHATSAPP_PHONE_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxx
```

**Note:** Nécessite une vérification de compte Meta Business (peut prendre quelques jours).

### 4. API Locale (Orange API, CallR, etc.)

Pour les fournisseurs locaux en Côte d'Ivoire.

**Configuration:**
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=local
LOCAL_WHATSAPP_API_URL=https://api.votre-fournisseur.com/send
LOCAL_WHATSAPP_API_KEY=your_api_key
```

**Adapter le code dans `whatsappService.js`:**
```javascript
async sendViaLocal(to, message) {
  // Adapter selon votre fournisseur
  const response = await axios.post(this.localApiUrl, {
    // Structure spécifique à votre API
  });
}
```

## 🚀 Démarrage Rapide

### En Développement (Mode Test)

Aucune configuration supplémentaire nécessaire. Les notifications s'affichent dans les logs:

```bash
cd backend
npm run dev
```

Quand un colis est créé, vous verrez dans la console:
```
📱 ========== WHATSAPP (TEST) ==========
À: +2250700000001
Message: 🎉 Votre colis a été créé !
📦 Référence: CLS-2025-000001
...
========================================
```

### En Production (Twilio)

1. Obtenir les credentials Twilio
2. Mettre à jour `.env`:
```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

3. Redémarrer le serveur:
```bash
npm run start
```

## 📋 Templates de Messages

Les templates suivants sont disponibles:

- `colis_created` - Notification de création de colis
- `colis_assigned` - Assignation au livreur
- `colis_en_livraison` - Colis en cours de livraison
- `colis_delivered` - Colis livré
- `mandat_created` - Demande de mandat créée
- `mandat_en_traitement` - Mandat en cours de traitement
- `mandat_document_obtenu` - Document obtenu
- `mandat_delivered` - Document livré

## 🧪 Tests

### Test Manuel

1. Créer un colis via l'interface
2. Vérifier les logs console (mode test)
3. Vérifier la réception WhatsApp (mode production)

### Test Programmatique

```javascript
const whatsappService = require('./services/whatsappService');

// Test simple
await whatsappService.send('+2250700000001', 'Test message');

// Test avec template
await whatsappService.sendTemplate('+2250700000001', 'colis_created', {
  reference: 'CLS-2025-TEST',
  montant: 5000,
  destination: 'Abidjan',
  tracking_url: 'http://localhost:5173/tracking?ref=CLS-2025-TEST'
});
```

## 💰 Coûts Estimés

### Twilio
- ~$0.005 par message WhatsApp
- Exemple: 10,000 messages/mois = ~$50/mois

### Meta WhatsApp Business
- Gratuit jusqu'à 1,000 conversations/mois
- Ensuite: ~$0.005-$0.01 par conversation

### Recommandation
Pour démarrer, utilisez **Twilio** (simple et fiable).

## 🔒 Sécurité

- Ne jamais committer les credentials dans Git
- Utiliser `.env` (déjà dans `.gitignore`)
- Renouveler les tokens régulièrement
- Monitorer les logs d'envoi

## 📞 Support

- Twilio: https://www.twilio.com/docs/whatsapp
- Meta: https://developers.facebook.com/docs/whatsapp
- Issues: Créer un ticket sur le projet

## 🔄 Migration SMS → WhatsApp

WhatsApp est recommandé car:
- ✅ Plus économique que les SMS
- ✅ Confirmation de livraison
- ✅ Support multimédia (images, PDF, etc.)
- ✅ Meilleure délivrabilité
- ✅ Expérience utilisateur familière

Pour activer les SMS en parallèle:
```env
SMS_ENABLED=true
SMS_API_KEY=your_sms_key
```
