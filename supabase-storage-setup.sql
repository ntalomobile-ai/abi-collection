-- =====================================================
-- SETUP SUPABASE STORAGE
-- =====================================================
-- Ce script configure les buckets Supabase Storage
-- pour les images de produits et de profils
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

-- Fin du script