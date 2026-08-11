const db = require("../db");


// ==================================
// Ajouter paiement avec preuve
// ==================================

exports.createPaiement = async(req,res)=>{


try{


const {

    id_reservation,
    montant,
    mode_paiement

} = req.body;



console.log(
"Données paiement reçues :",
req.body
);



// fichier preuve paiement

const preuve = req.file
?
req.file.filename
:
null;





// Vérification

if(
!id_reservation ||
!montant ||
!mode_paiement
){

return res.status(400).json({

message:"Les champs obligatoires sont manquants"

});

}




const sql = `

INSERT INTO paiement

(
id_reservation,
montant,
mode_paiement,
statut,
preuve
)

VALUES (?,?,?,?,?)

`;





const [result] = await db.query(

sql,

[

id_reservation,

montant,

mode_paiement,

"En attente",

preuve

]

);





res.json({

message:"Paiement envoyé avec succès",

id_paiement:result.insertId,

preuve:preuve

});



}

catch(error){


console.log(
"Erreur ajout paiement :",
error
);



res.status(500).json({

message:"Erreur ajout paiement",

error:error.message

});


}


};








// ==================================
// Afficher paiements
// ==================================

exports.getPaiements = async(req,res)=>{

try{

const [paiements] = await db.query(`
SELECT

p.*,

r.id_reservation,
r.date_reservation,
r.date_debut_sejour,
r.date_fin_sejour,
r.nombre_personnes,
r.montant_total,
r.statut AS statut_reservation,

u.id_utilisateur,
u.nom,
u.prenom,
u.email,

o.id_offre,
o.titre,
o.prix,
o.image,

d.nom AS destination

FROM paiement p

INNER JOIN reservation r
ON p.id_reservation = r.id_reservation

INNER JOIN utilisateur u
ON r.id_utilisateur = u.id_utilisateur

INNER JOIN offre o
ON r.id_offre = o.id_offre

INNER JOIN destination d
ON o.id_destination = d.id_destination

ORDER BY p.id_paiement DESC

`);

res.json(paiements);

}
catch(error){

console.log(
"Erreur récupération paiements :",
error
);

res.status(500).json({

message:"Erreur récupération paiements",

error:error.message

});

}

};

// ==================================
// Modifier paiement (validation admin)
// ==================================
exports.updatePaiement = async(req,res)=>{

try{


const id=req.params.id;


const {
statut
}=req.body;



const sql=`

UPDATE paiement

SET

statut=?

WHERE id_paiement=?

`;



const [result]=await db.query(

sql,

[
statut,
id
]

);



if(result.affectedRows===0){

return res.status(404).json({

message:"Paiement introuvable"

});

}




// ===============================
// CREER NOTIFICATION SI PAIEMENT PAYE
// ===============================
// ===============================
// CREER NOTIFICATION SI PAIEMENT PAYE
// ===============================

if(statut === "Payé" || statut === "Paye"){


console.log("Paiement confirmé, création notification");


const [paiement] = await db.query(

`
SELECT 
r.id_utilisateur

FROM paiement p

INNER JOIN reservation r

ON p.id_reservation = r.id_reservation

WHERE p.id_paiement=?
`,

[id]

);



console.log(
"Utilisateur concerné :",
paiement
);



if(paiement.length > 0){


await db.query(

`

INSERT INTO notification

(
id_utilisateur,
titre,
message,
type,
lien
)

VALUES (?,?,?,?,?)

`,

[

paiement[0].id_utilisateur,

"Paiement validé",

"Votre paiement est confirmé. Téléchargez votre reçu.",

"Paiement",

"/api/recu/"+id

]


);


console.log(
"Notification paiement créée"
);


}


}



res.json({

message:"Statut paiement modifié avec succès"

});



}
catch(error){


console.log(
"Erreur modification paiement :",
error
);



res.status(500).json({

message:"Erreur modification paiement",

error:error.message

});


}

};



// ==================================
// Supprimer paiement
// ==================================

exports.deletePaiement = async(req,res)=>{


try{


const id=req.params.id;



const [result]=await db.query(


`

DELETE FROM paiement

WHERE id_paiement=?

`,

[id]


);





if(result.affectedRows===0){


return res.status(404).json({

message:"Paiement introuvable"

});


}





res.json({

message:"Paiement supprimé avec succès"

});



}

catch(error){


console.log(
"Erreur suppression paiement :",
error
);



res.status(500).json({

message:"Erreur suppression paiement",

error:error.message

});


}



};