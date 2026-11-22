# Consignes Studio Niko — révision Modern Web Guidance

Référentiel officiel : https://github.com/GoogleChrome/modern-web-guidance
Pour toute évolution frontend, privilégier les API web natives, le HTML sémantique, le focus clavier visible, les interfaces réactives et accessibles, la compatibilité Safari iOS/Chrome Android/Firefox, la réduction des mouvements si pertinente, les fallbacks et les opérations non bloquantes.
Pour les développements assistés via un terminal Node.js, consulter la documentation et chercher le guide pertinent à la tâche avec :
- npx modern-web-guidance@latest search "mobile responsive layout"
- npx modern-web-guidance@latest retrieve "<id-retourné-par-la-recherche>"
Ne jamais inventer un identifiant ou annoncer qu'un guide a été consulté sans l'avoir récupéré. La CLI ne fonctionne pas dans une PWA statique sur iPhone.

## Contraintes propres à ce dépôt

PWA multi-profils déterministes. Les profils et règles métiers ne sont pas des modèles LLM autonomes : ne pas les décrire comme une intelligence artificielle véritable. Préserver l'import local et l'export de fichiers, la confidentialité et le fonctionnement hors-ligne partiel.

## Règles de révision
- Modifier les fichiers sources réels, pas uniquement les fichiers générés ; préserver le format, la licence et la structure existante.
- Vérifier les chemins relatifs sur GitHub Pages et Vercel ; gérer les erreurs réseau et fichiers importés sans données fictives.
- Ne jamais placer de clé d'API ou de données personnelles dans un frontend public.
- Ne pas exécuter de campagne de tests sans demande explicite du propriétaire. Ne jamais déclarer une fonctionnalité « testée » ou « déployée » sans preuve.
- Distinguer systématiquement : code écrit, code enregistré, déploiement et fonctionnement vérifié.
