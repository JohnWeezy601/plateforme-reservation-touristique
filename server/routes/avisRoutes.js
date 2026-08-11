const express = require("express");

const router = express.Router();


const avisController = require("../controllers/avisController");

const authMiddleware = require("../middleware/authMiddleware");


router.get(
"/admin",
avisController.getTousLesAvisAdmin
);

// ============================================
// Afficher les avis publics
// ============================================

router.get(
"/",
avisController.getAvis
);







// ============================================
// Ajouter un avis
// ============================================

router.post(
"/",
authMiddleware,
avisController.createAvis
);







// ============================================
// Like / Unlike avis
// ============================================
// Like avis
router.post(
"/like",
avisController.likeAvis
);


// Répondre avis
router.post(
"/reponse",
avisController.repondreAvis
);


// Like réponse
router.post(
"/reponse/like",
avisController.likeReponseAvis
);








// ============================================
// Modifier un avis
// ============================================

router.put(
"/:id",
authMiddleware,
avisController.updateAvis
);








// ============================================
// Supprimer un avis
// ============================================

router.delete(
"/:id",
authMiddleware,
avisController.deleteAvis
);









// ============================================
// Modifier une réponse
// ============================================

router.put(
"/reponse/:id",
authMiddleware,
avisController.updateReponseAvis
);








// ============================================
// Supprimer une réponse
// ============================================

router.delete(
"/reponse/:id",
authMiddleware,
avisController.deleteReponseAvis
);








// ============================================
// Admin : modifier statut avis
// ============================================

router.put(
"/statut/:id",
authMiddleware,
avisController.updateStatutAvis
);







module.exports = router;