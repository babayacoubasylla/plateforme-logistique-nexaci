# Mobile Livreur - Guide des Fonctionnalités

## 📱 Vue d'ensemble

Application mobile Expo pour les livreurs de la plateforme logistique. Version améliorée avec thème unifié, preuve de livraison GPS + photo, et interface modernisée.

## ✨ Fonctionnalités principales

### 1. **Dashboard livreur**
- **Statistiques en temps réel** : Missions du jour, taux de livraison, revenus mensuels, efficacité
- **Résumé détaillé** : Colis et mandats (total, livrés, en cours, revenus)
- **Missions du jour** : Liste des colis à livrer avec statuts et informations destinataire
- **Accès rapide** : Boutons vers Livraisons, Historique, Profil
- **Scrollable** : Tout le contenu est accessible sans problème de visibilité

### 2. **Mes Livraisons (Colis assignés)**
- Liste de tous les colis assignés au livreur
- Affichage : référence, statut (badge coloré), destinataire, téléphone, adresse, point relais
- Dates formatées (relative : "Il y a X min/h/jours")
- Pull-to-refresh pour actualiser
- EmptyState enrichi quand aucune livraison

### 3. **Détail du colis**
- **Informations complètes** : référence, statut, mode (domicile/point relais), destinataire, expéditeur, point relais
- **Historique timeline** : Affichage chronologique de tous les changements de statut avec dates
- **Preuve de livraison** :
  - 📸 **Photo** : Bouton "Prendre une photo" pour capturer une preuve visuelle
  - 📍 **GPS** : Capture automatique des coordonnées GPS au chargement de l'écran
  - Les coordonnées GPS sont ajoutées automatiquement au commentaire lors de la mise à jour du statut
- **Actions contextuelles** :
  - `en_attente` → Prendre en charge
  - `pris_en_charge`/`en_transit` → Démarrer la livraison
  - `en_livraison` → Marquer comme livré OU Signaler un échec
- **Commentaire optionnel** : Zone de texte multiligne pour notes livreur
- **États terminaux** : Affichage clair si colis livré ou livraison échouée (pas de modification possible)

### 4. **Historique**
- Toutes les livraisons terminées (livrées ou échouées)
- Filtrage et recherche

### 5. **Profil**
- Informations du livreur
- Paramètres compte
- Déconnexion

## 🎨 Système de thème

### Structure
```typescript
theme/
├── colors.ts     // Palette de couleurs + statusColors
└── index.ts      // spacing, typography, borderRadius, shadows
```

### Utilisation
```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,         // 16px
    backgroundColor: '#f9fafb'
  },
  title: {
    ...theme.typography.title,          // fontSize 24, fontWeight 700
    color: theme.colors.primary         // #1976d2
  },
  card: {
    borderRadius: theme.borderRadius.md, // 10px
    ...theme.shadows.medium              // elevation 3, shadowOffset etc.
  }
});
```

### Couleurs de statut
- `en_attente`: Orange (#ff9800)
- `pris_en_charge`: Bleu (#2196f3)
- `en_livraison`: Violet (#9c27b0)
- `livre`: Vert (#4caf50)
- `echec_livraison`: Rouge (#f44336)
- `annule`: Gris (#9e9e9e)

## 📦 Packages installés

### Expo modules
```json
{
  "expo-image-picker": "~15.3.0",    // Caméra + galerie photo
  "expo-location": "~18.1.0",         // GPS + reverse geocoding
  "expo-file-system": "~18.0.10",     // Téléchargement fichiers
  "expo-sharing": "~13.0.3"           // Partage natif
}
```

### Navigation
```json
{
  "@react-navigation/native": "^6.1.18",
  "@react-navigation/native-stack": "^6.9.26"
}
```

### Utilitaires
```json
{
  "react-native-toast-message": "^2.3.3",  // Feedback utilisateur
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

## 🚀 Démarrage

```bash
# Installation des dépendances
cd mobile-livreur
npm install

# Démarrage Expo
npm start

# Ou directement
npx expo start
```

## 🔐 Permissions requises

- **Caméra** : Capture de photos de preuve de livraison
- **Localisation** : GPS pour traçabilité des livraisons

Les permissions sont demandées au moment de l'utilisation (pas au démarrage).

## 📸 Workflow preuve de livraison

1. Livreur ouvre le détail d'un colis en statut `en_livraison`
2. GPS capturé automatiquement en arrière-plan
3. Livreur clique "📷 Prendre une photo"
4. Permission caméra demandée si nécessaire
5. Photo capturée et affichée en preview
6. Livreur peut supprimer et reprendre la photo si besoin
7. Livreur saisit un commentaire optionnel
8. Livreur clique "✅ Marquer comme livré"
9. Les coordonnées GPS sont ajoutées au commentaire automatiquement
10. Statut mis à jour avec photo + GPS + commentaire
11. Toast de confirmation

## 🛠️ Composants UI réutilisables

### EmptyState
```typescript
<EmptyState
  icon="🚚"
  title="Aucune livraison assignée"
  subtitle="Les nouvelles missions apparaîtront ici."
/>
```

### StatusBadge
```typescript
<StatusBadge status="en_livraison" />
// Affiche badge violet avec texte "En livraison"
```

## 📊 Format des dates

Utiliser `formatDate()` pour affichage relatif :
- "À l'instant"
- "Il y a 5 min"
- "Il y a 3h"
- "Il y a 2 jours"
- "15 oct" (si > 7 jours)

```typescript
import { formatDate } from '../utils/dateFormatter';

<Text>{formatDate(item.createdAt)}</Text>
```

## 🔄 Synchronisation

- Pull-to-refresh sur liste des colis assignés
- Rechargement automatique après mise à jour de statut
- Toast de confirmation/erreur pour chaque action

## 🎯 Prochaines améliorations possibles

- [ ] Upload de la photo vers le backend (endpoint à créer)
- [ ] Signature électronique du destinataire
- [ ] Scan de QR code pour vérification colis
- [ ] Navigation GPS vers adresse destinataire
- [ ] Mode hors-ligne avec sync différée
- [ ] Notifications push pour nouvelles missions
- [ ] Chat avec client/support
- [ ] Historique des revenus avec graphiques

## 📝 Notes techniques

- SDK Expo : 54.0.0
- React Native : 0.81.5
- TypeScript : 5.9.2
- Babel plugin module-resolver pour imports @/ (alias vers src/)
- Images : Format JPG/PNG, compression qualité 0.7
- GPS : Permissions foreground uniquement (pas background)
