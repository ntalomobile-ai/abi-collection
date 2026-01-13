// Service Supabase pour gérer les opérations de base de données
class SupabaseService {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    // Initialiser le client Supabase
    async init() {
        if (this.initialized) return;

        try {
            // Charger la configuration
            const config = typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG : 
                          (typeof window !== 'undefined' && window.SUPABASE_CONFIG) ? window.SUPABASE_CONFIG : {
                url: window.SUPABASE_URL || '',
                anonKey: window.SUPABASE_ANON_KEY || ''
            };

            if (!config.url || !config.anonKey) {
                console.warn('Configuration Supabase manquante. Utilisation du mode localStorage.');
                return false;
            }

            // Initialiser Supabase
            this.client = supabase.createClient(config.url, config.anonKey);
            this.initialized = true;
            
            // Vérifier la connexion (ne pas échouer si la table n'existe pas encore)
            try {
                const { data, error } = await this.client.from('products').select('count').limit(1);
                if (error) {
                    // PGRST116 = table n'existe pas encore, c'est OK
                    if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                        console.log('Table products n\'existe pas encore, elle sera créée automatiquement');
                        return true; // On considère que Supabase est prêt même si la table n'existe pas
                    }
                    console.warn('Erreur de connexion Supabase:', error);
                    return false;
                }
            } catch (err) {
                // Si la table n'existe pas, on continue quand même
                console.log('Vérification de la table products:', err.message);
            }

            console.log('Supabase initialisé avec succès');
            return true;
        } catch (error) {
            console.warn('Erreur lors de l\'initialisation Supabase:', error);
            return false;
        }
    }

    // =====================================================
    // PRODUITS
    // =====================================================

    async getProducts() {
        if (!this.initialized) {
            throw new Error('Supabase n\'est pas initialisé. Veuillez configurer Supabase dans config.js');
        }

        try {
            const { data, error } = await this.client
                .from('products')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                // Si la table n'existe pas, retourner un tableau vide
                if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                    console.log('Table products n\'existe pas encore. Veuillez exécuter supabase-schema-complete.sql');
                    return [];
                }
                throw error;
            }
            return data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des produits:', error);
            throw error;
        }
    }

    async addProduct(product) {
        if (!this.initialized) {
            throw new Error('Supabase n\'est pas initialisé. Veuillez configurer Supabase dans config.js');
        }

        try {
            const { data, error } = await this.client
                .from('products')
                .insert([product])
                .select()
                .single();

            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error);
            throw error;
        }
    }

    async updateProduct(id, product) {
        if (!this.initialized) {
            throw new Error('Supabase n\'est pas initialisé. Veuillez configurer Supabase dans config.js');
        }

        try {
            const { data, error } = await this.client
                .from('products')
                .update(product)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            
            return data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour du produit:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        if (!this.initialized) {
            throw new Error('Supabase n\'est pas initialisé. Veuillez configurer Supabase dans config.js');
        }

        try {
            const { error } = await this.client
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            return true;
        } catch (error) {
            console.error('Erreur lors de la suppression du produit:', error);
            throw error;
        }
    }

    // =====================================================
    // COMMANDES
    // =====================================================

    async getOrders() {
        if (!this.initialized) {
            throw new Error('Supabase n\'est pas initialisé. Veuillez configurer Supabase dans config.js');
        }

        try {
            const { data, error } = await this.client
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }
            console.log('Commandes récupérées depuis Supabase:', data?.length || 0);
            return data || [];
        } catch (error) {
            console.error('Erreur lors de la récupération des commandes:', error);
            throw error;
        }
    }

    async addOrder(order) {
        if (!this.initialized) {
            throw new Error('Supabase n\'est pas initialisé. Veuillez configurer Supabase dans config.js');
        }

        try {
            // Préparer les données pour Supabase
            const orderData = {
                customer_name: order.customer.name,
                customer_phone: order.customer.phone,
                customer_address: order.customer.address,
                customer_note: order.customer.note || null,
                items: order.items,
                total: order.total,
                status: order.status || 'soumis',
                created_at: new Date().toISOString()
            };

            console.log('Tentative d\'insertion de la commande dans Supabase...', orderData);

            const { data, error } = await this.client
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (error) {
                console.error('Erreur lors de l\'insertion de la commande dans Supabase:', error);
                console.error('Détails de l\'erreur:', {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }
            
            console.log('✅ Commande insérée avec succès dans Supabase:', data);
            return data;
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de la commande dans Supabase:', error);
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        if (!this.initialized) {
            return this.updateOrderStatusInLocalStorage(id, status);
        }

        try {
            const { data, error } = await this.client
                .from('orders')
                .update({ status: status })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            
            // Synchroniser avec localStorage
            this.updateOrderStatusInLocalStorage(id, status);
            
            return data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la commande:', error);
            return this.updateOrderStatusInLocalStorage(id, status);
        }
    }

    // =====================================================
    // AUTHENTIFICATION
    // =====================================================

    async signIn(email, password) {
        if (!this.initialized) {
            // Fallback vers l'authentification locale
            return this.signInLocal(email, password);
        }

        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { success: true, user: data.user, session: data.session };
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            return this.signInLocal(email, password);
        }
    }

    async signOut() {
        if (!this.initialized) {
            return this.signOutLocal();
        }

        try {
            const { error } = await this.client.auth.signOut();
            if (error) throw error;
            
            this.signOutLocal();
            return { success: true };
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            this.signOutLocal();
            return { success: true };
        }
    }

    async getCurrentUser() {
        if (!this.initialized) {
            return this.getCurrentUserLocal();
        }

        try {
            const { data: { user } } = await this.client.auth.getUser();
            return user;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return this.getCurrentUserLocal();
        }
    }

    // =====================================================
    // FALLBACK LOCALSTORAGE
    // =====================================================

    getProductsFromLocalStorage() {
        const saved = localStorage.getItem('abi_products');
        if (saved) {
            return JSON.parse(saved);
        }
        return [];
    }

    addProductToLocalStorage(product) {
        const products = this.getProductsFromLocalStorage();
        const newId = Math.max(...products.map(p => p.id || 0), 0) + 1;
        products.push({ ...product, id: newId });
        localStorage.setItem('abi_products', JSON.stringify(products));
        return { ...product, id: newId };
    }

    updateProductInLocalStorage(id, product) {
        const products = this.getProductsFromLocalStorage();
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { ...products[index], ...product };
            localStorage.setItem('abi_products', JSON.stringify(products));
            return products[index];
        }
        return null;
    }

    deleteProductFromLocalStorage(id) {
        const products = this.getProductsFromLocalStorage();
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem('abi_products', JSON.stringify(filtered));
        return true;
    }

    getOrdersFromLocalStorage() {
        return JSON.parse(localStorage.getItem('abi_orders') || '[]');
    }

    addOrderToLocalStorage(order) {
        const orders = this.getOrdersFromLocalStorage();
        orders.push(order);
        localStorage.setItem('abi_orders', JSON.stringify(orders));
        return order;
    }

    updateOrderStatusInLocalStorage(id, status) {
        const orders = this.getOrdersFromLocalStorage();
        const order = orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            localStorage.setItem('abi_orders', JSON.stringify(orders));
            return order;
        }
        return null;
    }

    signInLocal(email, password) {
        // Authentification locale de fallback
        const ADMIN_CREDENTIALS = {
            email: 'admin@abicollection.com',
            password: 'Admin2024!'
        };

        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            const token = 'local_' + btoa(JSON.stringify({ email, exp: Date.now() + 3600000 }));
            localStorage.setItem('abi_admin_session', JSON.stringify({
                token: token,
                email: email,
                loginTime: Date.now()
            }));
            return { success: true, user: { email }, session: { access_token: token } };
        }
        return { success: false, error: 'Identifiants incorrects' };
    }

    signOutLocal() {
        localStorage.removeItem('abi_admin_session');
        return { success: true };
    }

    getCurrentUserLocal() {
        const session = localStorage.getItem('abi_admin_session');
        if (session) {
            try {
                const parsed = JSON.parse(session);
                if (Date.now() - parsed.loginTime < 3600000) {
                    return { email: parsed.email };
                }
            } catch (e) {
                // Session invalide
            }
        }
        return null;
    }

    // =====================================================
    // STORAGE - Gestion des images
    // =====================================================

    /**
     * Uploader une image vers Supabase Storage
     * @param {File} file - Le fichier image à uploader
     * @param {string} bucket - Le nom du bucket ('produits' ou 'profiles')
     * @param {string} path - Le chemin où stocker l'image (optionnel)
     * @returns {Promise<{success: boolean, url?: string, error?: string}>}
     */
    async uploadImage(file, bucket = 'produits', path = null) {
        if (!this.initialized || !this.client) {
            return { success: false, error: 'Supabase non initialisé' };
        }

        try {
            // Générer un nom de fichier unique si path n'est pas fourni
            const fileName = path || `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
            const filePath = fileName.replace(/[^a-zA-Z0-9._-]/g, '_'); // Nettoyer le nom de fichier

            // Uploader le fichier
            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Erreur lors de l\'upload vers Supabase Storage:', error);
                return { success: false, error: error.message };
            }

            // Obtenir l'URL publique
            const { data: urlData } = this.client.storage
                .from(bucket)
                .getPublicUrl(filePath);

            console.log('Image uploadée avec succès vers Supabase Storage:', urlData.publicUrl);
            return {
                success: true,
                url: urlData.publicUrl,
                path: filePath
            };
        } catch (error) {
            console.error('Erreur lors de l\'upload d\'image:', error);
            return { success: false, error: error.message || 'Erreur inconnue' };
        }
    }

    /**
     * Supprimer une image de Supabase Storage
     * @param {string} bucket - Le nom du bucket
     * @param {string} path - Le chemin de l'image à supprimer
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deleteImage(bucket, path) {
        if (!this.initialized || !this.client) {
            return { success: false, error: 'Supabase non initialisé' };
        }

        try {
            const { error } = await this.client.storage
                .from(bucket)
                .remove([path]);

            if (error) {
                console.error('Erreur lors de la suppression d\'image:', error);
                return { success: false, error: error.message };
            }

            console.log('Image supprimée avec succès de Supabase Storage');
            return { success: true };
        } catch (error) {
            console.error('Erreur lors de la suppression d\'image:', error);
            return { success: false, error: error.message || 'Erreur inconnue' };
        }
    }

    /**
     * Obtenir l'URL publique d'une image depuis Supabase Storage
     * @param {string} bucket - Le nom du bucket
     * @param {string} path - Le chemin de l'image
     * @returns {string} L'URL publique
     */
    getImageUrl(bucket, path) {
        if (!this.initialized || !this.client) {
            return null;
        }

        try {
            const { data } = this.client.storage
                .from(bucket)
                .getPublicUrl(path);

            return data.publicUrl;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'URL:', error);
            return null;
        }
    }
}

// Instance globale du service
const supabaseService = new SupabaseService();
