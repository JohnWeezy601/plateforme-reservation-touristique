const db = require("../db");



// ===============================
// AJOUTER UNE NOTIFICATION
// ===============================

exports.createNotification = (req,res)=>{


const {
    id_utilisateur,
    titre,
    message,
    type

}=req.body;



const sql = `

INSERT INTO notification

(id_utilisateur,titre,message,type)

VALUES (?,?,?,?)

`;



db.query(

sql,

[
id_utilisateur,
titre,
message,
type
],


(err,result)=>{


if(err){

return res.status(500).json({

message:"Erreur création notification",
error:err

});

}



res.json({

message:"Notification créée avec succès",

id_notification:result.insertId

});


}


);



};







// ===============================
// AFFICHER TOUTES LES NOTIFICATIONS
// ===============================


exports.getNotifications=(req,res)=>{


const sql=`

SELECT 

notification.*,

utilisateur.nom,

utilisateur.prenom

FROM notification

LEFT JOIN utilisateur

ON notification.id_utilisateur = utilisateur.id_utilisateur

ORDER BY date_notification DESC

`;



db.query(

sql,

(err,result)=>{


if(err){

return res.status(500).json({

message:"Erreur récupération notifications",
error:err

});

}



res.json(result);


}


);



};








// ===============================
// AFFICHER NOTIFICATIONS PAR UTILISATEUR
// ===============================


exports.getNotificationsByUser = async (req,res)=>{

    try {


        const id = req.params.id;


        const sql = `

        SELECT *

        FROM notification

        WHERE id_utilisateur = ?

        ORDER BY date_notification DESC

        `;



        const [result] = await db.query(
            sql,
            [id]
        );



        console.log(
            "Notifications trouvées :",
            result
        );


        res.json(result);



    } catch(error) {


        console.log(
            "Erreur récupération notifications utilisateur :",
            error
        );


        res.status(500).json({

            message:"Erreur récupération notifications utilisateur",

            error:error.message

        });


    }

};



// ===============================
// MARQUER UNE NOTIFICATION COMME LUE
// ===============================


exports.markAsRead=(req,res)=>{


const id=req.params.id;



const sql=`

UPDATE notification

SET lu=1

WHERE id_notification=?

`;



db.query(

sql,

[id],


(err,result)=>{


if(err){

return res.status(500).json({

message:"Erreur modification notification",
error:err

});

}



res.json({

message:"Notification marquée comme lue"

});


}


);



};








// ===============================
// SUPPRIMER NOTIFICATION
// ===============================


exports.deleteNotification=(req,res)=>{


const id=req.params.id;



const sql=`

DELETE FROM notification

WHERE id_notification=?

`;



db.query(

sql,

[id],


(err,result)=>{


if(err){

return res.status(500).json({

message:"Erreur suppression notification",
error:err

});

}



res.json({

message:"Notification supprimée"

});


}


);



};







// ===============================
// COMPTER NOTIFICATIONS NON LUES
// ===============================

exports.countUnread = async(req,res)=>{

    try{


        const id = req.params.id;


        const sql = `

        SELECT COUNT(*) AS total

        FROM notification

        WHERE id_utilisateur = ?

        AND lu = 0

        `;



        const [result] = await db.query(
            sql,
            [id]
        );



        res.json({

            total: result[0].total

        });



    }
    catch(error){


        console.log(error);


        res.status(500).json({

            message:"Erreur compteur notification"

        });


    }


};




// =====================================================
// NOTIFICATION PAIEMENT NON VALIDÉ / ÉCHOUÉ
// =====================================================

exports.notifierPaiementNonValide = async ({
    id_utilisateur,
    id_paiement,
    statut
}) => {

    try {

        if (!id_utilisateur) {
            console.log(
                "Impossible de créer la notification : utilisateur manquant"
            );
            return;
        }


        const statutNormalise = String(statut || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");


        // =================================================
        // ON NOTIFIE UNIQUEMENT POUR CES STATUTS
        // =================================================

        const statutsAutorises = [
            "non valide",
            "non validee",
            "echoue",
            "echec"
        ];


        if (!statutsAutorises.includes(statutNormalise)) {

            return;

        }


        // =================================================
        // ÉVITER LES DOUBLONS
        // =================================================

        const [notificationsExistantes] = await db.query(

            `
            SELECT id_notification

            FROM notification

            WHERE id_utilisateur = ?

            AND type = 'Paiement'

            AND message LIKE ?

            LIMIT 1
            `,

            [
                id_utilisateur,
                `%${id_paiement}%`
            ]

        );


        if (
            notificationsExistantes.length > 0
        ) {

            console.log(
                "Notification paiement déjà existante pour le paiement :",
                id_paiement
            );

            return;

        }


        // =================================================
        // MESSAGE
        // =================================================

        let titre = "Paiement non validé";

        let message =
            `Votre paiement #${id_paiement} n'a pas été validé. Veuillez vérifier votre paiement.`;


        if (
            statutNormalise === "echoue" ||
            statutNormalise === "echec"
        ) {

            titre = "Paiement échoué";

            message =
                `Votre paiement #${id_paiement} a échoué. Veuillez réessayer le paiement.`;

        }


        // =================================================
        // CRÉER NOTIFICATION
        // =================================================

        await db.query(

            `
            INSERT INTO notification
            (
                id_utilisateur,
                titre,
                message,
                type
            )

            VALUES (?, ?, ?, 'Paiement')
            `,

            [
                id_utilisateur,
                titre,
                message
            ]

        );


        console.log(
            "Notification paiement créée :",
            {
                id_utilisateur,
                id_paiement,
                statut
            }
        );


    }
    catch(error) {

        console.log(
            "Erreur notification paiement :",
            error
        );

    }

};