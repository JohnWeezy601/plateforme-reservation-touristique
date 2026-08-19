const express = require("express");

const router = express.Router();

const offreController =
    require("../controllers/offreController");

const offrePhotoController =
    require("../controllers/offrePhotoController");

const upload =
    require("../middleware/upload");


// ============================================================
// AJOUTER UNE OFFRE
// ============================================================

router.post(
    "/",
    upload.single("image"),
    offreController.createOffre
);


// ============================================================
// TOUTES LES OFFRES
// ============================================================

router.get(
    "/",
    offreController.getOffres
);


// ============================================================
// AJOUTER PLUSIEURS PHOTOS
// ============================================================

router.post(
    "/:id/photos",
    upload.array("photos", 10),
    offrePhotoController.ajouterPhotos
);


// ============================================================
// PHOTOS D'UNE OFFRE
// ============================================================

router.get(
    "/:id/photos",
    offrePhotoController.getPhotos
);


// ============================================================
// SUPPRIMER PHOTO
// ============================================================

router.delete(
    "/photos/:idPhoto",
    offrePhotoController.supprimerPhoto
);


// ============================================================
// OFFRE PAR ID
// ============================================================

router.get(
    "/:id",
    offreController.getOffreById
);


// ============================================================
// MODIFIER
// ============================================================

router.put(
    "/:id",
    upload.single("image"),
    offreController.updateOffre
);


// ============================================================
// SUPPRIMER
// ============================================================

router.delete(
    "/:id",
    offreController.deleteOffre
);


module.exports = router;