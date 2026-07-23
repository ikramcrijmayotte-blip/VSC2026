# CRIJ Mayotte — Suivi Service Civique

Application web de suivi de 30 volontaires accompagnés par 3 CIP, avec espace Direction/Admin.

## Fonctionnalités

- Connexion Direction / Admin
- Création, modification et suppression des comptes
- Rôles : Direction, CIP, Lecture seule
- Gestion des volontaires
- Attribution des volontaires à un CIP
- Suivi des actions, entretiens et formations
- Tableau de bord
- Statistiques
- Déploiement Render

## Déploiement GitHub + Render

1. Créer un nouveau dépôt GitHub.
2. Importer tous les fichiers de ce projet à la racine.
3. Sur Render, choisir `New > Web Service`.
4. Connecter le dépôt GitHub.
5. Render détectera le `render.yaml`, ou renseigner :
   - Build Command : `npm install`
   - Start Command : `npm start`
6. Ajouter les variables d'environnement :
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`

## Compte administrateur

Le compte Direction est créé au premier démarrage à partir des variables :
- ADMIN_EMAIL
- ADMIN_PASSWORD

Ne pas mettre le mot de passe directement dans le code.

## Important pour la production

La version fournie utilise un fichier JSON pour la démonstration. Sur Render Free, le stockage local peut être éphémère après un redéploiement.

Pour un vrai usage professionnel avec des données de jeunes, connecter une base de données persistante comme PostgreSQL/Supabase et ajouter :
- mots de passe hashés avec bcrypt
- sessions sécurisées / JWT
- HTTPS
- sauvegardes
- journal des modifications
- droits d'accès précis
