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
// CONNEXION GOOGLE
// =====================================================

router.post(
    "/google",
    utilisateurController.googleLogin
);


// =====================================================
// CONNEXION FACEBOOK
// =====================================================

router.post(
    "/facebook",
    utilisateurController.facebookLogin
);


// =====================================================
// =====================================================
// HISTORIQUE DES PHOTOS DE PROFIL
// IMPORTANT : AVANT /:id
// =====================================================
// =====================================================

router.get(
    "/photo-history/:id",
    utilisateurController.getPhotosProfil
);


// =====================================================
// MES POSTS
// Photos publiées par le client
// Les photos viennent de avis_photo
// =====================================================

router.get(
    "/posts/:id",
    utilisateurController.getPostsUtilisateur
);


// =====================================================
// PHOTO UTILISATEUR
// =====================================================

router.put(
    "/photo/:id",
    upload.single("photo"),
    utilisateurController.updatePhoto
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
// AFFICHER UN UTILISATEUR PAR ID
// IMPORTANT : CETTE ROUTE DOIT RESTER À LA FIN
// =====================================================

router.get(
    "/:id",
    utilisateurController.getUtilisateurById
);


module.exports = router;