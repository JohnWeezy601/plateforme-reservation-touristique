const express = require("express");

const router = express.Router();

const notificationController = require("../controllers/notificationController");


// ==========================
// Ajouter une notification
// ==========================

router.post(
    "/",
    notificationController.createNotification
);



// ==========================
// Récupérer toutes les notifications
// ==========================

router.get(
    "/",
    notificationController.getNotifications
);



// ==========================
// Récupérer les notifications d'un utilisateur
// ==========================

router.get(
    "/utilisateur/:id",
    notificationController.getNotificationsByUser
);



// ==========================
// Marquer une notification comme lue
// ==========================

router.put(
    "/lu/:id",
    notificationController.markAsRead
);



// ==========================
// Supprimer une notification
// ==========================

router.delete(
    "/:id",
    notificationController.deleteNotification
);





// ==========================
// Nombre notifications non lues
// ==========================

router.get(
    "/count/:id",
    notificationController.countUnread
);

module.exports = router;