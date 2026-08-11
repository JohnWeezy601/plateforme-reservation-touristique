const express = require("express");

const router = express.Router();


const reservationController = require("../controllers/reservationController");



// =================================
// Ajouter une réservation
// POST /api/reservations
// =================================

router.post(
    "/",
    reservationController.createReservation
);




// =================================
// Afficher toutes les réservations
// GET /api/reservations
// =================================

router.get(
    "/",
    reservationController.getReservations
);




// =================================
// Afficher une réservation par ID
// GET /api/reservations/:id
// =================================

router.get(
    "/:id",
    reservationController.getReservationById
);




// =================================
// Modifier statut réservation
// PUT /api/reservations/:id
// =================================

router.put(
    "/:id",
    reservationController.updateReservation
);




// =================================
// Supprimer réservation
// DELETE /api/reservations/:id
// =================================

router.delete(
    "/:id",
    reservationController.deleteReservation
);



module.exports = router;