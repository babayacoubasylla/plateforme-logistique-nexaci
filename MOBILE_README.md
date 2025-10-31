# 📱 Applications Mobiles - Plateforme Logistique

## Architecture

Ce projet comprend **deux applications mobiles** React Native/Expo interconnectées avec le backend:

### 1. 📦 **Mobile Client** (`mobile-client/`)
Application pour les clients permettant de:
- Se connecter
- Créer des nouveaux colis
- Suivre ses envois
- Voir l'historique

### 2. 🚚 **Mobile Livreur** (`mobile-livreur/`)
Application pour les livreurs permettant de:
- Se connecter (accès livreur uniquement)
- Voir les colis assignés
- Mettre à jour les statuts (en livraison, livré, échec)
- Ajouter des commentaires

## 🚀 Installation

### Prérequis
- Node.js 18+
- Expo Go installé sur votre téléphone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Backend démarré sur votre réseau local

### Configuration Backend

1. Assurez-vous que le backend tourne:
```bash
cd backend
npm run dev
```

2. Notez l'adresse IP locale de votre ordinateur:
   - Windows: `ipconfig` → Adresse IPv4
   - Mac/Linux: `ifconfig` → inet

3. Mettez à jour `API_URL` dans les fichiers `app.json`:
   - `mobile-client/app.json`
   - `mobile-livreur/app.json`
   
```json
{
  "expo": {
    "extra": {
      "API_URL": "http://VOTRE_IP_LOCALE:5000"
    }
  }
}
```

**Exemple:** `http://192.168.1.70:5000`

### Installation Mobile Client

```bash
cd mobile-client
npm install --legacy-peer-deps
npm start
```

### Installation Mobile Livreur

```bash
cd mobile-livreur
npm install --legacy-peer-deps
npm start
```

## 📲 Utilisation

1. **Lancez l'application** via `npm start`
2. **Scannez le QR code** avec Expo Go
3. **Connectez-vous** avec vos identifiants

### Comptes de test

#### Client
```
Email: client@test.com
Password: password123
Role: client
```

#### Livreur
```
Email: livreur@test.com
Password: password123
Role: livreur
```

## 🔗 Endpoints Backend Utilisés

### Mobile Client
- `POST /api/auth/login` - Connexion
- `GET /api/colis/my-colis` - Liste des colis du client
- `POST /api/colis` - Créer un nouveau colis

### Mobile Livreur
- `POST /api/auth/login` - Connexion (vérifie role=livreur)
- `GET /api/colis/assigned` - Colis assignés au livreur
- `GET /api/colis/:id` - Détails d'un colis
- `PATCH /api/colis/:id/status` - Mise à jour du statut

## 🌐 Flux de Communication

```
Mobile Client ──┐
                ├──> Backend API (Express) ──> MongoDB
Mobile Livreur ─┘                           └─> WhatsApp (Twilio)
```

### Cycle de vie d'un colis

1. **Client** crée un colis → Backend enregistre → **WhatsApp** notifie le destinataire
2. **Admin/Gérant** assigne un livreur → **WhatsApp** notifie le livreur
3. **Livreur** change statut → Backend met à jour → **WhatsApp** notifie le destinataire
4. **Client** consulte le tracking en temps réel

## 🎨 Fonctionnalités

### Mobile Client
- ✅ Authentification sécurisée (JWT + AsyncStorage)
- ✅ Création de colis (domicile / point relais)
- ✅ Liste des envois avec pull-to-refresh
- ✅ Affichage des détails destinataire
- ✅ Interface intuitive et moderne

### Mobile Livreur
- ✅ Authentification livreur uniquement
- ✅ Dashboard avec aperçu tournée
- ✅ Liste des colis assignés (filtrable par statut)
- ✅ Détails complets du colis (expéditeur, destinataire, adresse)
- ✅ Mise à jour statut avec confirmation
- ✅ Ajout de commentaires
- ✅ Code couleur par statut
- ✅ Pull-to-refresh

## 🔧 Développement

### Structure des projets

```
mobile-client/
├── App.tsx                 # Point d'entrée
├── src/
│   ├── config/            # Configuration API
│   ├── navigation/        # Navigation Stack
│   ├── screens/           # Écrans (Login, Dashboard, etc.)
│   └── services/          # API client (axios)
└── app.json               # Config Expo

mobile-livreur/
└── (même structure)
```

### Ajouter un écran

1. Créer `src/screens/MonEcran.tsx`
2. Ajouter le type dans `RootStackParamList` (navigation/AppNavigator.tsx)
3. Ajouter `<Stack.Screen name="MonEcran" component={MonEcran} />`

### Ajouter un endpoint API

1. Ajouter la fonction dans `src/services/api.ts`
2. Utiliser dans un écran avec try/catch

```typescript
import { monEndpoint } from '@/services/api';

const result = await monEndpoint(params);
```

## 🐛 Dépannage

### "Expo Go incompatible"
Les apps utilisent **Expo SDK 54**. Assurez-vous d'avoir la dernière version d'Expo Go.

### "Network Error" / "Request failed"
- Vérifiez que le backend tourne
- Vérifiez l'IP dans `app.json` → `extra.API_URL`
- Assurez-vous d'être sur le même réseau Wi-Fi

### "Cannot read property 'token'"
Vérifiez les identifiants de connexion. Le backend doit renvoyer:
```json
{
  "token": "jwt_token",
  "user": { "role": "client" ou "livreur" }
}
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## 📝 TODO Future

- [ ] Scanner QR code pour les colis
- [ ] Géolocalisation livreur en temps réel
- [ ] Notifications push (Firebase)
- [ ] Mode hors-ligne avec sync
- [ ] Photos de livraison
- [ ] Signature électronique
- [ ] Export PDF des bordereaux
- [ ] Dark mode

## 📄 Licence

MIT - Plateforme Logistique Côte d'Ivoire
