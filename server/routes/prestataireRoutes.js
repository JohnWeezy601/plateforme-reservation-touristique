const express = require("express");

const router = express.Router();


const prestataireController =
require("../controllers/prestataireController");




// GET tous les prestataires

router.get(
"/",
prestataireController.getPrestataires
);



router.get(
    "/utilisateur/:id",
    prestataireController.getPrestataireByUtilisateur
);

router.get(
    "/:id/statistiques",
    prestataireController.getStatistiquesPrestataire
);




// POST ajouter

router.post(
"/",
prestataireController.createPrestataire
);




// PUT modifier

router.put(
"/:id",
prestataireController.updatePrestataire
);




// DELETE supprimer

router.delete(
"/:id",
prestataireController.deletePrestataire
);



module.exports = router;