# Guide d'utilisation - JAD ECLAIRAGE Catalogue Produits

Bonjour !

Voici un guide simple pour vous aider à utiliser l'application Catalogue Produits de JAD ECLAIRAGE que j'ai créée pour vos agents commerciaux.

## 1. Accès à l'application

L'application est actuellement accessible via le lien temporaire de test. Une fois déployée sur Netlify, elle sera disponible à une adresse permanente.

[Lien vers l'application de test](https://8080-ips9sp662ksoqs06f4gjs-5d049b95.manusvm.computer)

L'application est conçue pour être **responsive**, elle s'adapte donc aux écrans d'ordinateurs, de tablettes et de smartphones.

## 2. Présentation de l'interface

L'interface se compose de plusieurs zones principales :

*   **En-tête :** Contient le logo et le nom "JAD ECLAIRAGE" ainsi qu'une barre de recherche.
*   **Barre latérale gauche (Catégories) :** Affiche l'arborescence des catégories de produits (Sources de lumières, Extérieur, Intérieur, etc.). Vous pouvez cliquer sur une catégorie pour filtrer les produits affichés.
*   **Grille centrale (Produits) :** C'est ici que les produits sont affichés sous forme de cartes. Chaque carte montre l'image, le nom, la référence, la description et le prix (si disponible).
*   **Barre latérale droite (Sélection) :** Affiche la liste des produits que vous avez sélectionnés et le bouton pour générer le fichier Excel.

## 3. Navigation et Recherche

*   **Parcourir les catégories :** Cliquez sur les noms des catégories dans la barre latérale gauche. Les sous-catégories se déplient. Cliquer sur une catégorie (ou sous-catégorie) affiche uniquement les produits correspondants dans la grille centrale. Cliquez sur "Tous les produits" pour afficher à nouveau l'ensemble du catalogue.
*   **Rechercher un produit :** Utilisez la barre de recherche en haut à droite. Tapez un nom, une référence ou un mot-clé de la description. La grille de produits se mettra à jour automatiquement pour afficher les résultats correspondants, tout en respectant le filtre de catégorie éventuellement actif.

## 4. Sélectionner des produits

*   **Pour sélectionner un produit :** Cliquez sur le bouton "Sélectionner" sur la carte du produit dans la grille centrale. La carte se mettra en surbrillance et le produit sera ajouté à la liste dans la barre latérale droite "Sélection".
*   **Pour désélectionner un produit :** Cliquez sur le bouton "Désélectionner" sur la carte du produit sélectionné dans la grille, ou cliquez sur la petite croix (×) à côté de son nom dans la liste de la barre latérale "Sélection".

## 5. Générer la liste Excel

*   Une fois que vous avez sélectionné tous les produits souhaités, cliquez sur le bouton **"Générer la liste Excel"** en bas de la barre latérale "Sélection".
*   Un fichier Excel (`.xlsx`) contenant la liste des produits sélectionnés (Nom, Référence, Description, Catégorie, Prix) sera automatiquement téléchargé par votre navigateur.
*   Le nom du fichier inclura la date du jour (par ex. `liste_produits_AAAA-MM-JJ.xlsx`).
*   Vous pouvez ensuite ouvrir ce fichier avec Microsoft Excel, Google Sheets, ou tout autre logiciel compatible, et le partager par email, WhatsApp, etc.

## 6. Structure des catégories

L'application affiche maintenant la structure complète des catégories selon la hiérarchie demandée :

* **Sources de lumières** (Standard, Sphérique, Flamme, Spot, etc.)
* **Extérieur**
  * Résidentiel (Appliques, Suspension, Hublots, etc.)
  * Professionnel (Projecteurs, Luminaires, Marché à pied)
* **Intérieur**
  * Décoration (Appliques, Suspensions, Lampadaires, etc.)
  * Éclairage (Panels, Cadres spots, Spots Led, etc.)

## 7. Mise à jour des produits

Actuellement, l'application charge les produits depuis le fichier `products.json`. Pour mettre à jour le catalogue :

1. Modifiez votre fichier Excel source avec les nouveaux produits
2. Utilisez le script de traitement pour générer un nouveau fichier JSON
3. Remplacez le fichier `products.json` dans l'application
4. Redéployez l'application si nécessaire

## 8. Déploiement sur Netlify

Pour déployer cette application sur Netlify et obtenir une URL permanente :

1. Créez un compte sur [Netlify](https://netlify.com) (gratuit)
2. Connectez-vous à votre compte Netlify
3. Sur le tableau de bord, cliquez sur "Add new site" puis "Deploy manually"
4. Faites glisser le dossier décompressé de l'application (`product-catalog-app`) dans la zone de dépôt
5. Attendez que Netlify termine le déploiement (généralement moins d'une minute)
6. Votre application est maintenant en ligne avec une URL Netlify (par exemple, `random-name-123456.netlify.app`)
7. Vous pouvez personnaliser cette URL dans les paramètres du site

Pour mettre à jour l'application plus tard :
1. Modifiez les fichiers localement
2. Allez dans la section "Deploys" de votre site Netlify
3. Faites glisser à nouveau le dossier mis à jour dans la zone de dépôt

---

J'espère que ce guide vous sera utile. N'hésitez pas si vous avez des questions ou si vous souhaitez de l'aide pour le déploiement sur Netlify.
