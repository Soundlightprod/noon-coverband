# NooN Coverband — récapitulatif de la refonte (prévisualisation)

## Fichiers modifiés
- `index.html`, `videos.html` : réécriture complète (structure, textes conservés, SEO, accessibilité)
- `style.css` : nouvelle feuille de style (noir chaud, ivoire, magenta/cyan du logo)
- `worker.js` : formulaire (nouveaux champs, validation, limites), redirections 301 de `/index.html` et `/videos.html`
## Fichiers ajoutés
- `site.js` (menu, lecteurs vidéo au clic, visionneuse photo, formulaire)
- `logo-mark-176.png` (logo officiel, fond noir rendu transparent), `slp-logo-240.png` (version allégée), `og-noon.jpg` (aperçu de partage 1200×630)
- `robots.txt`, `sitemap.xml`
## Inchangés
`consent.js` (bandeau repositionné en CSS), suivi des visites (même script, mêmes `artist_slug`), `confidentialite.html`, photos, portraits, logos partenaires.

## Contrôles effectués (prévisualisation locale)
- Captures 1440, 1366, 820 et 390 px : pas de débordement horizontal, aucune erreur console
- Mobile 390×844 avec bandeau d'audience : nom, accroche et 2 boutons visibles
- « Voir NooN en live » défile vers la vidéo ; lecture et son au clic (youtube-nocookie)
- Visionneuse : ouverture à Entrée, flèches, fermeture à Échap, focus rendu
- Formulaire : en cas d'échec le message s'affiche et les données restent ; worker testé avec une API mail simulée (cas valide, date à définir, e-mail invalide, message vide, API en panne)
- Menu mobile, ancres, `/index.html` → `/` et `/videos.html` → `/videos` (301)

## À valider avec NooN ou SLP
1. **Noms Cécile et Pierre** : affichés publiquement (demandé par le brief) ; la règle d'anonymisation des fiches artistes SLP/BMB (rôles seuls) est donc à confirmer pour ce site.
2. **Photo d'ouverture** : photo-01 (seule où les deux se voient bien, mais pose studio et basse définition, agrandie à ~800 px). Idéal : une vraie photo live large des deux.
3. **Chiffre des concerts** : « près de cent-vingt » partout provisoirement ; « 120+ » retiré.
4. **Captations** : intitulés « Live · extrait 1/2/3 sur 3 » (titres YouTube) ; morceau, lieu et extrait principal à confirmer (extrait 1 choisi par défaut).
5. **Vignettes vidéo** : chargées depuis YouTube (le poste de travail n'y avait pas accès) ; à héberger en local si souhaité.
6. **Regroupement des artistes** par univers à valider (ex. Daft Punk, Michael Jackson).
7. **« Il y a trois ans »** conservé : année de création à confirmer.
8. **Références** : logos seuls ; lieu, contexte et photo de 2-3 prestations à fournir. **Événements** : aucune photo typée disponible, donc pas d'image.
9. **Formulaire** : l'expéditeur est encore `onboarding@resend.dev` (code existant) et `RESEND_API_KEY` doit exister côté Cloudflare ; réception réelle à tester sur un environnement de test. Pas de captcha (présent sur les autres sites SLP).
10. Fichier `download` à la racine (sans usage apparent) : à supprimer ?
