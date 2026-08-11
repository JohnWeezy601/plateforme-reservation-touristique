import {
    useEffect,
    useState
} from "react";


import {
    useParams
} from "react-router-dom";


import api from "../api/api";


import "./Recu.css";



function Recu(){


const {id}=useParams();


const [recu,setRecu]=useState(null);





// =============================
// CHARGER LES DONNEES DU RECU
// =============================

useEffect(()=>{


const chargerRecu=async()=>{


try{


const res = await api.get(
`/recu/${id}`
);



console.log(
"Données reçu :",
res.data
);



setRecu(res.data);



}
catch(error){


console.log(
"Erreur chargement reçu :",
error
);


}



};



chargerRecu();



},[id]);







if(!recu){


return (

<div className="chargement">

<h2>
Chargement reçu...
</h2>

</div>

);


}







return(


<div className="recu-container">



<div className="recu-card">





<div className="recu-header">


<h1>
🌍 Plateforme Touristique
</h1>


<h2>
REÇU DE PAIEMENT
</h2>


<p className="date-recu">

Date du reçu :
{" "}
{new Date()
.toLocaleDateString("fr-FR")}

</p>


</div>








<div className="ligne"></div>






<section>

<h3>
 Informations client
</h3>


<div className="carte-identite">


<div className="photo-zone">

<img
src={
recu.photo
?
`http://localhost:8081/uploads/${recu.photo}`
:
"/avatar.png"
}
alt="Photo client"
className="photo-client"
/>

</div>




<div className="infos-client">


<p>
<strong>Nom :</strong>
{" "}
{recu.nom}
</p>


<p>
<strong>Prénom :</strong>
{" "}
{recu.prenom}
</p>


<p>
<strong>Email :</strong>
{" "}
{recu.email}
</p>


<p>
<strong>Téléphone :</strong>
{" "}
{recu.telephone || "-"}
</p>


</div>


</div>


</section>








<section>


<h3>
🏝 Détails réservation
</h3>



<div className="info">


<p>

<strong>
Réservation N° :
</strong>

{" "}

{recu.id_reservation}

</p>




<p>

<strong>
Offre :
</strong>

{" "}

{recu.titre}

</p>




<p>

<strong>
Destination :
</strong>

{" "}

{recu.nom_destination}

</p>





<p>

<strong>
Nombre personnes :
</strong>

{" "}

{recu.nombre_personnes}

</p>





<p>

<strong>
Date début :
</strong>

{" "}

{
new Date(
recu.date_debut_sejour
)
.toLocaleDateString("fr-FR")
}

</p>





<p>

<strong>
Date fin :
</strong>

{" "}

{
new Date(
recu.date_fin_sejour
)
.toLocaleDateString("fr-FR")
}

</p>


</div>


</section>









<section>


<h3>
💳 Paiement
</h3>



<div className="paiement-box">


<p>


<strong>
Montant :
</strong>



<span className="montant">


{
Number(recu.montant)
.toLocaleString("fr-FR")
}


 Ar


</span>


</p>





<p>


<strong>
Statut :
</strong>



<span className="statut">


{recu.statut_paiement}


</span>


</p>



</div>


</section>









<div className="message">


Merci pour votre confiance et bon voyage 🌍


</div>








<div className="actions">



<button

className="btn-print"

onClick={()=>window.print()}

>

🖨 Imprimer / Enregistrer PDF

</button>




<button

className="btn-retour"

onClick={()=>window.location.href="/mes-notifications"}

>

⬅ Retour 

</button>


</div>







</div>




</div>


);


}



export default Recu;