const express = require("express");

const router = express.Router();

const prestataireController = require("../controllers/prestataireController");

// =====================================
// GET tous les prestataires
// GET /api/prestataires
// =====================================
router.get(
    "/",
    prestataireController.getPrestataires
);

// =====================================
// GET prestataire lié à un utilisateur
// GET /api/prestataires/utilisateur/:id
// =====================================
router.get(
    "/utilisateur/:id",
    prestataireController.getPrestataireByUtilisateur
);

// =====================================
// GET statistiques d'un prestataire
// GET /api/prestataires/:id/statistiques
// =====================================
router.get(
    "/:id/statistiques",
    prestataireController.getStatistiquesPrestataire
);

// =====================================
// POST ajouter un prestataire
// POST /api/prestataires
// =====================================
router.post(
    "/",
    prestataireController.createPrestataire
);

// =====================================
// PUT modifier un prestataire
// PUT /api/prestataires/:id
// =====================================
router.put(
    "/:id",
    prestataireController.updatePrestataire
);

// =====================================
// DELETE supprimer un prestataire
// DELETE /api/prestataires/:id
// =====================================
router.delete(
    "/:id",
    prestataireController.deletePrestataire
);

module.exports = router;