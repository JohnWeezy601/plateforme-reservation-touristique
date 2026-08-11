const express = require("express");

const router = express.Router();

const recommandationController =
    require("../controllers/recommandationController");


// =====================================================
// STATISTIQUES ADMIN
// =====================================================

router.get(
    "/admin",
    recommandationController.getStatistiquesAdmin
);


// =====================================================
// GENERER RECOMMANDATIONS POUR UN UTILISATEUR
// =====================================================

router.post(
    "/generer/:id",
    recommandationController.genererRecommandation
);


// =====================================================
// RECUPERER RECOMMANDATIONS D'UN UTILISATEUR
// =====================================================

router.get(
    "/:id",
    recommandationController.getRecommandations
);


module.exports = router;