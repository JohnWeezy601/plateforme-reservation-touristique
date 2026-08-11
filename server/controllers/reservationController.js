const db = require("../db");

// ==========================
// Ajouter réservation
// ==========================

exports.createReservation = async(req,res)=>{


try{


const {

id_utilisateur,
id_offre,
date_debut_sejour,
date_fin_sejour,
nombre_personnes,
montant_total

}=req.body;



console.log(
"DONNEES RESERVATION :",
req.body
);





const sql=`

INSERT INTO reservation

(

id_utilisateur,
id_offre,
date_debut_sejour,
date_fin_sejour,
nombre_personnes,
montant_total,
statut

)

VALUES (?,?,?,?,?,?,?)

`;





const [result]=await db.query(

sql,

[

id_utilisateur,

id_offre,

date_debut_sejour,

date_fin_sejour,

nombre_personnes,

montant_total,

"En attente"

]

);


// ==========================
// Notification administrateurs
// ==========================


const [administrateurs] = await db.query(

`
SELECT id_utilisateur
FROM utilisateur
WHERE role = 'administrateur'
`

);



for(const admin of administrateurs){


await db.query(

`
INSERT INTO notification
(
id_utilisateur,
titre,
message,
type
)

VALUES (?,?,?,?)
`,

[

admin.id_utilisateur,

"Nouvelle réservation",

"Une nouvelle réservation vient d'être effectuée.",

"Reservation"

]

);


}




res.json({

message:
"Réservation créée avec succès",

id_reservation:
result.insertId

});




}

catch(error){


console.log(

"ERREUR CREATION RESERVATION :",

error

);




res.status(500).json({

message:
"Erreur création réservation",

error:error.message

});



}


};

// ==========================
// Afficher toutes les réservations
// ==========================

exports.getReservations = async (req, res) => {

    try {

        const sql = `
            SELECT

                r.*,

                u.nom,
                u.prenom,
                u.email,

                o.titre,
                o.prix,
                o.image

            FROM reservation r

            INNER JOIN utilisateur u
                ON r.id_utilisateur = u.id_utilisateur

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            ORDER BY r.id_reservation DESC
        `;

        const [reservations] = await db.query(sql);

        res.json(reservations);

    } catch (err) {

        res.status(500).json({
            message: "Erreur récupération réservation",
            error: err
        });

    }

};



// ==========================
// Afficher une réservation
// ==========================

exports.getReservationById = async (req, res) => {

    try {

        const id = req.params.id;

        const sql = `
            SELECT

                r.*,

                u.nom,
                u.prenom,
                u.email,

                o.titre,
                o.prix,
                o.image

            FROM reservation r

            INNER JOIN utilisateur u
                ON r.id_utilisateur = u.id_utilisateur

            INNER JOIN offre o
                ON r.id_offre = o.id_offre

            WHERE r.id_reservation = ?
        `;

        const [result] = await db.query(sql, [id]);

        if (result.length === 0) {

            return res.status(404).json({
                message: "Réservation introuvable"
            });

        }

        res.json(result[0]);

    } catch (err) {

        res.status(500).json({
            message: "Erreur récupération réservation",
            error: err
        });

    }

};



// ==========================
// Modifier uniquement le statut
// ==========================

exports.updateReservation = async (req, res) => {

    try {

        const id = req.params.id;

        const { statut } = req.body;


        // ==========================
        // Récupérer utilisateur
        // ==========================

        const [reservation] = await db.query(

            `
            SELECT id_utilisateur
            FROM reservation
            WHERE id_reservation = ?
            `,

            [id]

        );


        if (reservation.length === 0) {

            return res.status(404).json({

                message: "Réservation introuvable"

            });

        }


        const id_utilisateur =
            reservation[0].id_utilisateur;


        // ==========================
        // Modifier le statut
        // ==========================

        await db.query(

            `
            UPDATE reservation
            SET statut = ?
            WHERE id_reservation = ?
            `,

            [
                statut,
                id
            ]

        );


        // ==========================
        // Notification client
        // ==========================

        let message = "";

        let lien = null;


        // ==========================
        // Réservation confirmée
        // ==========================

        if (statut === "Confirmée") {

            message =
                "Votre réservation a été confirmée.Veuillez passer au paiement pour finaliser votre réservation.";

            lien =
                `/paiement-public/${id}`;

        }


        // ==========================
        // Réservation annulée
        // ==========================

        if (statut === "Annulée") {

            message =
                "Votre réservation a été annulée.";

            lien = null;

        }


        // ==========================
        // Debug
        // ==========================

        console.log(
            "===== NOTIFICATION RESERVATION ====="
        );

        console.log(
            "ID RESERVATION :",
            id
        );

        console.log(
            "ID UTILISATEUR :",
            id_utilisateur
        );

        console.log(
            "STATUT :",
            statut
        );

        console.log(
            "MESSAGE :",
            message
        );

        console.log(
            "LIEN :",
            lien
        );


        // ==========================
        // Créer notification
        // ==========================

        if (message) {

            await db.query(

                `
                INSERT INTO notification
                (
                    id_utilisateur,
                    titre,
                    message,
                    type,
                    lien
                )

                VALUES (?,?,?,?,?)
                `,

                [
                    id_utilisateur,
                    "Modification réservation",
                    message,
                    "Reservation",
                    lien
                ]

            );

        }


        // ==========================
        // Réponse
        // ==========================

        res.json({

            message:
                "Réservation mise à jour avec succès",

            id_reservation:
                id,

            statut:
                statut,

            lien:
                lien

        });


    }
    catch (err) {

        console.log(
            "ERREUR UPDATE RESERVATION :",
            err
        );


        res.status(500).json({

            message:
                "Erreur modification réservation",

            error:
                err.message

        });

    }

};




// ==========================
// Supprimer réservation
// ==========================

exports.deleteReservation = async (req, res) => {

    try {

        const id = req.params.id;

        const sql = `
            DELETE FROM reservation
            WHERE id_reservation = ?
        `;

        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {

            return res.status(404).json({
                message: "Réservation introuvable"
            });

        }

        res.json({
            message: "Réservation supprimée avec succès"
        });

    } catch (err) {

        res.status(500).json({
            message: "Erreur suppression réservation",
            error: err
        });

    }

};