// ============================================================================
// CONFIGURATION ET CONSTANTES
// ============================================================================

// Chemin vers le fichier JSON local contenant les données de la recette
const RECIPE_URL = 'data/recipe.json';

// Dictionnaire pour convertir les lettres Nutri-Score en valeurs numériques
const nutriScoreMap = { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5 };

// ============================================================================
// INITIALISATION DE L'APPLICATION
// ============================================================================

// On attend que le HTML soit totalement chargé avant de manipuler le DOM
document.addEventListener('DOMContentLoaded', initProject);

/**
 * Fonction maîtresse qui orchestre l'affichage de la page
 */
async function initProject() {
    try {
        // 1. Récupération du JSON local
        const response = await fetch(RECIPE_URL);
        if (!response.ok) throw new Error(`Erreur HTTP lors du chargement du JSON : ${response.status}`);
        
        const recipeData = await response.json();

        // 2. Injection des textes simples (Titre, Description)
        injectRecipeInfo(recipeData);
        
        // 3. Injection dynamique de la liste des étapes
        injectSteps(recipeData.etapes);

        // 4. Appel à l'API pour générer les ingrédients et calculer la note globale
        await loadIngredientsAndScore(recipeData.codes_barres);

    } catch (error) {
        console.error("Échec de l'initialisation du projet :", error);
    }
}

// ============================================================================
// FONCTIONS D'INJECTION DOM (INTERFACE UTILISATEUR)
// ============================================================================

/**
 * Met à jour le titre principal et la description de la page
 */
function injectRecipeInfo(recipe) {
    const mainTitle = document.querySelector('h1.display-5');
    const description = document.querySelector('p.lead');
    
    if (mainTitle) mainTitle.textContent = recipe.title;
    if (description) description.textContent = recipe.description;
}

/**
 * Crée le code HTML pour chaque étape et l'insère dans la page
 */
function injectSteps(etapes) {
    const stepsContainer = document.querySelector('.list-group.w-auto');
    if (!stepsContainer) return;

    stepsContainer.innerHTML = ''; // Nettoyage de la zone

    etapes.forEach((etape, index) => {
        // On supprime les numéros (ex: "1. ") au début de la phrase venant du JSON
        const cleanText = etape.replace(/^\d+\.\s*/, '');
        
        const stepHTML = `
            <a class="list-group-item list-group-item-action d-flex gap-3 py-3" aria-current="true">
                <img src="https://cdn-icons-png.flaticon.com/512/6614/6614301.png" alt="toque" width="32" height="32" class="rounded-circle flex-shrink-0">
                <div class="d-flex gap-2 w-100 justify-content-between">
                    <div>
                        <h6 class="mb-0">Étape ${index + 1}</h6>
                        <p class="mb-0 opacity-75">${cleanText}</p>
                    </div>
                    <small>
                        <input class="form-check-input flex-shrink-0" type="radio" name="listGroupRadios" value="${index + 1}" ${index === 0 ? 'checked' : ''}>
                    </small>
                </div>
            </a>
        `;
        stepsContainer.insertAdjacentHTML('beforeend', stepHTML);
    });
}

// ============================================================================
// GESTION API ET AFFICHAGE DES INGRÉDIENTS
// ============================================================================

/**
 * Récupère les données de l'API OpenFoodFacts séquentiellement (un par un)
 * Cela évite le bannissement temporaire et les erreurs 408 / 525.
 */
async function loadIngredientsAndScore(barcodes) {
    const plist = document.getElementById('productList');
    if (!plist) return;
    
    plist.innerHTML = ''; // Nettoyage de la grille des produits
    let validScores = []; // Tableau qui stockera uniquement les notes valides (a, b, c, d, e)

    // Chargement séquentiel
    for (const barcode of barcodes) {
        try {
            // Requête vers l'API avec ".json" à la fin pour forcer un retour de données propre
            const url = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,nutriscore_grade,image_front_small_url`;
            const res = await fetch(url);
            
            if (!res.ok) throw new Error(`Code HTTP ${res.status}`);
            
            const data = await res.json();
            
            if (data.product) {
                // Affichage du produit réussi
                displayIngredient(data.product, plist);
                
                // Récupération sécurisée du Nutri-Score pour le calcul mathématique
                const grade = (data.product.nutriscore_grade || "").toLowerCase();
                if (nutriScoreMap[grade]) {
                    validScores.push(grade);
                }
            } else {
                throw new Error("Produit absent de la base de données");
            }
        } catch (err) {
            // En cas d'erreur (CORS, 404, etc.), on affiche une carte "erreur" pour ne pas casser le design
            console.warn(`Impossible de charger le code-barres ${barcode}. Raison:`, err.message);
            displayFallbackIngredient(barcode, plist);
        }
    }

    // Le chargement de tous les ingrédients est terminé, on lance le calcul de la moyenne
    calculateAndDisplayAverageScore(validScores);
}

/**
 * Crée le HTML d'un ingrédient récupéré avec succès
 */
function displayIngredient(product, container) {
    const nutriScore = product.nutriscore_grade || 'unknown';
    const imageSrc = product.image_front_small_url || 'https://via.placeholder.com/140?text=Pas+d%27image';
    const productName = product.product_name || 'Nom inconnu';
    
    const content = document.createElement('div');
    content.className = 'col-md-6 col-lg-4 text-center mb-4';
    
    content.innerHTML = `
        <img src="${imageSrc}" alt="${productName}" width="140" height="140" loading="lazy" style="object-fit:cover;border-radius:50%;" class="shadow-sm mb-3 bg-white">
        <h2 class="fw-normal fs-5">${productName}</h2>
        <img src="https://static.openfoodfacts.org/images/attributes/dist/nutriscore-${nutriScore}.svg" alt="Nutriscore ${nutriScore}" style="height:50px;">
    `;
    
    container.appendChild(content);
}

/**
 * Crée le HTML d'un ingrédient qui a généré une erreur API (Fallback)
 */
function displayFallbackIngredient(barcode, container) {
    const content = document.createElement('div');
    content.className = 'col-md-6 col-lg-4 text-center mb-4 opacity-50'; // Légèrement transparent
    
    content.innerHTML = `
        <img src="https://via.placeholder.com/140?text=Indisponible" alt="Erreur" width="140" height="140" style="object-fit:cover;border-radius:50%;" class="shadow-sm mb-3 bg-light">
        <h2 class="fw-normal fs-5 text-danger">Produit introuvable</h2>
        <img src="https://static.openfoodfacts.org/images/attributes/dist/nutriscore-unknown.svg" alt="Nutriscore inconnu" style="height:50px;">
    `;
    
    container.appendChild(content);
}

// ============================================================================
// ALGORITHME DE CALCUL
// ============================================================================

/**
 * Convertit les lettres en chiffres, fait la moyenne, et affiche l'image globale
 */
function calculateAndDisplayAverageScore(scores) {
    if (scores.length === 0) return; // Sécurité mathématique

    // Addition des points
    let totalPoints = 0;
    scores.forEach(grade => {
        totalPoints += nutriScoreMap[grade];
    });
    
    // Moyenne arrondie
    const averageNumber = Math.round(totalPoints / scores.length);
    
    // Recherche de la lettre correspondante au chiffre obtenu
    const finalGrade = Object.keys(nutriScoreMap).find(key => nutriScoreMap[key] === averageNumber);
    
    // Remplacement du SVG dans l'en-tête HTML
    const mainScoreImg = document.querySelector('.col-lg-6.mx-auto img:last-child');
    if (mainScoreImg && finalGrade) {
        mainScoreImg.src = `https://static.openfoodfacts.org/images/attributes/dist/nutriscore-${finalGrade}.svg`;
        mainScoreImg.alt = `Nutri-Score moyen : ${finalGrade.toUpperCase()}`;
    }
}