# Configuration de l'utilisateur Admin

## 📍 Où sont stockés les utilisateurs admin ?

L'application utilise **Supabase Auth** pour l'authentification. Les utilisateurs sont stockés dans la table `auth.users` qui est créée automatiquement par Supabase.

## 🔐 Créer un utilisateur admin dans Supabase

### Méthode 1 : Via le Dashboard Supabase (Recommandé)

1. **Connectez-vous à votre projet Supabase**
   - Allez sur [app.supabase.com](https://app.supabase.com)
   - Sélectionnez votre projet

2. **Allez dans Authentication > Users**
   - Cliquez sur **"Add user"** ou **"Invite user"**

3. **Créez l'utilisateur admin**
   - **Email** : `admin@abicollection.com` (ou l'email de votre choix)
   - **Password** : Choisissez un mot de passe sécurisé
   - **Auto Confirm User** : ✅ Cochez cette case pour activer l'utilisateur immédiatement
   - Cliquez sur **"Create user"**

4. **Vérifiez l'utilisateur**
   - L'utilisateur devrait apparaître dans la liste des utilisateurs
   - Son email doit être confirmé (colonne "Confirmed")

### Méthode 2 : Via SQL (Alternative)

Si vous préférez utiliser SQL, exécutez cette commande dans **SQL Editor** :

```sql
-- Créer un utilisateur admin via SQL
-- Note: Cette méthode nécessite d'utiliser l'API Supabase Auth
-- Il est plus simple d'utiliser le Dashboard

-- Pour créer un utilisateur, utilisez plutôt la fonction auth.users
-- via l'API ou le Dashboard
```

**Note** : La création d'utilisateur via SQL direct n'est pas recommandée. Utilisez plutôt le Dashboard ou l'API Supabase Auth.

### Méthode 3 : Via l'API Supabase (Pour scripts)

Si vous voulez créer l'utilisateur programmatiquement :

```javascript
// Exemple avec Supabase Admin API (côté serveur uniquement)
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://zbovidxxvukkwcpaihot.supabase.co',
  'VOTRE_SERVICE_ROLE_KEY' // ⚠️ Ne jamais exposer cette clé côté client
);

const { data, error } = await supabaseAdmin.auth.admin.createUser({
  email: 'admin@abicollection.com',
  password: 'Admin2024!',
  email_confirm: true
});
```

## 🔄 Authentification dans l'application

Une fois l'utilisateur créé dans Supabase :

1. **Ouvrez l'application**
2. **Allez sur la page Admin** (cliquez sur "Admin" dans le menu)
3. **Connectez-vous avec** :
   - Email : `admin@abicollection.com` (ou celui que vous avez créé)
   - Mot de passe : Le mot de passe que vous avez défini dans Supabase

## ⚠️ Fallback local

Si Supabase n'est pas configuré ou si la connexion échoue, l'application utilise un **fallback local** avec ces credentials hardcodés :

- **Email** : `admin@abicollection.com`
- **Password** : `Admin2024!`

Ces credentials sont définis dans `index.html` (ligne 773).

## 🔒 Sécurité

### Recommandations :

1. **Changez le mot de passe par défaut** dans Supabase
2. **Utilisez un mot de passe fort** (minimum 12 caractères, majuscules, minuscules, chiffres, symboles)
3. **Ne commitez jamais** les credentials dans Git
4. **Activez 2FA** dans Supabase pour votre compte (optionnel mais recommandé)

### Pour désactiver le fallback local :

Si vous voulez forcer l'utilisation de Supabase Auth uniquement, modifiez `supabase-service.js` :

```javascript
async signIn(email, password) {
    if (!this.initialized) {
        // Désactiver le fallback local
        return { success: false, error: 'Supabase non configuré' };
    }
    // ... reste du code
}
```

## 🧪 Tester l'authentification

1. Créez l'utilisateur dans Supabase (voir ci-dessus)
2. Ouvrez l'application
3. Allez sur la page Admin
4. Connectez-vous avec les credentials créés
5. Vous devriez accéder au tableau de bord admin

## 📝 Notes

- La table `auth.users` est gérée automatiquement par Supabase
- Vous n'avez pas besoin de créer cette table manuellement
- Les utilisateurs créés via Supabase Auth peuvent être gérés depuis le Dashboard
- Vous pouvez créer plusieurs utilisateurs admin si nécessaire
