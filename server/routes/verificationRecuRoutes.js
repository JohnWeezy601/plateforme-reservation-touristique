const express = require("express");

const router = express.Router();

const verificationRecuController = require(
    "../controllers/verificationRecuController"
);


// =========================================
// VERIFIER UN RECU AVEC SON TOKEN
// =========================================

router.get(
    "/:token",
    verificationRecuController.verifierRecu
);


// =========================================
// CONFIRMER L'ARRIVEE / UTILISER LE RECU
// =========================================

router.post(
    "/:token/utiliser",
    verificationRecuController.utiliserRecu
);


module.exports = router;