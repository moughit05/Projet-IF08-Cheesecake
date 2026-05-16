# Projet IF08 - Le Cheesecake Dynamique

![Status](https://img.shields.io/badge/Status-En%20D%C3%A9veloppement-orange)
![Tech](https://img.shields.io/badge/Tech-HTML5%20%2F%20CSS3%20%2F%20JS-blue)
![API](https://img.shields.io/badge/API-OpenFoodFacts-green)

## Description du Projet

Ce projet consiste à créer un site web **simple, moderne et responsive** dédié à la présentation d'une recette de cheesecake. 

Sa particularité réside dans l'exploitation de la puissance des données ouvertes : le site récupère dynamiquement les informations des ingrédients (images, noms, Nutri-Score) en temps réel via l'API publique **[OpenFoodFacts](https://world.openfoodfacts.org/)**.

### Fonctionnalités Clés
-  **Données Dynamiques** : Récupération automatique des infos produits via codes-barres.
-  **Calcul du Nutri-Score** : Algorithme de calcul du Nutri-Score moyen de la recette.
-  **Responsive Design** : Interface fluide adaptée à tous les supports (Desktop, Tablette, Mobile).
-  **Zéro Image Locale** : Optimisation du stockage par l'utilisation exclusive d'assets distants.

## 🛠️ Technologies Utilisées

| Technologie | Usage |
| :--- | :--- |
| **HTML5** | Structure sémantique de la page |
| **CSS3** | Mise en forme et animations |
| **Bootstrap 5.3** | Framework CSS pour le responsive (via CDN) |
| **JavaScript (ES6+)** | Logique métier, Fetch API et manipulation du DOM |
| **JSON** | Stockage local de la recette et des métadonnées produits |

---

## 📂 Structure du Projet

```text
.
├── index.html          # Point d'entrée principal
├── README.md           # Documentation (ce fichier)
├── css/
│   └── style.css       # Styles personnalisés
├── js/
│   └── main.js         # Logique applicative (appels API & rendu)
└── data/
    ├── recipe.json     # Étapes et contenu de la recette
    └── products.json   # Base de données des codes-barres ingrédients
```

## ⚠️ Contraintes et Directives
> **Règles strictes du projet :**
> - **Images** : Interdiction d'utiliser des images locales. Tout doit provenir d'OpenFoodFacts.
> - **Architecture** : Le site doit rester statique (HTML/CSS/JS uniquement).
> - **Deadline** : Rendu final impératif avant le **Vendredi 5 Juin** sur le serveur FTP.
> - **Workflow** : Suivi obligatoire sur **ClickUp** (tâches de < 2h).

