const express = require("express");

const router = express.Router();

const contactController = require("../controllers/contactController");


// ajouter un message contact
router.post(
"/",
contactController.createContact
);


// afficher les contacts
router.get(
"/",
contactController.getContacts
);


// modifier statut
router.put(
"/:id",
contactController.updateStatut
);


// supprimer
router.delete(
"/:id",
contactController.deleteContact
);


module.exports = router;