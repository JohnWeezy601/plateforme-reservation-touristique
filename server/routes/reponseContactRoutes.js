const express = require("express");

const router = express.Router();

const reponseController = require("../controllers/reponseContactController");

// Route de test
router.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Route des réponses fonctionne correctement."
    });

});

// Envoyer une réponse
router.post("/", reponseController.envoyerReponse);

module.exports = router;