const express = require("express");

const router = express.Router();

const offreController =
    require("../controllers/offreController");

const offrePhotoController =
    require("../controllers/offrePhotoController");

const upload =
    require("../middleware/upload");


// =====================================
// AJOUTER UNE OFFRE AVEC IMAGE PRINCIPALE
// POST /api/offres
// =====================================

router.post(
    "/",
    upload.single("image"),
    offreController.createOffre
);



// =====================================
// AFFICHER TOUTES LES OFFRES
// GET /api/offres
// =====================================

router.get(
    "/",
    offreController.getOffres
);



// =====================================
// AJOUTER PLUSIEURS PHOTOS À UNE OFFRE
// POST /api/offres/:id/photos
// =====================================

router.post(
    "/:id/photos",
    upload.array("photos", 10),
    offrePhotoController.ajouterPhotos
);



// =====================================
// RÉCUPÉRER LES PHOTOS D'UNE OFFRE
// GET /api/offres/:id/photos
// =====================================

router.get(
    "/:id/photos",
    offrePhotoController.getPhotos
);



// =====================================
// SUPPRIMER UNE PHOTO
// DELETE /api/offres/photos/:idPhoto
// =====================================

router.delete(
    "/photos/:idPhoto",
    offrePhotoController.supprimerPhoto
);



// =====================================
// AFFICHER UNE OFFRE PAR ID
// GET /api/offres/:id
// =====================================

router.get(
    "/:id",
    offreController.getOffreById
);



// =====================================
// MODIFIER UNE OFFRE
// PUT /api/offres/:id
// =====================================

router.put(
    "/:id",
    upload.single("image"),
    offreController.updateOffre
);



// =====================================
// SUPPRIMER UNE OFFRE
// DELETE /api/offres/:id
// =====================================

router.delete(
    "/:id",
    offreController.deleteOffre
);



module.exports = router;