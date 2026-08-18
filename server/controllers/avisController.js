const db = require("../db");



// ============================================
// Ajouter un avis
// ============================================
// ============================================
// Ajouter un avis
// ============================================

exports.createAvis = async(req,res)=>{

try{

const {

id_offre,
note,
commentaire

}=req.body;



const id_utilisateur = req.user.id;



// ==============================
// Insertion de l'avis
// ==============================

const [result] = await db.query(

`
INSERT INTO avis
(
id_utilisateur,
id_offre,
note,
commentaire
)

VALUES(?,?,?,?)

`

,

[

id_utilisateur,
id_offre,
note,
commentaire

]

);



// ==============================
// Retourner l'identifiant créé
// ==============================

res.status(201).json({

message:"Avis envoyé en attente de validation",

id_avis:result.insertId

});


}
catch(error){

console.log(error);

res.status(500).json({

message:"Erreur ajout avis",

error:error.message

});


}


};



// ============================================
// Afficher les avis publics
// ============================================
// ============================================
// Afficher les avis publics
// ============================================

exports.getAvis = async(req,res)=>{

try{


const [avis] = await db.query(`
    SELECT
        a.id_avis,
        a.id_utilisateur,
        a.id_offre,
        a.note,
        a.commentaire,
        a.date_avis,
        a.statut,
        u.nom,
        u.prenom,
        u.photo,
        u.role,
        o.titre,

        (
            SELECT COUNT(*)
            FROM avis_like al
            WHERE al.id_avis = a.id_avis
        ) AS nombre_likes

    FROM avis a

    LEFT JOIN utilisateur u
        ON u.id_utilisateur = a.id_utilisateur

    LEFT JOIN offre o
        ON o.id_offre = a.id_offre

    WHERE a.statut LIKE 'Publi%'

    ORDER BY a.date_avis DESC
`);




// =====================================
// Récupérer réponses + photos
// =====================================

for(const a of avis){



// ==========================
// Réponses
// ==========================

const [reponses]=await db.query(

`

SELECT

r.id_reponse,

r.id_utilisateur,

r.reponse,

r.date_reponse,

u.nom,

u.prenom,

u.photo,

u.role,

(

SELECT COUNT(*)

FROM reponse_avis_like ral

WHERE ral.id_reponse=r.id_reponse

)

AS nombre_likes

FROM reponse_avis r

LEFT JOIN utilisateur u

ON u.id_utilisateur=r.id_utilisateur

WHERE r.id_avis=?

ORDER BY r.date_reponse ASC

`

,

[

a.id_avis

]

);



a.reponses=reponses;





// ==========================
// Photos
// ==========================

const [photos]=await db.query(

`

SELECT

id_photo,

photo

FROM avis_photo

WHERE id_avis=?

ORDER BY date_ajout ASC

`

,

[

a.id_avis

]

);



a.photos=photos;


}



res.json(avis);



}
catch(error){

console.log(error);

res.status(500).json({

message:"Erreur récupération avis",

error:error.message

});


}


};








// ============================================
// Like / Unlike avis
// ============================================

exports.likeAvis = async(req,res)=>{


try{


const {

id_avis,

id_utilisateur

}=req.body;




if(!id_utilisateur){

return res.status(400).json({

message:"Utilisateur manquant"

});

}





const [existe]=await db.query(

`

SELECT *

FROM avis_like

WHERE id_avis=?

AND id_utilisateur=?

`

,

[

id_avis,

id_utilisateur

]

);





// enlever le like

if(existe.length){


await db.query(

`

DELETE FROM avis_like

WHERE id_avis=?

AND id_utilisateur=?

`

,

[

id_avis,

id_utilisateur

]

);



return res.json({

liked:false

});


}





// ajouter like


await db.query(

`

INSERT INTO avis_like

(
id_avis,
id_utilisateur
)

VALUES(?,?)

`

,

[

id_avis,

id_utilisateur

]

);



res.json({

liked:true

});



}
catch(error){


res.status(500).json({

message:"Erreur like avis",

error:error.message

});


}


};









// ============================================
// Ajouter une réponse
// ============================================


exports.repondreAvis = async(req,res)=>{


try{


const {

id_avis,

id_utilisateur,

reponse

}=req.body;




if(!id_utilisateur){

return res.status(400).json({

message:"Utilisateur manquant"

});

}





await db.query(

`

INSERT INTO reponse_avis

(
id_avis,
id_utilisateur,
reponse
)

VALUES(?,?,?)

`

,

[

id_avis,

id_utilisateur,

reponse

]

);





res.json({

message:"Réponse ajoutée"

});



}
catch(error){


res.status(500).json({

message:"Erreur réponse",

error:error.message

});


}


};









// ============================================
// Like / Unlike réponse
// ============================================


exports.likeReponseAvis = async(req,res)=>{


try{


const {

id_reponse,

id_utilisateur

}=req.body;




if(!id_utilisateur){

return res.status(400).json({

message:"Utilisateur manquant"

});

}




const [existe]=await db.query(

`

SELECT *

FROM reponse_avis_like

WHERE id_reponse=?

AND id_utilisateur=?

`

,

[

id_reponse,

id_utilisateur

]

);





if(existe.length){



await db.query(

`

DELETE FROM reponse_avis_like

WHERE id_reponse=?

AND id_utilisateur=?

`

,

[

id_reponse,

id_utilisateur

]

);



return res.json({

liked:false

});


}







await db.query(

`

INSERT INTO reponse_avis_like

(
id_reponse,
id_utilisateur
)

VALUES(?,?)

`

,

[

id_reponse,

id_utilisateur

]

);



res.json({

liked:true

});



}
catch(error){


res.status(500).json({

message:"Erreur like réponse",

error:error.message

});


}


};









// ============================================
// Modifier avis
// ============================================


exports.updateAvis = async(req,res)=>{


try{


await db.query(

`

UPDATE avis

SET

note=?,

commentaire=?

WHERE id_avis=?

`

,

[

req.body.note,

req.body.commentaire,

req.params.id

]

);



res.json({

message:"Avis modifié"

});


}
catch(error){


res.status(500).json({

error:error.message

});


}


};









// ============================================
// Supprimer avis
// ============================================


exports.deleteAvis = async(req,res)=>{


try{


await db.query(

`

DELETE FROM avis

WHERE id_avis=?

`

,

[

req.params.id

]

);



res.json({

message:"Avis supprimé"

});


}
catch(error){


res.status(500).json({

error:error.message

});


}


};









// ============================================
// Modifier réponse
// ============================================


exports.updateReponseAvis = async(req,res)=>{


try{


await db.query(

`

UPDATE reponse_avis

SET reponse=?

WHERE id_reponse=?

`

,

[

req.body.reponse,

req.params.id

]

);



res.json({

message:"Réponse modifiée"

});


}
catch(error){


res.status(500).json({

error:error.message

});


}


};









// ============================================
// Supprimer réponse
// ============================================


exports.deleteReponseAvis = async(req,res)=>{


try{


await db.query(

`

DELETE FROM reponse_avis

WHERE id_reponse=?

`

,

[

req.params.id

]

);



res.json({

message:"Réponse supprimée"

});


}
catch(error){


res.status(500).json({

error:error.message

});


}


};









// ============================================
// Modifier statut avis ADMIN
// ============================================


exports.updateStatutAvis = async(req,res)=>{


try{


await db.query(

`

UPDATE avis

SET statut=?

WHERE id_avis=?

`

,

[

req.body.statut,

req.params.id

]

);



res.json({

message:"Statut modifié"

});


}
catch(error){


res.status(500).json({

error:error.message

});


}


};


// ============================================
// ADMIN : récupérer tous les avis
// ============================================

exports.getTousLesAvisAdmin = async(req,res)=>{


try{


const [avis] = await db.query(

`

SELECT

a.id_avis,
a.id_utilisateur,
a.id_offre,
a.note,
a.commentaire,
a.date_avis,
a.statut,

u.nom,
u.prenom,
u.email,
u.photo,
u.role,

o.titre


FROM avis a


LEFT JOIN utilisateur u

ON u.id_utilisateur=a.id_utilisateur


LEFT JOIN offre o

ON o.id_offre=a.id_offre


ORDER BY a.date_avis DESC


`

);



res.json(avis);



}

catch(error){


console.log(error);


res.status(500).json({

message:"Erreur récupération avis admin",

error:error.message

});


}



};