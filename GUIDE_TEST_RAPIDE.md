# ✅ GUIDE TEST WORKFLOW COMPLET - NEXACI
**Date:** 3 novembre 2025  
**Status:** Prêt pour démonstration

---

## 🎯 WORKFLOW À TESTER

1. ✅ Client crée colis (mobile)
2. ✅ Gérant crée livreur (web)
3. ✅ Gérant assigne livreur (web)
4. ✅ Livreur voit colis (mobile)
5. ✅ Statuts progressifs jusqu'à livraison

---

## 📝 ÉTAPES DÉTAILLÉES

### ÉTAPE 1: Créer colis (Client Mobile)
- App Nexaci Client
- Login: `baba@nexaci.ci`
- "Nouveau colis" → Remplir formulaire
- **Vérifier logs:** `✅ COLIS CRÉÉ AVEC SUCCÈS! Référence: CLS-2025-00000X`

### ÉTAPE 2: Créer livreur (Admin/Gérant Web)
- Web: https://nexaci-frontend.onrender.com
- Login: `gerant@nexaci.com`
- "Gestion utilisateurs" → "Ajouter"
- Rôle: **Livreur**, Agence: Sélectionner
- **Vérifier logs:** `✅ Agence assignée: [Nom Agence]`

### ÉTAPE 3: Voir livreur (Gérant Web)
- "Mes colis" → Ouvrir un colis
- "Assigner livreur" → **Liste doit afficher le nouveau livreur**
- Si vide: **Rafraîchir la page (F5)**
- **Vérifier logs:** `📋 Livreurs trouvés pour agence: 1`

### ÉTAPE 4: Changer statut (Gérant Web)
- Colis → "Changer statut" → `en_preparation`
- Confirmer

### ÉTAPE 5: Assigner livreur (Gérant Web)
- "Assigner livreur" → Sélectionner le livreur
- Confirmer
- **Vérifier:** Message succès

### ÉTAPE 6: Voir assignation (Livreur Mobile)
- App Nexaci Livreur
- Login: email/mot de passe du livreur créé
- "Mes livraisons" → **Colis doit apparaître**

### ÉTAPE 7: Progresser statuts (Livreur Mobile)
- Ouvrir colis → Changer statut:
  - `pris_en_charge` → `en_transit` → `en_livraison` → `livre`

---

## 🐛 SI PROBLÈMES

### Liste livreurs vide
→ **Rafraîchir page (F5)** ou vérifier logs: `📋 Livreurs trouvés`

### Colis invisible
→ Vérifier logs: `🏢 Agence expéditeur` doit être défini

### Pas d'assignation
→ Colis doit être en `en_preparation` d'abord

---

## 📋 CHECKLIST

- [ ] Client crée colis ✅
- [ ] Gérant crée livreur ✅
- [ ] Liste livreurs affichée ✅
- [ ] Gérant assigne livreur ✅
- [ ] Livreur voit colis ✅
- [ ] Statuts progressent ✅

---

**WORKFLOW COMPLET PRÊT!**
