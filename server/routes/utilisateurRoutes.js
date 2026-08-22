const express = require("express");

const router = express.Router();

const utilisateurController =
    require("../controllers/utilisateurController");

const upload =
    require("../middleware/upload");


// =====================================================
// AFFICHER UTILISATEURS
// =====================================================

router.get(

    "/",

    utilisateurController.getUtilisateurs

);


// =====================================================
// AJOUTER UTILISATEUR - ADMIN
// =====================================================

router.post(

    "/",

    utilisateurController.register

);


// =====================================================
// INSCRIPTION PUBLIC
// =====================================================

router.post(

    "/register",

    utilisateurController.register

);


// =====================================================
// CONNEXION CLASSIQUE
// =====================================================

router.post(

    "/login",

    utilisateurController.login

);


// =====================================================
// CONNEXION AVEC GOOGLE
// =====================================================

router.post(

    "/google",

    utilisateurController.googleLogin

);


// =====================================================
// CONNEXION AVEC FACEBOOK
// =====================================================

router.post(

    "/facebook",

    utilisateurController.facebookLogin

);


// =====================================================
// =====================================================
// PHOTOS DE PROFIL CLIENT
// =====================================================
// IMPORTANT : ces routes doivent être placées
// AVANT router.get("/:id")
// =====================================================


// =====================================================
// RÉCUPÉRER LES ANCIENNES PHOTOS DE PROFIL
// =====================================================

router.get(

    "/:id/photos-profil",

    utilisateurController.getPhotosProfilClient

);


// =====================================================
// AJOUTER UNE PHOTO DANS L'HISTORIQUE
// =====================================================

router.post(

    "/:id/photos-profil",

    utilisateurController.ajouterPhotoProfilClient

);


// =====================================================
// MODIFIER UTILISATEUR
// =====================================================

router.put(

    "/:id",

    utilisateurController.updateUtilisateur

);


// =====================================================
// SUPPRIMER UTILISATEUR
// =====================================================

router.delete(

    "/:id",

    utilisateurController.deleteUtilisateur

);


// =====================================================
// PHOTO UTILISATEUR
// =====================================================
// ⚠️ NE PAS MODIFIER CETTE ROUTE
// =====================================================

router.put(

    "/photo/:id",

    upload.single("photo"),

    utilisateurController.updatePhoto

);


// =====================================================
// AFFICHER UN UTILISATEUR PAR ID
// =====================================================

router.get(

    "/:id",

    utilisateurController.getUtilisateurById

);


module.exports = router;