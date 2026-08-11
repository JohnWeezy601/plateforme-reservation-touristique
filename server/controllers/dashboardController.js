const db = require("../db");


// =====================================
// STATISTIQUES DASHBOARD ADMIN
// =====================================

exports.getStatistiques = async(req,res)=>{


try{


// =====================================
// TOTAL UTILISATEURS
// =====================================

const [utilisateurs] = await db.query(

`
SELECT COUNT(*) AS total
FROM utilisateur
`

);




// =====================================
// TOTAL DESTINATIONS
// =====================================

const [destinations] = await db.query(

`
SELECT COUNT(*) AS total
FROM destination
`

);





// =====================================
// TOTAL RESERVATIONS
// =====================================

const [reservations] = await db.query(

`
SELECT COUNT(*) AS total
FROM reservation
`

);






// =====================================
// TOTAL PAIEMENTS
// =====================================

const [paiements] = await db.query(

`
SELECT COUNT(*) AS total
FROM paiement
`

);






// =====================================
// CHIFFRE AFFAIRE
// =====================================

const [revenus] = await db.query(

`
SELECT

COALESCE(
SUM(montant_total),
0
) AS total

FROM reservation

WHERE statut='Confirmée'

`

);








// =====================================
// RESERVATIONS PAR MOIS
// =====================================

const [reservationsMois] = await db.query(

`
SELECT

MONTH(date_reservation) AS moisNumero,

MONTHNAME(date_reservation) AS mois,

COUNT(*) AS total


FROM reservation


GROUP BY

MONTH(date_reservation),

MONTHNAME(date_reservation)


ORDER BY moisNumero ASC

`

);








// =====================================
// REVENUS PAR MOIS
// =====================================

const [revenusMois] = await db.query(

`
SELECT


MONTH(date_reservation) AS moisNumero,


MONTHNAME(date_reservation) AS mois,


COALESCE(
SUM(montant_total),
0
) AS total



FROM reservation


WHERE statut='Confirmée'


GROUP BY

MONTH(date_reservation),

MONTHNAME(date_reservation)



ORDER BY moisNumero ASC

`

);










// =====================================
// DESTINATIONS POPULAIRES
// =====================================

const [destinationsPopulaires] = await db.query(

`
SELECT


d.nom,


COUNT(r.id_reservation) AS total



FROM reservation r



JOIN offre o

ON r.id_offre=o.id_offre



JOIN destination d

ON o.id_destination=d.id_destination



GROUP BY d.id_destination



ORDER BY total DESC



LIMIT 5

`

);









// =====================================
// DERNIERES RESERVATIONS
// =====================================

const [dernieresReservations] = await db.query(

`
SELECT


r.id_reservation,


r.date_reservation,


r.statut,


r.montant_total,


u.nom,


u.prenom,


o.titre



FROM reservation r



JOIN utilisateur u

ON r.id_utilisateur=u.id_utilisateur



JOIN offre o

ON r.id_offre=o.id_offre



ORDER BY r.id_reservation DESC



LIMIT 5


`

);









// =====================================
// NOTIFICATIONS RECENTES
// =====================================

const [notifications] = await db.query(

`
SELECT


titre,

message,

date_notification



FROM notification



WHERE id_utilisateur=6



ORDER BY date_notification DESC



LIMIT 5


`

);










// =====================================
// REPONSE JSON
// =====================================


res.json({


totalUtilisateurs:
utilisateurs[0].total,



totalDestinations:
destinations[0].total,



totalReservations:
reservations[0].total,



totalPaiements:
paiements[0].total,



revenus:
revenus[0].total,



reservationsMois,


revenusMois,


destinationsPopulaires,


dernieresReservations,


notifications



});




}

catch(error){


console.log(

"Erreur statistiques dashboard :",

error

);



res.status(500).json({

message:"Erreur récupération statistiques dashboard",

error:error.message

});


}


};