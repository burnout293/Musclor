# Musclor — guide de reprise

Appli web (PWA) de suivi de musculation, installée sur iPhone depuis l'écran d'accueil, hébergée sur **GitHub Pages**. Ce fichier contient tout le nécessaire pour continuer à la faire évoluer depuis n'importe quel compte Claude / session Claude Code. Dans Claude Code, ce fichier (`CLAUDE.md`) est lu automatiquement ; ailleurs, colle-le en début de conversation.

Langue de l'interface : **français**. Version actuelle : **1.4.0**.

---

## 1. Ce que fait l'appli

Saisir ses séances de musculation et suivre sa progression. 4 onglets (barre de navigation en bas) : **Séance, Calendrier, Courbes, Réglages** (depuis la 1.4.0 ; l'ancien onglet Exercices est rangé dans Réglages).

Vocabulaire depuis la 1.4.0 : une **séance** = une journée d'entraînement, d'un **type de séance** (Push, Pull, Jambes… : nom + couleur) ; elle regroupe plusieurs **exercices** (les lignes de `entries`). L'interface dit « exercice ajouté / supprimé » pour une ligne.

- **Séance** : formulaire de saisie (date, type de séance, exercice, charge sur un disque avec +/−, séries, répétitions, commentaire) + historique. Le **type de séance** se choisit à côté de la date ; il appartient à la date et s'enregistre **aussitôt** (`setDayType`), sans attendre la validation d'un exercice. L'exercice se choisit dans une **liste maison** avec la pastille de couleur (A-Z) : la liste native d'iOS n'affiche pas de couleur, donc le `<select id="f-ex">` reste mais caché, comme simple porteur de la valeur (`onExChange` met le bouton à jour). Sous le disque, le bouton **« Reprendre »** remplit charge, séries et répétitions avec la dernière séance de l'exercice. Badge **RECORD** sur une séance qui bat le meilleur résultat des dates précédentes du même exercice (`recordIds`, la toute première séance n'en a pas). Éditer ✏️ ou supprimer 🗑️ chaque séance : la suppression est **immédiate**, avec un message « Annuler » pendant 5 s (`toast(msg, undoFn)`) ; supprimer un exercice ou tout l'historique garde la confirmation.
- **Calendrier** : vue par mois (lundi en premier). Chaque jour de séance est **entièrement coloré par son type** (rouge sans type ; chiffre foncé sur les couleurs claires, `inkFor`), avec une légende des types du mois. Toucher un jour → détail de la journée + bouton Retour, avec le choix du type de séance (pour typer après coup) et un tri **A-Z / Chrono / Couleur** mémorisé pour toutes les dates. Chrono = ordre de saisie (l'`id` commence par l'horodatage en base 36) ; Couleur = ordre de la palette (`hueKey` : teinte, rouge en tête, gris à la fin).
- **Courbes** : **toutes** les courbes à la fois, une carte par exercice ayant des séances (meilleure valeur par séance, courbe lumineuse à la couleur de l'exercice). Graduations rondes (`niceScale` : 6 au plus) ; toucher un point affiche « date · valeur », le toucher à nouveau la masque. Bouton **Filtrer** (cases à cocher, Tout afficher / Tout masquer) et bouton **Trier** (A-Z, Récent = dernière séance d'abord, Personnalisé = ordre réglé avec des flèches). Les deux panneaux s'ouvrent dans la carte d'en-tête, un seul à la fois.
- **Réglages** : un menu (une ligne par rubrique, place prévue pour d'autres), chaque rubrique ouvre sa page avec un retour « ‹ Réglages » (`showSettingsView`, `openSettings`) :
  - **Types d'exercices** (l'ancien onglet Exercices) : chaque exercice a un **groupe de muscle**, une **unité** et une **couleur** propres (11 pastilles + une couleur libre via le sélecteur natif). Créer, éditer (se répercute sur les séances liées), supprimer. La liste « Mes exercices » est **triée par couleur** (`byColor`), puis par nom.
  - **Types de séances** : nom + couleur (même composant de pastilles, `makeSwatches`). Créer, éditer, supprimer ; supprimer un type retire le type des jours concernés mais garde leurs exercices.

Particularités métier :
- L'unité dépend de l'exercice : `kg`, `%`, `min`, `s`, `km`, `niv`, ou libre. Les valeurs **négatives** sont permises (ex. tractions assistées −27 kg).
- Groupe de muscle : liste prédéfinie + option « Autre… » qui ouvre un champ texte libre. **Depuis la 1.2.0, le groupe n'a plus de couleur** (pastille grise) : la couleur appartient à l'exercice.
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

Clé : **`suivi-muscu-v2`**. Ne **jamais** changer cette clé sans écrire une migration : ça effacerait l'historique des utilisateurs. (Il existe déjà une migration `v1` → `v2`.) Autres clés, propres à l'appareil et hors sauvegarde : `musclor-tab` (dernier onglet ouvert ; l'ancienne valeur `"exercices"` mène à Réglages), `musclor-tri-jour` (`"az"|"chrono"|"color"`) et `musclor-courbes` (`{ sort: "az"|"recent"|"custom", hidden: [exId], order: [exId] }`).

```js
data = {
  catalog: [ { id, name, groupe, unite, color:"#rrggbb" } ],
  sessionTypes: [ { id, name, color:"#rrggbb" } ],          // 1.4.0
  dayTypes: { "YYYY-MM-DD": sessionTypeId },                // 1.4.0 : un type par jour
  entries: [ { id, date:"YYYY-MM-DD", exId, name, groupe, unite,
               series:Number, reps:Number, valeur:Number, comment:String } ],
  seeded: Boolean   // true tant que ce sont les données d'exemple
}
```

`entries` dénormalise `name/groupe/unite` (copie au moment de la saisie) pour que l'historique survive à la suppression/édition d'un exercice du catalogue ; éditer un exercice répercute ces champs sur ses séances. `exId` relie une séance à son exercice. La **couleur n'est pas dénormalisée** : elle se lit dans le catalogue (`exColor(exId)`, rouge par défaut).

`dayTypes` peut garder une date sans exercice (type choisi puis rien saisi) : c'est sans effet, le calendrier ne montre que les jours avec exercices. « Effacer » l'historique vide aussi `dayTypes`. L'import recopie `sessionTypes` et `dayTypes` s'ils existent.

Mise en forme des données (`ensureShape`, au chargement et à l'import) : crée `sessionTypes` / `dayTypes` absents (données d'avant la 1.4.0) et complète les couleurs manquantes. Migration des couleurs d'exercice : un exercice sans `color` reprend l'ancienne couleur de son groupe (`LEGACY_GROUP_COLORS`, celles d'avant la 1.2.0), sinon la première couleur libre de `PALETTE`.

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

Détails à respecter (1.2.0) :
- Champs de saisie à **16 px minimum** : en dessous, l'iPhone zoome quand on les touche. Le disque et les compteurs gardent leurs gros chiffres (leurs règles passent après).
- Boutons **enfoncés au toucher** (`button:active`). Safari iOS n'applique `:active` que si la page écoute `touchstart` : l'écouteur vide en tête du script est donc indispensable.
- **Grilles : toujours `minmax(0, 1fr)`**, jamais `1fr` seul, et `padding: 0` sur les boutons qu'elles contiennent. Avec `1fr`, une case trop remplie élargit sa colonne : en 1.2.0, 4 points de couleur + la marge par défaut des boutons faisaient déborder le calendrier de 37 px et l'iPhone décalait toute la page.
- `main` et `form` sont en colonne avec un écart (14 px entre cartes, 12 px entre champs) : pas de marges en ligne pour espacer.
- Onglet actif : trait rouge lumineux au-dessus de l'icône. Date du jour au format « sam. 24 oct. » (`DAYS_SHORT`, `MONTHS_SHORT`).

Couleur d'exercice : variable CSS `--ex` posée sur l'élément ; elle donne le liseré gauche des lignes (`li.row.ex`), la pastille `.exdot` et la couleur de la courbe. Plusieurs SVG coexistent sur la page Courbes : chaque dégradé a un `id` unique (`mcFill1`, `mcFill2`…), sinon toutes les courbes prendraient le premier.

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

Test : le flux de mise à jour (service worker) ne se teste que sur un vrai serveur HTTPS / l'iPhone (bloqué dans les navigateurs intégrés). Le reste se vérifie en servant le dossier en local, **en coupant `sw.js`** (réponse 404) : sinon le service worker sert l'`index.html` en cache et l'on teste l'ancienne version.

---

## 7. Idées / pistes non faites

- Synchronisation multi-appareils (nécessiterait un backend ou un stockage cloud).
- Export CSV en plus du JSON.
- Volume total par séance (les records sont faits).
- Historique compact : outils en icônes, volume écrit « 4 × 8 » (proposé en maquette M01, écarté le 24/10/2026).
- Filtre par groupe de muscle dans les courbes (le filtre actuel est par exercice).
- Glisser-déposer pour l'ordre personnalisé des courbes (aujourd'hui : flèches ↑ ↓).
- `CHANGELOG.md` pour historiser les versions.
