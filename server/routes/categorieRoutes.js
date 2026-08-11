const express = require("express");
const router = express.Router();

const categorieController = require("../controllers/categorieController");

// Ajouter une catégorie
router.post("/", categorieController.createCategorie);

// Afficher toutes les catégories
router.get("/", categorieController.getCategories);

// Modifier catégorie
router.put(
    "/:id",
    categorieController.updateCategorie
);


// Supprimer catégorie
router.delete(
    "/:id",
    categorieController.deleteCategorie
);

module.exports = router;