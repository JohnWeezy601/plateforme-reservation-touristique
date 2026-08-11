const db = require("../db");



// =====================================
// AJOUTER UNE OFFRE
// =====================================

exports.createOffre = async(req,res)=>{


try{


const {

id_prestataire,
id_destination,
id_categorie,
titre,
description,
prix,
capacite,
disponibilite,
date_debut,
date_fin

}=req.body;



const image = req.file
? req.file.filename
: null;



const sql = `

INSERT INTO offre

(
id_prestataire,
id_destination,
id_categorie,
titre,
description,
prix,
capacite,
disponibilite,
date_debut,
date_fin,
image
)

VALUES (?,?,?,?,?,?,?,?,?,?,?)

`;



const [result] = await db.query(

sql,

[

id_prestataire,
id_destination,
id_categorie,
titre,
description,
prix,
capacite,
disponibilite,
date_debut,
date_fin,
image

]


);



res.status(201).json({

message:"Offre ajoutée avec succès",

id_offre:result.insertId,

image:image

});



}

catch(error){


console.log(
"Erreur ajout offre :",
error
);


res.status(500).json({

message:"Erreur ajout offre",

error:error.message

});


}


};








// =====================================
// MODIFIER UNE OFFRE
// =====================================

exports.updateOffre = async(req,res)=>{


try{


const id=req.params.id;



const {

id_prestataire,
id_destination,
id_categorie,
titre,
description,
prix,
capacite,
disponibilite,
date_debut,
date_fin

}=req.body;



const image = req.file

?

req.file.filename

:

req.body.image;



const sql=`

UPDATE offre

SET

id_prestataire=?,

id_destination=?,

id_categorie=?,

titre=?,

description=?,

prix=?,

capacite=?,

disponibilite=?,

date_debut=?,

date_fin=?,

image=?

WHERE id_offre=?

`;




const [result]=await db.query(

sql,

[

id_prestataire,

id_destination,

id_categorie,

titre,

description,

prix,

capacite,

disponibilite,

date_debut,

date_fin,

image,

id

]


);




if(result.affectedRows===0){


return res.status(404).json({

message:"Offre introuvable"

});


}





res.json({

message:"Offre modifiée avec succès"

});




}

catch(error){


console.log(

"Erreur modification offre :",

error

);



res.status(500).json({

message:"Erreur modification offre",

error:error.message

});


}



};









// =====================================
// SUPPRIMER UNE OFFRE
// =====================================

exports.deleteOffre = async(req,res)=>{


try{


const id=req.params.id;



const [result]=await db.query(

`

DELETE FROM offre

WHERE id_offre=?

`,

[id]

);





if(result.affectedRows===0){


return res.status(404).json({

message:"Offre introuvable"

});


}




res.json({

message:"Offre supprimée avec succès"

});



}


catch(error){


console.log(

"Erreur suppression offre :",

error

);



res.status(500).json({

message:"Erreur suppression offre",

error:error.message

});


}


};









// =====================================
// AFFICHER TOUTES LES OFFRES
// =====================================


exports.getOffres = async(req,res)=>{


try{


const [offres]=await db.query(

`

SELECT

o.*,


d.nom AS destination,


c.nom AS categorie,


p.nom_entreprise AS prestataire



FROM offre o



LEFT JOIN destination d

ON o.id_destination=d.id_destination



LEFT JOIN categorie c

ON o.id_categorie=c.id_categorie



LEFT JOIN prestataire p

ON o.id_prestataire=p.id_prestataire



ORDER BY o.id_offre DESC


`

);



res.json(offres);



}

catch(error){


console.log(

"Erreur récupération offres :",

error

);



res.status(500).json({

message:"Erreur récupération offres",

error:error.message

});


}


};









// =====================================
// AFFICHER UNE OFFRE PAR ID
// =====================================


exports.getOffreById = async(req,res)=>{


try{


const id=req.params.id;



const [offres]=await db.query(

`

SELECT


o.*,


d.nom AS destination,


c.nom AS categorie,


p.nom_entreprise AS prestataire



FROM offre o



LEFT JOIN destination d

ON o.id_destination=d.id_destination



LEFT JOIN categorie c

ON o.id_categorie=c.id_categorie



LEFT JOIN prestataire p

ON o.id_prestataire=p.id_prestataire



WHERE o.id_offre=?


`,

[id]

);





if(offres.length===0){


return res.status(404).json({

message:"Offre introuvable"

});


}





res.json(offres[0]);



}


catch(error){


console.log(

"Erreur détail offre :",

error

);



res.status(500).json({

message:"Erreur récupération offre",

error:error.message

});


}


};