// Configuration Supabase
// Remplacez ces valeurs par vos propres clés Supabase
// Pour Netlify, utilisez les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

// Détecter si on est dans un environnement avec variables d'environnement (Netlify)
const getEnvVar = (name, defaultValue) => {
    // Netlify injecte les variables d'environnement dans window
    if (typeof window !== 'undefined' && window[`__NETLIFY_ENV_${name}`]) {
        return window[`__NETLIFY_ENV_${name}`];
    }
    // Fallback pour les variables d'environnement standard
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
        return process.env[name];
    }
    return defaultValue;
};

const SUPABASE_CONFIG = {
    url: getEnvVar('VITE_SUPABASE_URL', 'https://zbovidxxvukkwcpaihot.supabase.co'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_XSgyfLQp3JqXXwsDqxjJDg_lnhDJ3Ls')
};

// Exposer la config globalement pour supabase-service.js
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
}
