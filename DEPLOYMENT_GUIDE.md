# 🚀 Guide de Déploiement NexaCI

## 📱 Étape 1 : Logo et Branding (✅ Terminé)

### Logo intégré
- ✅ Composant `Logo.tsx` créé dans mobile-client et mobile-livreur
- ✅ Logo ajouté aux écrans de connexion
- ✅ app.json mis à jour avec le nom "NexaCI"

### Action requise : Ajouter votre image logo
1. Sauvegardez votre logo NexaCI en PNG (transparent)
2. Créez 3 versions :
   - `icon.png` : 1024x1024px (icône app)
   - `splash.png` : 1242x2436px (écran démarrage)
   - `adaptive-icon.png` : 1024x1024px (Android)

3. Placez-les dans :
```
mobile-client/assets/
├── icon.png
├── splash.png
└── adaptive-icon.png

mobile-livreur/assets/
├── icon.png
├── splash.png
└── adaptive-icon.png
```

---

## 📱 Étape 2 : Configuration Expo EAS Build

### A. Installation EAS CLI

```bash
npm install -g eas-cli
```

### B. Connexion Expo

```bash
eas login
# Entrez vos identifiants Expo
# Ou créez un compte : https://expo.dev
```

### C. Configuration des projets

#### Mobile Client
```bash
cd mobile-client
eas init --id nexaci-client
```

#### Mobile Livreur
```bash
cd mobile-livreur
eas init --id nexaci-livreur
```

### D. Build APK pour tests (Android)

#### Mobile Client
```bash
cd mobile-client
eas build --platform android --profile preview
```

#### Mobile Livreur
```bash
cd mobile-livreur
eas build --platform android --profile preview
```

**Temps de build** : ~10-15 minutes
**Résultat** : Vous recevrez un lien pour télécharger l'APK

### E. Partage en ligne avec Expo Publish (plus rapide)

```bash
# Mobile Client
cd mobile-client
npx expo publish

# Mobile Livreur
cd mobile-livreur
npx expo publish
```

**Résultat** : Lien QR code permanent partageable

---

## 🖥️ Étape 3 : Déploiement Backend sur Railway

### A. Préparation du backend

1. **Créer un fichier `.env.production`** dans `backend/` :

```env
# MongoDB Atlas (gratuit)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexaci?retryWrites=true&w=majority

# JWT
JWT_SECRET=votre_secret_jwt_production_tres_long_et_securise

# Twilio WhatsApp (optionnel)
TWILIO_ACCOUNT_SID=votre_sid
TWILIO_AUTH_TOKEN=votre_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Port
PORT=5000
```

2. **Vérifier package.json** :

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### B. Déploiement Railway

1. **Créer un compte** : https://railway.app
2. **Nouveau projet** : "New Project" → "Deploy from GitHub"
3. **Connecter votre repo** : Sélectionnez `backend/`
4. **Variables d'environnement** :
   - Aller dans "Variables"
   - Copier tout depuis `.env.production`
   - Ajouter : `NODE_ENV=production`

5. **MongoDB Atlas** (gratuit) :
   - Créer un compte : https://mongodb.com/cloud/atlas
   - Créer un cluster gratuit
   - Obtenir l'URI de connexion
   - Ajouter l'IP `0.0.0.0/0` dans Network Access
   - Mettre l'URI dans `MONGODB_URI`

6. **Déployer** : Railway déploie automatiquement
7. **Obtenir l'URL** : Ex: `https://nexaci-backend.railway.app`

### C. Mettre à jour les apps mobiles avec l'URL production

#### mobile-client/app.json
```json
"extra": {
  "API_URL": "https://nexaci-backend.railway.app"
}
```

#### mobile-livreur/app.json
```json
"extra": {
  "API_URL": "https://nexaci-backend.railway.app"
}
```

Puis republier :
```bash
npx expo publish
```

---

## 🌐 Étape 3 (Alternative) : Déploiement sur Render.com

1. **Créer un compte** : https://render.com
2. **New Web Service** → Connecter GitHub
3. **Configuration** :
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Root Directory** : `backend`
4. **Variables** : Ajouter toutes les env variables
5. **MongoDB** : Utiliser MongoDB Atlas (comme Railway)

---

## 🌐 Étape 4 : Frontend Web (Optionnel)

### Vercel (Recommandé)

```bash
cd frontend
npx vercel
```

Ou via Dashboard :
1. https://vercel.com
2. Import Project → GitHub
3. Framework Preset : Vite
4. Deploy

### Variables d'environnement Vercel
```
VITE_API_URL=https://nexaci-backend.railway.app
```

---

## 📋 Checklist de déploiement

### Préparation
- [ ] Logo NexaCI en 3 formats (icon, splash, adaptive)
- [ ] Compte Expo créé
- [ ] Compte Railway/Render créé
- [ ] Compte MongoDB Atlas créé
- [ ] Twilio configuré (optionnel)

### Apps Mobiles
- [ ] Logo intégré dans assets/
- [ ] app.json mis à jour
- [ ] eas.json configuré
- [ ] `eas login` effectué
- [ ] `eas init` pour chaque app
- [ ] Build APK lancé
- [ ] APK téléchargé et testé
- [ ] Expo publish effectué
- [ ] QR code partagé

### Backend
- [ ] .env.production créé
- [ ] MongoDB Atlas cluster créé
- [ ] Variables d'environnement configurées
- [ ] Backend déployé sur Railway/Render
- [ ] URL backend obtenue
- [ ] Tests endpoints OK
- [ ] apps mobiles mises à jour avec URL prod

### Frontend (Optionnel)
- [ ] Variables env configurées
- [ ] Déployé sur Vercel
- [ ] URL obtenue
- [ ] Tests navigation OK

---

## 🧪 Tests post-déploiement

### Test Backend
```bash
curl https://nexaci-backend.railway.app/api/health
```

### Test Mobile
1. Scannez le QR code Expo
2. Testez la connexion
3. Créez un colis
4. Vérifiez l'upload photo
5. Testez le tracking

### Test Livreur
1. Scannez le QR code Expo
2. Connexion livreur
3. Voir les colis assignés
4. Tester capture GPS
5. Tester photo preuve
6. Mettre à jour statut

---

## 📊 Monitoring

### Railway Dashboard
- Logs en temps réel
- Métriques CPU/RAM
- Déploiements automatiques Git

### Expo Dashboard
- Analytics utilisateurs
- Crashlytics
- OTA Updates

---

## 🔄 Mises à jour

### Backend (automatique)
```bash
git push origin main
# Railway redéploie automatiquement
```

### Apps Mobiles (OTA - instant)
```bash
cd mobile-client
npx expo publish
# Les utilisateurs reçoivent la mise à jour au prochain lancement
```

### Apps Mobiles (nouveau build)
```bash
# Seulement si changement natif (packages Expo, permissions, etc.)
eas build --platform android --profile preview
```

---

## 💰 Coûts

### Gratuit
- ✅ Expo Publish
- ✅ Expo EAS (500 builds/mois gratuits)
- ✅ Railway ($5 crédit gratuit/mois)
- ✅ Render (750h gratuites/mois)
- ✅ MongoDB Atlas (512MB gratuit)
- ✅ Vercel (100 GB bande passante/mois)

### Payant (si croissance)
- Railway : $5/mois pour plus de ressources
- EAS : $29/mois pour builds illimités
- MongoDB Atlas : $9/mois pour plus de stockage

---

## 🆘 Support

### Expo
- Documentation : https://docs.expo.dev
- Forum : https://forums.expo.dev

### Railway
- Documentation : https://docs.railway.app
- Discord : https://discord.gg/railway

### NexaCI
- Repository GitHub
- Issues tracker
- README.md

---

## 🎯 Prochaines étapes

1. **Ajouter votre logo** dans assets/
2. **Lancer `eas build`** pour créer les APKs
3. **Déployer le backend** sur Railway
4. **Tester avec vrais utilisateurs**
5. **Collecter feedback**
6. **Itérer !**

**Bonne chance avec NexaCI ! 🚀**
