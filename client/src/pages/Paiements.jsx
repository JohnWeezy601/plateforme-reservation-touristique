import { 
    useEffect, 
    useState 
} from "react";

import api from "../api/api";

import "./Paiements.css";



function Paiements(){


const [paiements,setPaiements] = useState([]);

const [recherche,setRecherche] = useState("");

const [menuOuvert,setMenuOuvert] = useState(null);

const [detailPaiement,setDetailPaiement] = useState(null);


// ===========================
// PAGINATION
// ===========================

const [page,setPage] = useState(1);

const paiementsParPage = 4;






// ===========================
// CHARGER PAIEMENTS
// ===========================

const chargerPaiements = async()=>{


try{


const res = await api.get("/paiements");


setPaiements(res.data);



}

catch(error){


console.log(

"Erreur chargement paiements :",

error

);


}



};






useEffect(()=>{


chargerPaiements();


},[]);








// ===========================
// VALIDER PAIEMENT
// ===========================

const validerPaiement = async(id)=>{


try{


await api.put(

`/paiements/${id}`,

{
statut:"Paye"
}

);




setPaiements(prev=>


prev.map(p=>


p.id_paiement===id

?

{

...p,

statut:"Paye"

}

:

p


)


);





if(detailPaiement?.id_paiement===id){


setDetailPaiement({

...detailPaiement,

statut:"Paye"

});


}





setMenuOuvert(null);



}

catch(error){


console.log(

"Erreur validation paiement :",

error

);


}



};









// ===========================
// REFUSER PAIEMENT
// ===========================

const refuserPaiement = async(id)=>{


try{


await api.put(

`/paiements/${id}`,

{
statut:"Echoue"
}

);





setPaiements(prev=>


prev.map(p=>


p.id_paiement===id

?

{

...p,

statut:"Echoue"

}

:

p


)


);






if(detailPaiement?.id_paiement===id){


setDetailPaiement({

...detailPaiement,

statut:"Echoue"

});


}




setMenuOuvert(null);



}

catch(error){


console.log(

"Erreur refus paiement :",

error

);


}



};









// ===========================
// SUPPRIMER PAIEMENT
// ===========================

const supprimerPaiement = async(id)=>{


const confirmation = window.confirm(

"Voulez-vous supprimer ce paiement ?"

);



if(!confirmation){

return;

}





try{


await api.delete(

`/paiements/${id}`

);





setPaiements(prev=>


prev.filter(

p=>p.id_paiement!==id

)


);






if(detailPaiement?.id_paiement===id){


setDetailPaiement(null);


}





setMenuOuvert(null);



}

catch(error){


console.log(

"Erreur suppression paiement :",

error

);



alert(

"Impossible de supprimer le paiement"

);



}



};









// ===========================
// RECHERCHE
// ===========================


const paiementsFiltres = paiements.filter((p)=>{


const texte = recherche.toLowerCase();



return(


(p.mode_paiement || "")

.toLowerCase()

.includes(texte)



||



String(

p.id_reservation || ""

)

.includes(texte)



||



(p.date_paiement &&


new Date(

p.date_paiement

)

.toLocaleDateString("fr-FR")

.includes(texte)


)



);



});









// ===========================
// PAGINATION CALCUL
// ===========================


const indexDernier = page * paiementsParPage;


const indexPremier = indexDernier - paiementsParPage;



const paiementsAffiches = paiementsFiltres.slice(

indexPremier,

indexDernier

);



const nombrePages = Math.ceil(

paiementsFiltres.length / paiementsParPage

);

return(


<div className="dashboard-content">





<div className="paiement-header">


<div>

<h1>
💳 Gestion des paiements
</h1>


<p>
Gérez les paiements des réservations des clients.
</p>


</div>


</div>







{/* ==========================
RECHERCHE
========================== */}


<div className="recherche-paiement">


<input

type="text"

placeholder="🔍 Rechercher paiement..."

value={recherche}


onChange={(e)=>{

setRecherche(e.target.value);

setPage(1);

}}


/>


</div>









{/* ==========================
LISTE PAIEMENTS
========================== */}



<div className="paiements-grid">



{

paiementsAffiches.length===0

?


<div className="empty">

Aucun paiement disponible

</div>


:



paiementsAffiches.map((paiement)=>(



<div

className="paiement-card"

key={paiement.id_paiement}

>







{/* MENU TROIS POINTS */}



<div className="menu-paiement">



<button

className="btn-menu-paiement"


onClick={()=>


setMenuOuvert(

menuOuvert===paiement.id_paiement

?

null

:

paiement.id_paiement

)


}

>

⋮

</button>







{

menuOuvert===paiement.id_paiement &&



<div className="menu-actions">





<button

onClick={()=>{


setDetailPaiement(paiement);

setMenuOuvert(null);


}}

>

👁 Voir détails

</button>







<button

disabled={paiement.statut==="Paye"}

onClick={()=>{


validerPaiement(

paiement.id_paiement

);


}}

>

✅ Valider

</button>







<button

disabled={paiement.statut==="Echoue"}

onClick={()=>{


refuserPaiement(

paiement.id_paiement

);


}}

>

❌ Refuser

</button>








<button

onClick={()=>{


supprimerPaiement(

paiement.id_paiement

);


}}

>

🗑 Supprimer

</button>





</div>


}



</div>









<div className="paiement-body">



<h3>

Paiement #

{paiement.id_paiement}

</h3>






<p>

<strong>
Réservation :
</strong>


{paiement.id_reservation}


</p>








<p>

<strong>
Client :
</strong>


{paiement.nom || "Non défini"}

{" "}

{paiement.prenom || ""}


</p>







<p>

<strong>
Montant :
</strong>


{

Number(

paiement.montant_total || paiement.montant || 0

)

.toLocaleString("fr-FR")

}


Ar


</p>







<p>

<strong>
Mode :
</strong>


{

paiement.mode_paiement || "-"

}


</p>







<p>

<strong>
Date :
</strong>


{

paiement.date_paiement

?

new Date(

paiement.date_paiement

)

.toLocaleDateString("fr-FR")


:

"-"

}



</p>







<p>

<strong>
Statut :
</strong>


<span

className={

`statut ${(paiement.statut || "En attente")

.replace(/\s/g,"")

.toLowerCase()}`

}

>


{

paiement.statut || "En attente"

}


</span>



</p>





</div>








</div>



))


}



</div>











{/* ==========================
PAGINATION
========================== */}



<div className="pagination">



<button

disabled={page===1}

onClick={()=>setPage(page-1)}

>

⬅

</button>







{

Array.from(

{length:nombrePages},

(_,i)=>(


<button


key={i}


className={

page===i+1

?

"active-page"

:

""

}



onClick={()=>setPage(i+1)}


>


{i+1}


</button>



)

)


}







<button


disabled={page===nombrePages}


onClick={()=>setPage(page+1)}


>

➡

</button>




</div>






{/* ==========================
MODALE DETAILS PAIEMENT
========================== */}


{

detailPaiement &&



<div className="modal-overlay">



<div className="modal-paiement">





<div className="modal-header">


<h2>

Détails du paiement

</h2>




<button

className="close-modal"

onClick={()=>setDetailPaiement(null)}

>

✕

</button>



</div>









<div className="detail-grid">





<p>

<strong>
ID paiement :
</strong>

{detailPaiement.id_paiement}

</p>






<p>

<strong>
ID réservation :
</strong>

{detailPaiement.id_reservation}

</p>









<hr/>







<h3>

Informations client

</h3>







<p>

<strong>
Nom :
</strong>


{detailPaiement.nom || "-"}

{" "}

{detailPaiement.prenom || ""}


</p>








<p>

<strong>
Email :
</strong>


{detailPaiement.email || "-"}


</p>








<p>

<strong>
Téléphone :
</strong>


{detailPaiement.telephone || "-"}


</p>









<hr/>








<h3>

Informations offre

</h3>








<p>

<strong>
Offre :
</strong>


{detailPaiement.titre || "-"}


</p>







<p>

<strong>
Destination :
</strong>


{detailPaiement.destination || "-"}


</p>








<p>

<strong>
Prix :
</strong>


{

Number(

detailPaiement.prix || 0

)

.toLocaleString("fr-FR")

}

Ar


</p>









<hr/>








<h3>

Informations séjour

</h3>








<p>

<strong>
Date réservation :
</strong>


{

detailPaiement.date_reservation

?

new Date(

detailPaiement.date_reservation

)

.toLocaleDateString("fr-FR")

:

"-"

}


</p>









<p>

<strong>
Début séjour :
</strong>


{

detailPaiement.date_debut_sejour

?

new Date(

detailPaiement.date_debut_sejour

)

.toLocaleDateString("fr-FR")

:

"-"

}



</p>








<p>

<strong>
Fin séjour :
</strong>


{

detailPaiement.date_fin_sejour

?

new Date(

detailPaiement.date_fin_sejour

)

.toLocaleDateString("fr-FR")

:

"-"

}


</p>









<p>

<strong>
Nombre personnes :
</strong>


{

detailPaiement.nombre_personnes || 0

}



</p>









<hr/>









<h3>

Paiement

</h3>








<p>

<strong>
Montant payé :
</strong>


{

Number(

detailPaiement.montant_total ||

detailPaiement.montant ||

0

)

.toLocaleString("fr-FR")

}

Ar


</p>








<p>

<strong>
Mode paiement :
</strong>


{

detailPaiement.mode_paiement || "-"

}



</p>









<p>

<strong>
Statut :
</strong>



<span

className={

`statut ${(detailPaiement.statut || "")

.replace(/\s/g,"")

.toLowerCase()}`

}

>


{detailPaiement.statut}



</span>


</p>






</div>









{/* PREUVE PAIEMENT */}



{

detailPaiement.preuve &&



<div className="preuve-paiement">


<h3>

Preuve paiement

</h3>




<img

src={

`http://localhost:8081/uploads/${detailPaiement.preuve}`

}

alt="preuve paiement"

/>



</div>



}









<div className="modal-actions">





<button

className="btn-valider"


onClick={()=>{


validerPaiement(

detailPaiement.id_paiement

);


}}

>

✅ Valider

</button>







<button

className="btn-refuser"


onClick={()=>{


refuserPaiement(

detailPaiement.id_paiement

);


}}

>

❌ Refuser

</button>








<button

className="btn-close"


onClick={()=>setDetailPaiement(null)}

>

Fermer

</button>






</div>








</div>





</div>



}



</div>


);


}



export default Paiements;

