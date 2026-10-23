# Musclor — guide de reprise

Appli web (PWA) de suivi de musculation, installée sur iPhone depuis l'écran d'accueil, hébergée sur **GitHub Pages**. Ce fichier contient tout le nécessaire pour continuer à la faire évoluer depuis n'importe quel compte Claude / session Claude Code. Dans Claude Code, ce fichier (`CLAUDE.md`) est lu automatiquement ; ailleurs, colle-le en début de conversation.

Langue de l'interface : **français**. Version actuelle : **1.1.0**.

---

## 1. Ce que fait l'appli

Saisir ses séances de musculation et suivre sa progression. 4 onglets (barre de navigation en bas) :

- **Séance** : formulaire de saisie (date, exercice, charge sur un disque avec +/−, séries, répétitions, commentaire) + historique. Éditer ✏️ ou supprimer 🗑️ chaque séance.
- **Calendrier** : vue par mois (lundi en premier). Les jours avec séance sont en rouge avec le nombre de séances. Toucher un jour → détail de la journée + bouton Retour.
- **Courbes** : évolution de la meilleure valeur par séance pour un exercice (courbe lumineuse rouge).
- **Exercices** : catalogue. Chaque exercice a un **groupe de muscle** et une **unité** propres. Créer, éditer (se répercute sur les séances liées), supprimer.

Particularités métier :
- L'unité dépend de l'exercice : `kg`, `%`, `min`, `s`, `km`, `niv`, ou libre. Les valeurs **négatives** sont permises (ex. tractions assistées −27 kg).
- Groupe de muscle : liste prédéfinie + option « Autre… » qui ouvre un champ texte libre.
- Une séance = un bloc complet (on saisit le nombre de séries d'un coup, pas série par série).
- La courbe prend la **meilleure valeur par date** (= plus haute, donc progression même pour l'assistance qui remonte vers 0).

---

## 2. Fichiers du dépôt

| Fichier | Rôle | À ré-uploader quand il change |
|---|---|---|
| `index.html` | **Toute l'appli** : HTML + CSS + JS en un seul fichier, autonome | oui |
| `sw.js` | Service worker : hors-ligne + détection des mises à jour. Contient `VERSION` | oui |
| `manifest.webmanifest` | Nom, icônes, plein écran, couleurs | si modifié |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | Icônes (haltère blanc sur fond rouge) | si modifiées |
| `README.md`, `CLAUDE.md` | Docs (ne sont pas servies par l'appli) | — |

Pas de build, pas de dépendance, pas de framework. **JavaScript vanilla** (style ES5 prudent pour Safari iOS). Tout CSS/JS est inline dans `index.html`. Seule ressource externe : la police Google Fonts (Anton + Inter).

---

## 3. ⚠️ Mécanisme de mise à jour (le point le plus important)

GitHub Pages sert les fichiers de la branche. Pour publier une nouvelle version :

1. Modifier les fichiers voulus (le plus souvent `index.html`).
2. **Dans `sw.js`, augmenter `VERSION`** (ex. `1.1.0` → `1.2.0`) et décrire le changement dans `NOTES`.
3. Ré-uploader les fichiers modifiés sur GitHub (ils remplacent les anciens) → **Commit**.

À la prochaine ouverture, chaque iPhone affiche un bandeau **« Mise à jour disponible »** ; un appui recharge l'appli. **Sans changement de `VERSION`, les téléphones ne voient pas la nouvelle version.** Le service worker ne force jamais la mise à jour (pas de `skipWaiting` auto) : c'est l'utilisateur qui valide.

Règles liées :
- Le tableau `ASSETS` de `sw.js` liste les fichiers mis en cache. **Si tu ajoutes un nouveau fichier** (image, script séparé…), ajoute-le à `ASSETS`, sinon il ne sera pas disponible hors-ligne.
- Garde le tag de release GitHub aligné sur `VERSION` (`v1.2.0`) si tu en crées.

Déploiement = **écraser les fichiers** (pas une release). Une release seule ne déploie rien. Rollback : ré-uploader les fichiers d'un ancien commit/release.

---

## 4. Données (localStorage, sur l'appareil)

Clé : **`suivi-muscu-v2`**. Ne **jamais** changer cette clé sans écrire une migration : ça effacerait l'historique des utilisateurs. (Il existe déjà une migration `v1` → `v2`.) Autre clé : `musclor-tab` (dernier onglet ouvert).

```js
data = {
  catalog: [ { id, name, groupe, unite } ],
  entries: [ { id, date:"YYYY-MM-DD", exId, name, groupe, unite,
               series:Number, reps:Number, valeur:Number, comment:String } ],
  seeded: Boolean   // true tant que ce sont les données d'exemple
}
```

`entries` dénormalise `name/groupe/unite` (copie au moment de la saisie) pour que l'historique survive à la suppression/édition d'un exercice du catalogue ; éditer un exercice répercute ces champs sur ses séances. `exId` relie une séance à son exercice.

**Sauvegarde** : boutons Exporter/Importer (JSON = l'objet `data` entier). Les données sont **par appareil**, jamais synchronisées (pas de serveur). `navigator.storage.persist()` est demandé pour limiter les purges.

---

## 5. Design « Mix » (identité salle de sport, noir & rouge)

Appli **100 % sombre** (pas de thème clair). Tokens CSS dans `:root` de `index.html` :

```
--bg #101011   --surface #1a1a1c   --surface-2 #232326   --line #2b2b2e
--fg #f5f5f5   --muted #a3a3a3   --accent #e8141f (rouge vif)
--good #4ade80   --danger #ff5a5a
```

Typo : **Anton** (titres/chiffres, `--font-disp`), **Inter** (corps, `--font-ui`). Composants maison : disque de charge avec boutons +/−, cartes-steppers séries/réps, barre de navigation basse à 4 icônes, grille de calendrier, courbe SVG lumineuse (dégradé + `drop-shadow`). Cibles tactiles ≥ 44 px.

L'exploration de départ (4 directions : Iron, Néon, Disques, Tableau LED + le Mix retenu) est sur une **toile de design** Claude : https://claude.ai/artifact/Eef5MPUG8Gt6ELdBC2Ua1U — utile pour garder la cohérence ou repartir sur une autre direction.

---

## 6. Conventions pour modifier l'appli

- Un seul `index.html` autonome : garde le CSS/JS inline, pas de build ni de dépendance ajoutée.
- JS vanilla prudent (Safari iOS), tout dans une IIFE, `try/catch` autour de `localStorage`.
- UI et textes en français.
- Doit marcher **hors-ligne** et à **largeur téléphone** (~390 px), sans scroll horizontal.
- Ne pas casser la persistance : clé localStorage stable, migration si le schéma change.
- Accessibilité : vrais `<button>`/`<label>`, `aria-label` sur les boutons-icônes.
- Après **toute** modification destinée à être publiée : **bump `VERSION` dans `sw.js`** + `NOTES`.

Test : le flux de mise à jour (service worker) ne se teste que sur un vrai serveur HTTPS / l'iPhone (bloqué dans les navigateurs intégrés). Le reste se vérifie en servant le dossier en local.

---

## 7. Idées / pistes non faites

- Synchronisation multi-appareils (nécessiterait un backend ou un stockage cloud).
- Export CSV en plus du JSON.
- Records (PR) et volume total par séance.
- Filtre par groupe de muscle dans les courbes.
- `CHANGELOG.md` pour historiser les versions.
