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
        await loadProducts();
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

// Charger les données des produits depuis l'API Netlify
async function loadProducts() {
    try {
        console.log("Tentative d'appel à l'API: /api/getProducts");
        // Appel à l'API via la redirection configurée dans netlify.toml
        const response = await fetch("/api/getProducts");
        
        if (!response.ok) {
            throw new Error(`Le serveur a répondu avec une erreur: ${response.status}`);
        }
        
        allProducts = await response.json();
        console.log(`${allProducts.length} produits chargés depuis l'API.`);
    } catch (error) {
        console.error("Erreur dans loadProducts:", error);
        throw new Error("Impossible de charger les données des produits depuis le serveur.");
    }
}

// Initialiser l'interface utilisateur
function initUI() {
    generateCategoryNav();
    displayProducts();
    initSearch();
    initExcelButton();
}

// Générer la navigation par catégories
function generateCategoryNav() {
    const categoryNav = document.getElementById("category-nav");
    if (!categoryNav) return;

    const categoryTree = {};
    allProducts.forEach(product => {
        if (!product.category) return;
        const path = product.category.split('\\');
        let currentLevel = categoryTree;
        for (const segment of path) {
            if (!currentLevel[segment]) {
                currentLevel[segment] = { products: [], subcategories: {} };
            }
            currentLevel[segment].products.push(product);
            currentLevel = currentLevel[segment].subcategories;
        }
    });

    const createCategoryElement = (name, data, path) => {
        const item = document.createElement('div');
        item.className = 'category-item';
        // Compter tous les produits dans cette branche, y compris les sous-catégories
        const totalProductsInBranch = data.products.length;
        item.innerHTML = `<span>${name} (${totalProductsInBranch})</span>`;

        if (Object.keys(data.subcategories).length > 0) {
            item.innerHTML += `<span class="toggle-icon">+</span>`;
            const subContainer = document.createElement('div');
            subContainer.className = 'subcategories-container';
            for (const subName in data.subcategories) {
                const subPath = path ? `${path}\\${subName}` : subName;
                subContainer.appendChild(createCategoryElement(subName, data.subcategories[subName], subPath));
            }
            item.appendChild(subContainer);
        }

        item.querySelector('span:first-child').addEventListener('click', (e) => {
            e.stopPropagation();
            currentCategory = path;
            document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            displayProducts();
        });

        const toggle = item.querySelector('.toggle-icon');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const sub = item.querySelector('.subcategories-container');
                if (sub.style.display === 'block') {
                    sub.style.display = 'none';
                    toggle.textContent = '+';
                } else {
                    sub.style.display = 'block';
                    toggle.textContent = '-';
                }
            });
        }
        return item;
    };

    categoryNav.innerHTML = ''; // Vider la navigation

    const allProductsItem = document.createElement('div');
    allProductsItem.className = 'category-item active';
    allProductsItem.innerHTML = `<span>Tous les produits (${allProducts.length})</span>`;
    allProductsItem.addEventListener('click', () => {
        currentCategory = null;
        document.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
        allProductsItem.classList.add('active');
        displayProducts();
    });
    categoryNav.appendChild(allProductsItem);

    // Démarrer à partir de "Welcome" mais ne pas l'afficher
    if (categoryTree.Welcome) {
        for (const name in categoryTree.Welcome.subcategories) {
            categoryNav.appendChild(createCategoryElement(name, categoryTree.Welcome.subcategories[name], `Welcome\\${name}`));
        }
    }
}

// Initialiser la recherche
function initSearch() {
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", (e) => {
        searchTerm = e.target.value.trim().toLowerCase();
        displayProducts();
    });
}

// Afficher les produits
function displayProducts() {
    const productGrid = document.getElementById("product-grid");
    
    const filteredProducts = allProducts.filter(product => {
        const categoryMatch = !currentCategory || (product.category && product.category.startsWith(currentCategory));
        const searchMatch = !searchTerm || 
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.reference && product.reference.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        return categoryMatch && searchMatch;
    });

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `<div class="no-products"><p>Aucun produit ne correspond à votre recherche.</p></div>`;
        return;
    }

    productGrid.innerHTML = filteredProducts.map(product => {
        const isSelected = selectedProducts.some(p => p.id === product.id);
        const imageUrl = product.imageurl || './placeholder.jpg';
        const price = product.price ? parseFloat(product.price).toFixed(2) : null;
        
        return `
            <div class="product-card ${isSelected ? 'selected' : ''}" data-id="${product.id}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" onerror="this.src='./placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name || 'Sans nom'}</h3>
                    <p class="product-reference">Réf: ${product.reference || 'N/A'}</p>
                    ${price ? `<p class="product-price">${price} Dhs</p>` : ''}
                    <p class="product-description">${product.description || 'Aucune description'}</p>
                </div>
                <button class="select-button" data-id="${product.id}">
                    ${isSelected ? 'Désélectionner' : 'Sélectionner'}
                </button>
            </div>
        `;
    }).join('');

    addSelectButtonEventListeners();
}

function addSelectButtonEventListeners() {
    document.querySelectorAll(".select-button").forEach(button => {
        button.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleProductSelection(e.target.dataset.id);
        });
    });
}

function toggleProductSelection(productId) {
    const product = allProducts.find(p => p.id === productId);
    const index = selectedProducts.findIndex(p => p.id === productId);

    if (index > -1) {
        selectedProducts.splice(index, 1);
    } else {
        selectedProducts.push(product);
    }
    
    updateSelectedProductsList();
    displayProducts();
}

function updateSelectedProductsList() {
    const listContainer = document.getElementById("selected-products-list");
    const excelButton = document.getElementById("generate-excel-button");

    if (selectedProducts.length === 0) {
        listContainer.innerHTML = `<p>Aucun produit sélectionné.</p>`;
        excelButton.disabled = true;
    } else {
        listContainer.innerHTML = `
            <p>${selectedProducts.length} produit(s) sélectionné(s):</p>
            <ul class="selected-list">
                ${selectedProducts.map(p => `
                    <li class="selected-item">
                        <span class="selected-name">${p.name}</span>
                        <button class="remove-button" data-id="${p.id}">×</button>
                    </li>
                `).join('')}
            </ul>`;
        excelButton.disabled = false;
        
        document.querySelectorAll(".remove-button").forEach(button => {
            button.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleProductSelection(e.target.dataset.id);
            });
        });
    }
}

function initExcelButton() {
    document.getElementById("generate-excel-button").addEventListener("click", generateExcel);
}

function generateExcel() {
    if (selectedProducts.length === 0) return;

    try {
        const excelData = selectedProducts.map(p => ({
            'Nom': p.name || '',
            'Référence': p.reference || '',
            'Description': p.description || '',
            'Catégorie': p.category ? p.category.replace('Welcome\\', '') : '',
            'Prix': p.price || ''
        }));
        
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Produits");
        XLSX.writeFile(workbook, `liste_produits_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
        console.error("Erreur Excel:", error);
        alert("Erreur lors de la génération du fichier Excel.");
    }
}