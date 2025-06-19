// Importation du package @netlify/neon pour une connexion facile à la base de données
import { neon } from '@netlify/neon';

// Le handler principal de la fonction Netlify
export default async (req, context) => {
  try {
    // Exécuter la requête SQL pour récupérer tous les produits, triés par nom
    // La variable d'environnement NETLIFY_DATABASE_URL est utilisée automatiquement par ce package
    const products = await neon`SELECT * FROM products ORDER BY name ASC;`;

    // Si tout va bien, retourner une réponse avec le statut 200 (OK)
    // et la liste des produits au format JSON
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Autoriser les requêtes depuis n'importe quelle origine
      },
    });
  } catch (error) {
    // Si une erreur se produit (ex: problème de connexion, table non trouvée, etc.)
    console.error('Erreur dans la fonction getProducts:', error);
    
    // Retourner une réponse d'erreur 500 (Erreur Interne du Serveur)
    return new Response(JSON.stringify({ message: "Erreur lors de la récupération des produits depuis la base de données.", error: error.message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json' 
      },
    });
  }
};