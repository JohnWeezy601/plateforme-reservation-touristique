const db = require("../db");



// =====================================
// AFFICHER LES PRESTATAIRES
// GET /api/prestataires
// =====================================

exports.getPrestataires = async(req,res)=>{


try{


const [result] = await db.query(`

SELECT

p.id_prestataire,

p.id_utilisateur,

p.nom_entreprise,

p.description,

p.adresse,

p.ville,

p.telephone,

p.email,

p.statut,

u.nom,

u.prenom,

u.email AS email_utilisateur,

u.role


FROM prestataire p


LEFT JOIN utilisateur u

ON p.id_utilisateur = u.id_utilisateur


ORDER BY p.id_prestataire DESC


`);



res.json(result);



}

catch(error){


console.log(error);


res.status(500).json({

message:"Erreur récupération prestataires",

error:error.message

});


}



};







// =====================================
// AJOUTER UN PRESTATAIRE
// POST /api/prestataires
// =====================================


exports.createPrestataire = async(req,res)=>{


const {


id_utilisateur,

nom_entreprise,

description,

adresse,

ville,

telephone,

email,

statut


}=req.body;



try{


const [result] = await db.query(`


INSERT INTO prestataire

(

id_utilisateur,

nom_entreprise,

description,

adresse,

ville,

telephone,

email,

statut

)


VALUES(?,?,?,?,?,?,?,?)


`,


[

id_utilisateur,

nom_entreprise,

description,

adresse,

ville,

telephone,

email,

statut || "En attente"

]


);



res.json({

message:"Prestataire ajouté avec succès",

id:result.insertId

});



}

catch(error){


console.log(error);


res.status(500).json({

message:"Erreur ajout prestataire",

error:error.message

});


}



};









// =====================================
// MODIFIER PRESTATAIRE
// PUT /api/prestataires/:id
// =====================================


exports.updatePrestataire = async(req,res)=>{


const id=req.params.id;


const {


nom_entreprise,

description,

adresse,

ville,

telephone,

email,

statut


}=req.body;



try{


const [result] = await db.query(`


UPDATE prestataire

SET

nom_entreprise=?,

description=?,

adresse=?,

ville=?,

telephone=?,

email=?,

statut=?


WHERE id_prestataire=?


`,


[

nom_entreprise,

description,

adresse,

ville,

telephone,

email,

statut,

id

]


);



if(result.affectedRows===0){


return res.status(404).json({

message:"Prestataire introuvable"

});


}



res.json({

message:"Prestataire modifié avec succès"

});


}

catch(error){


console.log(error);


res.status(500).json({

message:"Erreur modification prestataire",

error:error.message

});


}



};









// =====================================
// SUPPRIMER PRESTATAIRE
// DELETE /api/prestataires/:id
// =====================================


exports.deletePrestataire = async(req,res)=>{


const id=req.params.id;



try{


const [result] = await db.query(`


DELETE FROM prestataire

WHERE id_prestataire=?


`,


[id]


);



if(result.affectedRows===0){


return res.status(404).json({

message:"Prestataire introuvable"

});


}



res.json({

message:"Prestataire supprimé avec succès"

});



}

catch(error){


console.log(error);


res.status(500).json({

message:"Erreur suppression prestataire",

error:error.message

});


}



};