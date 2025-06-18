/**
 * Script pour initialiser la base de données NeonDB avec les données du fichier products.json
 * 
 * Ce script:
 * 1. Lit le fichier products.json local
 * 2. Se connecte à la base de données NeonDB
 * 3. Pour chaque produit, génère l'URL Cloudinary correspondante
 * 4. Insère les produits dans la table 'products'
 * 
 * Usage: node seed-database.js
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

// Fonction pour normaliser les chaînes (supprimer les accents)
function normalizeString(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Fonction pour transformer le chemin de catégorie en chemin Cloudinary
function generateCloudinaryPath(category, id) {
  if (!category) return `default/${id}`;
  
  // Transformer le chemin de catégorie
  const transformedPath = category
    .split('\\')
    .map(segment => 
      normalizeString(segment)
        .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
    )
    .join('/');
  
  return `${transformedPath}/${id}`;
}

// Fonction principale
async function seedDatabase() {
  console.log('Démarrage de l\'initialisation de la base de données...');
  
  // Vérifier la variable d'environnement
  if (!process.env.NETLIFY_DATABASE_URL) {
    console.error('Erreur: Variable d\'environnement NETLIFY_DATABASE_URL non définie');
    console.log('Veuillez créer un fichier .env avec NETLIFY_DATABASE_URL=votre_url_de_connexion');
    process.exit(1);
  }
  
  // Lire le fichier products.json
  let products;
  try {
    const productsFilePath = path.resolve(__dirname, '../products.json');
    const productsData = fs.readFileSync(productsFilePath, 'utf8');
    products = JSON.parse(productsData);
    console.log(`${products.length} produits trouvés dans le fichier JSON`);
  } catch (error) {
    console.error('Erreur lors de la lecture du fichier products.json:', error);
    process.exit(1);
  }
  
  // Initialiser la connexion à la base de données
  const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Nécessaire pour les connexions SSL à NeonDB
    }
  });
  
  let client;
  try {
    // Acquérir un client depuis le pool
    client = await pool.connect();
    console.log('Connexion à la base de données établie');
    
    // Vérifier si la table products existe déjà
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `);
    
    // Si la table n'existe pas, la créer
    if (!tableCheck.rows[0].exists) {
      console.log('Création de la table products...');
      await client.query(`
        CREATE TABLE products (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          reference VARCHAR(255),
          description TEXT,
          category VARCHAR(255),
          price DECIMAL(10, 2),
          imageUrl VARCHAR(512)
        );
      `);
      console.log('Table products créée avec succès');
    } else {
      console.log('La table products existe déjà');
      
      // Vider la table existante
      await client.query('DELETE FROM products');
      console.log('Table products vidée pour réinitialisation');
    }
    
    // Insérer les produits dans la base de données
    console.log('Insertion des produits dans la base de données...');
    
    for (const product of products) {
      // Générer l'URL Cloudinary
      const cloudinaryPath = generateCloudinaryPath(product.category, product.id);
      const cloudinaryUrl = `https://res.cloudinary.com/dd6m5fhgl/image/upload/${cloudinaryPath}.jpg`;
      
      // Insérer le produit dans la base de données
      await client.query(`
        INSERT INTO products (id, name, reference, description, category, price, imageUrl )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        product.id,
        product.name || '',
        product.reference || '',
        product.description || '',
        product.category || '',
        product.price || 0,
        cloudinaryUrl
      ]);
    }
    
    console.log(`${products.length} produits insérés avec succès dans la base de données`);
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  } finally {
    // Libérer le client
    if (client) {
      client.release();
    }
    
    // Fermer le pool
    await pool.end();
    console.log('Connexion à la base de données fermée');
  }
}

// Exécuter la fonction principale
seedDatabase().catch(console.error);

/**
 * Instructions pour exécuter ce script:
 * 
 * 1. Assurez-vous d'avoir Node.js installé
 * 2. Installez les dépendances nécessaires:
 *    npm install pg dotenv
 * 3. Créez un fichier .env avec votre URL de connexion:
 *    NETLIFY_DATABASE_URL=postgres://username:password@neon.db.url:5432/database
 * 4. Placez votre fichier products.json dans le répertoire parent
 * 5. Exécutez le script:
 *    node seed-database.js
 */
