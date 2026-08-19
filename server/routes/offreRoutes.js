const express = require("express");

const router = express.Router();

const offreController =
    require("../controllers/offreController");

const offrePhotoController =
    require("../controllers/offrePhotoController");

const upload =
    require("../middleware/upload");


// Ajouter une offre
router.post(
    "/",
    upload.single("image"),
    offreController.createOffre
);


// Toutes les offres
router.get(
    "/",
    offreController.getOffres
);


// Ajouter plusieurs photos
router.post(
    "/:id/photos",
    upload.array("photos", 10),
    offrePhotoController.ajouterPhotos
);


// Photos d'une offre
router.get(
    "/:id/photos",
    offrePhotoController.getPhotos
);


// Supprimer photo
router.delete(
    "/photos/:idPhoto",
    offrePhotoController.supprimerPhoto
);


// Offre par ID
router.get(
    "/:id",
    offreController.getOffreById
);


// Modifier
router.put(
    "/:id",
    upload.single("image"),
    offreController.updateOffre
);


// Supprimer
router.delete(
    "/:id",
    offreController.deleteOffre
);


module.exports = router;