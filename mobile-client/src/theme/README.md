# Thème Mobile - Plateforme Logistique

Ce dossier contient le système de design centralisé pour l'application mobile client.

## Structure

- `colors.ts` — Palette de couleurs et mapping des statuts
- `index.ts` — Thème complet (couleurs, espacements, typographies, radius, ombres)

## Usage

```typescript
import { theme } from '@/theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: '#f9fafb'
  },
  title: {
    ...theme.typography.title,
    marginBottom: theme.spacing.md
  },
  card: {
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.medium
  }
});
```

## Espacements

- `xs`: 4px — très petit (marges internes minimales)
- `sm`: 8px — petit (gaps, espacements serrés)
- `md`: 12px — moyen (padding de cartes, marges standards)
- `lg`: 16px — large (padding de conteneur, sections)
- `xl`: 24px — très large (séparations importantes)
- `xxl`: 32px — extra large (espaces majeurs)

## Rayons de bordure

- `sm`: 6px — petits éléments (badges, puces)
- `md`: 10px — éléments standards (inputs, cartes)
- `lg`: 16px — grands éléments (modals, sections)
- `full`: 9999px — arrondi complet (boutons ronds, avatars)

## Typographies

- `title` — Titres principaux (24px, bold)
- `subtitle` — Sous-titres (18px, 600)
- `body` — Texte standard (14px, normal)
- `caption` — Texte secondaire/hints (12px, normal, gris)
- `label` — Labels de champs (14px, 500)

## Ombres

- `small` — Ombres légères (cartes simples)
- `medium` — Ombres moyennes (cartes en relief)
- `large` — Ombres fortes (modals, overlays)

## Couleurs

- `primary`: #1976d2 — Action principale
- `success`: #4caf50 — Succès
- `warning`: #ff9800 — Avertissement
- `danger`: #f44336 — Erreur/Danger
- `info`: #2196f3 — Information
- `purple`: #9c27b0 — En cours
- `neutral`: #757575 — Neutre/Annulé

La fonction `colorForStatus(status)` retourne la couleur associée à un statut de colis/mandat.

## Principe

Toujours utiliser le thème plutôt que des valeurs en dur pour garantir la cohérence visuelle sur toutes les vues.
