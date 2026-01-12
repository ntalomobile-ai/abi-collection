# Abi Collection - Boutique de Luxe

Application e-commerce de luxe avec intégration Supabase et déploiement Netlify.

## 🚀 Fonctionnalités

- Catalogue de produits avec catégories
- Panier d'achat
- Passage de commande via WhatsApp
- Interface d'administration complète
- Gestion des produits et commandes
- Gestion de profil admin avec photo
- Upload d'images (produits et profils)
- Stockage d'images via Supabase Storage (avec fallback local)
- Base de données Supabase
- Déploiement Netlify

## 📋 Prérequis

- Un compte [Supabase](https://supabase.com) (gratuit)
- Un compte [Netlify](https://netlify.com) (gratuit)
- Node.js (optionnel, pour le développement local)

## 🔧 Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **URL du projet** et votre **clé anonyme (anon key)**

### 2. Créer les tables

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Exécutez le script `supabase-schema-complete.sql` qui crée :
   - Table `products` : pour les produits
   - Table `orders` : pour les commandes
   - Politiques RLS (Row Level Security)
   - Index pour les performances
   - Buckets Storage pour les images (`produits` et `profiles`)
   - Politiques de stockage pour les images

### 2.1. Configurer Supabase Storage (optionnel mais recommandé)

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Exécutez le script `supabase-storage-setup.sql` pour créer les buckets :
   - Bucket `produits` : pour les images de produits
   - Bucket `profiles` : pour les photos de profil admin
   - Politiques de stockage (lecture publique, écriture authentifiée)

**Note :** Si vous n'exécutez pas ce script, l'application utilisera un fallback local (base64) pour stocker les images.

### 3. Configurer l'authentification (optionnel)

Si vous souhaitez utiliser l'authentification Supabase :

1. Allez dans **Authentication > Users**
2. Créez un utilisateur avec l'email `admin@abicollection.com`
3. Définissez un mot de passe
4. L'application utilisera automatiquement Supabase Auth

**Note :** L'application fonctionne aussi avec une authentification locale de fallback.

### 4. Configurer les variables d'environnement

Mettez à jour le fichier `config.js` avec vos clés Supabase :

```javascript
const SUPABASE_CONFIG = {
    url: 'https://votre-projet.supabase.co',
    anonKey: 'votre-clé-anonyme'
};
```

## 🌐 Déploiement sur Netlify

### Option 1 : Déploiement via l'interface Netlify

1. **Préparer le dépôt**
   - Créez un dépôt Git (GitHub, GitLab, Bitbucket)
   - Poussez votre code

2. **Connecter à Netlify**
   - Allez sur [netlify.com](https://netlify.com)
   - Cliquez sur **"Add new site" > "Import an existing project"**
   - Connectez votre dépôt Git

3. **Configurer les variables d'environnement**
   - Dans les paramètres du site, allez dans **Site settings > Environment variables**
   - Ajoutez :
     - `VITE_SUPABASE_URL` : votre URL Supabase
     - `VITE_SUPABASE_ANON_KEY` : votre clé anonyme Supabase

4. **Déployer**
   - Netlify détectera automatiquement que c'est un site statique
   - Le déploiement se fera automatiquement

### Option 2 : Déploiement via Netlify CLI

1. **Installer Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Se connecter**
   ```bash
   netlify login
   ```

3. **Initialiser le site**
   ```bash
   netlify init
   ```

4. **Configurer les variables d'environnement**
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://votre-projet.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "votre-clé-anonyme"
   ```

5. **Déployer**
   ```bash
   netlify deploy --prod
   ```

## 📁 Structure des fichiers

```
Boutique/
├── index.html              # Application principale
├── config.js              # Configuration Supabase
├── supabase-service.js    # Service Supabase
├── netlify.toml           # Configuration Netlify
├── _redirects            # Redirections Netlify
├── supabase-schema.sql   # Schéma de base de données
└── README.md             # Ce fichier
```

## 🔐 Sécurité

- Les clés Supabase sont stockées dans `config.js` (à ne pas commiter en production)
- Utilisez les variables d'environnement Netlify pour la production
- Les politiques RLS (Row Level Security) sont activées dans Supabase
- Seuls les utilisateurs authentifiés peuvent modifier les produits et voir les commandes

## 🛠️ Développement local

1. **Ouvrir le projet**
   ```bash
   # Ouvrez simplement index.html dans un navigateur
   # Ou utilisez un serveur local :
   python -m http.server 8000
   # ou
   npx serve
   ```

2. **Configurer Supabase**
   - Mettez à jour `config.js` avec vos clés Supabase

## 📝 Notes importantes

- **Fallback localStorage** : Si Supabase n'est pas configuré, l'application utilise localStorage comme fallback
- **Images** : Les images sont automatiquement uploadées vers Supabase Storage si configuré, sinon stockées en base64 (fallback local). Exécutez `supabase-storage-setup.sql` pour activer le stockage Supabase.
- **WhatsApp** : Les numéros WhatsApp sont définis dans `index.html` (`WHATSAPP_NUMBERS`). Modifiez-les selon vos besoins

## 📸 Gestion des Images

L'application prend en charge deux modes de stockage d'images :

### Mode Supabase Storage (Recommandé pour la production)

1. **Configuration :** Exécutez `supabase-storage-setup.sql` dans le SQL Editor de Supabase
2. **Buckets créés :**
   - `produits` : pour les images de produits (lecture publique, écriture authentifiée)
   - `profiles` : pour les photos de profil admin (lecture publique, écriture authentifiée)
3. **Avantages :**
   - Images hébergées sur CDN Supabase
   - Meilleure performance
   - Pas de limitation de taille dans la base de données
   - URLs publiques pour chaque image

### Mode Local (Fallback)

Si Supabase Storage n'est pas configuré, l'application utilise automatiquement :
- **Stockage base64** dans localStorage (pour le profil admin)
- **Stockage base64** dans la base de données Supabase (pour les produits)
- **Avantages :** Fonctionne immédiatement sans configuration
- **Inconvénients :** Limité par la taille, moins performant

### Upload d'Images

- **Format supportés :** JPEG, JPG, PNG, GIF, WebP
- **Taille maximale :** 5MB par image
- **Compression automatique :** Les images sont automatiquement compressées si nécessaire

## 🐛 Dépannage

### L'application ne se connecte pas à Supabase

1. Vérifiez que vos clés sont correctes dans `config.js`
2. Vérifiez que les tables existent dans Supabase
3. Vérifiez la console du navigateur pour les erreurs

### Les commandes ne s'enregistrent pas

1. Vérifiez les politiques RLS dans Supabase
2. Vérifiez que la table `orders` existe
3. L'application utilisera localStorage en fallback si Supabase échoue

### Les images ne s'uploadent pas vers Supabase Storage

1. Vérifiez que les buckets `produits` et `profiles` existent dans Supabase Storage
2. Exécutez le script `supabase-storage-setup.sql` dans le SQL Editor
3. Vérifiez les politiques de stockage dans Supabase (Storage > Policies)
4. L'application utilisera un fallback local (base64) si Supabase Storage n'est pas disponible

### Problèmes de déploiement Netlify

1. Vérifiez que `netlify.toml` est présent
2. Vérifiez que les variables d'environnement sont définies
3. Consultez les logs de déploiement dans Netlify

## 📞 Support

Pour toute question ou problème, consultez :
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Netlify](https://docs.netlify.com)

## 📄 Licence

Ce projet est fourni tel quel pour usage personnel ou commercial.
