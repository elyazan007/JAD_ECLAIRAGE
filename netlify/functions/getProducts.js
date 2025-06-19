// Importation du package @netlify/neon
import { neon } from '@netlify/neon';

// Définition du handler de la fonction Netlify
export default async (req, context) => {
  try {
    // Exécuter la requête SQL pour récupérer tous les produits
    // La variable d'environnement NETLIFY_DATABASE_URL est utilisée automatiquement
    const products = await neon`SELECT * FROM products ORDER BY name ASC;`;

    // Retourner une réponse 200 OK avec les produits au format JSON
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Autoriser les requêtes cross-origin
      },
    });
  } catch (error) {
    // En cas d'erreur, retourner une réponse 500 avec le message d'erreur
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ message: "Erreur lors de la récupération des produits.", error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};