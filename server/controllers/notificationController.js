const db = require("../db");


// ===============================
// AJOUTER UNE NOTIFICATION
// ===============================

exports.createNotification = async (req, res) => {

    try {

        const {
            id_utilisateur,
            titre,
            message,
            type,
            lien
        } = req.body;


        console.log("===== CREATION NOTIFICATION =====");
        console.log("ID UTILISATEUR :", id_utilisateur);
        console.log("TITRE :", titre);
        console.log("MESSAGE :", message);
        console.log("TYPE :", type);
        console.log("LIEN :", lien);


        const sql = `

            INSERT INTO notification
            (
                id_utilisateur,
                titre,
                message,
                type,
                lien
            )

            VALUES (?,?,?,?,?)

        `;


        const [result] = await db.query(

            sql,

            [
                id_utilisateur,
                titre,
                message,
                type,
                lien || null
            ]

        );


        console.log(
            "Notification créée avec ID :",
            result.insertId
        );


        res.status(201).json({

            message: "Notification créée avec succès",

            id_notification: result.insertId

        });


    }
    catch (error) {

        console.log(
            "Erreur création notification :",
            error
        );


        res.status(500).json({

            message: "Erreur création notification",

            error: error.message

        });

    }

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