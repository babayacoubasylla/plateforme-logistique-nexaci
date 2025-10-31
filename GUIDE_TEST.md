# 🧪 Guide de Test - Applications Mobiles

## 📱 Applications disponibles

### 1. **Mobile Client** (Port 8081)
- Création de colis avec photo
- Création de mandats avec documents
- Suivi en temps réel
- Téléchargement de reçus PDF

### 2. **Mobile Livreur** (Port 8084) ✅ **EN COURS**
- Dashboard avec statistiques
- Liste des colis assignés
- Preuve de livraison (photo + GPS)
- Timeline historique

### 3. **Backend API** (Port 5000) ✅ **ACTIF**
- Gestion colis et mandats
- Upload de fichiers
- Génération de PDF
- Notifications WhatsApp

---

## 🚀 Démarrage rapide

### Mobile Livreur (déjà démarré)
```bash
# Déjà en cours sur http://172.20.10.2:8084
# Scanner le QR code avec Expo Go
```

### Mobile Client
```bash
cd mobile-client
npx expo start
# Scanner le QR code avec Expo Go
```

### Backend (déjà actif)
```bash
# Déjà en cours sur http://localhost:5000
```

---

## 📲 Installation Expo Go

### Android
1. Télécharger **Expo Go** depuis Google Play Store
2. Ouvrir l'app
3. Scanner le QR code affiché dans le terminal

### iOS
1. Télécharger **Expo Go** depuis App Store
2. Ouvrir l'app Caméra native
3. Scanner le QR code (ouvrira automatiquement Expo Go)

---

## 🧪 Scénarios de test

### Test 1 : Mobile Livreur - Connexion
1. Ouvrir Expo Go et scanner le QR code livreur (port 8084)
2. **Login** : Utiliser les identifiants d'un livreur
   - Email : `livreur@test.com`
   - Mot de passe : (celui configuré dans votre base)
3. Vérifier que le dashboard s'affiche avec statistiques

### Test 2 : Mobile Livreur - Dashboard
1. Vérifier l'affichage des statistiques :
   - ✅ Missions du jour
   - ✅ Taux de livraison
   - ✅ Revenus mensuels
   - ✅ Efficacité
2. Vérifier le résumé Colis/Mandats
3. Vérifier la liste "Missions du jour"
4. Tester le scroll complet de la page

### Test 3 : Mobile Livreur - Liste des colis
1. Cliquer sur "📦 Mes Livraisons"
2. Vérifier l'affichage de la liste avec :
   - ✅ Référence du colis
   - ✅ Badge de statut coloré
   - ✅ Nom destinataire
   - ✅ Téléphone
   - ✅ Adresse
   - ✅ Date relative ("Il y a X min")
3. Tester le pull-to-refresh
4. Si vide, vérifier l'EmptyState avec icône 🚚

### Test 4 : Mobile Livreur - Détail du colis
1. Taper sur un colis dans la liste
2. Vérifier l'affichage des informations :
   - ✅ Référence, statut, mode livraison
   - ✅ Destinataire (nom, téléphone, adresse)
   - ✅ Point relais (si applicable)
   - ✅ Expéditeur
3. Vérifier la **timeline historique** :
   - ✅ Liste chronologique des événements
   - ✅ Dates formatées
   - ✅ Descriptions claires

### Test 5 : Mobile Livreur - Preuve de livraison GPS
1. Ouvrir un colis en statut `en_livraison`
2. Vérifier l'affichage du GPS :
   - ✅ Message "📍 GPS capturé: lat, lng" en vert
   - ✅ Coordonnées précises affichées
3. Si GPS refusé : pas de message d'erreur (silencieux)

### Test 6 : Mobile Livreur - Photo de preuve
1. Dans un colis `en_livraison`, cliquer "📷 Prendre une photo"
2. **Première fois** : Accepter la permission caméra
3. Prendre une photo du colis
4. Vérifier :
   - ✅ Photo affichée en preview
   - ✅ Bouton "🗑️ Supprimer" visible
5. Tester la suppression et reprendre une photo

### Test 7 : Mobile Livreur - Mise à jour statut
1. Ajouter un commentaire (optionnel)
2. Cliquer sur l'action selon le statut :
   - `en_attente` → "🧳 Prendre en charge"
   - `pris_en_charge` → "🚚 Démarrer la livraison"
   - `en_livraison` → "✅ Marquer comme livré"
3. Confirmer dans la popup
4. Vérifier :
   - ✅ Toast de succès
   - ✅ Statut mis à jour
   - ✅ GPS ajouté au commentaire `[GPS: lat, lng]`
   - ✅ Historique enrichi avec nouvelle entrée

### Test 8 : Mobile Livreur - États terminaux
1. Ouvrir un colis avec statut `livre` ou `echec_livraison`
2. Vérifier :
   - ✅ Message clair ("✅ Colis livré" ou "❌ Livraison échouée")
   - ✅ Pas de boutons d'action (modification impossible)
   - ✅ Historique complet visible

### Test 9 : Mobile Livreur - Historique
1. Cliquer sur "🕒 Mon Historique" depuis le dashboard
2. Vérifier la liste des livraisons terminées

### Test 10 : Mobile Livreur - Profil
1. Cliquer sur "👤 Mon Profil" depuis le dashboard
2. Vérifier les informations du livreur
3. Tester la déconnexion

---

## 🐛 Points à vérifier

### Fonctionnalités critiques
- [ ] **Permissions** : Caméra et GPS demandées au bon moment
- [ ] **Toast messages** : Affichés pour succès/erreur
- [ ] **Navigation** : Retour arrière fonctionne
- [ ] **Scroll** : Tout le contenu est accessible
- [ ] **Dates** : Formatage relatif correct
- [ ] **Couleurs** : Badges de statut corrects
- [ ] **GPS** : Coordonnées capturées automatiquement
- [ ] **Photo** : Capture et preview fonctionnent
- [ ] **Historique** : Timeline chronologique correcte

### Performance
- [ ] Chargement rapide des listes
- [ ] Pull-to-refresh fluide
- [ ] Pas de freeze lors de la capture photo
- [ ] Pas de freeze lors de la capture GPS

### UI/UX
- [ ] Tous les textes lisibles
- [ ] Espacement cohérent (theme)
- [ ] Ombres et bordures appliquées
- [ ] EmptyStates informatifs
- [ ] Icônes pertinents

---

## 📝 Compte de test livreur

Si besoin de créer un compte livreur de test :

```bash
# Dans le backend
cd backend
node scripts/create-livreur-test.js
```

Ou via l'interface admin web (http://localhost:5173) :
1. Se connecter en tant qu'admin
2. Aller dans "Utilisateurs"
3. Créer un utilisateur avec rôle "livreur"
4. Noter les identifiants

---

## 🎯 Checklist finale

### Mobile Livreur
- [x] Système de thème appliqué
- [x] Dashboard avec statistiques
- [x] Liste colis assignés
- [x] Détail colis complet
- [x] Timeline historique
- [x] Capture GPS automatique
- [x] Photo de preuve
- [x] Mise à jour statuts
- [x] EmptyStates enrichis
- [x] Dates relatives
- [x] Pull-to-refresh

### Mobile Client
- [x] Système de thème appliqué
- [x] Formulaire colis optimisé
- [x] Import contacts
- [x] GPS location
- [x] Parsing liens maps
- [x] Photo picker
- [x] Upload photo vers backend
- [x] Support mandats complet
- [x] Upload documents
- [x] Téléchargement PDF
- [x] Détail colis avec historique

---

## 🔄 Rechargement de l'app

Si besoin de recharger l'app mobile :
- Dans Expo Go : Secouer le téléphone → "Reload"
- Dans le terminal : Appuyer sur `r`

## 🛑 Arrêter les serveurs

```bash
# Dans chaque terminal, appuyer sur Ctrl+C
```

---

## 📞 Support

En cas de problème :
1. Vérifier que le backend tourne (http://localhost:5000)
2. Vérifier les logs du terminal
3. Vérifier la connexion réseau (même WiFi)
4. Redémarrer Expo Go
5. Effacer le cache : `npx expo start -c`

**Bon test ! 🚀**
