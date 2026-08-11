const express = require("express");

const router = express.Router();


const prestataireController =
require("../controllers/prestataireController");




// GET tous les prestataires

router.get(
"/",
prestataireController.getPrestataires
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