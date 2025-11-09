# 🧪 TEST WORKFLOW COMPLET - NEXACI
**Date:** 9 novembre 2025  
**Objectif:** Validation complète avant publication sur les stores

---

## 🎯 PLAN DE TEST COMPLET

### Phase 1: App Mobile Client 📱
**Durée estimée:** 5 minutes

1. **Installation APK Client**
   - Télécharger: https://expo.dev/artifacts/eas/dKqddS6MELozK2hEQXmsmT.apk
   - Installer sur Android
   - Ouvrir l'application

2. **Connexion Client**
   ```
   📧 Email: baba@nexaci.ci
   🔑 Mot de passe: [Voir dans l'app]
   ```
   OU
   ```
   📧 Email: client@nexaci.com
   🔑 Mot de passe: Client123
   ```

3. **Créer un Nouveau Colis**
   - Cliquer "Nouveau colis"
   - Remplir le formulaire:
     - **Nom destinataire:** Jean Dupont
     - **Téléphone:** +225 07 12 34 56 78
     - **Adresse:** Cocody, Angré 8ème tranche, Villa 123
     - **Type livraison:** Point relais
     - **Poids:** 2 kg
     - **Mode paiement:** Espèces
     - **Valeur déclarée:** 50000 FCFA
   - Valider la création

4. **Vérifications App Client**
   - ✅ Référence colis générée (CLS-2025-XXXXXX)
   - ✅ Colis apparaît dans "Mes colis"
   - ✅ Statut initial: "en_attente"
   - ✅ Toutes les informations correctes

---

### Phase 2: Dashboard Gérant Web 💻
**Durée estimée:** 5 minutes

1. **Connexion Gérant**
   - URL: https://nexaci-frontend.onrender.com
   - Login:
     ```
     📧 Email: gerant@nexaci.com
     🔑 Mot de passe: Gerant123
     ```

2. **Visualiser le Colis Créé**
   - Aller dans "Mes colis"
   - **Rafraîchir la page (F5)** si nécessaire
   - Localiser le colis créé depuis l'app mobile

3. **Préparer le Colis**
   - Ouvrir le détail du colis
   - Changer le statut: "en_attente" → "en_preparation"
   - Vérifier que le changement est sauvegardé

4. **Assigner un Livreur**
   - Cliquer "Assigner un livreur"
   - **Si liste vide: F5 pour rafraîchir**
   - Sélectionner: **Yao Kouassi** (yao.kouassi@nexaci.com)
   - Confirmer l'assignation

5. **Vérifications Dashboard Gérant**
   - ✅ Colis visible dans la liste
   - ✅ Changement de statut fonctionne
   - ✅ Liste livreurs contient 3 options
   - ✅ Assignation réussie avec message de confirmation
   - ✅ Statut mis à jour: "assigné"

---

### Phase 3: App Mobile Livreur 🚚
**Durée estimée:** 10 minutes

1. **Installation APK Livreur**
   - Télécharger: https://expo.dev/artifacts/eas/eic97EjndtetKQQUmjWPvU.apk
   - Installer sur Android
   - Ouvrir l'application

2. **Connexion Livreur**
   ```
   📧 Email: yao.kouassi@nexaci.com
   🔑 Mot de passe: Livreur123
   ```

3. **Voir le Colis Assigné**
   - Aller dans "Mes livraisons"
   - **Swipe down** pour rafraîchir si nécessaire
   - Le colis assigné doit apparaître

4. **Progression des Statuts**
   - Ouvrir le colis assigné
   - Progresser étape par étape:
     
     **Étape 1:** Pris en charge
     - Changer statut: "assigné" → "pris_en_charge"
     - Attendre 30 secondes
     
     **Étape 2:** En transit
     - Changer statut: "pris_en_charge" → "en_transit"
     - Attendre 30 secondes
     
     **Étape 3:** En livraison
     - Changer statut: "en_transit" → "en_livraison"
     - Attendre 30 secondes
     
     **Étape 4:** Livré
     - Changer statut: "en_livraison" → "livre"
     - Confirmer la livraison

5. **Vérifications App Livreur**
   - ✅ Colis assigné visible dans "Mes livraisons"
   - ✅ Détails colis complets (destinataire, adresse, etc.)
   - ✅ Changements de statut fonctionnent
   - ✅ Colis livré apparaît dans "Historique"

---

### Phase 4: Vérification Synchronisation 🔄
**Durée estimée:** 3 minutes

1. **Retour Dashboard Gérant**
   - Rafraîchir la page
   - Vérifier que le colis est maintenant statut "livré"
   - Consulter l'historique des changements

2. **Retour App Client**
   - Rafraîchir "Mes colis"
   - Vérifier que le statut est "livré"
   - Consulter le suivi détaillé

3. **Vérifications Synchronisation**
   - ✅ Statuts synchronisés sur toutes les plateformes
   - ✅ Historique complet visible partout
   - ✅ Horodatage correct des changements

---

## 📊 CHECKLIST VALIDATION COMPLÈTE

### Backend API ✅
- [ ] Health check: https://nexaci-backend.onrender.com/health
- [ ] Authentification fonctionne
- [ ] CRUD colis opérationnel
- [ ] Assignation livreurs OK
- [ ] Changements statuts synchronisés

### Frontend Web ✅
- [ ] Dashboard admin accessible
- [ ] Dashboard gérant fonctionnel
- [ ] Gestion colis complète
- [ ] Assignation livreurs OK
- [ ] Interface responsive

### App Mobile Client ✅
- [ ] Installation APK réussie
- [ ] Connexion utilisateur OK
- [ ] Création colis fonctionnelle
- [ ] Interface intuitive
- [ ] Synchronisation temps réel

### App Mobile Livreur ✅
- [ ] Installation APK réussie
- [ ] Connexion livreur OK
- [ ] Visualisation colis assignés
- [ ] Changement statuts OK
- [ ] Interface ergonomique

### Synchronisation Globale ✅
- [ ] Client → Backend → Gérant
- [ ] Gérant → Backend → Livreur
- [ ] Livreur → Backend → Client/Gérant
- [ ] Temps réel fonctionnel
- [ ] Pas de perte de données

---

## 🚀 PRÊT POUR LES STORES?

Une fois tous les tests validés ✅, nous pourrons procéder à:

### Play Store (Android)
- Préparer les assets (icônes, captures d'écran)
- Configurer les métadonnées
- Build de production signé
- Soumission pour review

### App Store (iOS)
- Configuration Xcode
- Provisioning profiles
- Build iOS signé
- Soumission App Store Connect

---

**🎯 OBJECTIF:** Validation 100% avant publication officielle
**⏱️ TEMPS TOTAL:** ~25 minutes de test approfondi
**📱 PLATEFORMES:** Android (priorité) + iOS (si besoin)