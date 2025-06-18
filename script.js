// Catalogue Produits - Script principal
console.log("Chargement du script principal...");

// Variables globales
let allProducts = [];
let selectedProducts = [];
let currentCategory = null;
let searchTerm = "";

// Attendre que le DOM soit chargé
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM chargé, initialisation de l'application...");
    
    try {
        // Charger les données des produits
        await loadProducts();
        
        // Initialiser l'interface utilisateur
        initUI();
        
        console.log("Application initialisée avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation de l'application:", error);
        document.body.innerHTML = `
            <div class="error-container">
                <h2>Erreur de chargement</h2>
                <p>Une erreur est survenue lors du chargement de l'application.</p>
                <p>Détails: ${error.message}</p>
            </div>
        `;
    }
});

// Charger les données des produits depuis l'API Netlify Function
async function loadProducts() {
    try {
        // Modification: Utilisation de l'API Netlify Function au lieu du fichier JSON local
        const response = await fetch("/api/getProducts");
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        allProducts = await response.json();
        console.log(`${allProducts.length} produits chargés`);
    } catch (error) {
        console.error("Erreur lors du chargement des produits:", error);
        throw new Error("Impossible de charger les données des produits");
    }
}

// Initialiser l'interface utilisateur
function initUI() {
    // Générer la navigation par catégories
    generateCategoryNav();
    
    // Afficher tous les produits par défaut
    displayProducts();
    
    // Initialiser la recherche
    initSearch();
    
    // Initialiser le bouton de génération Excel
    initExcelButton();
}

// Générer la navigation par catégories
function generateCategoryNav() {
    const categoryNav = document.getElementById("category-nav");
    if (!categoryNav) {
        console.error("Élément category-nav non trouvé");
        return;
    }
    
    // Extraire toutes les catégories uniques
    const categories = extractCategories();
    
    // Créer la structure HTML pour la navigation
    let navHTML = `<ul class="category-list">`;
    
    // Ajouter l'option "Tous les produits"
    navHTML += `
        <li class="category-item">
            <a href="#" class="category-link" data-category="all">
                Tous les produits (${allProducts.length})
            </a>
        </li>
    `;
    
    // Ajouter les catégories principales (niveau 1)
    // Supprimer "Welcome\" du début des catégories pour l'affichage
    for (const mainCategory in categories) {
        if (mainCategory === "Welcome") continue; // Ignorer la catégorie Welcome
        
        const mainCategoryProducts = countProductsInCategory(mainCategory, categories[mainCategory]);
        
        navHTML += `
            <li class="category-item">
                <a href="#" class="category-link" data-category="${mainCategory}">
                    ${mainCategory} (${mainCategoryProducts})
                </a>
                ${generateSubcategoryList(mainCategory, categories[mainCategory])}
            </li>
        `;
    }
    
    navHTML += `</ul>`;
    categoryNav.innerHTML = navHTML;
    
    // Ajouter les écouteurs d'événements pour les liens de catégories
    addCategoryEventListeners();
}

// Extraire la structure hiérarchique des catégories à partir des produits
function extractCategories() {
    const categoryTree = {};
    
    allProducts.forEach(product => {
        if (!product.category) return;
        
        // Diviser le chemin de catégorie en segments
        const categoryPath = product.category.split("\\");
        
        // Ignorer les produits sans catégorie valide
        if (categoryPath.length < 2) return;
        
        // Construire l'arborescence des catégories
        let currentLevel = categoryTree;
        
        // Commencer à partir de l'index 1 pour ignorer "Welcome"
        for (let i = 1; i < categoryPath.length; i++) {
            const segment = categoryPath[i];
            
            if (!currentLevel[segment]) {
                currentLevel[segment] = {};
            }
            
            currentLevel = currentLevel[segment];
        }
    });
    
    return categoryTree;
}

// Générer la liste HTML des sous-catégories
function generateSubcategoryList(parentCategory, subcategories) {
    if (Object.keys(subcategories).length === 0) {
        return "";
    }
    
    let html = `<ul class="subcategory-list">`;
    
    for (const subcategory in subcategories) {
        const fullPath = `${parentCategory}\\${subcategory}`;
        const subcategoryProducts = countProductsInCategory(fullPath, subcategories[subcategory]);
        
        html += `
            <li class="subcategory-item">
                <a href="#" class="category-link" data-category="${fullPath}">
                    ${subcategory} (${subcategoryProducts})
                </a>
                ${generateSubcategoryList(fullPath, subcategories[subcategory])}
            </li>
        `;
    }
    
    html += `</ul>`;
    return html;
}

// Compter le nombre de produits dans une catégorie et ses sous-catégories
function countProductsInCategory(categoryPath, subcategories) {
    // Compter les produits directement dans cette catégorie
    const directProducts = allProducts.filter(product => {
        // Supprimer "Welcome\" du début pour la comparaison
        const normalizedCategory = product.category.replace("Welcome\\", "");
        return normalizedCategory === categoryPath || normalizedCategory.startsWith(`${categoryPath}\\`);
    }).length;
    
    return directProducts;
}

// Ajouter les écouteurs d'événements pour les liens de catégories
function addCategoryEventListeners() {
    const categoryLinks = document.querySelectorAll(".category-link");
    
    categoryLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            
            // Supprimer la classe active de tous les liens
            categoryLinks.forEach(l => l.classList.remove("active"));
            
            // Ajouter la classe active au lien cliqué
            link.classList.add("active");
            
            // Mettre à jour la catégorie actuelle
            currentCategory = link.getAttribute("data-category");
            
            // Afficher les produits de la catégorie sélectionnée
            displayProducts();
        });
    });
}

// Initialiser la recherche
function initSearch() {
    const searchInput = document.getElementById("search-input");
    
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            searchTerm = event.target.value.trim().toLowerCase();
            displayProducts();
        });
    }
}

// Afficher les produits selon les filtres actuels (catégorie et recherche)
function displayProducts() {
    const productGrid = document.getElementById("product-grid");
    
    if (!productGrid) {
        console.error("Élément product-grid non trouvé");
        return;
    }
    
    // Filtrer les produits selon la catégorie et le terme de recherche
    const filteredProducts = allProducts.filter(product => {
        // Vérifier si le produit correspond à la catégorie sélectionnée
        const categoryMatch = currentCategory === "all" || currentCategory === null || 
            (product.category && (
                // Supprimer "Welcome\" du début pour la comparaison
                product.category.replace("Welcome\\", "") === currentCategory || 
                product.category.replace("Welcome\\", "").startsWith(`${currentCategory}\\`)
            ));
        
        // Vérifier si le produit correspond au terme de recherche
        const searchMatch = !searchTerm || 
            (product.name && product.name.toLowerCase().includes(searchTerm)) || 
            (product.reference && product.reference.toLowerCase().includes(searchTerm)) || 
            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        return categoryMatch && searchMatch;
    });
    
    // Générer le HTML pour les cartes de produits
    let productsHTML = "";
    
    if (filteredProducts.length === 0) {
        productsHTML = `
            <div class="no-products">
                <p>Aucun produit ne correspond à votre recherche.</p>
            </div>
        `;
    } else {
        filteredProducts.forEach(product => {
            const isSelected = selectedProducts.some(p => p.id === product.id);
            const imageUrl = product.imageUrl || './placeholder.jpg';
            
            productsHTML += `
                <div class="product-card ${isSelected ? 'selected' : ''}" data-id="${product.id}">
                    <div class="product-image">
                        ${product.imageUrl ? 
                            `<img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='./placeholder.jpg'">` : 
                            `<div class="no-image">Image non disponible</div>`
                        }
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name || 'Sans nom'}</h3>
                        <p class="product-reference">Réf: ${product.reference || 'N/A'}</p>
                        ${product.price ? `<p class="product-price">${product.price.toFixed(2)} Dhs</p>` : ''}
                        <p class="product-description">${product.description || 'Aucune description disponible'}</p>
                    </div>
                    <button class="select-button" data-id="${product.id}">
                        ${isSelected ? 'Désélectionner' : 'Sélectionner'}
                    </button>
                </div>
            `;
        });
    }
    
    productGrid.innerHTML = productsHTML;
    
    // Ajouter les écouteurs d'événements pour les boutons de sélection
    addSelectButtonEventListeners();
}

// Ajouter les écouteurs d'événements pour les boutons de sélection
function addSelectButtonEventListeners() {
    const selectButtons = document.querySelectorAll(".select-button");
    
    selectButtons.forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.getAttribute("data-id");
            toggleProductSelection(productId);
        });
    });
}

// Basculer la sélection d'un produit
function toggleProductSelection(productId) {
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) {
        console.error(`Produit avec ID ${productId} non trouvé`);
        return;
    }
    
    const isSelected = selectedProducts.some(p => p.id === productId);
    
    if (isSelected) {
        // Désélectionner le produit
        selectedProducts = selectedProducts.filter(p => p.id !== productId);
    } else {
        // Sélectionner le produit
        selectedProducts.push(product);
    }
    
    // Mettre à jour l'affichage
    updateSelectedProductsList();
    displayProducts();
}

// Mettre à jour la liste des produits sélectionnés
function updateSelectedProductsList() {
    const selectedProductsList = document.getElementById("selected-products-list");
    const generateExcelButton = document.getElementById("generate-excel-button");
    
    if (!selectedProductsList || !generateExcelButton) {
        console.error("Éléments de la sélection non trouvés");
        return;
    }
    
    if (selectedProducts.length === 0) {
        selectedProductsList.innerHTML = `<p>Aucun produit sélectionné.</p>`;
        generateExcelButton.disabled = true;
    } else {
        let html = `<ul class="selected-list">`;
        
        selectedProducts.forEach(product => {
            html += `
                <li class="selected-item">
                    <span class="selected-name">${product.name || 'Sans nom'}</span>
                    <span class="selected-ref">${product.reference || 'N/A'}</span>
                    <button class="remove-button" data-id="${product.id}">×</button>
                </li>
            `;
        });
        
        html += `</ul>`;
        selectedProductsList.innerHTML = html;
        generateExcelButton.disabled = false;
        
        // Ajouter les écouteurs d'événements pour les boutons de suppression
        addRemoveButtonEventListeners();
    }
}

// Ajouter les écouteurs d'événements pour les boutons de suppression
function addRemoveButtonEventListeners() {
    const removeButtons = document.querySelectorAll(".remove-button");
    
    removeButtons.forEach(button => {
        button.addEventListener("click", () => {
            const productId = button.getAttribute("data-id");
            toggleProductSelection(productId);
        });
    });
}

// Initialiser le bouton de génération Excel
function initExcelButton() {
    const generateExcelButton = document.getElementById("generate-excel-button");
    
    if (generateExcelButton) {
        generateExcelButton.addEventListener("click", generateExcel);
    }
}

// Générer le fichier Excel
function generateExcel() {
    if (selectedProducts.length === 0) {
        alert("Veuillez sélectionner au moins un produit.");
        return;
    }
    
    try {
        // Préparer les données pour le fichier Excel
        const excelData = selectedProducts.map(product => ({
            'Nom': product.name || '',
            'Référence': product.reference || '',
            'Description': product.description || '',
            'Catégorie': product.category ? product.category.replace('Welcome\\', '') : '',
            'Prix': product.price || ''
        }));
        
        // Créer une nouvelle feuille de calcul
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Créer un nouveau classeur
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");
        
        // Générer le fichier Excel
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        
        // Convertir le buffer en Blob
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Créer un URL pour le Blob
        const url = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `liste_produits_${new Date().toISOString().slice(0, 10)}.xlsx`;
        
        // Ajouter le lien au document et cliquer dessus
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Nettoyer
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        console.log("Fichier Excel généré avec succès");
    } catch (error) {
        console.error("Erreur lors de la génération du fichier Excel:", error);
        alert("Une erreur est survenue lors de la génération du fichier Excel.");
    }
}
