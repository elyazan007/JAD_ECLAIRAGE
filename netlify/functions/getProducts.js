// Fonction Netlify pour récupérer les produits depuis la base de données NeonDB
const { Pool } = require('pg');

exports.handler = async function(event, context) {
  // Configuration CORS pour permettre les requêtes cross-origin
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Répondre immédiatement aux requêtes OPTIONS (pre-flight)
  if (event.httpMethod === 'OPTIONS' ) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS préflight réussi' })
    };
  }

  // Initialiser la connexion à la base de données
  let client;
  try {
    // Créer un pool de connexion à la base de données NeonDB
    const pool = new Pool({
      connectionString: process.env.NETLIFY_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Nécessaire pour les connexions SSL à NeonDB
      }
    });

    // Acquérir un client depuis le pool
    client = await pool.connect();

    // Exécuter la requête SQL pour récupérer tous les produits
    const result = await client.query('SELECT * FROM products');
    
    // Libérer le client
    client.release();

    // Retourner les produits en format JSON
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    // Gérer les erreurs
    console.error('Erreur lors de la récupération des produits:', error);
    
    // S'assurer que le client est libéré en cas d'erreur
    if (client) {
      client.release();
    }

    // Retourner une réponse d'erreur
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Erreur lors de la récupération des produits',
        error: error.message
      })
    };
  }
};
