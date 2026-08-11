import { useEffect, useState } from "react";
import api from "../api/api";
import "./MesReservations.css";


function MesReservations(){


const [reservations,setReservations]=useState([]);



const utilisateur = JSON.parse(
localStorage.getItem("utilisateur")
);





// ===============================
// Charger mes réservations
// ===============================

useEffect(()=>{


const chargerReservations = async()=>{


try{


const res = await api.get(
"/reservations"
);



const mesReservations =
res.data.filter(

(reservation)=>

reservation.id_utilisateur ===
utilisateur.id_utilisateur

);



setReservations(
mesReservations
);



}
catch(error){


console.log(
"Erreur chargement réservations",
error
);


}



};



if(utilisateur){

chargerReservations();

}



},[]);








const statutClass=(statut)=>{


if(statut==="Confirmée"){

return "confirmee";

}


if(statut==="Annulée"){

return "annulee";

}


return "attente";


};







return (

<div className="mes-reservations">



<h1>
Mes réservations
</h1>


<p className="subtitle">

Retrouvez toutes vos demandes de réservation.

</p>








{

reservations.length===0 ?



<div className="empty">


Aucune réservation trouvée.


</div>



:



reservations.map((reservation)=>(



<div

className="reservation-client-card"

key={
reservation.id_reservation
}

>




<div className="reservation-image">


{

reservation.image &&


<img

src={
`http://localhost:8081/uploads/${reservation.image}`
}

alt={reservation.titre}

/>


}



</div>







<div className="reservation-info">


<h2>

{reservation.titre}

</h2>



<p>

📅 Date réservation :

{
new Date(
reservation.date_reservation
)
.toLocaleDateString("fr-FR")

}

</p>




<p>

👥 Nombre personnes :

{
reservation.nombre_personnes
}

</p>





<p>

💰 Montant :

<strong>

{
Number(
reservation.montant_total
)
.toLocaleString("fr-FR")

}

 Ar

</strong>


</p>





<span

className={
`statut ${statutClass(
reservation.statut
)}`
}

>

{
reservation.statut
}

</span>





</div>




</div>



))


}




</div>


);


}


export default MesReservations;