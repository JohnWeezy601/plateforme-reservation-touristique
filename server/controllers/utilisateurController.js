const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");




// =============================
// AJOUT UTILISATEUR
// =============================

exports.register = async(req,res)=>{


    const {

        nom,
        prenom,
        email,
        mot_de_passe,
        password,
        telephone,
        role

    } = req.body;



    const passwordFinal = password || mot_de_passe;



    try{


        if(!passwordFinal){


            return res.status(400).json({

                message:"Le mot de passe est obligatoire"

            });


        }




        const rolesAutorises = [

            "Administrateur",
            "Touriste",
            "Prestataire"

        ];



        if(!rolesAutorises.includes(role)){


            return res.status(400).json({

                message:"Rôle invalide"

            });


        }







        // Vérifier email existant

        const [emailExiste] = await db.query(

            `
            SELECT id_utilisateur
            FROM utilisateur
            WHERE email=?
            `,

            [
                email
            ]

        );



        if(emailExiste.length > 0){


            return res.status(400).json({

                message:"Cet email existe déjà"

            });


        }







        const hashPassword = await bcrypt.hash(

            passwordFinal,

            10

        );








        const [result] = await db.query(

            `
            INSERT INTO utilisateur
            (
                nom,
                prenom,
                email,
                mot_de_passe,
                telephone,
                role
            )

            VALUES (?,?,?,?,?,?)

            `,


            [

                nom,

                prenom,

                email,

                hashPassword,

                telephone,

                role

            ]


        );





        res.json({


            message:"Utilisateur ajouté avec succès",

            id:result.insertId


        });





    }


    catch(error){


        console.log(error);



        res.status(500).json({


            message:"Erreur ajout utilisateur",

            error:error.message


        });


    }


};









// =============================
// LOGIN
// =============================


exports.login = async(req,res)=>{


    const {

        email,

        mot_de_passe

    } = req.body;



    try{


        const [result] = await db.query(

            `
            SELECT *
            FROM utilisateur
            WHERE email=?
            `,

            [
                email
            ]

        );



        if(result.length===0){


            return res.status(404).json({

                message:"Utilisateur introuvable"

            });


        }




        const utilisateur=result[0];



        const passwordOK = await bcrypt.compare(

            mot_de_passe,

            utilisateur.mot_de_passe

        );



        if(!passwordOK){


            return res.status(401).json({

                message:"Mot de passe incorrect"

            });


        }







        const token = jwt.sign(

            {

                id:utilisateur.id_utilisateur,

                role:utilisateur.role

            },

            process.env.JWT_SECRET,

            {

                expiresIn:"1h"

            }

        );







        res.json({


            message:"Connexion réussie",


            token,


            utilisateur:{


                id:utilisateur.id_utilisateur,

                nom:utilisateur.nom,

                prenom:utilisateur.prenom,

                email:utilisateur.email,

                role:utilisateur.role,

                photo:utilisateur.photo


            }


        });




    }

    catch(error){


        console.log(error);


        res.status(500).json({

            message:"Erreur serveur"

        });


    }


};









// =============================
// MODIFIER UTILISATEUR
// =============================


exports.updateUtilisateur = async(req,res)=>{


    const id=req.params.id;



    const {

        nom,

        prenom,

        email,

        telephone,

        role


    } = req.body;





    try{



        const rolesAutorises=[

            "Administrateur",
            "Touriste",
            "Prestataire"

        ];




        if(!rolesAutorises.includes(role)){


            return res.status(400).json({

                message:"Rôle invalide"

            });


        }







        await db.query(

            `
            UPDATE utilisateur

            SET

            nom=?,

            prenom=?,

            email=?,

            telephone=?,

            role=?

            WHERE id_utilisateur=?

            `,


            [

                nom,

                prenom,

                email,

                telephone,

                role,

                id

            ]

        );







        res.json({

            message:"Utilisateur modifié avec succès"

        });





    }

    catch(error){


        console.log(error);


        res.status(500).json({

            message:"Erreur modification utilisateur"

        });


    }


};









// =============================
// SUPPRIMER UTILISATEUR
// =============================


exports.deleteUtilisateur = async(req,res)=>{


    const id=req.params.id;



    try{



        // supprimer recommandations IA

        await db.query(

            `
            DELETE FROM recommandation_ia
            WHERE id_utilisateur=?

            `,

            [
                id
            ]

        );






        // supprimer notifications

        await db.query(

            `
            DELETE FROM notification
            WHERE id_utilisateur=?

            `,

            [
                id
            ]

        );







        // supprimer avis

        await db.query(

            `
            DELETE FROM avis
            WHERE id_utilisateur=?

            `,

            [
                id
            ]

        );








        // supprimer réservations

        await db.query(

            `
            DELETE FROM reservation
            WHERE id_utilisateur=?

            `,

            [
                id
            ]

        );








        // supprimer utilisateur

        await db.query(

            `
            DELETE FROM utilisateur
            WHERE id_utilisateur=?

            `,

            [
                id
            ]

        );






        res.json({

            message:"Utilisateur supprimé avec succès"

        });





    }

    catch(error){


        console.log(error);


        res.status(500).json({

            message:"Erreur suppression utilisateur",

            error:error.message

        });


    }


};









// =============================
// AFFICHER UTILISATEURS
// =============================


exports.getUtilisateurs = async(req,res)=>{


    try{


        const [utilisateurs]=await db.query(

            `
            SELECT

            id_utilisateur,

            nom,

            prenom,

            email,

            telephone,

            role,

            photo,

            date_inscription


            FROM utilisateur


            ORDER BY date_inscription DESC

            `


        );



        res.json(utilisateurs);



    }


    catch(error){


        console.log(error);


        res.status(500).json({

            message:"Erreur récupération utilisateurs"

        });


    }


};





// =============================
// AFFICHER UN UTILISATEUR PAR ID
// =============================

exports.getUtilisateurById = async(req,res)=>{

    const id = req.params.id;


    try{

        const [utilisateur] = await db.query(

            `
            SELECT

            id_utilisateur,
            nom,
            prenom,
            email,
            telephone,
            role,
            photo,
            date_inscription

            FROM utilisateur

            WHERE id_utilisateur=?

            `,

            [id]

        );


        if(utilisateur.length === 0){

            return res.status(404).json({

                message:"Utilisateur introuvable"

            });

        }


        res.json(utilisateur[0]);


    }
    catch(error){

        console.log(error);


        res.status(500).json({

            message:"Erreur récupération utilisateur"

        });

    }


};





// =============================
// MODIFIER PHOTO
// =============================


exports.updatePhoto = async(req,res)=>{


    const id=req.params.id;



    if(!req.file){


        return res.status(400).json({

            message:"Aucune photo envoyée"

        });


    }




    try{


        await db.query(

            `
            UPDATE utilisateur

            SET photo=?

            WHERE id_utilisateur=?

            `,


            [

                req.file.filename,

                id

            ]

        );



        res.json({

            message:"Photo modifiée",

            photo:req.file.filename

        });



    }

    catch(error){


        console.log(error);


        res.status(500).json({

            message:"Erreur photo"

        });


    }


};