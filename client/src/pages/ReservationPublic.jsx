import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./ReservationPublic.css";


function ReservationPublic(){


const {id}=useParams();

const navigate = useNavigate();



const [offre,setOffre]=useState(null);

const [nombrePersonnes,setNombrePersonnes]=useState(1);

const [dateDebut,setDateDebut]=useState("");

const [dateFin,setDateFin]=useState("");

const [loading,setLoading]=useState(false);




// ===============================
// Vérification utilisateur connecté
// ===============================


const getUtilisateurConnecte = ()=>{


const user = localStorage.getItem("utilisateur");


if(!user){

return null;

}


try{

return JSON.parse(user);


}
catch(error){

localStorage.removeItem("utilisateur");

return null;

}


};





// ===============================
// Charger offre
// ===============================


useEffect(()=>{


const chargerOffre = async()=>{


try{


const res = await api.get(

`/offres/${id}`

);


setOffre(res.data);



}

catch(error){

console.log(
"Erreur chargement offre",
error
);


}


};


chargerOffre();



},[id]);







// ===============================
// Réserver
// ===============================


const reserver = async()=>{


const user = getUtilisateurConnecte();



console.log(
"USER AVANT RESERVATION :",
user
);




// ===============================
// Pas connecté
// ===============================

if(!user){


const retour = `/reservation-public/${id}`;


sessionStorage.setItem(
"retourApresLogin",
retour
);



console.log(
"TEST SESSION APRES SET :",
sessionStorage.getItem("retourApresLogin")
);



setTimeout(()=>{

navigate("/login-client");

},100);



return;


}





// ===============================
// Vérification dates
// ===============================


if(!dateDebut || !dateFin){


alert(
"Veuillez sélectionner les dates du séjour"
);


return;


}






try{


setLoading(true);



const montant =

Number(offre.prix)

*

Number(nombrePersonnes);






const response = await api.post(

"/reservations",

{


id_utilisateur:

user.id_utilisateur,



id_offre:

offre.id_offre,



date_debut_sejour:

dateDebut,



date_fin_sejour:

dateFin,



nombre_personnes:

Number(nombrePersonnes),



montant_total:

montant


}

);




console.log(
"REPONSE RESERVATION :",
response.data
);




alert(
    "Votre réservation a été envoyée avec succès. Veuillez attendre la validation de l'administrateur."
);



}

catch(error){


console.log(
"Erreur réservation",
error
);


alert(
"Erreur lors de la réservation"
);



}

finally{


setLoading(false);


}



};







if(!offre){


return(

<div className="loading">

<h2>
Chargement de l'offre...
</h2>

</div>

);


}







return(


<div className="reservation-public">


<div className="reservation-card">


<h1>
Réserver cette offre
</h1>



<div className="offre-reservation">


<img

src={

offre.image

?

`http://localhost:8081/uploads/${offre.image}`

:

"/image-default.jpg"

}

alt={offre.titre}

/>



<div>


<h2>

{offre.titre}

</h2>



<p>

{offre.description}

</p>



<p>

📍 {offre.destination}

</p>




<h3>

Prix :

{

Number(offre.prix)

.toLocaleString("fr-FR")

}

Ar / personne


</h3>


</div>



</div>






<div className="reservation-form">


<label>

Date début séjour

</label>



<input

type="date"

value={dateDebut}

onChange={(e)=>setDateDebut(e.target.value)}

/>





<label>

Date fin séjour

</label>



<input

type="date"

value={dateFin}

onChange={(e)=>setDateFin(e.target.value)}

/>






<label>

Nombre de personnes

</label>



<input

type="number"

min="1"

max={offre.capacite}

value={nombrePersonnes}

onChange={(e)=>setNombrePersonnes(e.target.value)}

/>





<h3>

Total :

{

(

Number(offre.prix)

*

Number(nombrePersonnes)

)

.toLocaleString("fr-FR")

}

Ar

</h3>




<button

onClick={reserver}

disabled={loading}

>


{

loading

?

"Traitement..."

:

"Confirmer ma réservation"

}


</button>




</div>



</div>



</div>


);



}


export default ReservationPublic;