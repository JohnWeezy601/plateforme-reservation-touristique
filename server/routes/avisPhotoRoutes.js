const express = require("express");

const router = express.Router();

const avisPhotoController =
    require("../controllers/avisPhotoController");

const uploadMiddleware =
    require("../middleware/cloudinaryUploadMiddleware");


// =======================================
// Ajouter plusieurs photos à un avis
// POST /api/avis-photo
// =======================================

router.post(

    "/",

    uploadMiddleware.array("photos", 10),

    avisPhotoController.ajouterPhotosAvis

);


// =======================================
// Récupérer les photos d'un avis
// GET /api/avis-photo/:id
// =======================================

router.get(

    "/:id",

    avisPhotoController.getPhotosAvis

);

router.get(
    "/utilisateur/:id",
    avisPhotoController.getPhotosUtilisateur
);


// =======================================
// Supprimer une photo
// DELETE /api/avis-photo/:id
// =======================================

router.delete(

    "/:id",

    avisPhotoController.supprimerPhotoAvis

);


module.exports = router;