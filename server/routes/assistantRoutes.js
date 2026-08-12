const express = require("express");

const router = express.Router();

const assistantController =
    require("../controllers/assistantController");


// =====================================================
// ASSISTANT TOURISTIQUE
// =====================================================

router.post(
    "/",
    assistantController.assisterTouriste
);


module.exports = router;