# Comptes de test et instructions de connexion

Date: 1 novembre 2025
Statut: Validés en base (mots de passe OK, comptes actifs)

---

## Applications et liens
- Frontend Web: https://nexaci-frontend.onrender.com
- Backend API: https://nexaci-backend.onrender.com
- APK Android (Client): https://expo.dev/artifacts/eas/dKqddS6MELozK2hEQXmsmT.apk
- APK Android (Livreur): https://expo.dev/artifacts/eas/4dfNYJud6W6swiQNxKw1YW.apk
- Page QR d’installation (scanner sur téléphone): frontend/public/install-qr.html (ou déployée selon votre hébergement)

Astuce format téléphone: le backend accepte 0700000001, +2250700000001, 2250700000001, avec/ sans espaces.

---

## Rôles et identifiants

### Admin
- Email: admin.web@example.com
- Téléphone: 0700000010
- Mot de passe: Passw0rd!
- Accès: Web Admin, API

### Gérant
- Email: gerant.test@example.com
- Mot de passe: Passw0rd!
- Accès: Web Gérant, API

### Client (garanti)
- Email: client1@example.com
- Téléphone: 0101010101 / +2250101010101
- Mot de passe: client123
- Accès: Web Client, App Mobile Client, API

### Client (seed)
- Email: test.user.web@example.com
- Téléphone: 0700000009
- Mot de passe: Passw0rd!
- Accès: Web Client, API

### Livreur (garanti)
- Email: livreur1@example.com
- Téléphone: 0700000001 / +2250700000001
- Mot de passe: livreur123
- Accès: App Mobile Livreur, API

### Livreur (seed)
- Email: livreur.test@example.com
- Téléphone: 0700000011
- Mot de passe: Passw0rd!
- Accès: App Mobile Livreur, Web/ API

---

## Comment se connecter

### 1) Web (tous rôles)
1. Ouvrir: https://nexaci-frontend.onrender.com
2. Saisir Email OU Téléphone + Mot de passe (voir ci-dessus)
3. Valider → redirection vers le dashboard selon le rôle

### 2) Mobile Android — Client
1. Télécharger l’APK: https://expo.dev/artifacts/eas/dKqddS6MELozK2hEQXmsmT.apk
2. Autoriser "Sources inconnues" si demandé
3. Ouvrir l’app → Se connecter avec:
   - Email: client1@example.com (ou Téléphone: 0101010101)
   - Mot de passe: client123
4. Alternatif: créer un nouveau compte via "Créer un compte"

### 3) Mobile Android — Livreur
1. Télécharger l’APK: https://expo.dev/artifacts/eas/4dfNYJud6W6swiQNxKw1YW.apk
2. Ouvrir l’app → Se connecter avec:
   - Email: livreur1@example.com (ou Téléphone: 0700000001)
   - Mot de passe: livreur123

### 4) API (tests rapides)
Endpoint: POST https://nexaci-backend.onrender.com/api/auth/login

Body (exemples):
- Admin: { "email": "admin.web@example.com", "password": "Passw0rd!" }
- Client (email): { "email": "client1@example.com", "password": "client123" }
- Client (téléphone): { "email": "0101010101", "password": "client123" }
- Livreur (email): { "email": "livreur1@example.com", "password": "livreur123" }

Réponse attendue: 200 + data.user + data.token

---

## Notes
- Tous les comptes sont en statut actif et leurs mots de passe ont été vérifiés directement en base MongoDB.
- Les téléphones sont normalisés côté backend; toutes les variantes raisonnables sont acceptées à la connexion.
- Pour générer/partager des QR Codes, ouvrez `frontend/public/install-qr.html` et scannez.
