# Suivi Musculation

Appli web installable sur iPhone (écran d'accueil) : saisie des séances, catalogue d'exercices avec unités, courbes de progression. Hébergée sur GitHub Pages, fonctionne hors-ligne, données stockées sur chaque téléphone.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'appli |
| `sw.js` | Hors-ligne + détection des mises à jour (contient `VERSION`) |
| `manifest.webmanifest` | Nom, icône, plein écran |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Icônes |

## Publier une mise à jour

1. Modifier `index.html` (ou les autres fichiers).
2. Dans `sw.js`, augmenter `VERSION` (ex. `1.0.0` → `1.1.0`) et décrire le changement dans `NOTES`.
3. Envoyer les fichiers modifiés sur GitHub (*Add file → Upload files*, ils remplacent les anciens).

À leur prochaine ouverture, les téléphones affichent **« Mise à jour disponible »** avec les notes ; un appui sur **Mettre à jour** recharge l'appli. Les données saisies sont conservées.

Sans changement de `VERSION`, les téléphones ne voient pas la nouvelle version.
