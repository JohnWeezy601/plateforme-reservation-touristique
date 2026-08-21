
const express = require("express");

const router = express.Router();

const utilisateurController =
    require("../controllers/utilisateurController");

const upload =
    require("../middleware/upload");


// =============================
// AFFICHER UTILISATEURS
// =============================

router.get(

    "/",

    utilisateurController.getUtilisateurs

);


// =============================
// AJOUTER UTILISATEUR - ADMIN
// =============================

router.post(

    "/",

    utilisateurController.register

);


// =============================
// AFFICHER UN UTILISATEUR PAR ID
// =============================

router.get(

    "/:id",

    utilisateurController.getUtilisateurById

);


// =============================
// INSCRIPTION PUBLIC
// =============================

router.post(

    "/register",

    utilisateurController.register

);


// =============================
// CONNEXION CLASSIQUE
// =============================

router.post(

    "/login",

    utilisateurController.login

);


// =============================
// CONNEXION AVEC GOOGLE
// =============================

router.post(

    "/google",

    utilisateurController.googleLogin

);


// =============================
// MODIFIER UTILISATEUR
// =============================

router.put(

    "/:id",

    utilisateurController.updateUtilisateur

);


// =============================
// SUPPRIMER UTILISATEUR
// =============================

router.delete(

    "/:id",

    utilisateurController.deleteUtilisateur

);


// =============================
// PHOTO UTILISATEUR
// =============================

router.put(

    "/photo/:id",

    upload.single("photo"),

    utilisateurController.updatePhoto

);


module.exports = router;

