# AutoEntrepreneur 1M — PWA multi-agents

Application PWA pour les auto-entrepreneurs : catalogue de profils spécialistes, coopération de **1 à 10 agents**, socle de gestion d'entreprise, bibliothèque de méthodologies, import de fichiers et outils de contrôle qualité.

## Ouvrir

Après activation de GitHub Pages : https://nikoju1977.github.io/AutoEntrepreneur-1M/

L'application peut être installée depuis un navigateur Android, iOS ou ordinateur. Le contenu statique est mis en cache pour fonctionnement hors ligne après une première visite connectée.

## Fonctionnement

- Catalogue combinatoire de **1 000 000 de profils** (50 domaines × 20 spécialisations × 20 rôles × 50 approches). Dix profils maximum travaillent sur une mission.
- Bibliothèque métier locale pour chaque discipline et base commune de gestion d'entreprise.
- Rapports traçant les échanges méthodologiques entre agents, sans modèle d'IA générative connecté.
- Import de fichiers et de dossiers selon compatibilité navigateur. Inspection locale des médias et lecture des documents texte courants.
- Exports structurés, PDF par impression, récupération des originaux.

**Limites :** cette version ne lance pas un million de modèles ni dix LLMs indépendants ; les agents sont des profils et règles métiers déterministes. Les recommandations nécessitent une validation par un professionnel qualifié pour les décisions réglementaires ou sensibles.

## Confidentialité

Les pièces importées restent dans la session du navigateur et ne sont pas envoyées sur un serveur. Ne pas utiliser comme coffre-fort documentaire permanent.

## Déploiement

Le dépôt contient un workflow `.github/workflows/pages.yml` pour publier via GitHub Pages si la fonctionnalité GitHub Pages est activée et configurée pour **GitHub Actions** dans les paramètres du dépôt.
