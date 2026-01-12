# Guide de déploiement - Abi Collection

## 🚀 Déploiement rapide sur Netlify

### Étape 1 : Préparer Supabase

1. Créez un compte sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Dans **SQL Editor**, exécutez le contenu de `supabase-schema.sql`
4. Notez votre **URL** et **anon key** depuis **Settings > API**

### Étape 2 : Configurer l'application

**Option A : Configuration locale (pour développement)**

1. Copiez `config.example.js` vers `config.js`
2. Modifiez `config.js` avec vos clés Supabase :
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://votre-projet.supabase.co',
       anonKey: 'votre-clé-anonyme-ici'
   };
   ```

**Option B : Configuration via variables d'environnement (pour production)**

Pour Netlify, vous pouvez utiliser les variables d'environnement. Cependant, pour un site statique, vous devrez soit :
- Utiliser un build step (voir ci-dessous)
- Ou simplement mettre à jour `config.js` avant de pousser sur Git

### Étape 3 : Déployer sur Netlify

#### Méthode 1 : Via l'interface Netlify (Recommandé)

1. **Préparer le dépôt Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/votre-username/votre-repo.git
   git push -u origin main
   ```

2. **Connecter à Netlify**
   - Allez sur [app.netlify.com](https://app.netlify.com)
   - Cliquez sur **"Add new site" > "Import an existing project"**
   - Sélectionnez votre dépôt Git
   - Netlify détectera automatiquement les paramètres

3. **Configurer les variables d'environnement** (optionnel)
   - Dans **Site settings > Environment variables**
   - Ajoutez :
     - `VITE_SUPABASE_URL` = votre URL Supabase
     - `VITE_SUPABASE_ANON_KEY` = votre clé anonyme

4. **Déployer**
   - Le déploiement se fait automatiquement
   - Votre site sera disponible sur `votre-site.netlify.app`

#### Méthode 2 : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Initialiser le site
netlify init

# Configurer les variables d'environnement
netlify env:set VITE_SUPABASE_URL "https://votre-projet.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "votre-clé-anonyme"

# Déployer
netlify deploy --prod
```

### Étape 4 : Vérifier le déploiement

1. Visitez votre site Netlify
2. Ouvrez la console du navigateur (F12)
3. Vérifiez qu'il n'y a pas d'erreurs Supabase
4. Testez l'ajout d'un produit (en mode admin)
5. Testez la création d'une commande

## 🔧 Configuration avancée

### Utiliser un build step pour injecter les variables d'environnement

Si vous souhaitez utiliser les variables d'environnement Netlify, créez un fichier `build.js` :

```javascript
// build.js
const fs = require('fs');

// Lire config.example.js
let config = fs.readFileSync('config.example.js', 'utf8');

// Remplacer les valeurs par les variables d'environnement
config = config.replace('YOUR_SUPABASE_URL', process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL');
config = config.replace('YOUR_SUPABASE_ANON_KEY', process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY');

// Écrire config.js
fs.writeFileSync('config.js', config);
```

Puis dans `netlify.toml`, ajoutez :

```toml
[build]
  command = "node build.js"
  publish = "."
```

### Sécuriser les clés Supabase

⚠️ **Important** : Les clés Supabase `anon key` sont conçues pour être publiques. Cependant :

1. Ne commitez jamais `config.js` avec vos vraies clés
2. Utilisez `.gitignore` pour exclure `config.js`
3. Utilisez les variables d'environnement en production
4. Configurez les politiques RLS dans Supabase pour sécuriser vos données

## 🐛 Dépannage

### Le site ne se connecte pas à Supabase

1. Vérifiez que `config.js` contient les bonnes clés
2. Vérifiez la console du navigateur pour les erreurs
3. Vérifiez que les tables existent dans Supabase
4. Vérifiez les politiques RLS dans Supabase

### Les variables d'environnement ne fonctionnent pas

Pour un site statique, Netlify ne peut pas injecter les variables d'environnement directement dans le JavaScript client. Solutions :

1. Utilisez un build step (voir ci-dessus)
2. Ou mettez à jour `config.js` directement avec vos clés

### Erreurs CORS

Si vous voyez des erreurs CORS :
1. Vérifiez que votre URL Supabase est correcte
2. Vérifiez les paramètres CORS dans Supabase (Settings > API)

## 📝 Checklist de déploiement

- [ ] Projet Supabase créé
- [ ] Tables créées (exécution de `supabase-schema.sql`)
- [ ] `config.js` configuré avec les clés Supabase
- [ ] Dépôt Git créé et code poussé
- [ ] Site Netlify créé et connecté au dépôt
- [ ] Variables d'environnement configurées (optionnel)
- [ ] Site déployé et testé
- [ ] Authentification admin testée
- [ ] Création de commande testée

## 🎉 C'est fait !

Votre boutique est maintenant en ligne ! 🚀
