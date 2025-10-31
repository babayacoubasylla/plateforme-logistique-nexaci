# Guide de déploiement Render (GRATUIT)

Ce guide vous montre comment déployer **gratuitement** le backend et le frontend sur Render.

---

## Pourquoi Render ?

- ✅ **Tier gratuit généreux** : 750 heures/mois par service
- ✅ **SSL automatique** (HTTPS)
- ✅ **Déploiement automatique** depuis GitHub
- ✅ **Base de données** : MongoDB Atlas (gratuit aussi)
- ⚠️ **Limitation** : Services gratuits se mettent en veille après 15 min d'inactivité (démarrage ~30s au premier accès)

---

## Étape 1 : Préparer MongoDB Atlas

Vous avez déjà fait ça ! Votre URI :
```
mongodb+srv://babayacoubasylla04_db_user:ylkjMrAR6voC8dKL@cluster0.xqscvks.mongodb.net/nexaci?retryWrites=true&w=majority&appName=Cluster0
```

---

## Étape 2 : Pousser le code sur GitHub

Déjà fait aussi ! Votre repo :
```
https://github.com/babayacoubasylla/plateforme-logistique-nexaci
```

---

## Étape 3 : Déployer le Backend sur Render

### 3.1 Créer un compte Render
1. Allez sur https://render.com
2. Cliquez "Get Started" → "Sign in with GitHub"
3. Autorisez Render à accéder à votre compte GitHub

### 3.2 Créer le service Backend
1. Dashboard Render → "New +" → "Web Service"
2. Connectez votre repo GitHub : `babayacoubasylla/plateforme-logistique-nexaci`
3. Configurez le service :
   - **Name** : `nexaci-backend`
   - **Region** : Frankfurt (Europe)
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `node src/app.js`
   - **Instance Type** : **Free** (important !)

### 3.3 Ajouter les variables d'environnement
Dans la section "Environment" du service, ajoutez ces variables :

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://babayacoubasylla04_db_user:ylkjMrAR6voC8dKL@cluster0.xqscvks.mongodb.net/nexaci?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=nexaci-prod-super-secret-jwt-key-change-me-minimum-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=nexaci-prod-refresh-secret-change-me-minimum-32-chars
JWT_REFRESH_EXPIRES_IN=30d
WHATSAPP_ENABLED=false
```

### 3.4 Déployer
1. Cliquez "Create Web Service"
2. Render va automatiquement :
   - Cloner le repo
   - Installer les dépendances
   - Démarrer le serveur
3. Attendez 3-5 minutes (suivez les logs en temps réel)
4. Une fois "Live", vous aurez une URL : `https://nexaci-backend.onrender.com`

### 3.5 Tester le backend
Ouvrez dans un navigateur :
```
https://nexaci-backend.onrender.com/health
```
Réponse attendue :
```json
{"status":"ok","timestamp":"2025-10-31T..."}
```

---

## Étape 4 : Déployer le Frontend sur Render

### 4.1 Créer le service Frontend
1. Dashboard Render → "New +" → "Web Service"
2. Même repo GitHub : `babayacoubasylla/plateforme-logistique-nexaci`
3. Configurez :
   - **Name** : `nexaci-frontend`
   - **Region** : Frankfurt
   - **Branch** : `main`
   - **Root Directory** : `frontend`
   - **Runtime** : Node
   - **Build Command** : `npm install && npm run build`
   - **Start Command** : `npm run serve`
   - **Instance Type** : **Free**

### 4.2 Ajouter la variable d'environnement
```
VITE_API_URL=https://nexaci-backend.onrender.com
```

### 4.3 Déployer
1. Cliquez "Create Web Service"
2. Attendez 3-5 minutes
3. URL du frontend : `https://nexaci-frontend.onrender.com`

### 4.4 Mettre à jour le CORS du backend
1. Retournez dans les variables du service **backend**
2. Ajoutez :
```
FRONTEND_URL=https://nexaci-frontend.onrender.com
```
3. Render redéploie automatiquement le backend

### 4.5 Tester le frontend
1. Ouvrez `https://nexaci-frontend.onrender.com`
2. Essayez de créer un compte et de vous connecter
3. Vérifiez que les appels API fonctionnent

---

## Étape 5 : Mettre à jour les Apps Mobiles

Une fois le backend déployé et accessible, je mettrai à jour :
- `mobile-client/app.json` → `extra.API_URL`
- `mobile-livreur/app.json` → `extra.API_URL`

Puis je :
- Publierai une mise à jour OTA (EAS Update)
- Lancerai les builds APK Android pour les deux apps

---

## URLs Finales (après déploiement)

- **Backend API** : `https://nexaci-backend.onrender.com`
- **Frontend Web** : `https://nexaci-frontend.onrender.com`
- **MongoDB** : MongoDB Atlas (cluster gratuit)
- **GitHub** : https://github.com/babayacoubasylla/plateforme-logistique-nexaci

---

## Limitations du Tier Gratuit Render

### Services Web
- ✅ 750 heures/mois (suffisant pour 1 service 24/7)
- ⚠️ **Mise en veille après 15 min d'inactivité**
- ⚠️ Premier accès après veille : ~30 secondes de démarrage
- ✅ SSL/HTTPS automatique
- ✅ Déploiement automatique depuis GitHub

### Contourner la mise en veille (optionnel)
Utilisez un service de ping gratuit comme UptimeRobot :
1. https://uptimerobot.com (gratuit)
2. Ajoutez un monitor HTTP : `https://nexaci-backend.onrender.com/health`
3. Intervalle : 5 minutes
4. Votre backend restera actif 24/7

---

## Coûts si vous upgradez plus tard

- **Render Starter** (sans veille) : 7$/mois par service
- **MongoDB Atlas M10** : ~10$/mois (pour plus de stockage et performance)

Total estimé pour prod : **~25$/mois** (backend + frontend + DB)

Mais pour tester : **100% GRATUIT** 🎉

---

## Problèmes courants

**Build échoue ?**
→ Vérifiez les logs Render, souvent un problème de dépendances. Le `render.yaml` configure tout automatiquement.

**Erreur CORS ?**
→ Vérifiez que `FRONTEND_URL` dans le backend correspond exactement à l'URL du frontend Render.

**Backend ne démarre pas ?**
→ Vérifiez `MONGODB_URI` et `JWT_SECRET` dans les variables d'environnement.

**Frontend build fail ?**
→ Assurez-vous que `VITE_API_URL` pointe vers le backend Render avec HTTPS.

---

## Prochaines étapes

1. Déployez le backend sur Render (suivez Étape 3)
2. Testez `/health` endpoint
3. Déployez le frontend (Étape 4)
4. Envoyez-moi les deux URLs
5. Je mets à jour les apps mobiles et je lance les builds APK

**Prêt à déployer ?** Suivez les étapes ci-dessus, ça prend ~10 minutes ! 🚀
