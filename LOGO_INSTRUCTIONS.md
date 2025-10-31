# Instructions pour ajouter le logo NexaCI

## 📸 Préparation des images

Vous avez besoin de 3 versions de votre logo :

### 1. **icon.png** (Icône de l'application)
- **Dimensions** : 1024 x 1024 pixels
- **Format** : PNG avec transparence
- **Usage** : Icône sur l'écran d'accueil

### 2. **splash.png** (Écran de démarrage)
- **Dimensions** : 1242 x 2436 pixels (iPhone 11 Pro Max)
- **Format** : PNG
- **Usage** : Écran affiché au lancement de l'app

### 3. **adaptive-icon.png** (Android uniquement)
- **Dimensions** : 1024 x 1024 pixels
- **Format** : PNG avec transparence
- **Zone sûre** : Le logo doit être dans un cercle de 768px de diamètre au centre
- **Usage** : Icône adaptative Android

---

## 📁 Où placer les images ?

### Mobile Client
```
mobile-client/
└── assets/
    ├── icon.png          (1024x1024)
    ├── splash.png        (1242x2436)
    └── adaptive-icon.png (1024x1024)
```

### Mobile Livreur
```
mobile-livreur/
└── assets/
    ├── icon.png          (1024x1024)
    ├── splash.png        (1242x2436)
    └── adaptive-icon.png (1024x1024)
```

---

## 🎨 Outils recommandés

### Création/Redimensionnement
1. **Canva** (gratuit) : https://canva.com
2. **Figma** (gratuit) : https://figma.com
3. **Photopea** (gratuit, comme Photoshop) : https://photopea.com

### Templates Expo
- Télécharger les templates officiels : https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/

---

## 🖼️ Exemple de structure pour splash.png

```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          [ESPACE VIDE]          │
│                                 │
│     ┌───────────────────┐       │
│     │                   │       │
│     │   [LOGO NEXACI]   │       │  ← Logo centré
│     │                   │       │
│     └───────────────────┘       │
│                                 │
│      "NexaCI"                   │  ← Nom de marque
│      Livraison & Démarches      │
│                                 │
│          [ESPACE VIDE]          │
│                                 │
└─────────────────────────────────┘
```

**Couleur de fond** : #10b981 (vert émeraude) pour Client, #1976d2 (bleu) pour Livreur

---

## 🚀 Après avoir ajouté les images

1. **Vérifier que les fichiers sont bien nommés** (exactement comme ci-dessus)
2. **Relancer Expo** :
```bash
cd mobile-client
npx expo start -c  # -c pour clear cache

cd mobile-livreur
npx expo start -c
```

3. **Tester** : Le nouveau logo devrait apparaître sur l'écran de connexion

---

## ✅ Checklist

- [ ] icon.png créé (1024x1024)
- [ ] splash.png créé (1242x2436)
- [ ] adaptive-icon.png créé (1024x1024)
- [ ] Fichiers copiés dans mobile-client/assets/
- [ ] Fichiers copiés dans mobile-livreur/assets/
- [ ] Cache Expo effacé (`npx expo start -c`)
- [ ] Logo visible sur écran de connexion
- [ ] Prêt pour le build !

---

## 💡 Astuce rapide

Si vous n'avez pas encore les 3 versions, vous pouvez temporairement :
1. Utiliser la même image 1024x1024 pour icon et adaptive-icon
2. Créer splash.png en mettant votre logo 1024x1024 centré sur un fond 1242x2436 de la couleur de marque

---

## 📞 Besoin d'aide ?

Si vous avez votre logo mais pas dans les bonnes dimensions, envoyez-moi l'image et je vous aide à la redimensionner correctement.
