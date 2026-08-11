const db = require("../db");

const envoyerEmailClient = require("../services/emailService");


// =============================
// ENVOYER UNE REPONSE CLIENT
// =============================

exports.envoyerReponse = async(req,res)=>{


    const {
        id_contact,
        message
    } = req.body;



    try{


        // Vérification

        if(!id_contact || !message){


            return res.status(400).json({

                message:"Données manquantes"

            });

        }



        // 1 - récupérer le contact

        const [contacts] = await db.query(

            "SELECT * FROM contact WHERE id_contact=?",

            [id_contact]

        );



        if(contacts.length===0){


            return res.status(404).json({

                message:"Contact introuvable"

            });


        }



        const contact = contacts[0];



        console.log("📧 EMAIL CLIENT :", contact.email);



        // 2 - enregistrer la réponse

        await db.query(

            `
            INSERT INTO reponse_contact
            (
                id_contact,
                message
            )
            VALUES (?,?)
            `,

            [
                id_contact,
                message
            ]

        );




        // 3 - envoyer email au client

        await envoyerEmailClient(

            contact.email,

            "Réponse à votre demande - Plateforme touristique",

            message

        );





        // 4 - changer statut

        await db.query(

            `
            UPDATE contact
            SET statut='Traité'
            WHERE id_contact=?
            `,

            [id_contact]

        );





        res.json({

            success:true,

            message:"Réponse envoyée avec succès"

        });



    }

    catch(error){


        console.log(

            "Erreur réponse contact :",

            error

        );


        res.status(500).json({

            message:"Erreur serveur"

        });


    }


};