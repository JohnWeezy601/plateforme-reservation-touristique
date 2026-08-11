const db = require("../db");


// =================================
// Ajouter une catégorie
// =================================

exports.createCategorie = async (req,res)=>{

    try{

        const {
            nom,
            description
        } = req.body;


        const sql = `
            INSERT INTO categorie
            (
                nom,
                description
            )
            VALUES (?,?)
        `;


        const [result] = await db.query(
            sql,
            [
                nom,
                description
            ]
        );


        res.json({

            message:"Catégorie ajoutée avec succès",

            id:result.insertId

        });


    }
    catch(error){

        res.status(500).json({

            message:"Erreur lors de l'ajout de la catégorie",

            error:error

        });

    }

};





// =================================
// Afficher toutes les catégories
// =================================

exports.getCategories = async(req,res)=>{


    try{


        const [categories] = await db.query(

            `
            SELECT *
            FROM categorie
            ORDER BY id_categorie DESC
            `

        );


        res.json(categories);


    }
    catch(error){


        res.status(500).json({

            message:"Erreur récupération catégories",

            error:error

        });


    }


};







// =================================
// Modifier catégorie
// =================================


exports.updateCategorie = async(req,res)=>{


    try{


        const id = req.params.id;


        const {
            nom,
            description
        } = req.body;



        const sql = `

            UPDATE categorie

            SET

            nom=?,

            description=?

            WHERE id_categorie=?

        `;



        const [result] = await db.query(

            sql,

            [
                nom,
                description,
                id
            ]

        );



        if(result.affectedRows===0){


            return res.status(404).json({

                message:"Catégorie introuvable"

            });


        }




        res.json({

            message:"Catégorie modifiée avec succès"

        });



    }
    catch(error){


        res.status(500).json({

            message:"Erreur modification catégorie",

            error:error

        });


    }


};









// =================================
// Supprimer catégorie
// =================================


exports.deleteCategorie = async(req,res)=>{


    try{


        const id=req.params.id;



        const [result]=await db.query(

            `
            DELETE FROM categorie
            WHERE id_categorie=?
            `,

            [
                id
            ]

        );




        if(result.affectedRows===0){


            return res.status(404).json({

                message:"Catégorie introuvable"

            });


        }





        res.json({

            message:"Catégorie supprimée avec succès"

        });



    }
    catch(error){


        res.status(500).json({

            message:"Erreur suppression catégorie",

            error:error

        });


    }


};