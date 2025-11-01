# 🔐 Identifiants de Test pour les Applications Mobiles

> **Date de création:** 1 novembre 2025  
> **API Backend:** https://nexaci-backend.onrender.com

## 📱 Applications Disponibles

### 1️⃣ **Mobile Client** (App Client)
**Utilisation:** Pour les clients qui veulent envoyer des colis ou faire des mandats administratifs

#### Identifiants de test:
```
Email: test.user.web@example.com
Mot de passe: Passw0rd!
Rôle: client
```

**Fonctionnalités accessibles:**
- Créer une demande de colis
- Créer un mandat administratif
- Suivre mes envois
- Voir mon historique
- Gérer mon profil

---

### 2️⃣ **Mobile Livreur** (App Livreur)
**Utilisation:** Pour les livreurs qui effectuent les livraisons

#### Identifiants de test:
```
Email: livreur.test@example.com
Mot de passe: Passw0rd!
Rôle: livreur
```

**Fonctionnalités accessibles:**
- Voir les missions assignées
- Mettre à jour le statut des livraisons
- Scanner les codes QR
- Géolocalisation en temps réel
- Historique des livraisons

---

## 🌐 Identifiants Web (Frontend)

### Pour tester l'interface d'administration web:
**URL:** https://nexaci-frontend.onrender.com

#### Compte Admin:
```
Email: admin.web@example.com
Mot de passe: Passw0rd!
Rôle: admin
```

**Fonctionnalités accessibles:**
- Dashboard admin complet
- Gestion des agences
- Gestion des utilisateurs
- Statistiques globales
- Gestion des colis et mandats

#### Compte Client Web:
```
Email: test.user.web@example.com
Mot de passe: Passw0rd!
Rôle: client
```

---

## 📲 Comment tester sur mobile

### Option 1: Via Expo Go (OTA Updates actifs)
1. **Téléchargez Expo Go** sur votre téléphone:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Scannez le QR code** du projet:
   - Pour mobile-client: Exécutez `npm start` dans `mobile-client/`
   - Pour mobile-livreur: Exécutez `npm start` dans `mobile-livreur/`

3. **Connexion:** Utilisez les identifiants ci-dessus

### Option 2: Via APK (Android uniquement)
⚠️ **En attente:** Les builds APK nécessitent la configuration des credentials EAS
- Une fois disponibles, les liens de téléchargement seront ajoutés ici

### Option 3: Via TestFlight (iOS uniquement)
⚠️ **En attente:** Nécessite un compte Apple Developer
- Une fois configuré, l'invitation TestFlight sera partagée

---

## 🔧 Configuration API

Les applications mobiles sont déjà configurées pour pointer vers l'API de production:

**mobile-client/app.json:**
```json
{
  "extra": {
    "API_URL": "https://nexaci-backend.onrender.com"
  }
}
```

**mobile-livreur/app.json:**
```json
{
  "extra": {
    "API_URL": "https://nexaci-backend.onrender.com"
  }
}
```

---

## ✅ Checklist de Test

### Mobile Client:
- [ ] Login avec identifiants client
- [ ] Créer une demande de colis
- [ ] Créer un mandat administratif
- [ ] Voir le suivi en temps réel
- [ ] Vérifier les notifications

### Mobile Livreur:
- [ ] Login avec identifiants livreur
- [ ] Voir les missions assignées
- [ ] Mettre à jour le statut d'une livraison
- [ ] Scanner un QR code (si disponible)
- [ ] Tester la géolocalisation

### Web Admin:
- [ ] Login avec compte admin
- [ ] Accéder à "Gestion Agence"
- [ ] Créer/modifier des agences
- [ ] Voir les statistiques
- [ ] Gérer les utilisateurs

---

## 🆘 Problèmes Courants

### "Erreur de connexion" sur mobile:
1. Vérifiez votre connexion internet
2. Assurez-vous que l'API backend est UP: https://nexaci-backend.onrender.com/api/health
3. Vérifiez que vous utilisez les bons identifiants (email complet)

### "Token invalide":
- Déconnectez-vous et reconnectez-vous
- Effacez le cache de l'application

### "Accès refusé" sur mobile-livreur:
- Assurez-vous d'utiliser un compte avec le rôle **livreur** uniquement
- Le compte client ne fonctionnera pas sur l'app livreur

---

## 📞 Support

Pour tout problème technique, vérifiez:
1. Status de l'API: https://nexaci-backend.onrender.com/api/health
2. Status du frontend: https://nexaci-frontend.onrender.com
3. Les logs de la console de développement

---

**Dernière mise à jour:** 1 novembre 2025 à 04:00 UTC
