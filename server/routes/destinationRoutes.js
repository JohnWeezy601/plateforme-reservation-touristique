const express = require("express");

const router = express.Router();


// Controller destination
const destinationController =
require("../controllers/destinationController");


// Middleware upload image
const upload =
require("../middleware/upload");





// ================================
// Ajouter destination
// ================================

router.post(

    "/",

    upload.single("image"),

    destinationController.createDestination

);






// ================================
// Afficher destinations
// ================================

router.get(

    "/",

    destinationController.getDestinations

);


router.get(
"/:id/offres",
destinationController.getOffresByDestination
);



router.get(
"/:id",
destinationController.getDestinationById
);





// ================================
// Modifier destination
// ================================

router.put(

    "/:id",

    upload.single("image"),

    destinationController.updateDestination

);








// ================================
// Supprimer destination
// ================================

router.delete(

    "/:id",

    destinationController.deleteDestination

);






module.exports = router;