const db = require("../db");


// =============================
// CREER CONTACT
// =============================

exports.createContact = async(req,res)=>{

    const {
        nom,
        email,
        sujet,
        message
    } = req.body;


    try{


        const [result] = await db.query(

            `
            INSERT INTO contact
            (
                nom,
                email,
                sujet,
                message
            )
            VALUES (?,?,?,?)
            `,

            [
                nom,
                email,
                sujet,
                message
            ]

        );



        // =============================
        // Notification administrateur
        // =============================

        await db.query(

            `
            INSERT INTO notification
            (
                id_utilisateur,
                titre,
                message,
                lu
            )

            VALUES (?,?,?,?)
            `,

            [
                6,
                "Nouveau message client",
                `${nom} vous a envoyé un message`,
                0
            ]

        );




        res.json({

            message:"Message envoyé avec succès",

            id:result.insertId

        });


    }
    catch(error){


        console.log(
            "Erreur ajout contact :",
            error
        );


        res.status(500).json({

            message:"Erreur ajout contact"

        });


    }


};



// =============================
// AFFICHER CONTACTS
// =============================

exports.getContacts = async(req,res)=>{


    try{


        const [contacts] = await db.query(

            `
            SELECT * FROM contact
            ORDER BY date_envoi DESC
            `

        );



        res.json(contacts);



    }
    catch(error){


        console.log(
            "Erreur récupération contacts :",
            error
        );


        res.status(500).json({

            message:"Erreur récupération contacts"

        });


    }


};






// =============================
// MODIFIER STATUT
// =============================

exports.updateStatut = async(req,res)=>{


    const id = req.params.id;

    const {
        statut
    } = req.body;



    try{


        await db.query(

            `
            UPDATE contact
            SET statut=?
            WHERE id_contact=?
            `,

            [
                statut,
                id
            ]

        );



        res.json({

            message:"Statut modifié"

        });



    }
    catch(error){


        console.log(
            "Erreur modification statut :",
            error
        );


        res.status(500).json({

            message:"Erreur modification"

        });


    }


};






// =============================
// SUPPRIMER CONTACT
// =============================

exports.deleteContact = async(req,res)=>{


    const id = req.params.id;



    try{


        await db.query(

            "DELETE FROM contact WHERE id_contact=?",

            [
                id
            ]

        );



        res.json({

            message:"Contact supprimé"

        });



    }
    catch(error){


        console.log(
            "Erreur suppression :",
            error
        );


        res.status(500).json({

            message:"Erreur suppression"

        });


    }


};