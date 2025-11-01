# 🚀 NexaCI - Liens de Déploiement et Téléchargement

**Date de déploiement** : 31 octobre 2025

---

## 🌐 **Applications Web (Accessibles depuis n'importe quel navigateur)**

### Frontend Principal (Gestion Complète)
- **URL** : https://nexaci-frontend.onrender.com
- **Accès** : Public (nécessite authentification)
- **Fonctionnalités** :
  - ✅ Tableau de bord Admin
  - ✅ Gestion des utilisateurs
  - ✅ Gestion des agences (création, modification, liste)
  - ✅ Gestion des colis
  - ✅ Gestion des mandats administratifs
  - ✅ Statistiques et rapports
  - ✅ Historique complet

### Backend API
- **URL** : https://nexaci-backend.onrender.com
- **Health Check** : https://nexaci-backend.onrender.com/api/health
- **Test Endpoint** : https://nexaci-backend.onrender.com/api/test
- **Documentation** : Tous les endpoints sont listés dans les logs de démarrage

---

## 📱 **Applications Mobiles**

### 🔄 **Mises à jour OTA (Over-The-Air) - Déjà Publiées**

#### App Client (NexaCI Client)
- **Statut** : ✅ Publiée sur branche `preview`
- **API Production** : https://nexaci-backend.onrender.com
- **Dashboard EAS** : https://expo.dev/accounts/babayacoubasylla/projects/nexaci-client/updates
- **Comment tester** :
  1. Installer Expo Go sur votre téléphone
  2. Scanner le QR code dans le terminal après `npm start`
  3. L'app se met à jour automatiquement

#### App Livreur (NexaCI Livreur)
- **Statut** : ✅ Publiée sur branche `preview`
- **API Production** : https://nexaci-backend.onrender.com
- **Dashboard EAS** : https://expo.dev/accounts/babayacoubasylla/projects/nexaci-livreur/updates
- **Update ID** : d4ba3fc0-116d-456e-b48b-88ee31c3594b

---

## 📦 **Builds APK & iOS (En cours de génération)**

### ⚠️ **Note importante sur les builds**
Les builds APK Android et iOS nécessitent la génération de certificats (Keystore pour Android, Provisioning Profile pour iOS). 

### **Étapes pour générer les APK/IPA** :

#### Pour Android (APK) :
```powershell
# App Client
cd mobile-client
npx eas build --platform android --profile preview

# App Livreur
cd mobile-livreur
npx eas build --platform android --profile preview
```

**Lors de la première génération**, EAS vous demandera :
- "Generate a new Android Keystore?" → Répondez **YES** (y)
- EAS générera et stockera automatiquement le keystore

**Liens de téléchargement** : Les APK seront disponibles sur :
- https://expo.dev/accounts/babayacoubasylla/projects/nexaci-client/builds
- https://expo.dev/accounts/babayacoubasylla/projects/nexaci-livreur/builds

#### Pour iOS (IPA) :
```powershell
# App Client
cd mobile-client
npx eas build --platform ios --profile preview

# App Livreur
cd mobile-livreur
npx eas build --platform ios --profile preview
```

**⚠️ Prérequis iOS** :
- Compte Apple Developer (99 USD/an)
- Certificat de distribution iOS
- Provisioning Profile

**Alternative pour iOS sans compte développeur** :
- Utiliser Expo Go (gratuit, mais nécessite l'app Expo Go installée)
- Distribution via TestFlight (nécessite compte développeur)

---

## 🎯 **Comment Accéder à la Gestion d'Agence**

### Sur le Frontend Web (Recommandé pour gestion complète)

1. **Accédez à** : https://nexaci-frontend.onrender.com
2. **Connectez-vous** avec un compte administrateur ou gérant
3. **Menu Agences** : Disponible dans la navigation principale
4. **Fonctionnalités disponibles** :
   - Créer une nouvelle agence
   - Modifier les informations d'une agence
   - Voir la liste de toutes les agences
   - Assigner un gérant à une agence
   - Voir les statistiques par agence
   - Historique des opérations d'une agence

### Endpoints API Agences

```
GET    /api/agences              - Liste toutes les agences
POST   /api/agences              - Créer une nouvelle agence
GET    /api/agences/:id          - Détails d'une agence
PATCH  /api/agences/:id          - Modifier une agence
DELETE /api/agences/:id          - Supprimer une agence
GET    /api/agences/:id/stats    - Statistiques d'une agence
```

---

## 🔐 **Comptes de Test**

Pour tester le système, utilisez ces comptes (à créer via l'interface d'inscription) :

### Administrateur
- **Email** : admin@nexaci.com
- **Rôle** : Administrateur système
- **Accès** : Toutes les fonctionnalités

### Gérant d'Agence
- **Email** : gerant@nexaci.com
- **Rôle** : Gérant
- **Accès** : Gestion de son agence, colis, mandats

### Livreur
- **Email** : livreur@nexaci.com
- **Rôle** : Livreur
- **Accès** : App mobile Livreur, missions

### Client
- **Email** : client@nexaci.com
- **Rôle** : Client
- **Accès** : App mobile Client, créer colis/mandats

---

## 🛠️ **Support Technique**

### En cas de problème :

1. **Frontend ne charge pas (403/404)** :
   - Le service Render peut prendre 30-50 secondes à démarrer après inactivité
   - Rafraîchissez la page après 1 minute

2. **Backend lent** :
   - Le tier gratuit de Render dort après 15 min d'inactivité
   - Premier accès = cold start (30-50s)

3. **App mobile ne se connecte pas** :
   - Vérifiez que vous avez la dernière mise à jour OTA
   - Vérifiez votre connexion internet

4. **Builds APK/iOS échouent** :
   - Vérifiez que vous avez un compte Expo
   - Pour iOS, vérifiez votre compte Apple Developer

---

## 📊 **Tableau de Bord EAS (Expo Application Services)**

- **Compte** : babayacoubasylla
- **Projets** :
  - NexaCI Client : https://expo.dev/accounts/babayacoubasylla/projects/nexaci-client
  - NexaCI Livreur : https://expo.dev/accounts/babayacoubasylla/projects/nexaci-livreur

Sur ces dashboards, vous pouvez :
- Voir l'état de tous les builds
- Télécharger les APK/IPA générés
- Voir les mises à jour OTA publiées
- Gérer les certificats et credentials

---

## ✅ **Checklist de Déploiement**

- [x] Backend déployé sur Render
- [x] Frontend déployé sur Render
- [x] MongoDB Atlas configuré et connecté
- [x] CORS configuré pour accepter le frontend
- [x] Apps mobiles mises à jour avec API production
- [x] Mises à jour OTA publiées (Client + Livreur)
- [ ] APK Android générés (en attente de keystores)
- [ ] IPA iOS générés (nécessite compte Apple Developer)

---

## 🚀 **Prochaines Étapes Recommandées**

1. **Générer les APK Android** :
   - Exécuter les commandes de build
   - Accepter la génération automatique des keystores
   - Partager les liens de téléchargement

2. **Tester le Frontend** :
   - Créer un compte admin
   - Tester toutes les fonctionnalités
   - Créer une agence de test

3. **Distribuer les Apps** :
   - Partager les liens APK pour Android
   - Utiliser Expo Go pour iOS (en attendant les builds)

4. **Migration vers hébergement payant** (optionnel) :
   - Pour éviter les cold starts
   - Pour avoir un domaine personnalisé
   - Pour plus de performances

---

**Dernière mise à jour** : 31 octobre 2025, 16:00 UTC
**Version** : 1.0.0
**Environnement** : Production (tier gratuit)
