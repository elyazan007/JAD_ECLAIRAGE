// Fonction Netlify pour récupérer les produits depuis la base de données NeonDB
const { Pool } = require('pg');

exports.handler = async function(event, context) {
  // Configuration CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS' ) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  // Vérifier si la variable d'environnement est définie
  if (!process.env.NETLIFY_DATABASE_URL) {
      return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: "Erreur: NETLIFY_DATABASE_URL n'est pas définie." })
      };
  }

  const pool = new Pool({
    connectionString: process.env.NETLIFY_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products ORDER BY name ASC;');
    client.release();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result.rows)
    };
  } catch (error) {
    console.error('Erreur:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Erreur interne du serveur.", error: error.message })
    };
  }
};