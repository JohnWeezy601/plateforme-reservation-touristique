const express = require("express");

const router = express.Router();

const offreController = require("../controllers/offreController");

const upload = require("../middleware/upload");



// =====================================
// Ajouter une offre avec image
// POST /api/offres
// =====================================

router.post(
    "/",
    upload.single("image"),
    offreController.createOffre
);




// =====================================
// Afficher toutes les offres
// GET /api/offres
// =====================================

router.get(
    "/",
    offreController.getOffres
);




// =====================================
// Afficher une offre par ID
// GET /api/offres/:id
// =====================================

router.get(
    "/:id",
    offreController.getOffreById
);




// =====================================
// Modifier une offre
// PUT /api/offres/:id
// =====================================

router.put(
    "/:id",
    upload.single("image"),
    offreController.updateOffre
);




// =====================================
// Supprimer une offre
// DELETE /api/offres/:id
// =====================================

router.delete(
    "/:id",
    offreController.deleteOffre
);



module.exports = router;