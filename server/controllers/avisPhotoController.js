const db = require("../db");


// =======================================
// Ajouter plusieurs photos à un avis
// =======================================

exports.ajouterPhotosAvis = async(req,res)=>{

try{


const id_avis = req.body.id_avis;


if(!req.files || req.files.length===0){

return res.status(400).json({

message:"Aucune photo envoyée"

});

}




for(const file of req.files){


await db.query(

`
INSERT INTO avis_photo
(
id_avis,
photo
)
VALUES(?,?)
`

,

[

id_avis,

file.filename

]

);


}



res.json({

message:"Photos ajoutées avec succès"

});


}

catch(error){


console.log(error);


res.status(500).json({

message:"Erreur ajout photos",

error:error.message

});


}


};






// =======================================
// Récupérer les photos d'un avis
// =======================================


exports.getPhotosAvis = async(req,res)=>{


try{


const id_avis=req.params.id;



const [photos]=await db.query(

`
SELECT *

FROM avis_photo

WHERE id_avis=?

ORDER BY date_ajout ASC
`

,

[
id_avis
]

);



res.json(photos);



}

catch(error){


res.status(500).json({

error:error.message

});


}


};






// =======================================
// Supprimer une photo
// =======================================


exports.supprimerPhotoAvis = async(req,res)=>{


try{


await db.query(

`
DELETE FROM avis_photo

WHERE id_photo=?

`

,

[
req.params.id
]

);



res.json({

message:"Photo supprimée"

});


}

catch(error){


res.status(500).json({

error:error.message

});


}


};