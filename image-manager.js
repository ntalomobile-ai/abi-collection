// Gestionnaire d'images pour les produits et profils
class ImageManager {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    }

    // Uploader une image de produit
    async uploadProductImage(file) {
        return this.uploadImage(file, 'produits');
    }

    // Uploader une image de profil
    async uploadProfileImage(file) {
        return this.uploadImage(file, 'profiles');
    }

    // Méthode générique pour uploader une image
    async uploadImage(file, category = 'produits') {
        // Vérifier le type de fichier
        if (!this.allowedTypes.includes(file.type)) {
            throw new Error('Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.');
        }

        // Vérifier la taille
        if (file.size > this.maxFileSize) {
            throw new Error(`L'image est trop grande. Taille maximale: ${this.maxFileSize / 1024 / 1024}MB`);
        }

        // Essayer d'uploader vers Supabase Storage d'abord
        if (typeof supabaseService !== 'undefined' && supabaseService.initialized) {
            try {
                console.log(`📤 Tentative d'upload vers Supabase Storage (bucket: ${category})...`);
                const result = await supabaseService.uploadImage(file, category);
                
                if (result.success && result.url) {
                    console.log('✅ Image uploadée avec succès vers Supabase Storage:', result.url);
                    return {
                        url: result.url,
                        type: file.type,
                        size: file.size,
                        name: file.name,
                        category: category,
                        storage: 'supabase',
                        path: result.path
                    };
                } else {
                    console.warn('⚠️ Échec de l\'upload Supabase, utilisation du fallback local:', result.error);
                    // Continuer avec le fallback local
                }
            } catch (error) {
                console.warn('⚠️ Erreur lors de l\'upload Supabase, utilisation du fallback local:', error);
                // Continuer avec le fallback local
            }
        }

        // Fallback: Convertir en base64 pour stockage local
        console.log('💾 Stockage local (base64) de l\'image...');
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Image = e.target.result;
                
                resolve({
                    url: base64Image,
                    type: file.type,
                    size: file.size,
                    name: file.name,
                    category: category,
                    storage: 'local'
                });
            };
            reader.onerror = function(error) {
                reject(new Error('Erreur lors de la lecture du fichier'));
            };
            reader.readAsDataURL(file);
        });
    }

    // Compresser une image si nécessaire
    compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculer les nouvelles dimensions
                    if (width > height) {
                        if (width > maxWidth) {
                            height = (height * maxWidth) / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = (width * maxHeight) / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            const reader = new FileReader();
                            reader.onload = (e) => resolve(e.target.result);
                            reader.onerror = reject;
                            reader.readAsDataURL(blob);
                        },
                        file.type,
                        quality
                    );
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
}

// Instance globale
const imageManager = new ImageManager();
