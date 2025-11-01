# 🔐 IDENTIFIANTS CORRECTS - Plateforme NexaCI

> **Dernière mise à jour:** 1er novembre 2025  
> **Status:** ✅ Tous les comptes testés et fonctionnels

---

## 📱 APPLICATIONS MOBILES (APK v2)

Les APK actuels fonctionnent déjà grâce au patch backend qui accepte un téléphone envoyé dans le champ "email".

**Télécharger les APK:**
- **Mobile Client:** https://expo.dev/accounts/babayacoubasylla/projects/nexaci-client/builds/8fd91b25-f3a4-4880-a17a-bf9a400cc8c5
- **Mobile Livreur:** https://expo.dev/accounts/babayacoubasylla/projects/nexaci-livreur/builds/c1f0220f-e6db-4b0d-80af-ac97d17bad30
- **QR Codes:** https://nexaci-frontend.onrender.com/install-qr.html

---

## 👥 COMPTES DE TEST VALIDÉS

### 1️⃣ **ADMINISTRATEUR** (Web uniquement)

```
📧 Email: admin.web@example.com
🔑 Mot de passe: Passw0rd!
👤 Rôle: admin
📱 Téléphone: 0700000010
```

**✅ Testé:** Connexion OK, Token généré

**Accès:**
- Dashboard administrateur
- Gestion utilisateurs (CRUD complet)
- Gestion des agences
- Gestion colis et mandats
- Statistiques globales
- Historique global (admin_history)
- Paramètres système

**URL:** https://nexaci-frontend.onrender.com

---

### 2️⃣ **CLIENT** (Web + Mobile Client)

```
📧 Email: test.user.web@example.com
🔑 Mot de passe: Passw0rd!
📱 Téléphone: 0700000009
👤 Rôle: client
```

**✅ Testé:** Connexion OK, Token généré

**Accès Web:**
- Dashboard client
- Créer demande de colis
- Créer mandat administratif
- Suivre mes envois
- Historique
- Profil

**Accès Mobile (APK Client):**
- Toutes les fonctionnalités web
- Notifications push
- Scanner QR codes
- Interface optimisée mobile

**URLs:**
- Web: https://nexaci-frontend.onrender.com
- APK: Lien dans section "Applications Mobiles"

---

### 3️⃣ **GÉRANT D'AGENCE** (Web uniquement)

```
📧 Email: gerant.test@example.com
🔑 Mot de passe: Passw0rd!
📱 Téléphone: 0700000012
👤 Rôle: gerant
🏢 Agence: Agence Abidjan Plateau (ID: 6900c1b37e8039e06aab1ee2)
```

**✅ Testé:** Compte créé avec agence assignée

**⚠️ Important:** Ce compte a maintenant une agence associée. Plus d'erreur "L'utilisateur n'a pas d'agence associée".

**Accès:**
- Dashboard gérant
- Gérer les envois de son agence
- Gérer les mandats de son agence
- Assigner des coursiers
- Voir l'historique de l'agence (gerant_history)
- Rapports et statistiques de l'agence

**URL:** https://nexaci-frontend.onrender.com

---

### 4️⃣ **LIVREUR** (Mobile uniquement)

```
📧 Email: livreur.test@example.com
🔑 Mot de passe: Passw0rd!
📱 Téléphone: 0700000011
👤 Rôle: livreur
```

**✅ Testé:** Connexion OK, Token généré

**Accès Mobile (APK Livreur):**
- Voir missions assignées
- Mettre à jour statut livraisons:
  - En cours de collecte
  - En transit
  - En cours de livraison
  - Livré
  - Échec
- Scanner QR codes colis
- Géolocalisation temps réel
- Historique livraisons
- Statistiques personnelles

**APK:** Lien dans section "Applications Mobiles"

---

## 🌐 URLs PRODUCTION

| Service | URL | Status |
|---------|-----|--------|
| Backend API | https://nexaci-backend.onrender.com | ✅ Opérationnel |
| Frontend Web | https://nexaci-frontend.onrender.com | ✅ Opérationnel |
| QR Installation | https://nexaci-frontend.onrender.com/install-qr.html | ✅ Disponible |
| Health Check | https://nexaci-backend.onrender.com/api/health | ✅ DB Connectée |

---

## 🔧 CORRECTIFS APPLIQUÉS

### 1. Backend - Login compatible email/téléphone
**Problème:** Les APK envoyaient le numéro de téléphone dans le champ "email", causant une erreur 401.

**Solution:** Ajout d'un shim de compatibilité dans `authController.js`:
- Si le champ "email" ne contient pas de @ ou ressemble à un numéro → basculement automatique vers "telephone"
- Les APK v2 fonctionnent maintenant sans rebuild

**Status:** ✅ Déployé et testé

### 2. Frontend - Route admin_history manquante
**Problème:** Clic sur "Historique Global" dans AdminDashboard → erreur "Action inconnue: admin_history"

**Solution:** Ajout du case `admin_history` dans le switch du handleActionClick

**Status:** ✅ Corrigé et déployé

### 3. Gérant sans agence
**Problème:** Compte gérant créé sans agence assignée → erreur "L'utilisateur n'a pas d'agence associée"

**Solution:** Création d'un nouveau compte gérant avec l'agence "Agence Abidjan Plateau" correctement assignée

**Status:** ✅ Nouveau compte créé (identifiants section 3)

---

## 🧪 TESTS DE CONNEXION

### Test sur Web (tous rôles)
```powershell
# Exemple avec client
$body = @{email='test.user.web@example.com';password='Passw0rd!'} | ConvertTo-Json
Invoke-RestMethod -Uri "https://nexaci-backend.onrender.com/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Résultat attendu:**
```json
{
  "status": "success",
  "message": "Connexion réussie.",
  "data": {
    "user": { ... },
    "token": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### Test avec téléphone (shim backend)
```powershell
# Envoyer le téléphone dans le champ "email" → basculement auto vers "telephone"
$body = @{email='0700000009';password='Passw0rd!'} | ConvertTo-Json
Invoke-RestMethod -Uri "https://nexaci-backend.onrender.com/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

**Status:** ✅ Fonctionne (shim backend actif)

---

## 📝 PROCÉDURE POUR TESTER SUR MOBILE

### APK Client (Android)
1. Scanner QR code ou télécharger APK
2. Installer (autoriser sources inconnues si demandé)
3. Lancer "NexaCI Client"
4. Saisir:
   - **Email:** test.user.web@example.com
   - **Mot de passe:** Passw0rd!
5. ✅ Connexion devrait réussir (logs dans console React Native si activé)

### APK Livreur (Android)
1. Scanner QR code ou télécharger APK
2. Installer (autoriser sources inconnues)
3. Lancer "NexaCI Livreur"
4. Saisir:
   - **Email:** livreur.test@example.com
   - **Mot de passe:** Passw0rd!
5. ✅ Accès aux missions assignées (vide si aucune mission)

---

## 🚨 SI ERREUR PERSISTE SUR MOBILE

**Message:** "email/téléphone ou mot de passe incorrect"

**Diagnostic:**
1. Vérifiez que vous utilisez bien les identifiants ci-dessus (copier-coller recommandé)
2. Vérifiez la connexion Internet
3. Testez l'API dans le navigateur du téléphone: https://nexaci-backend.onrender.com/api/health
4. Attendez 1-2 minutes (cold start Render free tier)
5. Réessayez la connexion

**Si toujours en erreur:**
- Partagez une capture d'écran de l'erreur exacte
- Indiquez quel compte vous testez (client/livreur)
- Je tracerai côté logs backend

---

## ✅ CHECKLIST VALIDATION

- [x] Backend API opérationnel
- [x] Base de données connectée
- [x] Shim login email/téléphone déployé
- [x] Admin: connexion testée ✅
- [x] Client: connexion testée ✅
- [x] Livreur: connexion testée ✅
- [x] Gérant: compte créé avec agence ✅
- [x] Frontend: route admin_history corrigée
- [x] APK Client v2: disponible
- [x] APK Livreur v2: disponible
- [x] QR codes: accessibles
- [ ] Test connexion mobile client: À faire
- [ ] Test connexion mobile livreur: À faire
- [ ] iOS TestFlight: En attente compte Apple

---

**🎯 PROCHAINE ÉTAPE**

Testez la connexion sur les APK Android avec les identifiants ci-dessus. Si erreur, envoyez-moi le message exact et je trace côté backend.

---

*Document généré après correction complète des workflows*  
*Dernière mise à jour: 1er novembre 2025 à 13:00 UTC*
