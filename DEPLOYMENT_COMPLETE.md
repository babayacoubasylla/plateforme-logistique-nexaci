# Guide de déploiement complet du projet NexaCI

Ce guide décrit comment mettre en ligne **tout le projet** : backend, frontend web, et les deux applications mobiles (client + livreur).

---

## 1. Prérequis

- Compte Expo connecté : `npx expo whoami` → doit afficher votre username
- Compte Railway : https://railway.app (gratuit avec budget mensuel)
- Compte MongoDB Atlas : https://www.mongodb.com/cloud/atlas (gratuit)
- Git initialisé dans le projet (pour Railway)

---

## 2. Déployer le Backend (Railway)

### 2.1 Préparer MongoDB Atlas
1. Créez un cluster gratuit sur MongoDB Atlas
2. Créez un utilisateur de base de données avec mot de passe
3. Autorisez toutes les IPs (0.0.0.0/0) dans Network Access
4. Récupérez la connection string :
   ```
   mongodb+srv://<user>:<password>@cluster.mongodb.net/nexaci?retryWrites=true&w=majority
   ```

### 2.2 Déployer sur Railway
1. Allez sur https://railway.app et connectez-vous
2. Cliquez sur "New Project" → "Deploy from GitHub repo"
3. Autorisez Railway à accéder à votre repo GitHub
4. Sélectionnez le repo `plateforme-logistique`
5. Railway détecte automatiquement le backend

**Configuration des variables d'environnement :**
- Allez dans l'onglet "Variables" du service backend
- Ajoutez ces variables :
  ```
  MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nexaci?retryWrites=true&w=majority
  JWT_SECRET=votre-secret-jwt-tres-long-et-aleatoire-32-chars-minimum
  PORT=5000
  NODE_ENV=production
  ```

**Obtenir l'URL publique :**
- Railway génère une URL publique automatiquement
- Allez dans "Settings" → "Networking" → "Generate Domain"
- Exemple : `https://plateforme-logistique-production.up.railway.app`
- **Notez cette URL**, vous en aurez besoin pour le frontend et les apps mobiles

### 2.3 Initialiser la base de données
Une fois le backend déployé, lancez le script de seed :
```bash
# Se connecter en SSH au backend Railway (via le dashboard)
node scripts/seed-data.js
```

Ou créez un utilisateur admin manuellement via l'interface web une fois le frontend déployé.

---

## 3. Déployer le Frontend Web (Railway ou Vercel)

### Option A : Railway (recommandé pour simplicité)
1. Dans le même projet Railway, cliquez "New Service"
2. Sélectionnez le même repo GitHub
3. Configurez le service pour le dossier `frontend`
4. Ajoutez la variable d'environnement :
   ```
   VITE_API_URL=https://votre-backend-url.railway.app
   ```
5. Railway construit automatiquement avec `npm run build`
6. Récupérez l'URL publique du frontend (ex: `https://nexaci-frontend.up.railway.app`)

### Option B : Vercel (alternative)
1. Allez sur https://vercel.com
2. Importez le repo GitHub
3. Configurez le "Root Directory" → `frontend`
4. Ajoutez la variable d'environnement :
   ```
   VITE_API_URL=https://votre-backend-url.railway.app
   ```
5. Déployez

---

## 4. Mettre à jour les Apps Mobiles avec l'URL Backend

### 4.1 Mettre à jour API_URL dans mobile-client
```bash
cd mobile-client
```

Éditez `app.json` :
```json
{
  "expo": {
    "extra": {
      "API_URL": "https://votre-backend-url.railway.app"
    }
  }
}
```

### 4.2 Mettre à jour API_URL dans mobile-livreur
```bash
cd mobile-livreur
```

Éditez `app.json` :
```json
{
  "expo": {
    "extra": {
      "API_URL": "https://votre-backend-url.railway.app"
    }
  }
}
```

### 4.3 Publier les mises à jour EAS
```bash
cd mobile-livreur
npx eas update --branch preview --message "Backend URL prod"

cd ../mobile-client
npx eas update --branch preview --message "Backend URL prod"
```

---

## 5. Builder les Apps Mobiles (APK Android)

### 5.1 Build mobile-livreur (Android APK)
```bash
cd mobile-livreur
npx eas build --platform android --profile preview
```
- EAS va construire l'APK sur le cloud
- À la fin, vous recevrez une URL de téléchargement
- Partagez ce lien à vos livreurs pour installer l'app

### 5.2 Build mobile-client (Android APK)
```bash
cd mobile-client
npx eas build --platform android --profile preview
```
- Même processus que ci-dessus
- Partagez l'APK aux clients finaux

### 5.3 Build iOS (si nécessaire)
Si vous avez un compte Apple Developer (99$/an) :
```bash
npx eas build --platform ios --profile preview
```

---

## 6. Vérification et Tests

### Backend
- Testez l'endpoint de santé : `https://votre-backend-url.railway.app/health`
- Réponse attendue : `{ "status": "ok", "timestamp": "..." }`

### Frontend Web
- Ouvrez l'URL du frontend dans un navigateur
- Essayez de vous connecter avec un compte admin
- Vérifiez que les données s'affichent correctement

### Apps Mobiles
- Téléchargez les APK depuis les liens EAS
- Installez sur un appareil Android
- Testez la connexion et les fonctionnalités principales

---

## 7. Configuration CORS (si problèmes)

Si vous rencontrez des erreurs CORS, ajoutez cette variable sur Railway (backend) :
```
CORS_ORIGINS=https://votre-frontend-url.railway.app,https://votre-frontend-url.vercel.app
```

Puis redéployez le backend.

---

## 8. Maintenance et Mises à Jour

### Mettre à jour le backend
```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```
Railway redéploie automatiquement.

### Mettre à jour le frontend
Même processus : commit + push → redéploiement automatique.

### Mettre à jour les apps mobiles (OTA)
```bash
# Dans mobile-client ou mobile-livreur
npx eas update --branch preview --message "Fix: correction bug"
```
Les utilisateurs reçoivent la mise à jour au prochain lancement.

### Builder une nouvelle version des apps mobiles
Si vous changez des dépendances natives ou la config Expo :
```bash
npx eas build --platform android --profile preview
```

---

## 9. URLs Finales du Projet

Une fois déployé, vous aurez :
- **Backend API** : `https://plateforme-logistique-production.up.railway.app`
- **Frontend Web** : `https://nexaci-frontend.railway.app` (ou Vercel)
- **App Mobile Client** : Lien de téléchargement APK depuis EAS
- **App Mobile Livreur** : Lien de téléchargement APK depuis EAS
- **Dashboards Expo** :
  - Client : https://expo.dev/accounts/babayacoubasylla/projects/nexaci-client
  - Livreur : https://expo.dev/accounts/babayacoubasylla/projects/nexaci-livreur

---

## 10. Coûts Estimés

- **Railway** : 5$ de crédit gratuit/mois, puis ~5-20$/mois selon usage
- **MongoDB Atlas** : Gratuit jusqu'à 512 MB
- **Expo/EAS** : Gratuit pour builds + updates limités, puis ~29$/mois pour usage intensif
- **Vercel** (si utilisé) : Gratuit pour projets personnels

Total : **0-50$/mois** selon le trafic.

---

## Support et Problèmes Courants

**Erreur "CORS blocked" :**
→ Vérifiez CORS_ORIGINS dans les variables d'environnement Railway.

**App mobile ne se connecte pas :**
→ Vérifiez que `extra.API_URL` dans app.json pointe vers l'URL Railway (pas localhost).

**Build EAS échoue :**
→ Vérifiez que `eas.json` est correctement configuré et que le projectId est valide.

**Backend ne démarre pas sur Railway :**
→ Vérifiez les logs Railway, assurez-vous que MONGODB_URI est correct.

---

## Prochaines Étapes Recommandées

1. Configurer un nom de domaine personnalisé (ex: nexaci.ci)
2. Activer HTTPS partout (Railway le fait par défaut)
3. Mettre en place des sauvegardes MongoDB
4. Configurer des alertes de monitoring (Sentry, LogRocket)
5. Soumettre les apps sur Google Play Store (25$ une fois) et Apple App Store (99$/an)

---

**Félicitations !** Votre plateforme est maintenant entièrement en ligne. 🚀
