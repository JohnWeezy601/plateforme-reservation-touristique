const express = require("express");

const router = express.Router();


const paiementController =
require("../controllers/paiementController");


const upload =
require("../middleware/upload");




// ==================================
// Ajouter paiement avec preuve
// ==================================

router.post(

"/",

upload.single("preuve"),

paiementController.createPaiement

);






// Afficher paiements

router.get(

"/",

paiementController.getPaiements

);






// Modifier paiement

router.put(

"/:id",

paiementController.updatePaiement

);






// Supprimer paiement

router.delete(

"/:id",

paiementController.deletePaiement

);





module.exports=router;