const express = require("express");

const router = express.Router();

const paiementController =
    require("../controllers/paiementController");

const upload =
    require("../middleware/upload");


// ==========================================
// AJOUTER PAIEMENT AVEC PREUVE
// ==========================================

router.post(
    "/",
    upload.single("preuve"),
    paiementController.createPaiement
);


// ==========================================
// AFFICHER PAIEMENTS
// ==========================================

router.get(
    "/",
    paiementController.getPaiements
);


// ==========================================
// MODIFIER PAIEMENT
// ==========================================

router.put(
    "/:id",
    paiementController.updatePaiement
);


// ==========================================
// SUPPRIMER PAIEMENT
// ==========================================

router.delete(
    "/:id",
    paiementController.deletePaiement
);


module.exports = router;