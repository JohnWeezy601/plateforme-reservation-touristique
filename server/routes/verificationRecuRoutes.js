const express = require("express");

const router = express.Router();

const verificationRecuController = require(
    "../controllers/verificationRecuController"
);


router.get(
    "/:id",
    verificationRecuController.verifierRecu
);


module.exports = router;