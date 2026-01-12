-- Schéma SQL complet et corrigé pour créer les tables Supabase nécessaires
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    description TEXT,
    prix INTEGER NOT NULL,
    categorie TEXT NOT NULL,
    icon TEXT DEFAULT 'fa-gem',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    customer_note TEXT,
    items JSONB NOT NULL,
    total INTEGER NOT NULL,
    status TEXT DEFAULT 'soumis',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) - Activer RLS sur les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLITIQUES POUR LA TABLE PRODUCTS
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les produits sont publics en lecture" ON products;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les produits" ON products;
DROP POLICY IF EXISTS "Tout le monde peut insérer des produits" ON products;
DROP POLICY IF EXISTS "Seuls les admins peuvent supprimer les produits" ON products;

-- Politique: Tout le monde peut lire les produits (lecture publique)
CREATE POLICY "Les produits sont publics en lecture"
    ON products FOR SELECT
    USING (true);

-- Politique: Tout le monde peut insérer des produits (pour la synchronisation initiale)
CREATE POLICY "Tout le monde peut insérer des produits"
    ON products FOR INSERT
    WITH CHECK (true);

-- Politique: Seuls les utilisateurs authentifiés peuvent modifier les produits
CREATE POLICY "Seuls les admins peuvent modifier les produits"
    ON products FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Politique: Seuls les utilisateurs authentifiés peuvent supprimer les produits
CREATE POLICY "Seuls les admins peuvent supprimer les produits"
    ON products FOR DELETE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- POLITIQUES POUR LA TABLE ORDERS
-- =====================================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Tout le monde peut créer des commandes" ON orders;
DROP POLICY IF EXISTS "Seuls les admins peuvent lire les commandes" ON orders;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les commandes" ON orders;

-- Politique: Tout le monde peut créer des commandes
CREATE POLICY "Tout le monde peut créer des commandes"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Politique: Seuls les utilisateurs authentifiés peuvent lire les commandes
CREATE POLICY "Seuls les admins peuvent lire les commandes"
    ON orders FOR SELECT
    USING (auth.role() = 'authenticated');

-- Politique: Seuls les utilisateurs authentifiés peuvent modifier les commandes
CREATE POLICY "Seuls les admins peuvent modifier les commandes"
    ON orders FOR UPDATE
    USING (auth.role() = 'authenticated');

-- =====================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEX POUR AMÉLIORER LES PERFORMANCES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_categorie ON products(categorie);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- =====================================================
-- STORAGE - Buckets pour les images
-- =====================================================

-- Créer le bucket pour les images de produits
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'produits',
    'produits',
    true,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Créer le bucket pour les images de profil
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'profiles',
    'profiles',
    true,
    20971520, -- 20MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
    public = true,
    file_size_limit = 20971520,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Lecture publique des images produits" ON storage.objects;
DROP POLICY IF EXISTS "Insertion publique des images produits" ON storage.objects;
DROP POLICY IF EXISTS "Mise à jour authentifiée des images produits" ON storage.objects;
DROP POLICY IF EXISTS "Suppression authentifiée des images produits" ON storage.objects;

DROP POLICY IF EXISTS "Lecture publique des images profil" ON storage.objects;
DROP POLICY IF EXISTS "Insertion authentifiée des images profil" ON storage.objects;
DROP POLICY IF EXISTS "Mise à jour authentifiée des images profil" ON storage.objects;
DROP POLICY IF EXISTS "Suppression authentifiée des images profil" ON storage.objects;

-- Politiques de stockage pour les produits (public read, authenticated write)
CREATE POLICY "Lecture publique des images produits"
ON storage.objects FOR SELECT
USING (bucket_id = 'produits');

CREATE POLICY "Insertion publique des images produits"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'produits');

CREATE POLICY "Mise à jour authentifiée des images produits"
ON storage.objects FOR UPDATE
USING (bucket_id = 'produits' AND auth.role() = 'authenticated');

CREATE POLICY "Suppression authentifiée des images produits"
ON storage.objects FOR DELETE
USING (bucket_id = 'produits' AND auth.role() = 'authenticated');

-- Politiques de stockage pour les profils (public read, authenticated write)
CREATE POLICY "Lecture publique des images profil"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

CREATE POLICY "Insertion authentifiée des images profil"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Mise à jour authentifiée des images profil"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Suppression authentifiée des images profil"
ON storage.objects FOR DELETE
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');
