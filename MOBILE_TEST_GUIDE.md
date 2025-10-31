# 🧪 Guide de Test - Applications Mobiles

## Configuration Initiale

### 1. Vérifier l'IP Backend
```bash
# Windows
ipconfig

# Rechercher "Adresse IPv4" (ex: 192.168.1.70)
```

### 2. Mettre à jour les apps
Modifier `extra.API_URL` dans:
- `mobile-client/app.json`
- `mobile-livreur/app.json`

```json
"extra": {
  "API_URL": "http://192.168.1.70:5000"
}
```

### 3. Démarrer le Backend
```bash
cd backend
npm run dev
```

Vérifier: `✓ Serveur démarré sur le port 5000`

## 📱 Test Mobile Client

### Démarrage
```bash
cd mobile-client
npm start
```

### Scénario de Test

#### 1. Connexion Client
- Scanner le QR code avec Expo Go
- Email: `client@test.com`
- Password: `password123`
- ✅ Doit rediriger vers Dashboard

#### 2. Créer un Colis (Domicile)
- Dashboard → "Nouveau Colis"
- Remplir:
  - Nom destinataire: `Jean Kouassi`
  - Téléphone: `0768727493`
  - Adresse: `Cocody, Abidjan`
- Décocher "Point relais"
- Cliquer "Créer le colis"
- ✅ Message "Colis créé"
- ✅ Vérifier logs backend: "WhatsApp sent via Twilio"

#### 3. Créer un Colis (Point Relais)
- Dashboard → "Nouveau Colis"
- Cocher "Livraison en point relais"
- Remplir destinataire (nom + téléphone requis)
- L'adresse n'est plus obligatoire
- ✅ Doit créer sans erreur

#### 4. Voir Mes Colis
- Dashboard → "Mes Colis"
- ✅ Liste des colis créés
- ✅ Pull-to-refresh fonctionne
- ✅ Affiche référence, statut, destinataire

## 🚚 Test Mobile Livreur

### Démarrage
```bash
cd mobile-livreur
npm start
```

### Scénario de Test

#### 1. Connexion Livreur
- Scanner le QR code avec Expo Go
- Email: `livreur@test.com`
- Password: `password123`
- ✅ Doit rediriger vers Dashboard
- ✅ Message: "Bonjour [Nom] 👋"

#### 2. Voir Mes Livraisons
- Dashboard → "Accéder" (Mes Livraisons)
- ✅ Liste des colis assignés au livreur
- ✅ Badges couleur par statut:
  - 🟠 Orange: En attente
  - 🔵 Bleu: En transit
  - 🟣 Violet: En livraison
  - 🟢 Vert: Livré
  - 🔴 Rouge: Échec

#### 3. Détails d'un Colis
- Cliquer sur un colis
- ✅ Affiche infos complètes:
  - Référence, statut, mode
  - Destinataire (nom, tél, adresse)
  - Expéditeur
  - Point relais (si applicable)

#### 4. Mettre à Jour le Statut
- Sur un colis "en_transit"
- Ajouter commentaire (optionnel): `Départ pour livraison`
- Cliquer "🚚 Démarrer la livraison"
- Confirmer
- ✅ Message "Statut mis à jour: en_livraison"
- ✅ Vérifier logs backend: "WhatsApp sent" (notif destinataire)
- ✅ Page rafraîchie, boutons mis à jour

#### 5. Marquer comme Livré
- Cliquer "✅ Marquer comme livré"
- Confirmer
- ✅ Statut final: "✅ Colis livré"
- ✅ Boutons d'action désactivés

#### 6. Signaler un Échec
- Sur un autre colis
- Ajouter commentaire: `Destinataire absent`
- Cliquer "❌ Signaler un échec"
- ✅ Statut: "échec"
- ✅ Notification envoyée

## 🔗 Vérifier l'Interconnexion

### Backend → Mobile (GET)
1. Client ouvre "Mes Colis"
2. Backend reçoit: `GET /api/colis/my-colis`
3. Vérifier logs backend: `GET /api/colis/my-colis 200`

### Mobile → Backend (POST)
1. Client crée un colis
2. Backend reçoit: `POST /api/colis`
3. Vérifier logs: `Nouveau colis créé: COL-xxxxx`

### Backend → WhatsApp
1. Après création/statut
2. Vérifier logs: `WhatsApp sent via Twilio: SMxxxxx`
3. Destinataire reçoit message (si dans sandbox Twilio)

### Cycle Complet
```
Client (Mobile)
  ↓ POST /api/colis
Backend (Node)
  ↓ Save MongoDB
  ↓ POST Twilio API
WhatsApp
  ↓ Message
Destinataire (📱)

Admin/Gérant (Web)
  ↓ Assign livreur
Backend
  ↓ Update DB
  ↓ POST Twilio
Livreur (Mobile)
  ↓ GET /api/colis/assigned
  ↓ PATCH /api/colis/:id/status
Backend
  ↓ POST Twilio
Destinataire (📱) ← Notification statut
```

## ✅ Checklist Complète

### Mobile Client
- [ ] Connexion réussie
- [ ] Création colis domicile
- [ ] Création colis point relais
- [ ] Liste colis rafraîchie
- [ ] Notifications WhatsApp reçues

### Mobile Livreur
- [ ] Connexion livreur uniquement
- [ ] Liste colis assignés
- [ ] Détails complets affichés
- [ ] Statut "en_livraison" OK
- [ ] Statut "livré" OK
- [ ] Statut "échec" OK
- [ ] Commentaires enregistrés
- [ ] Notifications destinataire envoyées

### Backend
- [ ] Tous les endpoints répondent
- [ ] JWT auth fonctionne
- [ ] Logs WhatsApp "sent via Twilio"
- [ ] Base de données mise à jour

### WhatsApp (Twilio)
- [ ] Destinataire a rejoint sandbox
- [ ] Numéros formatés: +22568727493
- [ ] Messages "delivered" dans console Twilio

## 🐛 Problèmes Courants

### "Network Error"
```bash
# Vérifier backend
curl http://192.168.1.70:5000/api/health

# Vérifier IP dans app.json
grep API_URL mobile-*/app.json
```

### "Unauthorized"
- Token expiré → Se reconnecter
- Vérifier JWT_SECRET dans backend/.env

### "WhatsApp not received"
1. Numéro dans sandbox ? → Envoyer "join [code]" au numéro Twilio
2. Format correct ? → Logs backend doivent montrer +225XXXXXXXX
3. Twilio console → Vérifier status du message

### "Colis assignés vides"
```bash
# Via MongoDB Compass ou CLI
db.colis.updateOne(
  { reference: "COL-001" },
  { $set: { livreur_assigne: ObjectId("id_du_livreur") } }
)
```

## 📊 Données de Test

### Créer un livreur (si manquant)
```javascript
// Backend: scripts/create-livreur.js
const User = require('../src/models/User');
await User.create({
  nom: 'Kouadio',
  prenom: 'Yao',
  email: 'livreur@test.com',
  password: 'password123',
  role: 'livreur',
  telephone: '0123456789'
});
```

### Assigner un colis au livreur
Via l'interface web admin ou:
```javascript
const colis = await Colis.findOne({ reference: 'COL-001' });
const livreur = await User.findOne({ email: 'livreur@test.com' });
colis.livreur_assigne = livreur._id;
colis.statut = 'en_transit';
await colis.save();
```

## 🎯 Objectif Final

✅ **Client** crée un colis depuis son téléphone
✅ **Backend** enregistre et notifie via WhatsApp
✅ **Admin** assigne un livreur (web ou API)
✅ **Livreur** voit le colis sur son téléphone
✅ **Livreur** met à jour le statut
✅ **Destinataire** reçoit notification à chaque étape
✅ **Client** suit son colis en temps réel

## 📞 Support

Pour toute question sur les tests:
1. Vérifier les logs backend (terminal)
2. Vérifier les logs Metro (Expo terminal)
3. Consulter MOBILE_README.md pour le setup
4. Vérifier la console Twilio pour WhatsApp
